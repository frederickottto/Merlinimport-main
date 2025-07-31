import { NextResponse } from 'next/server';
import createReport from 'docx-templates';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const placeholders = JSON.parse(formData.get('placeholders') as string);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert the file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create the report
    const report = await createReport({
      template: buffer,
      data: {
        placeholders: placeholders.reduce((acc: Record<string, string>, p: { key: string; value: string }) => {
          acc[p.key] = p.value || '';
          return acc;
        }, {})
      },
      cmdDelimiter: ['{', '}'],
    });

    // Return the generated document
    return new NextResponse(report, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="exported-document.docx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export document' },
      { status: 500 }
    );
  }
} 