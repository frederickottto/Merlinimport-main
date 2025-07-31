/**
 * Formats a search query for the TED API, including support for CPV codes.
 * @param searchTerm The text search term
 * @param cpvCodes Array of CPV codes to filter by
 * @returns Formatted query string
 */
export function formatTEDQuery(searchTerm: string, cpvCodes: string[]): string {
  const conditions: string[] = [];

  // Add text search condition if provided
  if (searchTerm.trim()) {
    // If the search term already contains operators (AND, OR, NOT), use it as is
    if (searchTerm.toUpperCase().includes(' AND ') || 
        searchTerm.toUpperCase().includes(' OR ') || 
        searchTerm.toUpperCase().includes(' NOT ')) {
      conditions.push(`(${searchTerm})`);
    } else {
      // For simple search terms, search across text fields
      const terms = searchTerm.trim().split(/\s+/);
      const fieldQueries = terms.map(term => 
        `(notice-title~"${term}" OR organisation-name-buyer~"${term}")`
      );
      conditions.push(`(${fieldQueries.join(' AND ')})`);
    }
  }

  // Add CPV code conditions if provided
  if (cpvCodes.length > 0) {
    const cpvConditions = cpvCodes.map(code => `classification-cpv=${code}*`);
    conditions.push(`(${cpvConditions.join(' OR ')})`);
  }

  // If no conditions, return a default query that matches all
  if (conditions.length === 0) {
    return '*';
  }

  // Combine all conditions with AND
  return conditions.join(' AND ');
} 