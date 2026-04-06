// EduLens Type Definitions

export type QualityLevel = 'safe' | 'caution' | 'warning';

export interface QualityDimension {
  name: string;
  label: string;
  level: QualityLevel;
  score: number; // 0-100
  rationale: string;
}

export interface QualityScorecard {
  accuracy: QualityDimension;
  bias: QualityDimension;
  ageAppropriateness: QualityDimension;
  culturalSensitivity: QualityDimension;
  safety: QualityDimension;
  overallScore: number;
}

export interface ResourceSource {
  name: string;
  url: string;
  author?: string;
  publishDate?: string;
  license?: string;
  licenseType?: 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'public-domain' | 'copyrighted' | 'unknown';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf' | 'interactive' | 'image' | 'website';
  thumbnail?: string;
  source: ResourceSource;
  scorecard: QualityScorecard;
  curriculumAlignment?: string[];
  yearLevels?: number[];
  subjects?: string[];
  tags?: string[];
}

export interface LocalizedResource extends Resource {
  originalResource: Resource;
  adaptations: Adaptation[];
  localContext: LocalContext;
}

export interface Adaptation {
  type: 'example' | 'reference' | 'language' | 'cultural' | 'reading-level';
  original: string;
  adapted: string;
  rationale: string;
}

export interface LocalContext {
  country: string;
  state?: string;
  region?: string;
  suburb?: string;
  schoolName?: string;
  yearLevel?: number;
  subject?: string;
  studentInterests?: string[];
  communityAnchors?: string[];
}

export interface ClassroomProfile {
  id: string;
  name: string;
  location: {
    country: string;
    state: string;
    region?: string;
    suburb?: string;
  };
  school?: string;
  yearLevel: number;
  subject: string;
  studentCount?: number;
  studentBackgrounds?: string[];
  studentInterests?: string[];
  communityAnchors?: string[];
  languageContext?: {
    primaryLanguage: string;
    ealdLearners?: boolean;
    bilingualProgram?: boolean;
  };
}

export type ScopeLevel = 'country' | 'state' | 'region' | 'suburb' | 'school' | 'class' | 'individual';

export interface SearchQuery {
  query: string;
  scope: ScopeLevel;
  filters?: {
    yearLevels?: number[];
    subjects?: string[];
    contentTypes?: Resource['type'][];
    minQualityScore?: number;
  };
  classroomProfile?: ClassroomProfile;
}

export interface SearchResult {
  resources: Resource[];
  totalCount: number;
  queryTime: number;
  suggestions?: string[];
}
