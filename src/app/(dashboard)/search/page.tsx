"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2, ChevronDown, ChevronRight, Plus, X, Menu, X as XIcon, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CPVDivision } from "@/lib/cpv";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// EU Countries with their codes and names
const EU_COUNTRIES = [
  { code: 'AUT', name: 'Austria' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'BGR', name: 'Bulgaria' },
  { code: 'HRV', name: 'Croatia' },
  { code: 'CYP', name: 'Cyprus' },
  { code: 'CZE', name: 'Czech Republic' },
  { code: 'DNK', name: 'Denmark' },
  { code: 'EST', name: 'Estonia' },
  { code: 'FIN', name: 'Finland' },
  { code: 'FRA', name: 'France' },
  { code: 'DEU', name: 'Germany' },
  { code: 'GRC', name: 'Greece' },
  { code: 'HUN', name: 'Hungary' },
  { code: 'IRL', name: 'Ireland' },
  { code: 'ITA', name: 'Italy' },
  { code: 'LVA', name: 'Latvia' },
  { code: 'LTU', name: 'Lithuania' },
  { code: 'LUX', name: 'Luxembourg' },
  { code: 'MLT', name: 'Malta' },
  { code: 'NLD', name: 'Netherlands' },
  { code: 'POL', name: 'Poland' },
  { code: 'PRT', name: 'Portugal' },
  { code: 'ROU', name: 'Romania' },
  { code: 'SVK', name: 'Slovakia' },
  { code: 'SVN', name: 'Slovenia' },
  { code: 'ESP', name: 'Spain' },
  { code: 'SWE', name: 'Sweden' },
] as const;

interface MultilingualText {
  [key: string]: string | string[];
}

interface Notice {
  "notice-identifier": string;
  "notice-type": string;
  "publication-date": string;
  "notice-title": MultilingualText;
  "organisation-name-buyer": MultilingualText;
  "organisation-city-buyer": string;
  "organisation-country-buyer": string;
  "classification-cpv"?: string;
  "deadline-date-lot"?: string;
  "BT-27-Lot"?: string;
  "BT-27-Lot-Currency"?: string;
}

interface SearchResponse {
  results: Notice[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  error?: string;
}

interface OeffentlichevergabeNotice {
  title: string;
  location: string;
  'publication-date': string;
  'deadline-date': string;
  buyer: string;
  value: string;
  url: string | null;
  type: string;
  procedure: string;
}

interface BundServiceItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  location?: string;
  buyer?: string;
  deadline?: string;
  leistung?: string;
  region?: string;
}

// Leistungen categories
const LEISTUNGEN = [
  { value: '', label: 'Alle Ausschreibungen' },
  { value: 'leistung-bauleistungen', label: 'Bauleistungen (9098)' },
  { value: 'leistung-dienstleistungen', label: 'Dienstleistungen (3574)' },
  { value: 'leistung-lieferleistungen', label: 'Lieferleistungen (2199)' },
  { value: 'leistung-informationstechnik', label: 'Informationstechnik (137)' },
  { value: 'leistung-forschung', label: 'Forschung und Entwicklung (131)' },
  { value: 'leistung-arbeitsmarktdienstleistungen', label: 'Arbeitsmarktdienstleistungen (104)' },
  { value: 'leistung-kraftfahrwesen', label: 'Kraftfahrwesen (92)' },
  { value: 'leistung-bekleidung', label: 'Bekleidung, Möbel und Druck (49)' },
  { value: 'leistung-kommunikation', label: 'Kommunikations- und Elektrotechnik (43)' },
  { value: 'leistung-maschinen', label: 'Maschinen (38)' },
  { value: 'leistung-medizintechnik', label: 'Medizintechnik (32)' },
  { value: 'leistung-energiequellen', label: 'Energiequellen (18)' },
  { value: 'leistung-sanitaetswesen', label: 'Sanitätswesen (14)' },
  { value: 'leistung-lebensmittel', label: 'Lebensmittel (13)' },
  { value: 'leistung-wasser', label: 'Rohwasser, Reinwasser (10)' },
  { value: 'leistung-natuerlich', label: 'Natürliche Erzeugnisse (8)' },
  { value: 'leistung-waffen', label: 'Waffen, Munition und technische Sondergeräte (3)' },
  { value: 'leistung-fertig', label: 'Fertigerzeugnisse (2)' },
  { value: 'leistung-metalle', label: 'Metalle, Nichtmetalle (1)' }
] as const;

