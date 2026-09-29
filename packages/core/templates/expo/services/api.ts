export const API_BASE_URL = '__CT_API_BASE_URL__';

export async function checkBackendHealth(): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      const fallbackRes = await fetch(`${API_BASE_URL}/api/health`);
      return await fallbackRes.json();
    }
    return await res.json();
  } catch {
    throw new Error('Backend unreachable');
  }
}
