

// Map placeholder keys to their corresponding database fields
export const employeePlaceholderToSchemaMap: Record<string, string[]> = {
  'employee_name': ['foreName', 'lastName'],
  'employee_role': ['employeeRank.employeePositionLong'],
  'employee_description': ['description'],
  'employee_contact': ['mobile', 'telephone'],
  'employee_experience_it': ['experienceIt'],
  'employee_experience_is': ['experienceIs'],
  'employee_experience_itgs': ['experienceItGs'],
  'employee_experience_gps': ['experienceGps'],
  'employee_experience_other': ['experienceOther'],
  'employee_experience_all': ['experienceAll'],
  'employee_academic_degree': [
    'academicDegree.degreeTitleShort',
    'academicDegree.degreeTitleLong',
    'academicDegree.study',
    'academicDegree.university',
    'academicDegree.studyStart',
    'academicDegree.studyEnd',
    'academicDegree.completed',
    'academicDegree.studyMINT'
  ],
  'employee_voccational': [
    'voccational.voccationalTitleShort',
    'voccational.voccationalTitleLong',
    'voccational.company',
    'voccational.voccationalStart',
    'voccational.voccationalEnd',
    'voccational.voccationalMINT'
  ],
  'employee_certificates': [
    'employeeCertificates.certificate.title',
    'employeeCertificates.issuer',
    'employeeCertificates.validUntil'
  ],
  'employee_security_clearance': [
    'securityClearance.securityClearanceType',
    'securityClearance.securityClearanceLevel',
    'securityClearance.applicationDate',
    'securityClearance.approved'
  ],
  'employee_skills': [
    'employeeSkills.skill.title',
    'employeeSkills.niveau'
  ],
  'employee_professional_background': [
    'professionalBackground.position',
    'professionalBackground.employer',
    'professionalBackground.description',
    'professionalBackground.professionStart',
    'professionalBackground.professionEnd',
    'professionalBackground.executivePosition',
    'professionalBackground.experienceIt',
    'professionalBackground.experienceIs',
    'professionalBackground.experienceItGs',
    'professionalBackground.experienceGps',
    'professionalBackground.experienceOther',
    'professionalBackground.experienceAll'
  ]
};

export const projectPlaceholderToSchemaMap: Record<string, string[]> = {
  'project_title': ['title'],
  'project_type': ['type'],
  'project_description': ['description'],
  'project_keywords': ['keywords'],
  'project_team_size': ['teamSize'],
  'project_scope_audit_hours': ['scopeAuditHours'],
  'project_it': ['projectIT'],
  'project_is': ['projectIS'],
  'project_gs': ['projectGS'],
  'project_evb_it_contract_number': ['evbItContractNumber'],
  'project_evb_it_contract_location': ['evbItContractLocation'],
  'project_total_volume_euro': ['volumeEuroTotal'],
  'project_retrieved_volume_euro': ['volumeEuroRetrieved'],
  'project_total_volume_person_days': ['volumePTTotal'],
  'project_retrieved_volume_person_days': ['volumePTRetrieved'],
  'project_total_volume_hours': ['volumeHoursTotal'],
  'project_retrieved_volume_hours': ['volumeHoursRetrieved'],
  'project_approved_margin': ['approvedMargin'],
  'project_contract_start': ['contractBeginn'],
  'project_contract_end': ['contractEnd'],
  'project_first_contact_date': ['firstContactDate'],
  'project_service_date': ['serviceDate'],
  'project_relevant_standards': ['standards'],
  'project_reference_approval': ['referenceApproval']
};

export const deliverablePlaceholderToSchemaMap: Record<string, string[]> = {
  'deliverable_type': ['type'],
  'deliverable_title': ['title'],
  'deliverable_description': ['description'],
  'deliverable_keywords': ['keywords'],
  'deliverable_status': ['status'],
  'deliverable_text_maturity': ['textMaturity'],
  'deliverable_word_count': ['wordCount'],
  'deliverable_language': ['language'],
  'deliverable_gender_neutral': ['genderNeutral'],
  'deliverable_professional_tone': ['professionalTone'],
  'deliverable_contains_graphics': ['containsGraphics'],
  'deliverable_notes': ['notes']
};

// Helper function to get all possible placeholders
export const getAllPlaceholders = () => {
  return {
    employees: Object.keys(employeePlaceholderToSchemaMap),
    projects: Object.keys(projectPlaceholderToSchemaMap),
    deliverables: Object.keys(deliverablePlaceholderToSchemaMap)
  };
};

// Helper function to map placeholder to schema fields
export const mapPlaceholderToSchemaFields = (placeholderKey: string) => {
  return {
    employeeFields: employeePlaceholderToSchemaMap[placeholderKey] || [],
    projectFields: projectPlaceholderToSchemaMap[placeholderKey] || [],
    deliverableFields: deliverablePlaceholderToSchemaMap[placeholderKey] || []
  };
}; 