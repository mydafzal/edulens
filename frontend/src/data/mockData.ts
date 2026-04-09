export type TrustTier = 'gold' | 'silver' | 'bronze';

export const GRADE_LEVELS = [
  { id: 'early', label: 'Early Years K-2' },
  { id: 'primary', label: 'Primary 3-6' },
  { id: 'middle', label: 'Middle 7-9' },
  { id: 'senior', label: 'Senior 10-12' },
  { id: 'tertiary', label: 'Tertiary' },
] as const;

export type GradeLevelId = 'early' | 'primary' | 'middle' | 'senior' | 'tertiary';

export const GRADE_TO_STAGE: Record<GradeLevelId, string> = {
  early: 'Early Years',
  primary: 'Years 3 to 6',
  middle: 'Years 7 to 9',
  senior: 'Years 10 to 12',
  tertiary: 'Tertiary',
};

export interface ClassroomContextData {
  country: string;
  state: string;
  town: string;
  schoolName: string;
  localLandmarks: string[];
  firstNationsContext: string[];
  communityProjects: string[];
  culturalFigures: string[];
  localSportsTeams: string[];
  localArtistsMusic: string[];
  studentInterests: string[];
  languageBackgrounds: string[];
  localDataSources: string[];
}

export const defaultClassroomContext: ClassroomContextData = {
  country: 'Australia', state: '', town: '', schoolName: '',
  localLandmarks: [], firstNationsContext: [], communityProjects: [],
  culturalFigures: [], localSportsTeams: [], localArtistsMusic: [],
  studentInterests: [], languageBackgrounds: [], localDataSources: []
};

export interface VerifiedSource {
  id: string;
  title: string;
  url: string;
  provider: string;
  snippet: string;
  trust_tier: TrustTier;
  relevance_score: number;
  quality_score: number;
  type: 'article' | 'video' | 'pdf' | 'interactive';
  subject: string;
  grade_level: string;
  license: string;
  author?: string;
  publish_date?: string;
  thumbnail?: string;
  curriculum_codes?: string[];
}

export interface AgentResult {
  rating: number;
  verdict?: string;
  points: string[];
  concerns: string[];
  summary?: string;
}

export interface RemovedSource {
  id: string;
  title: string;
  reason: string;
}

export interface DualAgentReview {
  good_cop: AgentResult;
  bad_cop: AgentResult;
  consensus_score: number;
  consensus_verdict: string;
  recommendation: 'approve' | 'review' | 'reject';
  removed_sources: RemovedSource[];
}

export interface SearchPipelineResult {
  query: string;
  expanded_queries?: string[];
  grade_level: string;
  subject?: string;
  stage?: string;
  rag_sources: VerifiedSource[];
  dual_agent_review: DualAgentReview;
  summary: string;
  references: string[];
  removed_sources?: RemovedSource[];
  total_time: number;
  retry_count?: number;
  error?: string | null;
}

