import type { Resource, Adaptation, LocalContext } from '@/types/edulens';

export const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Water Scarcity in the Murray-Darling Basin',
    description:
      "Comprehensive overview of water management challenges in Australia's most important river system.",
    type: 'article',
    thumbnail:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop',
    source: {
      name: 'ABC Education',
      url: 'https://education.abc.net.au',
      author: 'Dr. Sarah Mitchell',
      publishDate: '2024-08-15',
      license: 'CC BY-NC',
      licenseType: 'cc-by-nc',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 92, rationale: 'Information verified against Bureau of Meteorology data.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 88, rationale: 'Presents multiple stakeholder perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 95, rationale: 'Suitable for Years 9-10.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 85, rationale: 'Includes First Nations perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 92,
    },
    curriculumAlignment: ['ACHGK051', 'ACHGK052'],
    yearLevels: [9, 10],
    subjects: ['Geography', 'Science'],
    tags: ['Water', 'Environment', 'Murray-Darling'],
  },
  {
    id: '2',
    title: 'Climate Data Visualization Tool',
    description:
      'Interactive tool for exploring climate data trends across Australian regions.',
    type: 'interactive',
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    source: {
      name: 'Bureau of Meteorology',
      url: 'http://www.bom.gov.au/climate/data/',
      publishDate: '2024-06-01',
      license: 'CC BY',
      licenseType: 'cc-by',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 98, rationale: 'Official government data source.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 95, rationale: 'Raw data presentation.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'caution', score: 72, rationale: 'May need teacher guidance.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 90, rationale: 'Neutral data presentation.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 91,
    },
    yearLevels: [9, 10, 11, 12],
    subjects: ['Science', 'Geography', 'Mathematics'],
    tags: ['Climate', 'Data', 'Interactive'],
  },
  {
    id: '3',
    title: 'First Nations Water Stories: The Murray River',
    description:
      'Documentary exploring the cultural significance of the Murray River to First Nations peoples.',
    type: 'video',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    source: {
      name: 'AIATSIS',
      url: 'https://aiatsis.gov.au',
      author: 'Ngarrindjeri Elders Council',
      publishDate: '2023-11-20',
      license: 'Educational Use',
      licenseType: 'copyrighted',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 95, rationale: 'Developed with Traditional Owners.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 90, rationale: 'Centres First Nations perspectives.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 88, rationale: 'Suitable for Years 7+.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 98, rationale: 'Exemplary cultural protocols.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 94,
    },
    yearLevels: [7, 8, 9, 10],
    subjects: ['Geography', 'History', 'Aboriginal Studies'],
    tags: ['First Nations', 'Water', 'Culture'],
  },
  {
    id: '4',
    title: 'Sustainable Agriculture in Regional Australia',
    description:
      'Case study examining sustainable farming practices in drought-prone regions.',
    type: 'pdf',
    source: {
      name: 'CSIRO',
      url: 'https://csiro.au',
      author: 'Agricultural Research Division',
      publishDate: '2024-03-10',
      license: 'CC BY-SA',
      licenseType: 'cc-by-sa',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 96, rationale: 'Peer-reviewed CSIRO research.' },
      bias: { name: 'bias', label: 'Bias', level: 'caution', score: 78, rationale: 'Focuses on successful adaptations.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 82, rationale: 'General audience writing.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'caution', score: 70, rationale: 'Limited Indigenous perspectives.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 85,
    },
    yearLevels: [9, 10, 11],
    subjects: ['Geography', 'Agriculture', 'Science'],
    tags: ['Agriculture', 'Sustainability', 'Drought'],
  },
  {
    id: '5',
    title: 'Introduction to Photosynthesis',
    description:
      'Comprehensive lesson covering the light-dependent and light-independent reactions of photosynthesis.',
    type: 'article',
    thumbnail:
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=400&fit=crop',
    source: {
      name: 'Khan Academy',
      url: 'https://khanacademy.org',
      publishDate: '2024-01-15',
      license: 'CC BY-NC-SA',
      licenseType: 'cc-by-nc',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 97, rationale: 'Peer-reviewed scientific content.' },
      bias: { name: 'bias', label: 'Bias', level: 'safe', score: 95, rationale: 'Neutral scientific presentation.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 90, rationale: 'Suitable for Years 9-12.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 92, rationale: 'No cultural concerns.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 95,
    },
    yearLevels: [9, 10, 11, 12],
    subjects: ['Biology', 'Science'],
    tags: ['Biology', 'Plants', 'Chemistry'],
  },
  {
    id: '6',
    title: 'The French Revolution: Causes and Consequences',
    description:
      'A detailed analysis of the social, economic, and political factors that led to the French Revolution.',
    type: 'pdf',
    thumbnail:
      'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=800&h=400&fit=crop',
    source: {
      name: 'National Archives of France',
      url: 'https://archives.fr',
      author: 'Prof. Jean-Michel Duclos',
      publishDate: '2023-09-01',
      license: 'CC BY',
      licenseType: 'cc-by',
    },
    scorecard: {
      accuracy: { name: 'accuracy', label: 'Accuracy', level: 'safe', score: 94, rationale: 'Archival primary sources cited.' },
      bias: { name: 'bias', label: 'Bias', level: 'caution', score: 75, rationale: 'Primarily Western perspective.' },
      ageAppropriateness: { name: 'ageAppropriateness', label: 'Age Appropriate', level: 'safe', score: 85, rationale: 'Suitable for Years 10-12.' },
      culturalSensitivity: { name: 'culturalSensitivity', label: 'Cultural Sensitivity', level: 'safe', score: 80, rationale: 'Appropriate historical context.' },
      safety: { name: 'safety', label: 'Safety', level: 'safe', score: 100, rationale: 'No safety concerns.' },
      overallScore: 87,
    },
    yearLevels: [10, 11, 12],
    subjects: ['History', 'Humanities'],
    tags: ['History', 'France', 'Revolution'],
  },
];

