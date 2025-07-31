declare module 'xlsx' {
  interface WorkSheet {
    [key: string]: string | number | boolean | null;
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  interface XLSX {
    read(data: Uint8Array, opts: { type: string }): WorkBook;
    utils: {
      book_new(): WorkBook;
      aoa_to_sheet(data: (string | number | boolean | null)[][]): WorkSheet;
      book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void;
      sheet_to_json(ws: WorkSheet, opts: { header: number }): (string | number | boolean | null)[][];
    };
    write(wb: WorkBook, opts: { type: string; bookType: string }): Buffer;
  }

  const xlsx: XLSX;
  export = xlsx;
} 