// German regions
const REGIONS = [
  { value: 'Baden-Württemberg', label: 'Baden-Württemberg' },
  { value: 'Bayern', label: 'Bayern' },
  { value: 'Berlin', label: 'Berlin' },
  { value: 'Brandenburg', label: 'Brandenburg' },
  { value: 'Bremen', label: 'Bremen' },
  { value: 'Hamburg', label: 'Hamburg' },
  { value: 'Hessen', label: 'Hessen' },
  { value: 'Mecklenburg-Vorpommern', label: 'Mecklenburg-Vorpommern' },
  { value: 'Niedersachsen', label: 'Niedersachsen' },
  { value: 'Nordrhein-Westfalen', label: 'Nordrhein-Westfalen' },
  { value: 'Rheinland-Pfalz', label: 'Rheinland-Pfalz' },
  { value: 'Saarland', label: 'Saarland' },
  { value: 'Sachsen', label: 'Sachsen' },
  { value: 'Sachsen-Anhalt', label: 'Sachsen-Anhalt' },
  { value: 'Schleswig-Holstein', label: 'Schleswig-Holstein' },
  { value: 'Thüringen', label: 'Thüringen' }
] as const;

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCPVCodes, setSelectedCPVCodes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [customCPVCode, setCustomCPVCode] = useState("");
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Notice[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [resultsOeffentlichevergabe, setResultsOeffentlichevergabe] = useState<OeffentlichevergabeNotice[]>([]);
  const [pageOeffentlichevergabe, setPageOeffentlichevergabe] = useState(1);
  const [bundServiceItems, setBundServiceItems] = useState<BundServiceItem[]>([]);
  const [bundServicePagination, setBundServicePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  });
  const [selectedLeistungen, setSelectedLeistungen] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [bundServiceSearch, setBundServiceSearch] = useState('');

  const ITEMS_PER_PAGE = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchAusschreibungen = useCallback(async (term: string, page: number = 1) => {
    if (!term && selectedCPVCodes.length === 0 && selectedCountries.length === 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ausschreibungen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: term,
          cpvCodes: selectedCPVCodes,
          countries: selectedCountries,
          page,
          limit: ITEMS_PER_PAGE,
        }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      setResults(data.results);
      setTotal(data.total);
      setCurrentPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCPVCodes, selectedCountries, ITEMS_PER_PAGE]);

  useEffect(() => {
    if (debouncedSearchTerm || selectedCPVCodes.length > 0 || selectedCountries.length > 0) {
      fetchAusschreibungen(debouncedSearchTerm, 1);
    }
  }, [debouncedSearchTerm, selectedCPVCodes, selectedCountries, fetchAusschreibungen]);

  const fetchOeffentlichevergabe = async (term: string, pageNumber: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/oeffentlichevergabe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: term,
          page: pageNumber,
          limit: ITEMS_PER_PAGE,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch results');
      }

      const data = await response.json();
      setResultsOeffentlichevergabe(data.notices || []);
      setTotal(data.pagination?.total || 0);
      setPageOeffentlichevergabe(data.pagination?.page || 1);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResultsOeffentlichevergabe([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBundServiceItems = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(selectedLeistungen.length > 0 && { leistung: selectedLeistungen.join(',') }),
        ...(selectedRegions.length > 0 && { region: selectedRegions.join(',') }),
        ...(bundServiceSearch && { search: bundServiceSearch })
      });

      const response = await fetch(`/api/bundservice?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Bundesservice items');
      }
      const data = await response.json();
      setBundServiceItems(data.items);
      setBundServicePagination(data.pagination);
    } catch (error) {
      console.error('Error fetching Bundesservice items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLeistungen, selectedRegions, bundServiceSearch]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchAusschreibungen(debouncedSearchTerm, newPage);
  };

  const handleCPVChange = (code: string, checked: boolean) => {
    setSelectedCPVCodes(prev => 
      checked 
        ? [...prev, code]
        : prev.filter(c => c !== code)
    );
  };

  const handleCustomCPVAdd = () => {
    if (customCPVCode.trim() && !selectedCPVCodes.includes(customCPVCode.trim())) {
      setSelectedCPVCodes(prev => [...prev, customCPVCode.trim()]);
      setCustomCPVCode("");
    }
  };

  const handleCustomCPVKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomCPVAdd();
    }
  };

  const toggleDivision = (division: string) => {
    setExpandedDivisions(prev =>
      prev.includes(division)
        ? prev.filter(d => d !== division)
        : [...prev, division]
    );
  };

  const removeCPVCode = (code: string) => {
    setSelectedCPVCodes(prev => prev.filter(c => c !== code));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(parseFloat(amount));
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  // Add auto-refresh effect
  useEffect(() => {
    // Initial fetch
    fetchBundServiceItems(1);

    // Set up auto-refresh every 15 minutes
    const interval = setInterval(() => {
      fetchBundServiceItems(1);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedLeistungen, selectedRegions, bundServiceSearch, fetchBundServiceItems]); // Re-fetch when filters change

  const handleLeistungChange = (leistung: string) => {
    setSelectedLeistungen((prev: string[]) => 
      prev.includes(leistung)
        ? prev.filter(l => l !== leistung)
        : [...prev, leistung]
    );
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegions((prev: string[]) => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Ausschreibungssuche</h1>
          <p className="text-muted-foreground mt-2">
            Sie können hier auf verschiedene öffentliche Datenbanken zugreifen, um Ausschreibungen zu finden.
          </p>
        </div>

        <Tabs defaultValue="ted" className="space-y-2">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="ted">Tender Electronic Daily</TabsTrigger>
            <TabsTrigger value="publicTenders">Öffentliche Ausschreibungen</TabsTrigger>
            <TabsTrigger value="bundService">Bund Service RSS</TabsTrigger>
          </TabsList>

          <TabsContent value="ted">
            <Card className="border-none shadow-none p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href="https://simap.ted.europa.eu/cpv" target="_blank" rel="noopener noreferrer">
                        CPV Guide
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
                      className="h-8 w-8"
                    >
                      {isMenuCollapsed ? <Menu className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className={`transition-all duration-300 ${isMenuCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Countries</Label>
                        <Select
                          onValueChange={handleCountryChange}
                          value={selectedCountries[0] || undefined}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select countries" />
                          </SelectTrigger>
                          <SelectContent>
                            {EU_COUNTRIES.map(country => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCountries.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCountries.map(code => {
                              const country = EU_COUNTRIES.find(c => c.code === code);
                              return (
                                <Badge key={code} variant="secondary" className="flex items-center gap-1">
                                  {country?.name || code}
                                  <button
                                    onClick={() => handleCountryChange(code)}
                                    className="hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="mb-2 block">CPV Codes</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter custom CPV code"
                            value={customCPVCode}
                            onChange={(e) => setCustomCPVCode(e.target.value)}
                            onKeyPress={handleCustomCPVKeyPress}
                          />
                          <Button size="icon" onClick={handleCustomCPVAdd}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {selectedCPVCodes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCPVCodes.map(code => (
                              <Badge key={code} variant="secondary" className="flex items-center gap-1">
                                {code}
                                <button
                                  onClick={() => removeCPVCode(code)}
                                  className="hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <ScrollArea className="h-[200px]">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(CPVDivision).map(([key, value]) => (
                          <Collapsible
                            key={value}
                            open={expandedDivisions.includes(value)}
                            onOpenChange={() => toggleDivision(value)}
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                              <div className="flex items-center gap-2">
                                {expandedDivisions.includes(value) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="text-sm font-medium">{value}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{key}</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 mt-2">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`cpv-${value}`}
                                    checked={selectedCPVCodes.includes(value)}
                                    onCheckedChange={(checked) => handleCPVChange(value, checked as boolean)}
                                  />
                                  <Label htmlFor={`cpv-${value}`} className="text-sm">
                                    {value} - {key}
                                  </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Division level - Use this for broader category search
                                </p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Enter search term or expert query (e.g., title:software AND buyer:government)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xl"
                  />
                </div>
                <Button
                  onClick={() => fetchAusschreibungen(searchTerm, 1)}
                  disabled={isLoading || (!searchTerm && selectedCPVCodes.length === 0 && selectedCountries.length === 0)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  {error && (
                    <div className="text-red-500 mb-4">
                      Error: {error}
                    </div>
                  )}

                  {results.length > 0 ? (
                    <div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Found {total} results
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Publication Date</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((notice, index) => {
                            // Helper function to get English text from multilingual object
                            const getEnglishText = (value: string | MultilingualText | null | undefined): string => {
                              if (!value) return '';
                              if (typeof value === 'string') return value;
                              if (typeof value === 'object') {
                                // Try to get English text first
                                if (value.eng) {
                                  const engText = value.eng;
                                  return Array.isArray(engText) ? engText[0] : engText;
                                }
                                // If no English, get the first available language
                                const firstLang = Object.keys(value)[0];
                                if (firstLang) {
                                  const text = value[firstLang];
                                  return Array.isArray(text) ? text[0] : text;
                                }
                                return JSON.stringify(value);
                              }
                              return String(value);
                            };

                            // Get title and buyer name in English
                            const title = getEnglishText(notice["notice-title"]);
                            const buyer = getEnglishText(notice["organisation-name-buyer"]);
                            
                            // Get location (country code)
                            const location = String(notice["organisation-country-buyer"] || '').split(',')[0].trim();

                            return (
                              <TableRow key={`${notice["notice-identifier"] || ''}-${notice["publication-date"] || ''}-${index}`}>
                                <TableCell className="font-medium max-w-md">
                                  <a 
                                    href={`https://ted.europa.eu/udl?uri=TED:NOTICE:${notice["notice-identifier"]}:TEXT:EN:HTML`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline text-primary"
                                  >
                                    {title || 'No title available'}
                                  </a>
                                </TableCell>
                                <TableCell>
                                  {location || '-'}
                                </TableCell>
                                <TableCell>
                                  {notice["publication-date"] ? formatDate(notice["publication-date"]) : '-'}
                                </TableCell>
                                <TableCell>
                                  {notice["deadline-date-lot"] ? formatDate(notice["deadline-date-lot"]) : '-'}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {buyer || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {notice["BT-27-Lot"] ? 
                                    formatCurrency(
                                      String(notice["BT-27-Lot"] || '0'),
                                      String(notice["BT-27-Lot-Currency"] || 'EUR')
                                    ) 
                                    : '-'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {total > ITEMS_PER_PAGE && (
                        <div className="mt-4 flex justify-center">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                  isActive={currentPage !== 1}
                                />
                              </PaginationItem>
                              <PaginationItem>
                                Page {currentPage}
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => hasMore && handlePageChange(currentPage + 1)}
                                  isActive={hasMore}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </div>
                  ) : (searchTerm || selectedCPVCodes.length > 0 || selectedCountries.length > 0) && !isLoading ? (
                    <div className="text-center text-muted-foreground py-8">
                      No results found
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="publicTenders">
            <Card className="border-none shadow-none p-6">
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Enter search term (e.g., software, IT services, consulting)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xl"
                />
                <Button
                  onClick={() => fetchOeffentlichevergabe(searchTerm, 1)}
                  disabled={isLoading || !searchTerm}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {error && (
                <div className="text-red-500 mb-4">
                  Error: {error}
                </div>
              )}

              {resultsOeffentlichevergabe.length > 0 ? (
                <div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Found {total} results
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Publication Date</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultsOeffentlichevergabe.map((notice, index) => (
                        <TableRow key={`${notice.title}-${index}`}>
                          <TableCell className="font-medium max-w-md">
                            {notice.url ? (
                              <a 
                                href={notice.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-primary"
                              >
                                {notice.title}
                              </a>
                            ) : (
                              notice.title
                            )}
                          </TableCell>
                          <TableCell>{notice.location}</TableCell>
                          <TableCell>{notice['publication-date']}</TableCell>
                          <TableCell>{notice['deadline-date']}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {notice.buyer}
                          </TableCell>
                          <TableCell>{notice.type}</TableCell>
                          <TableCell>{notice.procedure}</TableCell>
                          <TableCell className="text-right">
                            {notice.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {total > ITEMS_PER_PAGE && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => pageOeffentlichevergabe > 1 && fetchOeffentlichevergabe(searchTerm, pageOeffentlichevergabe - 1)}
                              isActive={pageOeffentlichevergabe > 1}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            Page {pageOeffentlichevergabe}
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => hasMore && fetchOeffentlichevergabe(searchTerm, pageOeffentlichevergabe + 1)}
                              isActive={hasMore}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              ) : !isLoading && searchTerm && (
                <div className="text-center text-muted-foreground py-8">
                  No results found
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="bundService">
            <Card className="border-none shadow-none p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Bundesservice Announcements</h3>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchBundServiceItems(1)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search in title, description, or buyer..."
                        value={bundServiceSearch}
                        onChange={(e) => setBundServiceSearch(e.target.value)}
                        className="max-w-xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <Label className="mb-2 block">Leistungen</Label>
                      <div className="flex flex-wrap gap-2">
                        {LEISTUNGEN.map((leistung) => (
                          <Badge
                            key={leistung.value}
                            variant={selectedLeistungen.includes(leistung.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleLeistungChange(leistung.value)}
                          >
                            {leistung.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Regions</Label>
                      <div className="flex flex-wrap gap-2">
                        {REGIONS.map((region) => (
                          <Badge
                            key={region.value}
                            variant={selectedRegions.includes(region.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleRegionChange(region.value)}
                          >
                            {region.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {bundServiceItems.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {item.title}
                          </a>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {item.location && (
                            <div>
                              <span className="font-medium">Location:</span> {item.location}
                            </div>
                          )}
                          {item.buyer && (
                            <div>
                              <span className="font-medium">Buyer:</span> {item.buyer}
                            </div>
                          )}
                          {item.deadline && (
                            <div>
                              <span className="font-medium">Deadline:</span> {item.deadline}
                            </div>
                          )}
                          {item.leistung && (
                            <div>
                              <span className="font-medium">Leistung:</span> {item.leistung}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Published:</span> {formatDate(item.pubDate)}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}

                  {bundServiceItems.length === 0 && !isLoading && (
                    <p className="text-center text-muted-foreground">
                      No items found.
                    </p>
                  )}

                  {bundServicePagination.hasMore && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => fetchBundServiceItems(bundServicePagination.page + 1)}
                        disabled={isLoading}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 