export const SOURCE_BANK: VerifiedSource[] = [
  {
    id: '1',
    title: 'Water Scarcity in the Murray-Darling Basin',
    url: 'https://education.abc.net.au',
    provider: 'ABC Education',
    snippet: 'Comprehensive overview of water management challenges in Australia\'s most important river system, including First Nations perspectives and Bureau of Meteorology data.',
    trust_tier: 'silver',
    relevance_score: 96,
    quality_score: 92,
    type: 'article',
    subject: 'Geography',
    grade_level: 'middle',
    license: 'CC BY-NC',
    author: 'Dr. Sarah Mitchell',
    publish_date: '2024-08-15',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=200&fit=crop',
    curriculum_codes: ['ACHGK051', 'ACHGK052'],
  },
  {
    id: '2',
    title: 'Climate Data Visualization Tool',
    url: 'https://bom.gov.au/climate/data/',
    provider: 'Bureau of Meteorology',
    snippet: 'Interactive tool for exploring climate data trends across Australian regions. Official government data updated in real time.',
    trust_tier: 'gold',
    relevance_score: 91,
    quality_score: 97,
    type: 'interactive',
    subject: 'Science',
    grade_level: 'senior',
    license: 'CC BY',
    publish_date: '2024-06-01',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    curriculum_codes: ['ACSSU189'],
  },
  {
    id: '3',
    title: 'First Nations Water Stories: The Murray River',
    url: 'https://aiatsis.gov.au',
    provider: 'AIATSIS',
    snippet: 'Documentary exploring the cultural significance of the Murray River to First Nations peoples. Developed with Ngarrindjeri Elders Council with full cultural protocols.',
    trust_tier: 'gold',
    relevance_score: 88,
    quality_score: 94,
    type: 'video',
    subject: 'History',
    grade_level: 'middle',
    license: 'Educational Use',
    author: 'Ngarrindjeri Elders Council',
    publish_date: '2023-11-20',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    curriculum_codes: ['ACDSEH106'],
  },
  {
    id: '4',
    title: 'Sustainable Agriculture in Regional Australia',
    url: 'https://csiro.au/research/agriculture',
    provider: 'CSIRO',
    snippet: 'Peer-reviewed case study examining sustainable farming in drought-prone regions. Data from 15 farms across QLD and NSW with 10-year longitudinal tracking.',
    trust_tier: 'gold',
    relevance_score: 83,
    quality_score: 88,
    type: 'pdf',
    subject: 'Geography',
    grade_level: 'senior',
    license: 'CC BY-SA',
    author: 'Agricultural Research Division',
    publish_date: '2024-03-10',
    curriculum_codes: ['ACHGK060'],
  },
  {
    id: '5',
    title: 'Australian Curriculum Geography Units',
    url: 'https://australiancurriculum.edu.au',
    provider: 'ACARA',
    snippet: 'Official curriculum-aligned units for Geography across Year 7-10. Includes lesson sequences, assessment tasks, and cross-curriculum priorities mapped to outcomes.',
    trust_tier: 'gold',
    relevance_score: 78,
    quality_score: 99,
    type: 'pdf',
    subject: 'Geography',
    grade_level: 'middle',
    license: 'CC BY',
    publish_date: '2024-01-01',
    curriculum_codes: ['ACHGK051', 'ACHGK052', 'ACHGK060'],
  },
];

export function getMockSearchResult(query: string, grade_level: string = 'middle'): SearchPipelineResult {
  const q = query.toLowerCase();
  const filtered = SOURCE_BANK.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.snippet.toLowerCase().includes(q) ||
    s.subject.toLowerCase().includes(q) ||
    q.split(' ').some(word => s.snippet.toLowerCase().includes(word) && word.length > 3)
  );
  const sources = filtered.length >= 2 ? filtered : SOURCE_BANK.slice(0, 4);
  const avgQuality = Math.round(sources.reduce((a, s) => a + s.quality_score, 0) / sources.length);

  return {
    query,
    expanded_queries: [],
    grade_level,
    subject: sources[0]?.subject || '',
    stage: 'complete',
    rag_sources: sources,
    dual_agent_review: {
      good_cop: {
        rating: 8.8,
        verdict: 'approve',
        points: [
          `${sources.length} sources verified from trusted Australian institutions`,
          `Content confirmed age-appropriate for ${GRADE_TO_STAGE[grade_level as GradeLevelId] || grade_level}`,
          'Multiple perspectives represented including First Nations voices',
          'Curriculum codes cross-referenced with ACARA documentation',
        ],
        concerns: [],
        summary: 'Strong, curriculum-aligned collection for classroom use.',
      },
      bad_cop: {
        rating: 6.9,
        verdict: 'flag',
        points: [],
        concerns: [
          'Two sources may require teacher scaffolding for reading level',
          'Limited representation of regional/rural Australian contexts',
          'Recommend cross-referencing BOM data with most recent 2025 updates',
          'One source has paywalled supplementary materials',
        ],
        summary: 'Teacher review recommended before classroom deployment.',
      },
      consensus_score: 7.8,
      consensus_verdict: `Resources are well-suited for "${query}" at ${GRADE_TO_STAGE[grade_level as GradeLevelId] || grade_level} level. Strong factual grounding with appropriate cultural sensitivity. Teacher scaffolding recommended for 2 of ${sources.length} sources. Overall collection approved for classroom use.`,
      recommendation: 'approve',
      removed_sources: [],
    },
    summary: `Found ${sources.length} high-quality resources for "${query}" aligned to the Australian Curriculum. Sources span ${[...new Set(sources.map(s => s.type))].join(', ')} formats from trusted institutions including ${sources.slice(0, 2).map(s => s.provider).join(' and ')}. Average quality score: ${avgQuality}/100. All sources verified through dual-agent review with consensus score 7.8/10.`,
    references: sources.map(s =>
      `${s.author ? s.author + '. ' : ''}(${s.publish_date?.slice(0, 4) || '2024'}). ${s.title}. ${s.provider}. ${s.url}`
    ),
    removed_sources: [],
    total_time: 2.3 + Math.random() * 1.4,
    retry_count: 0,
    error: null,
  };
}

