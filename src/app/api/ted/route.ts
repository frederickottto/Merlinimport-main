import { NextResponse } from 'next/server';
import { formatTEDQuery } from '@/lib/ted-query';

interface TEDNotice {
  'title-lot'?: string;
  'notice-title'?: string;
  'publication-date'?: string;
  'deadline-date-lot'?: string;
  'estimated-value-lot'?: number;
  'estimated-value-cur-lot'?: string;
  'notice-identifier'?: string;
  'place-of-performance'?: string;
  'organisation-city-buyer'?: string;
  'organisation-country-buyer'?: string;
}

export async function POST(request: Request) {
  try {
    const { searchTerm, cpvCodes = [], page = 1, limit = 10, country = 'DEU' } = await request.json();

    if (!searchTerm && cpvCodes.length === 0) {
      return NextResponse.json(
        { error: 'Either search term or CPV codes must be provided' },
        { status: 400 }
      );
    }

    // Format the search query
    const formattedQuery = formatTEDQuery(searchTerm, cpvCodes);

    // Calculate date 14 days ago
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const dateStr = fourteenDaysAgo.toISOString().split('T')[0].replace(/-/g, '');

    // Construct the TED API request body with correct field names
    const tedRequestBody = {
      query: `(${formattedQuery}) AND publication-date>=${dateStr} AND organisation-country-buyer=${country}`,
      page: parseInt(page),
      limit: parseInt(limit),
      scope: "ACTIVE",
      paginationMode: "PAGE_NUMBER",
      onlyLatestVersions: true,
      fields: [
        "notice-type",
        "publication-date",
        "organisation-name-buyer",
        "title-lot",
        "identifier-lot",
        "deadline-date-lot",
        "organisation-city-buyer",
        "organisation-country-buyer",
        "estimated-value-lot",
        "estimated-value-cur-lot",
        "classification-cpv",
        "notice-identifier",
        "notice-title",
        "place-of-performance"
      ]
    };

    const response = await fetch('https://api.ted.europa.eu/v3/notices/search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tedRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.message || 'Failed to fetch from TED API',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Process the notices to format dates and add URLs
    const processedNotices = (data.notices || []).map((notice: TEDNotice) => {
      // Get the title from either title-lot or notice-title
      const title = notice['title-lot'] || notice['notice-title'] || 'No title available';
      
      // Get the location from place-of-performance or city
      const location = notice['place-of-performance'] || 
                      (notice['organisation-city-buyer'] ? `${notice['organisation-city-buyer']}, ${notice['organisation-country-buyer']}` : 
                      notice['organisation-country-buyer'] || '-');

      // Format dates
      const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('de-DE');
        } catch {
          return '-';
        }
      };

      return {
        ...notice,
        title,
        location,
        'publication-date': formatDate(notice['publication-date']),
        'deadline-date-lot': formatDate(notice['deadline-date-lot']),
        'estimated-value-lot': notice['estimated-value-lot'] ? 
          `${notice['estimated-value-lot']} ${notice['estimated-value-cur-lot'] || ''}` : '-',
        url: notice['notice-identifier'] ? 
          `https://ted.europa.eu/udl?uri=TED:NOTICE:${notice['notice-identifier']}:TEXT:EN:HTML` : null
      };
    });

    return NextResponse.json({
      results: processedNotices,
      total: data.metadata?.totalElements || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: data.metadata?.hasNextPage || false
    });

  } catch (error) {
    console.error('Error in ausschreibungen API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 