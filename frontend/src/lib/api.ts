const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('scora-user');
  if (!user) return null;
  try { return JSON.parse(user).id || null; } catch { return null; }
}

export const api = {
  // Auth
  async login(email: string, name?: string, role?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  // Search (real pipeline)
  async search(payload: {
    query: string;
    grade_level: string;
    subject?: string;
    user_role?: string;
    classroom_context?: Record<string, unknown>;
    web_search_enabled?: boolean;
  }) {
    const user_id = getUserId();
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, user_id }),
      signal: AbortSignal.timeout(120_000), // 120s — pipeline makes 4 LLM calls
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Library
  async saveResource(resource: Record<string, unknown>) {
    const user_id = getUserId();
    if (!user_id) return;
    const res = await fetch(`${API_BASE}/library/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...resource, user_id }),
    });
    return res.json();
  },

  async getLibrary() {
    const user_id = getUserId();
    if (!user_id) return [];
    const res = await fetch(`${API_BASE}/library/${user_id}`);
    return res.json();
  },

  async removeFromLibrary(resource_id: string) {
    const user_id = getUserId();
    if (!user_id) return;
    await fetch(`${API_BASE}/library/${user_id}/${resource_id}`, { method: 'DELETE' });
  },

  // Saved searches
  async saveSearch(query: string, grade_level: string, full_result: unknown, sources_count: number, consensus_score?: number) {
    const user_id = getUserId();
    if (!user_id) return;
    const res = await fetch(`${API_BASE}/searches/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, query, grade_level, full_result, sources_count, consensus_score }),
    });
    return res.json();
  },

  async getSearchHistory() {
    const user_id = getUserId();
    if (!user_id) return [];
    const res = await fetch(`${API_BASE}/searches/history/${user_id}`);
    return res.json();
  },

  // Profile
  async saveProfile(userId: string, profile: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  // Tools
  async executeTool(tool_id: string, inputs: Record<string, unknown>, grade_level?: string, user_role?: string) {
    const res = await fetch(`${API_BASE}/tools/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_id, inputs, grade_level, user_role }),
    });
    if (!res.ok) throw new Error('Tool execution failed');
    return res.json();
  },
};
