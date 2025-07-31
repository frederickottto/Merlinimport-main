"use client"

import * as React from "react"
import {
  CalendarIcon,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  MapPin,
  Clock,
  X,
  Users,
  Euro,
  Building2,
  Mail,
} from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useSearch } from "@/hooks/use-search"
import { api } from "@/trpc/react"
import { useDebounce } from "@/hooks/use-debounce"

type SearchModel = "employees" | "projects" | "callToTender" | "organisations" | "tasks" | "organisationContacts"

// Models
const models = [
  { label: "Mitarbeiter", value: "employees" as SearchModel },
  { label: "Projekte", value: "projects" as SearchModel },
  { label: "Ausschreibungen", value: "callToTender" as SearchModel },
  { label: "Organisationen", value: "organisations" as SearchModel },
  { label: "Aufgaben", value: "tasks" as SearchModel },
  { label: "Kontakte", value: "organisationContacts" as SearchModel },
]

// Locations
// const locations = [
//   { label: "Berlin", value: "berlin" },
//   { label: "Munich", value: "munich" },
//   { label: "Frankfurt", value: "frankfurt" },
//   { label: "Hamburg", value: "hamburg" },
// ]

// Project filters
const projectStatuses = [
  { label: "RV", value: "RV" },
  { label: "Kein RV", value: "NO_RV" },
]

// Tender filters


// Task filters
const taskTypes = [
  { label: "Aufgabe", value: "TASK" },
  { label: "Lessons Learned", value: "LESSONS_LEARNED" },
]

const taskStatuses = [
  { label: "Offen", value: "OPEN" },
  { label: "Erledigt", value: "DONE" },
]

interface SearchResultItem {
  id: string
  name?: string | null
  foreName?: string | null
  lastName?: string | null
  title?: string | null
  description?: string | null
  location?: {
    city?: string | null
    country?: string | null
  } | null
  createdAt?: Date | string | null
  employeeRank?: {
    employeePositionLong?: string | null
  } | null
  employeeSkills?: Array<{
    skills?: {
      title?: string | null
    } | null
    title?: string | null
  }> | null
  organisation?: {
    name?: string | null
    legalName?: string | null
    website?: string | null
    legalType?: string | null
    parentOrganisation?: {
      name?: string | null
    } | null
  } | Array<{
    name?: string | null
    legalName?: string | null
    website?: string | null
    legalType?: string | null
    parentOrganisation?: {
      name?: string | null
    } | null
  }> | null
  division?: {
    title?: string | null
    name?: string | null
  } | Array<{
    title?: string | null
    name?: string | null
  }> | null
  employeeCertificates?: Array<{
    certificate?: {
      title?: string | null
    } | null
    title?: string | null
  }> | null
  // Tender specific fields
  status?: string | null
  type?: string | null
  offerDeadline?: Date | string | null
  bindingDeadline?: Date | string | null
  volume?: {
    euro?: number | null
    pt?: number | null
    hours?: number | null
  } | null
  successChance?: number | null
  keywords?: string[] | null
  employeeNumber?: number | null
  annualReturn?: number | null
  industrySector?: Array<{
    industrySector: string
  }> | null
  dueDate?: Date | string | null
  tenderId?: string | null
}

