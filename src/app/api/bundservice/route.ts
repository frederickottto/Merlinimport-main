import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['category', 'category'],
      ['dc:date', 'pubDate'],
      ['description', 'description'],
    ],
  },
});

interface BundServiceItem {
  title: string;
  link: string;
  pubDate: string;
  category?: string;
  description?: string;
  location?: string;
  deadline?: string;
  buyer?: string;
  leistung?: string;
  region?: string;
}

// Cache the feed data to avoid hitting the RSS feed too frequently
let cachedFeed: BundServiceItem[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// The main RSS feed URL with the correct structure
const BASE_URL = 'https://www.service.bund.de/Content/DE/Ausschreibungen/Suche/Formular.html';

// Leistungen categories with their URL parameters and counts
const LEISTUNGEN = {
  ALLE: { value: '', label: 'Alle Ausschreibungen' },
  BAULEISTUNGEN: { value: 'leistung-bauleistungen', label: 'Bauleistungen (9098)' },
  DIENSTLEISTUNGEN: { value: 'leistung-dienstleistungen', label: 'Dienstleistungen (3574)' },
  LIEFERLEISTUNGEN: { value: 'leistung-lieferleistungen', label: 'Lieferleistungen (2199)' },
  IT: { value: 'leistung-informationstechnik', label: 'Informationstechnik (137)' },
  FORSCHUNG: { value: 'leistung-forschung', label: 'Forschung und Entwicklung (131)' },
  ARBEITSMARKT: { value: 'leistung-arbeitsmarktdienstleistungen', label: 'Arbeitsmarktdienstleistungen (104)' },
  KRAFTFAHRWESEN: { value: 'leistung-kraftfahrwesen', label: 'Kraftfahrwesen (92)' },
  BEKLEIDUNG: { value: 'leistung-bekleidung', label: 'Bekleidung, Möbel und Druck (49)' },
  KOMMUNIKATION: { value: 'leistung-kommunikation', label: 'Kommunikations- und Elektrotechnik (43)' },
  MASCHINEN: { value: 'leistung-maschinen', label: 'Maschinen (38)' },
  MEDIZINTECHNIK: { value: 'leistung-medizintechnik', label: 'Medizintechnik (32)' },
  ENERGIE: { value: 'leistung-energiequellen', label: 'Energiequellen (18)' },
  SANITAET: { value: 'leistung-sanitaetswesen', label: 'Sanitätswesen (14)' },
  LEBENSMITTEL: { value: 'leistung-lebensmittel', label: 'Lebensmittel (13)' },
  WASSER: { value: 'leistung-wasser', label: 'Rohwasser, Reinwasser (10)' },
  NATUERLICH: { value: 'leistung-natuerlich', label: 'Natürliche Erzeugnisse (8)' },
  WAFFEN: { value: 'leistung-waffen', label: 'Waffen, Munition und technische Sondergeräte (3)' },
  FERTIG: { value: 'leistung-fertig', label: 'Fertigerzeugnisse (2)' },
  METALLE: { value: 'leistung-metalle', label: 'Metalle, Nichtmetalle (1)' }
} as const;

// German regions
const REGIONS = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen'
] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const leistung = searchParams.get('leistung');
    const region = searchParams.get('region');
    const searchTerm = searchParams.get('search')?.toLowerCase();

    // Check if we need to refresh the cache
    const now = Date.now();
    if (now - lastFetchTime > CACHE_DURATION || cachedFeed.length === 0) {
      try {
        // Construct the RSS feed URL with the correct parameters
        const feedUrl = new URL(BASE_URL);
        feedUrl.searchParams.set('nn', '4641482');
        feedUrl.searchParams.set('resultsPerPage', '100');
        feedUrl.searchParams.set('sortOrder', 'dateOfIssue_dt desc');
        feedUrl.searchParams.set('jobsrss', 'true');
        
        // Add Leistungen filter if specified
        if (leistung) {
          feedUrl.searchParams.set('cl2Categories_LeistungenErzeugnisse', leistung);
        }

        // Fetch the RSS feed
        const feed = await parser.parseURL(feedUrl.toString());
        
        // Process items and extract additional information from description
        cachedFeed = feed.items.map(item => {
          // Extract location, deadline, and buyer from description
          const description = item.description || '';
          const locationMatch = description.match(/Vergabestelle:.*?\n/);
          const deadlineMatch = description.match(/Angebotsfrist:.*?\n/);
          const buyerMatch = description.match(/Vergabestelle:.*?\n/);
          
          // Extract Leistung type from description
          let leistungType = '';
          Object.entries(LEISTUNGEN).forEach(([, value]) => {
            if (description.toLowerCase().includes(value.label.toLowerCase().split(' ')[0])) {
              leistungType = value.label;
            }
          });

          // Extract region from location
          const location = locationMatch ? locationMatch[0].replace('Vergabestelle:', '').trim() : '';
          const regionMatch = REGIONS.find(r => location.includes(r));

          return {
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || '',
            description: description,
            location: location,
            deadline: deadlineMatch ? deadlineMatch[0].replace('Angebotsfrist:', '').trim() : '',
            buyer: buyerMatch ? buyerMatch[0].replace('Vergabestelle:', '').trim() : '',
            leistung: leistungType,
            region: regionMatch || ''
          };
        });

        lastFetchTime = now;
      } catch (error) {
        console.error('Error fetching RSS feed:', error);
        // If the feed fails, return the cached data if available
        if (cachedFeed.length === 0) {
          throw new Error('Failed to fetch RSS feed and no cached data available');
        }
      }
    }

    // Apply filters
    let filteredItems = [...cachedFeed];
    
    if (region) {
      filteredItems = filteredItems.filter(item => item.region === region);
    }

    if (searchTerm) {
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.buyer?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: filteredItems.length,
        hasMore: endIndex < filteredItems.length
      }
    });

  } catch (error) {
    console.error('Error in Bundesservice API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 