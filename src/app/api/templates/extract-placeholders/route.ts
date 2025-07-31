import { NextResponse } from "next/server";
import { listCommands } from "docx-templates";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();

    // Extract commands from the template
    const commands = await listCommands(buffer, ['{{', '}}']);
    
    // Filter for INS commands (these are our placeholders)
    const placeholders = commands
      .filter(cmd => cmd.type === 'INS')
      .map(cmd => ({
        key: cmd.code.trim(),
        description: `Placeholder for ${cmd.code.trim()}`
      }));

    return NextResponse.json({ placeholders });
  } catch (error) {
    console.error("Error extracting placeholders:", error);
    return NextResponse.json(
      { error: "Failed to extract placeholders" },
      { status: 500 }
    );
  }
} 