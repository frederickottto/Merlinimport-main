import type { ConditionsOfParticipation } from "@/server/controllers/tender/conditionsOfParticipation/schema";

/**
 * Generates a search query string from conditions of participation
 * @param conditions The conditions of participation
 * @returns A formatted search query string
 */
export function generateSearchQuery(conditions: Partial<ConditionsOfParticipation>): string {
  const queryParts: string[] = [];

  // Add title if present
  if (conditions.title) {
    queryParts.push(`title:"${conditions.title}"`);
  }

  // Add requirements if present
  if (conditions.requirements) {
    // Split requirements into keywords and add them
    const keywords = conditions.requirements
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter out short words
      .map(word => word.toLowerCase());
    
    if (keywords.length > 0) {
      queryParts.push(`(${keywords.map(k => `keywords:"${k}"`).join(" OR ")})`);
    }
  }

  // Add academic degrees if present
  if (conditions.academicDegree && conditions.academicDegree.length > 0) {
    queryParts.push(`(${conditions.academicDegree.map(degree => `academicDegree:"${degree}"`).join(" OR ")})`);
  }

  // Add academic studies if present
  if (conditions.academicStudy && conditions.academicStudy.length > 0) {
    queryParts.push(`(${conditions.academicStudy.map(study => `academicStudy:"${study}"`).join(" OR ")})`);
  }

  // Add experience requirements
  const experienceFields = [
    { field: "experienceIt", label: "IT" },
    { field: "experienceIs", label: "IS" },
    { field: "experienceItGs", label: "IT-GS" },
    { field: "experienceGPS", label: "GPS" },
    { field: "experienceOther", label: "Other" },
    { field: "experienceAll", label: "All" },
  ];

  const experienceQueries = experienceFields
    .map(({ field, label }) => {
      const value = conditions[field as keyof ConditionsOfParticipation];
      return value ? `${label} experience:${value}+` : null;
    })
    .filter(Boolean);

  if (experienceQueries.length > 0) {
    queryParts.push(`(${experienceQueries.join(" OR ")})`);
  }

  // Add executive position if required
  if (conditions.executivePosition) {
    queryParts.push('executivePosition:true');
  }

  // Add criterion type if present
  if (conditions.criterionType) {
    queryParts.push(`criterionType:"${conditions.criterionType}"`);
  }

  // Combine all parts with AND
  return queryParts.join(" AND ");
} 