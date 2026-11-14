const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchJson<T>(url: string, options?: { token?: string } & RequestInit): Promise<T> {
  const { token, ...fetchOptions } = options || {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });
  if (res.ok === false) throw new Error(await res.text());
  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    fetchJson<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string }) =>
    fetchJson<{ user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () =>
    fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  getMe: (token?: string) =>
    fetchJson<{ user: any }>('/auth/me', { token }),

  // Forms
  getForms: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    fetchJson<{ forms: any[]; total: number }>(`/forms?${new URLSearchParams(params as any).toString()}`),
  getForm: (id: string, token?: string) => fetchJson<any>(`/forms/${id}`, { token }),
  createForm: (data: any, token?: string) => fetchJson<any>('/forms', { method: 'POST', body: JSON.stringify(data), token }),
  updateForm: (id: string, data: any, token?: string) => fetchJson<any>(`/forms/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteForm: (id: string, token?: string) => fetchJson<any>(`/forms/${id}`, { method: 'DELETE', token }),
  duplicateForm: (id: string, token?: string) => fetchJson<any>(`/forms/${id}/duplicate`, { method: 'POST', token }),
  publishForm: (id: string, token?: string) => fetchJson<any>(`/forms/${id}/publish`, { method: 'POST', token }),
  
  // Submissions
  getSubmissions: (params?: any, token?: string) => fetchJson<any>(`/submissions?${new URLSearchParams(params).toString()}`, { token }),
  getSubmission: (id: string, token?: string) => fetchJson<any>(`/submissions/${id}`, { token }),
  
  // Themes
  getThemes: (token?: string) => fetchJson<any[]>('/themes', { token }),
  getTheme: (id: string, token?: string) => fetchJson<any>(`/themes/${id}`, { token }),
  createTheme: (data: any, token?: string) => fetchJson<any>('/themes', { method: 'POST', body: JSON.stringify(data), token }),
  updateTheme: (id: string, data: any, token?: string) => fetchJson<any>(`/themes/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteTheme: (id: string, token?: string) => fetchJson<any>(`/themes/${id}`, { method: 'DELETE', token }),
  
  // Integrations
  getIntegrations: (formId: string, token?: string) => fetchJson<any[]>(`/integrations?formId=${formId}`, { token }),
  createIntegration: (data: any, token?: string) => fetchJson<any>('/integrations', { method: 'POST', body: JSON.stringify(data), token }),
  updateIntegration: (id: string, data: any, token?: string) => fetchJson<any>(`/integrations/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteIntegration: (id: string, token?: string) => fetchJson<any>(`/integrations/${id}`, { method: 'DELETE', token }),
  
  // Analytics
  getAnalytics: (formId: string, params?: any, token?: string) => fetchJson<any>(`/analytics/forms/${formId}?${new URLSearchParams(params).toString()}`, { token }),
  
  // Upload
  getUploadUrl: (data: { fileName: string; contentType: string; maxSize?: number }, token?: string) =>
    fetchJson<{ uploadUrl: string; downloadUrl: string; key: string }>('/upload/presign', { method: 'POST', body: JSON.stringify(data), token }),
  confirmUpload: (data: any, token?: string) => fetchJson<any>('/upload/confirm', { method: 'POST', body: JSON.stringify(data), token }),
};
