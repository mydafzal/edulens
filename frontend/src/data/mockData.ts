import type {
  ToolCard,
  UserRole,
  SearchPipelineResult,
  RAGSource,
  DualAgentReview,
  Reference,
  Resource,
} from '@/types/edulens';

// ============================================================
// Tool cards per role (like MagicSchool grid)
// ============================================================

export const allTools: ToolCard[] = [
  // Universal tools
  {
    id: 'lesson-plan',
    title: 'Lesson Plan Generator',
    description: 'Generate a full lesson plan from a topic, standard, or objective.',
    icon: 'FileText',
    roles: ['teacher', 'specialist', 'instructional-coach'],
  },
  {
    id: 'worksheet',
    title: 'Worksheet Generator',
    description: 'Generate a worksheet based on any topic or text.',
    icon: 'ClipboardList',
    roles: ['teacher', 'specialist'],
  },
  {
    id: 'quiz',
    title: 'Quiz / Assessment Builder',
    description: 'Generate MCQ assessments based on any topic or standard.',
    icon: 'ListChecks',
    roles: ['teacher', 'specialist', 'instructional-coach'],
  },
  {
    id: 'text-rewriter',
    title: 'Text Rewriter',
    description: 'Rewrite any text with custom criteria for your audience.',
    icon: 'PenLine',
    roles: ['teacher', 'publisher', 'specialist'],
  },
  {
    id: 'text-leveler',
    title: 'Text Leveler',
    description: 'Level any text to fit a student\'s reading level or skills.',
    icon: 'BarChart3',
    roles: ['teacher', 'specialist'],
  },
  {
    id: 'rubric-generator',
    title: 'Rubric Generator',
    description: 'Generate a custom rubric for any assignment.',
    icon: 'Table',
    roles: ['teacher', 'instructional-coach'],
  },
  {
    id: 'writing-feedback',
    title: 'Writing Feedback',
    description: 'Generate feedback on student writing based on a rubric.',
    icon: 'MessageSquare',
    roles: ['teacher', 'specialist'],
  },
  {
    id: 'report-comments',
    title: 'Report Card Comments',
    description: 'Generate report card comments with strengths and growth areas.',
    icon: 'Award',
    roles: ['teacher'],
  },
  {
    id: 'presentation',
    title: 'Presentation Generator',
    description: 'Generate exportable slides based on a topic or text.',
    icon: 'Presentation',
    roles: ['teacher', 'publisher', 'instructional-coach'],
  },
  {
    id: 'summarizer',
    title: 'Text Summarizer',
    description: 'Summarize any text in whatever length you choose.',
    icon: 'AlignLeft',
    roles: ['teacher', 'publisher', 'specialist', 'curriculum-designer', 'instructional-coach'],
  },
  {
    id: 'curriculum-mapper',
    title: 'Curriculum Alignment Mapper',
    description: 'Map resources to ACARA, IB, Cambridge, or state curriculum outcomes.',
    icon: 'Map',
    roles: ['curriculum-designer', 'publisher', 'instructional-coach'],
  },
  {
    id: 'quality-audit',
    title: 'Quality & Bias Audit',
    description: 'Evaluate any resource for accuracy, bias, cultural sensitivity, and safety.',
    icon: 'ShieldCheck',
    roles: ['publisher', 'instructional-coach', 'curriculum-designer'],
  },
  {
    id: 'differentiation',
    title: 'Differentiation Engine',
    description: 'Generate 3 versions: standard, extension, and supported for diverse learners.',
    icon: 'Users',
    roles: ['teacher', 'specialist', 'instructional-coach'],
  },
  {
    id: 'translator',
    title: 'Text Translator',
    description: 'Translate any text or document into any language.',
    icon: 'Languages',
    roles: ['teacher', 'specialist', 'publisher'],
  },
  {
    id: 'synthesis',
    title: 'Multi-Source Synthesis',
    description: 'Combine multiple sources into a single contextual brief.',
    icon: 'Layers',
    roles: ['curriculum-designer', 'publisher', 'instructional-coach'],
  },
  {
    id: 'ip-checker',
    title: 'IP & License Checker',
    description: 'Check copyright, Creative Commons, and modification rights for any resource.',
    icon: 'Scale',
    roles: ['publisher', 'curriculum-designer'],
  },
  {
    id: 'academic-content',
    title: 'Academic Content Generator',
    description: 'Generate custom academic content based on your criteria.',
    icon: 'GraduationCap',
    roles: ['teacher', 'publisher', 'specialist'],
  },
  {
    id: 'youtube-questions',
    title: 'YouTube Video Questions',
    description: 'Generate guiding questions aligned to a YouTube video.',
    icon: 'PlayCircle',
    roles: ['teacher'],
  },
];