export const sampleAdaptations: Adaptation[] = [
  {
    type: 'example',
    original: 'Consider a major river system in your country...',
    adapted: 'The Condamine-Balonne River system in the Darling Downs region faces similar challenges...',
    rationale: 'Replaced generic example with local Toowoomba reference',
  },
  {
    type: 'reference',
    original: 'Local farmers have adapted to water scarcity...',
    adapted: 'Farmers in the Lockyer Valley have pioneered innovative drip irrigation systems...',
    rationale: 'Added regional Queensland agricultural reference',
  },
  {
    type: 'cultural',
    original: 'Indigenous communities have traditional water management practices...',
    adapted: 'The Jarowair and Giabal peoples, Traditional Owners of the Toowoomba region, have practiced sustainable water management for thousands of years...',
    rationale: 'Incorporated local First Nations context',
  },
  {
    type: 'reading-level',
    original: 'The anthropogenic factors contributing to hydrological stress...',
    adapted: 'Human activities that put pressure on water supplies...',
    rationale: 'Simplified for Year 9 reading level',
  },
];

export const sampleLocalContext: LocalContext = {
  country: 'Australia',
  state: 'Queensland',
  region: 'Darling Downs',
  suburb: 'Toowoomba',
  yearLevel: 9,
  subject: 'Geography',
  studentInterests: ['Sports', 'Gaming', 'Music'],
  communityAnchors: ['Toowoomba Grammar', 'USQ', 'Picnic Point'],
};

export const demoPlanSections = [
  {
    title: 'Learning Objectives',
    content: [
      'Students will be able to explain the causes of water scarcity in the Murray-Darling Basin.',
      'Students will analyse the impact of climate change on Australian water resources.',
      'Students will evaluate sustainable water management strategies used by local communities.',
    ],
  },
  {
    title: 'Introduction (10 min)',
    content: [
      'Show the Climate Data Visualization Tool to display rainfall trends over the past 30 years.',
      'Ask students: "What do you notice about rainfall patterns in South-East Queensland?"',
      'Introduce key vocabulary: water scarcity, allocation, sustainable management, catchment.',
    ],
  },
  {
    title: 'Main Activity (25 min)',
    content: [
      'Students read the Murray-Darling Basin article in pairs.',
      'Complete a cause-and-effect graphic organiser identifying 3 causes and 3 consequences.',
      'Class discussion: How does water scarcity affect farmers, communities, and ecosystems?',
    ],
  },
  {
    title: 'Local Connection (10 min)',
    content: [
      'Watch excerpt from First Nations Water Stories documentary.',
      'Discuss the Jarowair and Giabal peoples\' traditional water management practices.',
      'Connect to Lockyer Valley farming innovations as a local example.',
    ],
  },
  {
    title: 'Assessment Task',
    content: [
      'Short response (250–300 words): "Evaluate ONE strategy used to manage water scarcity in regional Australia."',
      'Criteria: uses geographic terminology, references at least 2 sources, includes local example.',
      'Due: next lesson.',
    ],
  },
];

export const demoNotifications = [
  { id: '1', icon: '📚', text: 'New Year 9 Geography resources available', time: '2h ago', read: false },
  { id: '2', icon: '✅', text: 'Prep My Week workflow completed — 23 resources found', time: 'Yesterday', read: false },
  { id: '3', icon: '⚠️', text: 'AIATSIS documentary licence expiring in 3 days', time: '2 days ago', read: true },
  { id: '4', icon: '🎉', text: 'You\'ve saved 50 resources to your library!', time: '1 week ago', read: true },
];