export interface ChatHistoryItem {
  id: string;
  query: string;
  teachingTo: GradeLevelId;
  timestamp: string;
}

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  roles: string[];
}

export const ALL_TOOLS: ToolDefinition[] = [
  { id: 'lesson-plan', title: 'Lesson Plan Generator', description: 'Generate ready-to-use lesson plans from any topic', icon: 'FileText', roles: ['teacher', 'admin', 'specialist', 'instructional-coach'] },
  { id: 'worksheet', title: 'Worksheet Generator', description: 'Create printable worksheets for any subject', icon: 'ClipboardList', roles: ['teacher', 'student', 'specialist'] },
  { id: 'quiz', title: 'Quiz Builder', description: 'Build assessment questions from resources', icon: 'HelpCircle', roles: ['teacher', 'student', 'specialist', 'instructional-coach'] },
  { id: 'text-rewriter', title: 'Text Rewriter', description: 'Rewrite content for different audiences', icon: 'RefreshCw', roles: ['teacher', 'admin', 'publisher', 'specialist'] },
  { id: 'text-leveler', title: 'Text Leveler', description: 'Adjust reading level for your students', icon: 'BarChart2', roles: ['teacher', 'student', 'specialist'] },
  { id: 'rubric', title: 'Rubric Generator', description: 'Build assessment rubrics instantly', icon: 'CheckSquare', roles: ['teacher', 'admin', 'instructional-coach'] },
  { id: 'writing-feedback', title: 'Writing Feedback', description: 'Get AI feedback on student writing', icon: 'MessageSquare', roles: ['teacher', 'student', 'specialist'] },
  { id: 'presentation', title: 'Presentation Generator', description: 'Create slide decks from your resources', icon: 'Monitor', roles: ['teacher', 'student', 'admin', 'publisher', 'instructional-coach'] },
  { id: 'summarizer', title: 'Text Summarizer', description: 'Summarise long documents quickly', icon: 'AlignLeft', roles: ['teacher', 'student', 'admin', 'publisher', 'specialist', 'curriculum-designer', 'instructional-coach'] },
  { id: 'curriculum-mapper', title: 'Curriculum Alignment Mapper', description: 'Map resources to curriculum outcomes', icon: 'Map', roles: ['admin', 'publisher', 'curriculum-designer', 'instructional-coach'] },
  { id: 'quality-audit', title: 'Quality & Bias Audit', description: 'Deep quality and bias analysis', icon: 'Shield', roles: ['admin', 'publisher', 'curriculum-designer', 'instructional-coach'] },
  { id: 'multi-synthesis', title: 'Multi-Source Synthesis', description: 'Combine insights from multiple sources', icon: 'GitMerge', roles: ['admin', 'publisher', 'curriculum-designer', 'instructional-coach'] },
  { id: 'ip-checker', title: 'IP & License Checker', description: 'Verify intellectual property rights', icon: 'Lock', roles: ['publisher', 'curriculum-designer'] },
  { id: 'differentiation', title: 'Differentiation Engine', description: 'Adapt content for diverse learners', icon: 'Users', roles: ['teacher', 'admin', 'specialist', 'instructional-coach'] },
  { id: 'translator', title: 'Translator', description: 'Translate resources for EAL/D students', icon: 'Globe', roles: ['teacher', 'student', 'specialist'] },
  { id: 'report-card', title: 'Report Card Comments', description: 'Generate personalised report comments', icon: 'FileCheck', roles: ['teacher'] },
  { id: 'academic-content', title: 'Academic Content Generator', description: 'Create academic-grade content', icon: 'BookOpen', roles: ['teacher', 'publisher', 'specialist'] },
  { id: 'youtube-questions', title: 'YouTube Video Questions', description: 'Generate questions from any YouTube video', icon: 'Youtube', roles: ['teacher', 'student'] },
];

export function getToolsForRole(role: string): ToolDefinition[] {
  return ALL_TOOLS.filter(t => t.roles.includes(role));
}
