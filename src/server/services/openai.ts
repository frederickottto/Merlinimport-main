import OpenAI from 'openai';
import { env } from '@/env';

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || 'dummy-key-for-development',
});

export type DocumentContent = {
  type: string;
  content: string;
  title?: string;
  description?: string;
};

type DocumentSection = {
  section: string;
  content: string;
  order: number;
};

async function processContentInChunks(
  content: DocumentContent[],
  templateBuffer: Buffer,
  options: { preserveFormatting?: boolean; maintainSections?: boolean } = {}
): Promise<Buffer> {
  try {
    // Validate and clean template before processing
    const zip = new PizZip(templateBuffer);
    const docXml = zip.file('word/document.xml')?.asText();
    
    if (!docXml) {
      throw new Error('Template file is missing word/document.xml');
    }

    // Log template structure for debugging
    console.log('Template structure:', {
      hasContentTypes: !!zip.file('[Content_Types].xml'),
      hasDocumentXml: !!zip.file('word/document.xml'),
      documentXmlLength: docXml.length,
      templateTags: docXml.match(/{{[^}]+}}/g) || []
    });

    // If no template tags are found, we'll create a simple template
    let templateXml = docXml;
    if (!docXml.match(/{{[^}]+}}/g)) {
      console.log('No template tags found, creating simple template');
      templateXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${content.map((item, index) => `
    <w:p>
      <w:r>
        <w:t>${item.title}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${item.description}</w:t>
      </w:r>
    </w:p>
    ${index < content.length - 1 ? '<w:p><w:r><w:br/></w:r></w:p>' : ''}`).join('')}
  </w:body>
</w:document>`;
    }

    // Update the template with our XML
    zip.file('word/document.xml', templateXml);

    // Create the document with the template using the latest API
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Process sections
    const sections: DocumentSection[] = [];

    // First, get the document structure
    const structureResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a document processing assistant. Analyze the provided content and template, and return a JSON array of sections that need to be filled. Each section should be small enough to process individually.
${options.maintainSections ? 'Maintain the original section structure.' : 'You may reorganize sections as needed.'}

Return format:
{
  "sections": [
    {
      "section": "section_name",
      "content": "content_to_insert",
      "order": 1
    }
  ]
}`
        },
        {
          role: "user",
          content: `Content to process:
${content.map(item => `Type: ${item.type}\nTitle: ${item.title}\nDescription: ${item.description}\n`).join('\n')}

Please analyze this content and break it into logical sections that can be processed individually.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const structure = JSON.parse(structureResponse.choices[0]?.message?.content || '{}');
    if (!structure.sections || !Array.isArray(structure.sections)) {
      throw new Error('Invalid section structure returned from OpenAI');
    }

    // Process each section
    for (const section of structure.sections) {
      const sectionResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a document processing assistant. Your task is to format the provided content for a specific section of a Word document. Return ONLY the formatted content as a string, with appropriate Word formatting tags.
${options.preserveFormatting ? 'Preserve all original formatting.' : 'Use standard formatting.'}`
          },
          {
            role: "user",
            content: `Format this content for the "${section.section}" section:
${section.content}

Requirements:
- Use Word-compatible formatting
- Maintain professional tone
- Keep formatting simple and clean
- Focus on readability`
          }
        ],
        temperature: 0.1,
      });

      sections.push({
        ...section,
        content: sectionResponse.choices[0]?.message?.content || ''
      });
    }

    // Sort sections by order
    sections.sort((a, b) => a.order - b.order);

    // Set the template data
    doc.setData({
      sections: sections.map(s => ({
        name: s.section,
        content: s.content
      }))
    });

    // Render the document
    doc.render();

    // Get the output buffer
    const output = doc.getZip().generate({
      type: 'nodebuffer',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE'
    });

    return output;
  } catch (error) {
    console.error('Error in processContentInChunks:', error);
    throw error;
  }
}

export async function transferContentToTemplate(
  content: DocumentContent[],
  templateBuffer: Buffer,
  options: {
    preserveFormatting?: boolean;
    maintainSections?: boolean;
  } = {}
): Promise<string> {
  try {
    console.log('Starting chunked content processing');
    const outputBuffer = await processContentInChunks(content, templateBuffer, options);
    console.log('Content processing completed, output size:', outputBuffer.length);

    // Convert to base64
    const base64 = outputBuffer.toString('base64');
    
    // Validate the output - check for DOCX file signature in base64
    // DOCX files start with PK\x03\x04 in hex, which is UEsDBAoA in base64
    if (!base64.startsWith('UEsDBAoA')) {
      console.error('Invalid DOCX signature:', {
        expected: 'UEsDBAoA',
        actual: base64.substring(0, 8)
      });
      throw new Error('Invalid DOCX file format');
    }

    if (base64.length < 1000) {
      throw new Error('Invalid DOCX file size');
    }

    return base64;
  } catch (error) {
    console.error('Error in transferContentToTemplate:', error);
    throw error;
  }
} 