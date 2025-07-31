import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { TRPCError } from "@trpc/server";
import PizZip from "pizzip";

import { Buffer } from "buffer";

interface OpenAIError extends Error {
  code?: string;
}

import { pitchModuleSchema } from "@/server/controllers/misc/pitch/schema";
import type { PitchModule } from "@/server/controllers/misc/pitch/schema";
import { transferContentToTemplate } from "@/server/services/openai";




const templateFileSchema = z.object({
  name: z.string(),
  data: z.string(),
  type: z.string()
}).optional();

export const pitchRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.pitchModule.findMany({
      orderBy: { createdAt: "desc" },
    }) as Promise<PitchModule[]>;
  }),

  create: publicProcedure
    .input(pitchModuleSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pitchModule.create({
        data: input,
      }) as Promise<PitchModule>;
    }),

  update: publicProcedure
    .input(pitchModuleSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.pitchModule.update({
        where: { id },
        data,
      }) as Promise<PitchModule>;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pitchModule.delete({
        where: { id: input.id },
      }) as Promise<PitchModule>;
    }),

  generateWordDocument: publicProcedure
    .input(z.object({
      moduleIds: z.array(z.string()),
      templateFile: templateFileSchema
    }))
    .output(z.object({
      buffer: z.string(),
      filename: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log('Starting generateWordDocument mutation with input:', {
          moduleIds: input.moduleIds,
          hasTemplateFile: !!input.templateFile
        });

        const modules = await ctx.db.pitchModule.findMany({
          where: {
            id: {
              in: input.moduleIds
            }
          }
        });

        console.log('Found modules:', modules.length);

        if (modules.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No modules found with the provided IDs"
          });
        }

        // Get template buffer
        let templateBuffer: Buffer;
        if (!input.templateFile) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No template file provided. Please upload or select a template before exporting."
          });
        }

        try {
          // Validate base64 string
          const base64Data = input.templateFile.data;
          if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            throw new Error('Invalid base64 string received');
          }

          // Convert base64 to Buffer
          templateBuffer = Buffer.from(base64Data, 'base64');
          
          // Validate DOCX file
          const zip = new PizZip(templateBuffer);
          const requiredFiles = ['word/document.xml', '[Content_Types].xml'];
          const hasRequiredFiles = requiredFiles.every(file => zip.file(file));
          
          if (!hasRequiredFiles) {
            const missingFiles = requiredFiles.filter(file => !zip.file(file));
            throw new Error(`Invalid DOCX file: missing required files: ${missingFiles.join(', ')}`);
          }

          const documentXml = zip.file('word/document.xml');
          if (!documentXml) {
            throw new Error('Invalid DOCX file: missing document.xml');
          }

          const content = documentXml.asText();
          if (!content || content.length === 0) {
            throw new Error('Invalid DOCX file: document.xml is empty');
          }

          console.log('Template file validated as DOCX');
        } catch (error) {
          console.error('Template validation error:', error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid Word document: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }

        // Prepare content for transfer
        const content = modules.map(module => ({
          type: 'pitch' as const,
          title: module.title,
          description: module.description,
          content: `${module.title}\n\n${module.description}`
        }));

        console.log('Prepared content for transfer:', content.length, 'items');

        try {
          // Use OpenAI to transfer content to template
          console.log('Starting OpenAI content transfer');
          const outputBuffer = await transferContentToTemplate(content, templateBuffer, {
            preserveFormatting: true,
            maintainSections: true
          });
          console.log('OpenAI content transfer completed, output size:', outputBuffer.length);

          return {
            buffer: outputBuffer,
            filename: `pitch-document-${new Date().toISOString().split('T')[0]}.docx`
          };
        } catch (error) {
          console.error('Error in OpenAI content transfer:', error);
          
          if (error instanceof Error && 
              (error.message.includes('quota') || 
               error.message.includes('billing') || 
               (error as OpenAIError).code === 'insufficient_quota')) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "OpenAI API quota exceeded. Please check your OpenAI account status and billing details at https://platform.openai.com/account/usage"
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error in content transfer: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      } catch (error) {
        console.error("Error in generateWordDocument:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate Word document: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }),
});