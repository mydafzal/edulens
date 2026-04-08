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

// ---- New Types for Redesigned System ----

export type UserRole =
  | 'teacher'
  | 'publisher'
  | 'specialist'
  | 'curriculum-designer'
  | 'instructional-coach';

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  schoolName?: string;
  state?: string;
  suburb?: string;
  yearLevels?: string[];
  subjects?: string[];
  avatar?: string;
}

export interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  roles: UserRole[]; // which roles see this tool
  comingSoon?: boolean;
}

// Search pipeline — 3-phase design
// Phase 1: SEARCH (Query + HyDE → Hybrid Search → ColBERT Rerank → Trust Tier)
// Phase 2: EVALUATE (Dual-Agent parallel: Bad Cop removes, Good Cop validates → Consensus → retry if < 7)
// Phase 3: SYNTHESIZE (Generate summary from filtered sources + APA citations)
export type SearchStage =
  | 'idle'
  | 'searching'
  | 'evaluating'
  | 'synthesizing'
  | 'complete';

export interface DualAgentReview {
  goodCop: {
    verdict: 'approve' | 'conditional';
    positivePoints: string[];
    rating: number; // 0-10
    summary: string;
  };
  badCop: {
    verdict: 'approve' | 'flag' | 'reject';
    concerns: string[];
    rating: number; // 0-10
    summary: string;
  };
  consensusScore: number; // averaged
}

export interface SearchPipelineResult {
  query: string;
  expandedQueries: string[];
  stage: SearchStage;
  ragSources: RAGSource[];
  dualAgentReview: DualAgentReview;
  summary: string;
  references: Reference[];
  rawContent: string;
  totalTime: number;
}

export interface RAGSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  trustTier: 'gold' | 'silver' | 'bronze';
  relevanceScore: number;
  provider: string;
}

export interface Reference {
  id: string;
  title: string;
  authors: string[];
  url: string;
  publishDate: string;
  source: string;
  citationAPA: string;
}
