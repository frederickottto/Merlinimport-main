import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { parse } from 'csv-parse/sync';

interface SearchRequest {
  searchTerm: string;
  page: number;
  limit: number;
}

interface NoticeRecord {
  title: string;
  location: string;
  buyer: string;
  description?: string;
  shortDescription?: string;
  [key: string]: string | undefined;
}

export async function GET() {
  console.log('GET request received');
  return NextResponse.json({ message: 'API is working' });
}

export async function POST(request: Request) {
  console.log('POST request received');
  
  try {
    const body = await request.json() as SearchRequest;
    console.log('Request body:', body);

    const { searchTerm, page = 1, limit = 10 } = body;

    if (!searchTerm) {
      console.log('No search term provided');
      return NextResponse.json(
        { error: 'Search term must be provided' },
        { status: 400 }
      );
    }

    // Calculate the current month for pubMonth parameter
    const now = new Date();
    const pubMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    console.log('Using pubMonth:', pubMonth);

    // Construct the API request URL with query parameters
    const apiUrl = new URL('https://oeffentlichevergabe.de/api/notice-exports');
    apiUrl.searchParams.append('pubMonth', pubMonth);
    apiUrl.searchParams.append('format', 'csv.zip');

    console.log('API URL:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.bekanntmachungsservice.csv.zip+zip',
        'User-Agent': 'Mozilla/5.0 (compatible; MerlinApp/1.0)'
      },
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response Content:', errorText);
      console.error('API Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Failed to fetch from oeffentlichevergabe.de API: ${response.status} ${response.statusText}\n${errorText}`);
    }

    // Log the content type to verify we're getting a ZIP file
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if the response is actually a ZIP file by looking at the first few bytes
    const buffer = await response.arrayBuffer();
    const firstBytes = new Uint8Array(buffer.slice(0, 4));
    const isZip = firstBytes[0] === 0x50 && firstBytes[1] === 0x4B && firstBytes[2] === 0x03 && firstBytes[3] === 0x04;

    if (!isZip) {
      const errorText = await response.text();
      console.error('Unexpected response content:', errorText);
      throw new Error(`Expected ZIP file but got invalid content. Content-Type: ${contentType}`);
    }

    console.log('Received ZIP file of size:', buffer.byteLength);
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(buffer);
    
    console.log('Files in ZIP:', Object.keys(zipContent.files));
    
    // Define which CSV files to search through
    const searchableFiles = [
      'notice.csv',
      'organisation.csv',
      'purpose.csv',
      'classification.csv',
      'placeOfPerformance.csv'
    ];

    let allRecords: NoticeRecord[] = [];

    // Process each CSV file
    for (const fileName of searchableFiles) {
      const file = zipContent.file(fileName);
      if (!file) {
        console.log(`File ${fileName} not found in ZIP`);
        continue;
      }

      const csvContent = await file.async('text');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as NoticeRecord[];

      console.log(`Found ${records.length} records in ${fileName}`);
      allRecords = [...allRecords, ...records];
    }

    console.log('Total records found:', allRecords.length);
    
    // Filter notices based on search term
    const filteredNotices = allRecords.filter((record: NoticeRecord) => {
      const searchFields = Object.values(record).filter((field): field is string => 
        typeof field === 'string' && field !== undefined && field !== null
      );

      return searchFields.some(field => 
        field.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotices = filteredNotices.slice(startIndex, endIndex);

    console.log('Processed notices:', paginatedNotices.length);
    console.log('Pagination:', { page, limit, total: filteredNotices.length });

    return NextResponse.json({
      notices: paginatedNotices,
      pagination: {
        page,
        limit,
        total: filteredNotices.length,
        hasMore: endIndex < filteredNotices.length
      }
    });

  } catch (error) {
    console.error('Error in oeffentlichevergabe API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 