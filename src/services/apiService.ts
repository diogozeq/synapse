import { Course, Collaborator, Team, Enrollment, Role, Area, CollaboratorInput, TeamInput, RoleInput, EnrollmentInput, CheckInInput, BioAnalytics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type RequestOptions = RequestInit & { parse?: boolean };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { parse = true, headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    ...rest
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.detail;
    } catch {
      // ignore
    }
    throw new Error(detail || `API request failed with status ${response.status}`);
  }

  if (!parse) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  getCourses: () => request<Course[]>('/courses'),
  getCourse: (courseId: string) => request<Course>(`/courses/${courseId}`),
  createCourse: (payload: Partial<Course>) =>
    request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCourse: (courseId: string, payload: Partial<Course>) =>
    request<Course>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteCourse: (courseId: string) =>
    request<{ deleted: boolean }>(`/courses/${courseId}`, {
      method: 'DELETE'
    }),
  getUsers: () => request<Collaborator[]>('/users'),
  createUser: (payload: CollaboratorInput) =>
    request<Collaborator>('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateUser: (userId: string, payload: Partial<CollaboratorInput> & { totalXP?: number; level?: number; streakDays?: number }) =>
    request<Collaborator>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteUser: (userId: string) =>
    request<{ deleted: boolean }>(`/users/${userId}`, { method: 'DELETE' }),

  getTeams: () => request<Team[]>('/teams'),
  createTeam: (payload: TeamInput) =>
    request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateTeam: (teamId: string, payload: Partial<TeamInput>) =>
    request<Team>(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteTeam: (teamId: string) =>
    request<{ deleted: boolean }>(`/teams/${teamId}`, { method: 'DELETE' }),

  getRoles: (teamId?: string) => {
    const query = teamId ? `?teamId=${teamId}` : '';
    return request<Role[]>(`/roles${query}`);
  },
  createRole: (payload: RoleInput) =>
    request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateRole: (roleId: string, payload: Partial<RoleInput>) =>
    request<Role>(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteRole: (roleId: string) =>
    request<{ deleted: boolean }>(`/roles/${roleId}`, { method: 'DELETE' }),

  getAreas: () => request<Area[]>('/areas'),
  createArea: (payload: { name: string; description?: string }) =>
    request<Area>('/areas', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateArea: (areaId: string, payload: { name?: string; description?: string }) =>
    request<Area>(`/areas/${areaId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteArea: (areaId: string) =>
    request<{ deleted: boolean }>(`/areas/${areaId}`, { method: 'DELETE' }),

  getEnrollments: () => request<Enrollment[]>('/enrollments'),
  createEnrollment: (payload: EnrollmentInput) =>
    request<Enrollment>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateEnrollment: (enrollmentId: string, payload: Partial<EnrollmentInput>) =>
    request<Enrollment>(`/enrollments/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteEnrollment: (enrollmentId: string) =>
    request<{ deleted: boolean }>(`/enrollments/${enrollmentId}`, { method: 'DELETE' }),

  // Sessões de Aprendizado
  createSession: (payload: { userId: string; activityId: string; checkInBioId?: string; modoRecomendado?: string }) =>
    request<{
      id: string;
      userId: string;
      checkInBioId: string | null;
      modoRecomendado: string;
      startedAt: string;
      completedAt: string | null;
    }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  completeSession: (sessionId: string, payload: { score?: number; completedAt?: string }) =>
    request<{
      id: string;
      userId: string;
      completedAt: string | null;
      score: number | null;
    }>(`/api/sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  getUserSessions: (userId: string, limit?: number) =>
    request<{
      sessions: Array<{
        id: string;
        userId: string;
        checkInBioId: string | null;
        modoRecomendado: string;
        startedAt: string;
        completedAt: string | null;
      }>;
    }>(`/api/users/${userId}/sessions${limit ? `?limit=${limit}` : ''}`),

  // Interações
  saveInteraction: (payload: {
    userId: string;
    sessionId?: string;
    activityId: string;
    isCorrect?: boolean;
    responseTimeMs: number;
    attempts?: number;
  }) =>
    request<{
      id: string;
      userId: string;
      sessionId: string | null;
      activityId: string;
      isCorrect: boolean | null;
      responseTimeMs: number;
      attempts: number;
      createdAt: string;
    }>('/api/interactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getActivityInteractions: (activityId: string, userId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{
      interactions: Array<{
        id: string;
        userId: string;
        sessionId: string | null;
        activityId: string;
        isCorrect: boolean | null;
        responseTimeMs: number;
        attempts: number;
        createdAt: string;
      }>;
    }>(`/api/activities/${activityId}/interactions${query}`);
  },

  // Spaced Repetition
  getUserReviews: (userId: string, dueOnly: boolean = true) =>
    request<{
      reviews: Array<{
        id: string;
        userId: string;
        activityId: string;
        easinessFactor: number;
        interval: number;
        repetitions: number;
        lastReview: string | null;
        nextReview: string | null;
      }>;
    }>(`/api/users/${userId}/reviews?due_only=${dueOnly}`),
  createOrUpdateReview: (payload: {
    userId: string;
    activityId: string;
    easinessFactor: number;
    interval: number;
    repetitions: number;
    lastReview?: string;
    nextReview?: string;
  }) =>
    request<{
      id: string;
      userId: string;
      activityId: string;
      easinessFactor: number;
      interval: number;
      repetitions: number;
      lastReview: string | null;
      nextReview: string | null;
    }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateReview: (reviewId: string, payload: {
    easinessFactor: number;
    interval: number;
    repetitions: number;
    lastReview?: string;
    nextReview?: string;
  }) =>
    request<{
      id: string;
      userId: string;
      activityId: string;
      easinessFactor: number;
      interval: number;
      repetitions: number;
      lastReview: string | null;
      nextReview: string | null;
    }>(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Check-in Bio
  createCheckIn: (payload: CheckInInput) =>
    request<{ id: string }>('/api/checkins', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Bio Analytics
  getBioAnalytics: (userId: string) =>
    request<BioAnalytics>(`/api/users/${userId}/bio-analytics`)
};

export type ApiService = typeof apiService;