export function SearchDialog() {
  const { open, setOpen } = useSearch()
  const [model, setModel] = React.useState<SearchModel>("employees")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = React.useState("relevance")
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [locationSearch, setLocationSearch] = React.useState("")
  const [rankSearch, setRankSearch] = React.useState("")
  const [skillsSearch, setSkillsSearch] = React.useState("")
  const [certificatesSearch, setCertificatesSearch] = React.useState("")
  const [industrySearch, setIndustrySearch] = React.useState("")
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])

  // Fetch database options
  const { data: employeeRanks } = api.employeeRank.getAll.useQuery()
  const { data: skills } = api.skills.getAll.useQuery()
  const { data: certificates } = api.certificate.getAll.useQuery()
  const { data: industrySectors } = api.industrySector.getAll.useQuery()
  const { data: locations } = api.location.getAll.useQuery()

  // Profile filters
  const [profileFilters, setProfileFilters] = React.useState({
    employeeRank: [] as string[],
    location: [] as string[],
    skills: [] as string[],
    certificates: [] as string[],
    experience: {
      it: [0, 40] as [number, number],
      is: [0, 40] as [number, number],
      itgs: [0, 40] as [number, number],
      gps: [0, 40] as [number, number],
      other: [0, 40] as [number, number],
    },
    division: [] as string[],
  })

  // Project filters
  const [projectFilters, setProjectFilters] = React.useState({
    type: [] as string[],
    status: [] as string[],
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    volume: {
      euro: [0, 1_000_000] as [number, number],
      pt: [0, 1000] as [number, number],
      hours: [0, 10000] as [number, number],
    },
    keywords: [] as string[],
  })

  // Tender filters
  const [tenderFilters, setTenderFilters] = React.useState({
    type: [] as string[],
    status: [] as string[],
    offerDeadlineRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    bindingDeadlineRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    volume: {
      euro: [0, 1_000_000] as [number, number],
      pt: [0, 1000] as [number, number],
      hours: [0, 10000] as [number, number],
    },
    successChance: [0, 100] as [number, number],
    keywords: [] as string[],
  })

  // Organisation filters
  const [organisationFilters, setOrganisationFilters] = React.useState({
    industrySector: [] as string[],
    location: [] as string[],
    employeeNumber: [0, 10_000] as [number, number],
    annualReturn: [0, 1_000_000_000] as [number, number],
  })

  // Task filters
  const [taskFilters, setTaskFilters] = React.useState({
    type: [] as string[],
    status: [] as string[],
    dueDate: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
  })

  const { data, isLoading: isSearching } = api.search.search.useQuery(
    {
      model,
      query: debouncedSearchQuery,
      filters: getFiltersForModel(),
      sortBy,
      page: 1,
      limit: 20,
    },
    {
      enabled: open && debouncedSearchQuery.length > 0,
      refetchOnWindowFocus: false,
    },
  )

  function getFiltersForModel() {
    function clean(obj: Record<string, unknown>) {
      // Remove keys with undefined, null, empty array, or empty object values
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([, v]) =>
            v !== undefined &&
            v !== null &&
            !(Array.isArray(v) && v.length === 0) &&
            !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
        )
      )
    }
    switch (model) {
      case "employees":
        return {
          employees: clean({
            employeeRank: profileFilters.employeeRank,
            location: profileFilters.location,
            skills: profileFilters.skills,
            certificates: profileFilters.certificates,
            experience: clean(profileFilters.experience),
            division: profileFilters.division,
          }),
        }
      case "projects":
        return {
          projects: clean({
            type: projectFilters.type,
            status: projectFilters.status,
            dateRange: clean(projectFilters.dateRange),
            volume: clean(projectFilters.volume),
            keywords: projectFilters.keywords,
          }),
        }
      case "callToTender":
        return {
          callToTender: clean({
            type: tenderFilters.type,
            status: tenderFilters.status,
            offerDeadlineRange: clean(tenderFilters.offerDeadlineRange),
            bindingDeadlineRange: clean(tenderFilters.bindingDeadlineRange),
            volume: clean(tenderFilters.volume),
            successChance: tenderFilters.successChance,
            keywords: tenderFilters.keywords,
          }),
        }
      case "organisations":
        return {
          organisations: clean({
            industrySector: organisationFilters.industrySector,
            location: organisationFilters.location,
            employeeNumber: organisationFilters.employeeNumber,
            annualReturn: organisationFilters.annualReturn,
          }),
        }
      case "tasks":
        return {
          tasks: clean({
            type: taskFilters.type,
            status: taskFilters.status,
            dueDate: clean(taskFilters.dueDate),
          }),
        }
      case "organisationContacts":
        return {
          organisationContacts: clean({
            // Assuming no additional filters are needed for organisationContacts
          }),
        }
      default:
        return {}
    }
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const renderCheckboxList = (
    items: { label: string; value: string }[],
    values: string[],
    onChange: (val: string[]) => void,
  ) => (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.value} className="flex items-center space-x-2">
          <Checkbox
            id={`chk-${item.value}`}
            checked={values.includes(item.value)}
            onCheckedChange={(checked) => {
              const next = checked ? [...values, item.value] : values.filter((v) => v !== item.value)
              onChange(next)
            }}
          />
          <Label htmlFor={`chk-${item.value}`}>{item.label}</Label>
        </div>
      ))}
    </div>
  )

  const renderFilterContent = () => {
    switch (model) {
      case "employees":
        return (
          <Accordion 
            type="multiple" 
            value={expandedSections}
            onValueChange={setExpandedSections}
            defaultValue={[]}
          >
            <AccordionItem value="location">
              <AccordionTrigger>Standort</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileFilters.location.map((locId) => {
                      const loc = locations?.find((l) => l.id === locId)
                      return loc ? (
                        <Badge
                          key={locId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {loc.city}{loc.country ? `, ${loc.country}` : ''}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileFilters((p) => ({
                                ...p,
                                location: p.location.filter((id) => id !== locId),
                              }))
                            }}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Standort suchen..." 
                      value={locationSearch} 
                      onValueChange={setLocationSearch} 
                    />
                    {expandedSections.includes("location") && (
                      <CommandList>
                        <CommandGroup>
                          {locations
                            ?.filter((loc) => 
                              !profileFilters.location.includes(loc.id) &&
                              loc.city?.toLowerCase().includes(locationSearch.toLowerCase())
                            )
                            .map((loc) => (
                              <CommandItem
                                key={loc.id}
                                value={loc.id}
                                onSelect={() => {
                                  setProfileFilters((p) => ({
                                    ...p,
                                    location: [...p.location, loc.id],
                                  }))
                                  setLocationSearch("")
                                }}
                              >
                                {loc.city}{loc.country ? `, ${loc.country}` : ''}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rank">
              <AccordionTrigger>Position</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileFilters.employeeRank.map((rankId) => {
                      const rank = employeeRanks?.find((r) => r.id === rankId)
                      return rank ? (
                        <Badge
                          key={rankId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {rank.employeePositionLong}
                          <button
                            onClick={() => {
                              setProfileFilters((p) => ({
                                ...p,
                                employeeRank: p.employeeRank.filter((id) => id !== rankId),
                              }))
                            }}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Position suchen..." 
                      value={rankSearch} 
                      onValueChange={setRankSearch} 
                    />
                    {expandedSections.includes("rank") && rankSearch && (
                      <CommandList>
                        <CommandGroup>
                          {employeeRanks
                            ?.filter((rank) => 
                              !profileFilters.employeeRank.includes(rank.id) &&
                              rank.employeePositionLong.toLowerCase().includes(rankSearch.toLowerCase())
                            )
                            .map((rank) => (
                              <CommandItem
                                key={rank.id}
                                value={rank.id}
                                onSelect={() => {
                                  setProfileFilters((p) => ({
                                    ...p,
                                    employeeRank: [...p.employeeRank, rank.id],
                                  }))
                                  setRankSearch("")
                                }}
                              >
                                {rank.employeePositionLong}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="skills">
              <AccordionTrigger>Fähigkeiten</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileFilters.skills.map((skillId) => {
                      const skill = skills?.find((s) => s.id === skillId)
                      return skill ? (
                        <Badge
                          key={skillId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill.title}
                          <button
                            onClick={() => {
                              setProfileFilters((p) => ({
                                ...p,
                                skills: p.skills.filter((id) => id !== skillId),
                              }))
                            }}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Fähigkeiten suchen..." 
                      value={skillsSearch} 
                      onValueChange={setSkillsSearch} 
                    />
                    {expandedSections.includes("skills") && skillsSearch && (
                      <CommandList>
                        <CommandGroup>
                          {skills
                            ?.filter((skill) => 
                              !profileFilters.skills.includes(skill.id) &&
                              skill.title?.toLowerCase().includes(skillsSearch.toLowerCase())
                            )
                            .map((skill) => (
                              <CommandItem
                                key={skill.id}
                                value={skill.id}
                                onSelect={() => {
                                  setProfileFilters((p) => ({
                                    ...p,
                                    skills: [...p.skills, skill.id],
                                  }))
                                  setSkillsSearch("")
                                }}
                              >
                                {skill.title}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="certificates">
              <AccordionTrigger>Zertifikate</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileFilters.certificates.map((certId) => {
                      const cert = certificates?.find((c) => c.id === certId)
                      return cert ? (
                        <Badge
                          key={certId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {cert.title}
                          <button
                            onClick={() => {
                              setProfileFilters((p) => ({
                                ...p,
                                certificates: p.certificates.filter((id) => id !== certId),
                              }))
                            }}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Zertifikate suchen..." 
                      value={certificatesSearch} 
                      onValueChange={setCertificatesSearch} 
                    />
                    {expandedSections.includes("certificates") && certificatesSearch && (
                      <CommandList>
                        <CommandGroup>
                          {certificates
                            ?.filter((cert) => 
                              !profileFilters.certificates.includes(cert.id) &&
                              cert.title?.toLowerCase().includes(certificatesSearch.toLowerCase())
                            )
                            .map((cert) => (
                              <CommandItem
                                key={cert.id}
                                value={cert.id}
                                onSelect={() => {
                                  setProfileFilters((p) => ({
                                    ...p,
                                    certificates: [...p.certificates, cert.id],
                                  }))
                                  setCertificatesSearch("")
                                }}
                              >
                                {cert.title}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="experience">
              <AccordionTrigger>Erfahrung (Jahre)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {["it", "is", "itgs", "gps", "other"].map((key) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium capitalize">{key}</label>
                      <Slider
                        min={0}
                        max={40}
                        step={1}
                        value={profileFilters.experience[key as keyof typeof profileFilters.experience]}
                        onValueChange={(val) =>
                          setProfileFilters((p) => ({
                            ...p,
                            experience: { ...p.experience, [key]: val as [number, number] },
                          }))
                        }
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{profileFilters.experience[key as keyof typeof profileFilters.experience][0]} yrs</span>
                        <span>{profileFilters.experience[key as keyof typeof profileFilters.experience][1]} yrs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      case "projects":
        return (
          <Accordion type="multiple" defaultValue={["status", "deadlines", "volume", "keywords"]}>
            <AccordionItem value="status">
              <AccordionTrigger>Status</AccordionTrigger>
              <AccordionContent>
                {renderCheckboxList(projectStatuses, projectFilters.status, (val) => setProjectFilters((p) => ({ ...p, status: val })))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="deadlines">
              <AccordionTrigger>Vertragslaufzeit</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vertragsbeginn</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {projectFilters.dateRange?.from ? (
                            projectFilters.dateRange?.to ? (
                              <>
                                {format(projectFilters.dateRange.from, "dd.MM.yyyy")} - {format(projectFilters.dateRange.to, "dd.MM.yyyy")}
                              </>
                            ) : (
                              format(projectFilters.dateRange.from, "dd.MM.yyyy")
                            )
                          ) : (
                            <span>Datum auswählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[101]" align="start">
                        <Calendar
                          mode="range"
                          selected={projectFilters.dateRange as DateRange}
                          onSelect={(val) => setProjectFilters((p) => ({ ...p, dateRange: val as { from: Date | undefined; to: Date | undefined } }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="volume">
              <AccordionTrigger>Volumen</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {["euro", "pt", "hours"].map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="w-16 capitalize">
                        {key === "euro" ? "Euro" : key === "pt" ? "PT" : "Stunden"}
                      </label>
                      <Slider
                        min={0}
                        max={key === "euro" ? 200_000_000 : key === "pt" ? 1000 : 10000}
                        step={key === "euro" ? 50_000 : 10}
                        value={projectFilters.volume[key as keyof typeof projectFilters.volume] as [number, number]}
                        onValueChange={(val) =>
                          setProjectFilters((p) => ({
                            ...p,
                            volume: { ...p.volume, [key]: val },
                          }))
                        }
                      />
                      <span className="w-24 text-right">
                        {key === "euro"
                          ? `€${projectFilters.volume[key as keyof typeof projectFilters.volume][0].toLocaleString()} - €${projectFilters.volume[key as keyof typeof projectFilters.volume][1].toLocaleString()}`
                          : `${projectFilters.volume[key as keyof typeof projectFilters.volume][0]} - ${projectFilters.volume[key as keyof typeof projectFilters.volume][1]} ${key === "pt" ? "PT" : "h"}`}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="keywords">
              <AccordionTrigger>Schlüsselwörter</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {projectFilters.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          onClick={() => {
                            setProjectFilters((p) => ({
                              ...p,
                              keywords: p.keywords.filter((k) => k !== keyword),
                            }))
                          }}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Command>
                    <CommandInput 
                      placeholder="Schlüsselwort hinzufügen..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          const newKeyword = e.currentTarget.value.trim();
                          if (newKeyword && !projectFilters.keywords.includes(newKeyword)) {
                            setProjectFilters((p) => ({
                              ...p,
                              keywords: [...p.keywords, newKeyword],
                            }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <CommandList>
                    </CommandList>
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      case "organisations":
        return (
          <Accordion 
            type="multiple" 
            value={expandedSections}
            onValueChange={setExpandedSections}
            defaultValue={["location", "industry", "size", "return"]}
          >
            <AccordionItem value="location">
              <AccordionTrigger>Standort</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {organisationFilters.location.map((locId) => {
                      const loc = locations?.find((l) => l.id === locId)
                      return loc ? (
                        <Badge
                          key={locId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {loc.city}{loc.country ? `, ${loc.country}` : ''}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrganisationFilters((p) => ({
                                ...p,
                                location: p.location.filter((id) => id !== locId),
                              }))
                            }}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Standort suchen..." 
                      value={locationSearch} 
                      onValueChange={setLocationSearch} 
                    />
                    {expandedSections.includes("location") && (
                      <CommandList>
                        <CommandGroup>
                          {locations
                            ?.filter((loc) => 
                              !organisationFilters.location.includes(loc.id) &&
                              loc.city?.toLowerCase().includes(locationSearch.toLowerCase())
                            )
                            .map((loc) => (
                              <CommandItem
                                key={loc.id}
                                value={loc.id}
                                onSelect={() => {
                                  setOrganisationFilters((p) => ({
                                    ...p,
                                    location: [...p.location, loc.id],
                                  }))
                                  setLocationSearch("")
                                }}
                              >
                                {loc.city}{loc.country ? `, ${loc.country}` : ''}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="industry">
              <AccordionTrigger>Branche</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {organisationFilters.industrySector.map((sectorId) => {
                      const sector = industrySectors?.find((s) => s.id === sectorId)
                      return sector ? (
                        <Badge
                          key={sectorId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {sector.industrySector}
                          <button
                            onClick={() => {
                              setOrganisationFilters((p) => ({
                                ...p,
                                industrySector: p.industrySector.filter((id) => id !== sectorId),
                              }))
                            }}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Branche suchen..." 
                      value={industrySearch} 
                      onValueChange={setIndustrySearch} 
                    />
                    {expandedSections.includes("industry") && industrySearch && (
                      <CommandList>
                        <CommandGroup>
                          {industrySectors
                            ?.filter((sector) => 
                              !organisationFilters.industrySector.includes(sector.id) &&
                              sector.industrySector.toLowerCase().includes(industrySearch.toLowerCase())
                            )
                            .map((sector) => (
                              <CommandItem
                                key={sector.id}
                                value={sector.id}
                                onSelect={() => {
                                  setOrganisationFilters((p) => ({
                                    ...p,
                                    industrySector: [...p.industrySector, sector.id],
                                  }))
                                  setIndustrySearch("")
                                }}
                              >
                                {sector.industrySector}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="size">
              <AccordionTrigger>Mitarbeiterzahl</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={10_000}
                    step={100}
                    value={organisationFilters.employeeNumber}
                    onValueChange={(val) =>
                      setOrganisationFilters((p) => ({ ...p, employeeNumber: val as [number, number] }))
                    }
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{organisationFilters.employeeNumber[0].toLocaleString()}</span>
                    <span>{organisationFilters.employeeNumber[1].toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="return">
              <AccordionTrigger>Jahresumsatz</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={1_000_000_000}
                    step={1_000_000}
                    value={organisationFilters.annualReturn}
                    onValueChange={(val) =>
                      setOrganisationFilters((p) => ({ ...p, annualReturn: val as [number, number] }))
                    }
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>€{organisationFilters.annualReturn[0].toLocaleString()}</span>
                    <span>€{organisationFilters.annualReturn[1].toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      case "tasks":
        return (
          <Accordion 
            type="multiple" 
            value={expandedSections}
            onValueChange={setExpandedSections}
            defaultValue={["type", "status", "dueDate"]}
          >
            <AccordionItem value="type">
              <AccordionTrigger>Typ</AccordionTrigger>
              <AccordionContent>
                {renderCheckboxList(taskTypes, taskFilters.type, (val) => setTaskFilters((p) => ({ ...p, type: val })))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="status">
              <AccordionTrigger>Status</AccordionTrigger>
              <AccordionContent>
                {renderCheckboxList(taskStatuses, taskFilters.status, (val) => setTaskFilters((p) => ({ ...p, status: val })))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="dueDate">
              <AccordionTrigger>Fälligkeitsdatum</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Zeitraum</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taskFilters.dueDate?.from ? (
                            taskFilters.dueDate?.to ? (
                              <>
                                {format(taskFilters.dueDate.from, "dd.MM.yyyy")} - {format(taskFilters.dueDate.to, "dd.MM.yyyy")}
                              </>
                            ) : (
                              format(taskFilters.dueDate.from, "dd.MM.yyyy")
                            )
                          ) : (
                            <span>Datum auswählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[101]" align="start">
                        <Calendar
                          mode="range"
                          selected={taskFilters.dueDate as DateRange}
                          onSelect={(val) => setTaskFilters((p) => ({ ...p, dueDate: val as { from: Date | undefined; to: Date | undefined } }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
    }
  }

  const handleModelChange = (value: SearchModel) => {
    setModel(value)
    setSearchQuery("")
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleFilterClick = () => {
    setFiltersOpen(!filtersOpen)
  }

  const handleResultClick = (item: SearchResultItem) => {
    // Handle result click based on model type
    switch (model) {
      case "employees":
        // Navigate to employee profile
        window.location.href = `/profiles/${item.id}`
        break
      case "projects":
        // Navigate to project details
        window.location.href = `/projects/${item.id}`
        break
      case "callToTender":
        // Navigate to tender details
        window.location.href = `/tenders/${item.id}`
        break
      case "organisations":
        // Navigate to organisation details
        window.location.href = `/organisations/${item.id}`
        break
      case "tasks":
        // Navigate based on task type
        if (item.type === "LESSONS_LEARNED") {
          // For lessons learned, navigate to the tender page with the lessons learned tab
          window.location.href = `/tenders/${item.tenderId}?tab=lessons-learned`
        } else {
          // For regular tasks, navigate to tasks page
          window.location.href = `/tasks?taskId=${item.id}`
        }
        break
      case "organisationContacts":
        // Navigate to contact details
        window.location.href = `/organisations/contacts/${item.id}`
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl p-2 fixed top-[5vh] left-[50%] translate-x-[-50%] translate-y-0 z-[100]">
        <DialogTitle className="sr-only">Suche</DialogTitle>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-4">
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Modell auswählen" />
              </SelectTrigger>
              <SelectContent className="z-[101]">
                {models.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`${models.find((m) => m.value === model)?.label} suchen…`}
                className="pl-10 pr-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {model !== "organisationContacts" && (
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={handleFilterClick}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="sr-only">Erweiterte Suche</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] sm:w-[420px] p-0 z-[101]" align="end">
                    <Card className="border-0">
                      <CardHeader>
                        <CardTitle>{models.find((m) => m.value === model)?.label} Filter</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-6">{renderFilterContent()}</CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => {
                          // Reset filters based on model
                          switch (model) {
                            case "employees":
                              setProfileFilters({
                                employeeRank: [],
                                location: [],
                                skills: [],
                                certificates: [],
                                experience: {
                                  it: [0, 40],
                                  is: [0, 40],
                                  itgs: [0, 40],
                                  gps: [0, 40],
                                  other: [0, 40],
                                },
                                division: [],
                              })
                              break
                            case "projects":
                              setProjectFilters({
                                type: [],
                                status: [],
                                dateRange: { from: undefined, to: undefined },
                                volume: {
                                  euro: [0, 1_000_000],
                                  pt: [0, 1000],
                                  hours: [0, 10000],
                                },
                                keywords: [],
                              })
                              break
                            case "callToTender":
                              setTenderFilters({
                                type: [],
                                status: [],
                                offerDeadlineRange: { from: undefined, to: undefined },
                                bindingDeadlineRange: { from: undefined, to: undefined },
                                volume: {
                                  euro: [0, 1_000_000],
                                  pt: [0, 1000],
                                  hours: [0, 10000],
                                },
                                successChance: [0, 100],
                                keywords: [],
                              })
                              break
                            case "organisations":
                              setOrganisationFilters({
                                industrySector: [],
                                location: [],
                                employeeNumber: [0, 10_000],
                                annualReturn: [0, 1_000_000_000],
                              })
                              break
                            case "tasks":
                              setTaskFilters({
                                type: [],
                                status: [],
                                dueDate: { from: undefined, to: undefined },
                              })
                              break
                          }
                        }}>Zurücksetzen</Button>
                        <Button onClick={() => setFiltersOpen(false)}>Anwenden</Button>
                      </CardFooter>
                    </Card>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Results wrapper */}
          <div className="relative z-[99] backdrop-blur-md bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                {isSearching ? "Suche läuft…" : data?.items.length ? `${data.items.length} Ergebnisse` : "Keine Ergebnisse"}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sortieren nach" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="relevance">Relevanz</SelectItem>
                    <SelectItem value="createdAt-desc">Neueste zuerst</SelectItem>
                    <SelectItem value="createdAt-asc">Älteste zuerst</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isSearching ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={viewMode === "grid" ? "space-y-3" : "flex gap-4 p-4 border rounded-lg"}>
                    <Skeleton className={viewMode === "grid" ? "h-48 w-full" : "h-24 w-24 flex-shrink-0"} />
                    <div className={viewMode === "grid" ? "space-y-2" : "flex-1 space-y-2"}>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.items.length ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-lg font-medium">Keine Ergebnisse gefunden</p>
                <p className="text-sm text-muted-foreground">Versuchen Sie, Ihre Suche oder Filter anzupassen</p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                {data.items.map((item: SearchResultItem) => {
                  // Handle organisation and division as array or object
                  let organisationName = ""
                  if (Array.isArray(item.organisation)) {
                    organisationName = item.organisation?.[0]?.name || ""
                  } else if (item.organisation) {
                    organisationName = item.organisation?.name || ""
                  }

                  // Render different content based on model type
                  const renderContent = () => {
                    switch (model) {
                      case "employees":
                        return (
                          <>
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">
                                  {item.foreName && item.lastName 
                                    ? `${item.foreName} ${item.lastName}`
                                    : item.name || "Unbekannt"}
                                </h3>
                                {item.employeeRank?.employeePositionLong && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {item.employeeRank.employeePositionLong}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                                  {item.location?.city && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{item.location.city}</span>
                                    </div>
                                  )}
                                  {item.createdAt && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>Seit {format(new Date(item.createdAt), "MMM yyyy")}</span>
                                    </div>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {item.employeeSkills && item.employeeSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {item.employeeSkills.slice(0, 3).map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {skill.skills?.title || skill.title || "Unbekannte Fähigkeit"}
                                        </Badge>
                                      ))}
                                      {item.employeeSkills.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{item.employeeSkills.length - 3} weitere
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {item.employeeCertificates && item.employeeCertificates.length > 0 && (
                                <div className="flex flex-col gap-1">
                                  {item.employeeCertificates.slice(0, 2).map((cert, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {cert.certificate?.title || cert.title || "Unbekanntes Zertifikat"}
                                    </Badge>
                                  ))}
                                  {item.employeeCertificates.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{item.employeeCertificates.length - 2} weitere
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )
                      case "organisations":
                        const org = Array.isArray(item.organisation) ? item.organisation[0] : item.organisation;
                        return (
                          <>
                            <h3 className="font-semibold mb-2">{item.name || "Unbenannte Organisation"}</h3>
                            {org?.legalName && (
                              <p className="text-sm text-muted-foreground mb-2">{org.legalName}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                              {item.location?.city && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{item.location.city}{item.location.country ? `, ${item.location.country}` : ''}</span>
                                </div>
                              )}
                              {item.employeeNumber && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{item.employeeNumber.toLocaleString()} Mitarbeiter</span>
                                </div>
                              )}
                              {item.annualReturn && (
                                <div className="flex items-center gap-1">
                                  <Euro className="h-4 w-4" />
                                  <span>€{item.annualReturn.toLocaleString()} Jahresumsatz</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                              {org?.legalType && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  <span>{org.legalType}</span>
                                </div>
                              )}
                              {org?.parentOrganisation?.name && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  <span>Tochtergesellschaft von {org.parentOrganisation.name}</span>
                                </div>
                              )}
                            </div>
                            {item.industrySector && item.industrySector.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.industrySector.map((sector, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {sector.industrySector}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {org?.website && (
                              <div className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                <a href={org.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                  {org.website}
                                </a>
                              </div>
                            )}
                          </>
                        )
                      case "projects":
                        return (
                          <>
                            <h3 className="font-semibold mb-2">{item.title || "Untitled"}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              {item.createdAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                                </div>
                              )}
                            </div>
                            {organisationName && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Organisation: {organisationName}
                              </div>
                            )}
                          </>
                        )
                      case "callToTender":
                        return (
                          <>
                            <h3 className="font-semibold mb-2">{item.title || "Untitled"}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              {item.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.status}
                                </Badge>
                              )}
                              {item.type && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.type}
                                </Badge>
                              )}
                              {item.createdAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {item.offerDeadline && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Angebotsfrist: {format(new Date(item.offerDeadline), "MMM d, yyyy")}</span>
                                </div>
                              )}
                              {item.bindingDeadline && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Bindefrist: {format(new Date(item.bindingDeadline), "MMM d, yyyy")}</span>
                                </div>
                              )}
                              {item.volume && (
                                <div className="flex items-center gap-1">
                                  <span>Volumen: {item.volume.euro ? `${item.volume.euro.toLocaleString()}€` : ''} {item.volume.pt ? `${item.volume.pt} PT` : ''} {item.volume.hours ? `${item.volume.hours}h` : ''}</span>
                                </div>
                              )}
                              {item.successChance !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span>Erfolgschance: {item.successChance}%</span>
                                </div>
                              )}
                            </div>
                            {item.keywords && item.keywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.keywords.map((keyword, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {organisationName && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Organisation: {organisationName}
                              </div>
                            )}
                          </>
                        )
                      case "organisationContacts":
                        return (
                          <>
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">
                                  {item.name || "Unbekannter Kontakt"}
                                </h3>
                                {item.title && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {item.title}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                                  {item.description && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-4 w-4" />
                                      <span>{item.description}</span>
                                    </div>
                                  )}
                                  {item.createdAt && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>Seit {format(new Date(item.createdAt), "MMM yyyy")}</span>
                                    </div>
                                  )}
                                </div>
                                {organisationName && (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Organisation: {organisationName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )
                      default:
                        return (
                          <>
                            <h3 className="font-semibold mb-2">{item.title || "Unbenannte Aufgabe"}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              {item.type && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.type === "LESSONS_LEARNED" ? "Lessons Learned" : "Aufgabe"}
                                </Badge>
                              )}
                              {item.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.status === "OPEN" ? "Offen" : "Erledigt"}
                                </Badge>
                              )}
                              {item.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Fällig am {format(new Date(item.dueDate), "dd.MM.yyyy")}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleResultClick(item)}
                    >
                      <div className="p-6">
                        {renderContent()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 