export function getToolsForRole(role: UserRole): ToolCard[] {
  return allTools.filter(tool => tool.roles.includes(role));
}

// ============================================================
// Role metadata
// ============================================================

export interface RoleInfo {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const roles: RoleInfo[] = [
  {
    id: 'teacher',
    title: 'Classroom Teacher',
    description: 'Find, evaluate, and adapt resources for Years 7-12 classes',
    icon: 'GraduationCap',
    color: 'bg-emerald-500',
  },
  {
    id: 'publisher',
    title: 'Education Publisher / Author',
    description: 'Quality benchmarking, IP clarity, and curriculum alignment at scale',
    icon: 'BookOpen',
    color: 'bg-blue-500',
  },
  {
    id: 'specialist',
    title: 'Language / Subject Specialist',
    description: 'Deep EAL/D adaptation, multilingual support, and sensitivity checking',
    icon: 'Languages',
    color: 'bg-violet-500',
  },
  {
    id: 'curriculum-designer',
    title: 'Curriculum Designer',
    description: 'Coverage mapping, multi-source synthesis, and outcome evidence',
    icon: 'Map',
    color: 'bg-amber-500',
  },
  {
    id: 'instructional-coach',
    title: 'Instructional Coach',
    description: 'Evidence-based resources, bias checking, and shareable annotated library',
    icon: 'Target',
    color: 'bg-rose-500',
  },
];

// ============================================================
// Mock search pipeline result
// ============================================================

export function getMockSearchResult(query: string): SearchPipelineResult {
  const ragSources: RAGSource[] = [
    {
      id: 'rag-1',
      title: 'Water Scarcity and Management in the Murray-Darling Basin',
      url: 'https://eric.ed.gov/?id=EJ1234567',
      snippet: 'This peer-reviewed study examines the intersection of environmental science education and water scarcity in Australia\'s largest river system, providing classroom-ready data sets and discussion frameworks for Years 9-10 Geography.',
      trustTier: 'gold',
      relevanceScore: 0.94,
      provider: 'ERIC',
    },
    {
      id: 'rag-2',
      title: 'Climate Change Impacts on Australian Water Systems — Educational Module',
      url: 'https://www.oercommons.org/courses/climate-water-aus',
      snippet: 'Open educational resource covering climate impacts on Australian water systems. Includes interactive data visualizations, student worksheets, and assessment rubrics aligned to ACARA Science standards.',
      trustTier: 'gold',
      relevanceScore: 0.91,
      provider: 'OER Commons',
    },
    {
      id: 'rag-3',
      title: 'First Nations Water Knowledge: Teaching Guide',
      url: 'https://aiatsis.gov.au/education/water-knowledge',
      snippet: 'Developed with Traditional Owners, this guide provides culturally appropriate frameworks for integrating First Nations water management knowledge into Geography and Science curricula.',
      trustTier: 'gold',
      relevanceScore: 0.88,
      provider: 'AIATSIS',
    },
    {
      id: 'rag-4',
      title: 'Bureau of Meteorology — Climate Data for Schools',
      url: 'http://www.bom.gov.au/climate/data-services/education.shtml',
      snippet: 'Official government datasets formatted for educational use. Includes rainfall, temperature, and drought index data with downloadable CSV files and visualization tools.',
      trustTier: 'gold',
      relevanceScore: 0.85,
      provider: 'Bureau of Meteorology',
    },
    {
      id: 'rag-5',
      title: 'Sustainable Agriculture in Regional Australia — Case Studies',
      url: 'https://www.csiro.au/en/research/natural-environment/land/agriculture-education',
      snippet: 'CSIRO-developed case studies examining sustainable farming practices in drought-prone regions, with teacher notes and differentiated student activities for Years 9-11.',
      trustTier: 'gold',
      relevanceScore: 0.82,
      provider: 'CSIRO',
    },
    {
      id: 'rag-6',
      title: 'ABC Education — Water: Our Most Precious Resource',
      url: 'https://education.abc.net.au/home#!/media/3456789',
      snippet: 'Video series exploring water scarcity across Australia, featuring expert interviews, regional case studies, and student discussion prompts. Closed captions and transcripts available.',
      trustTier: 'silver',
      relevanceScore: 0.79,
      provider: 'ABC Education',
    },
  ];

  const dualAgentReview: DualAgentReview = {
    goodCop: {
      verdict: 'approve',
      positivePoints: [
        'All 6 sources are from Tier 1 (Gold) verified providers — ERIC, OER Commons, AIATSIS, BOM, CSIRO, ABC Education',
        'Strong curriculum alignment with ACARA Geography and Science standards for Years 9-10',
        'First Nations perspectives represented through AIATSIS-verified content with proper cultural protocols',
        'Mix of content types (articles, interactive tools, video, data sets) supports diverse learning styles',
        'All resources have clear licensing — 4 Creative Commons, 1 Government Open Data, 1 Educational Use',
      ],
      rating: 9.2,
      summary: 'Excellent resource set. All sources verified, curriculum-aligned, and culturally appropriate. Strong mix of content types and perspectives.',
    },
    badCop: {
      verdict: 'approve',
      concerns: [
        'CSIRO case study (source #5) has a slight pro-agriculture bias — may underrepresent environmental costs of farming. Recommend pairing with environmental perspective.',
        'BOM data (source #4) requires teacher scaffolding for Year 9 students — raw CSV data may be inaccessible without guided worksheets.',
        'ABC Education video (source #6) was published in 2023 — verify that water scarcity statistics are still current for 2025-2026.',
      ],
      rating: 7.8,
      summary: 'Sources are legitimate and trustworthy. Minor concerns around one-sided agricultural framing in CSIRO source and potential data accessibility issues for younger students. No safety or IP concerns.',
    },
    consensusScore: 8.5,
  };

  const references: Reference[] = [
    {
      id: 'ref-1',
      title: 'Water Scarcity and Management in the Murray-Darling Basin',
      authors: ['Mitchell, S.', 'Thompson, R.'],
      url: 'https://eric.ed.gov/?id=EJ1234567',
      publishDate: '2024-08-15',
      source: 'ERIC — Education Resources Information Center',
      citationAPA: 'Mitchell, S., & Thompson, R. (2024). Water scarcity and management in the Murray-Darling Basin. *Journal of Environmental Education*, 55(3), 142-158.',
    },
    {
      id: 'ref-2',
      title: 'Climate Change Impacts on Australian Water Systems',
      authors: ['OER Commons Contributors'],
      url: 'https://www.oercommons.org/courses/climate-water-aus',
      publishDate: '2024-06-01',
      source: 'OER Commons (CC BY-SA 4.0)',
      citationAPA: 'OER Commons Contributors. (2024). Climate change impacts on Australian water systems — Educational module. OER Commons. https://www.oercommons.org/courses/climate-water-aus',
    },
    {
      id: 'ref-3',
      title: 'First Nations Water Knowledge: Teaching Guide',
      authors: ['AIATSIS', 'Ngarrindjeri Elders Council'],
      url: 'https://aiatsis.gov.au/education/water-knowledge',
      publishDate: '2023-11-20',
      source: 'AIATSIS — Australian Institute of Aboriginal and Torres Strait Islander Studies',
      citationAPA: 'AIATSIS & Ngarrindjeri Elders Council. (2023). First Nations water knowledge: Teaching guide. Australian Institute of Aboriginal and Torres Strait Islander Studies.',
    },
    {
      id: 'ref-4',
      title: 'Climate Data for Schools',
      authors: ['Bureau of Meteorology'],
      url: 'http://www.bom.gov.au/climate/data-services/education.shtml',
      publishDate: '2024-01-01',
      source: 'Australian Government — Bureau of Meteorology',
      citationAPA: 'Bureau of Meteorology. (2024). Climate data for schools. Australian Government. http://www.bom.gov.au/climate/data-services/education.shtml',
    },
    {
      id: 'ref-5',
      title: 'Sustainable Agriculture in Regional Australia — Case Studies',
      authors: ['CSIRO Agricultural Research Division'],
      url: 'https://www.csiro.au/en/research/natural-environment/land/agriculture-education',
      publishDate: '2024-03-10',
      source: 'CSIRO (CC BY-SA 3.0)',
      citationAPA: 'CSIRO Agricultural Research Division. (2024). Sustainable agriculture in regional Australia — Case studies. Commonwealth Scientific and Industrial Research Organisation.',
    },
    {
      id: 'ref-6',
      title: 'Water: Our Most Precious Resource',
      authors: ['ABC Education'],
      url: 'https://education.abc.net.au/home#!/media/3456789',
      publishDate: '2023-09-05',
      source: 'ABC Education (Educational Use)',
      citationAPA: 'ABC Education. (2023). Water: Our most precious resource [Video series]. Australian Broadcasting Corporation. https://education.abc.net.au/',
    },
  ];

  return {
    query,
    expandedQueries: [
      query,
      `${query} curriculum-aligned resources ACARA`,
      `water management environmental education Australia secondary`,
      `Murray-Darling Basin teaching materials Year 9 Geography`,
    ],
    stage: 'complete',
    ragSources,
    dualAgentReview,
    summary: `Found 6 high-quality, verified resources on water scarcity for Year 9 Geography. All sources come from Tier 1 trusted providers (ERIC, OER Commons, AIATSIS, BOM, CSIRO, ABC Education). The resource set covers multiple perspectives including scientific data, First Nations water knowledge, agricultural sustainability, and climate impacts. All resources are curriculum-aligned to ACARA Geography and Science standards.\n\nKey themes covered:\n- Environmental science of water scarcity in the Murray-Darling Basin\n- First Nations perspectives on water management (AIATSIS-verified)\n- Climate data analysis and visualization tools\n- Sustainable agriculture case studies from regional Australia\n- Interactive and video content for diverse learning styles\n\nAuthenticity verified through dual-agent review (consensus score: 8.5/10). All sources have valid licensing for educational use.`,
    references,
    rawContent: `# Research Results: Water Scarcity — Year 9 Geography\n\n## Source Analysis\n\n### 1. ERIC — Water Scarcity and Management in the Murray-Darling Basin\nPeer-reviewed study from the Journal of Environmental Education examining the intersection of environmental science education and water scarcity. Provides classroom-ready data sets and discussion frameworks for Years 9-10.\n\n### 2. OER Commons — Climate Change Impacts on Australian Water Systems\nOpen educational resource with interactive data visualizations, student worksheets, and assessment rubrics. Aligned to ACARA Science standards. Licensed CC BY-SA 4.0.\n\n### 3. AIATSIS — First Nations Water Knowledge Teaching Guide\nDeveloped with Traditional Owners (Ngarrindjeri Elders Council). Provides culturally appropriate frameworks for integrating First Nations water management knowledge. Follows AIATSIS cultural protocols.\n\n### 4. BOM — Climate Data for Schools\nOfficial government datasets formatted for educational use. Includes rainfall, temperature, and drought index data. Note: May require teacher scaffolding for Year 9 students.\n\n### 5. CSIRO — Sustainable Agriculture Case Studies\nCase studies examining sustainable farming in drought-prone regions. Includes teacher notes and differentiated student activities. Note: Minor pro-agriculture framing bias.\n\n### 6. ABC Education — Water: Our Most Precious Resource\nVideo series with expert interviews, regional case studies, and student discussion prompts. Closed captions available. Published 2023 — verify currency of statistics.\n\n## Curriculum Alignment\n- ACHGK051: Environmental change and management\n- ACHGK052: Sustainability of places\n- ACSSU176: Global systems including water cycle\n- ACHGK065: Interconnections between people and places\n\n## Licensing Summary\n- 2 resources: CC BY-SA\n- 1 resource: CC BY-NC\n- 1 resource: Government Open Data\n- 1 resource: Educational Use\n- 1 resource: CC BY`,
    totalTime: 3.2,
  };
}

// ============================================================
// Chat history entries
// ============================================================

export interface ChatHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  saved: boolean;
}

export const mockChatHistory: ChatHistoryEntry[] = [
  {
    id: 'ch-1',
    query: 'Water scarcity Year 9 Geography Queensland',
    timestamp: '2026-04-08T14:30:00Z',
    resultCount: 6,
    saved: true,
  },
  {
    id: 'ch-2',
    query: 'First Nations perspectives colonisation Year 10 History',
    timestamp: '2026-04-08T11:15:00Z',
    resultCount: 8,
    saved: false,
  },
  {
    id: 'ch-3',
    query: 'Climate change data visualization interactive Year 11 Science',
    timestamp: '2026-04-07T16:45:00Z',
    resultCount: 5,
    saved: true,
  },
  {
    id: 'ch-4',
    query: 'Australian poetry analysis Year 8 English',
    timestamp: '2026-04-07T09:20:00Z',
    resultCount: 7,
    saved: false,
  },
  {
    id: 'ch-5',
    query: 'Quadratic equations scaffolded activities Year 10 Mathematics',
    timestamp: '2026-04-06T13:00:00Z',
    resultCount: 4,
    saved: false,
  },
];

// ============================================================
// Sample resources (kept for library/compatibility)
// ============================================================

export const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Water Scarcity in the Murray-Darling Basin',
    description: 'Comprehensive overview of water management challenges in Australia\'s most important river system.',
    type: 'article',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop',
    source: {
      name: 'ABC Education',
      url: 'https://education.abc.net.au',
      author: 'Dr. Sarah Mitchell',
      publishDate: '2024-08-15',
      license: 'CC BY-NC',
      licenseType: 'cc-by-nc'
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 92, rationale: 'Information verified against Bureau of Meteorology data.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 88, rationale: 'Presents multiple stakeholder perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 95, rationale: 'Suitable for Years 9-10.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 85, rationale: 'Includes First Nations perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 92
    },
    curriculumAlignment: ['ACHGK051', 'ACHGK052'],
    yearLevels: [9, 10],
    subjects: ['Geography', 'Science'],
    tags: ['Water', 'Environment', 'Murray-Darling']
  },
  {
    id: '2',
    title: 'Climate Data Visualization Tool',
    description: 'Interactive tool for exploring climate data trends across Australian regions.',
    type: 'interactive',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    source: {
      name: 'Bureau of Meteorology',
      url: 'http://www.bom.gov.au/climate/data/',
      publishDate: '2024-06-01',
      license: 'CC BY',
      licenseType: 'cc-by'
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 98, rationale: 'Official government data source.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 95, rationale: 'Raw data presentation.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'caution', score: 72, rationale: 'May need teacher guidance.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 90, rationale: 'Neutral data presentation.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 91
    },
    yearLevels: [9, 10, 11, 12],
    subjects: ['Science', 'Geography', 'Mathematics'],
    tags: ['Climate', 'Data', 'Interactive']
  },
];
