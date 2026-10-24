export interface StaffUser {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface ParticipantEntry {
  email: string;
  teamName: string;
}

export interface AllowedUsers {
  staffUsers: StaffUser[];
  participants: ParticipantEntry[];
}

const API_BASE = `http://localhost:${process.env.PORT || 3000}`;
export async function fetchAllowedUsers(): Promise<AllowedUsers> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/allowed-users`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.error('Failed to fetch allowed users:', e);
  }
  return { staffUsers: [], participants: [] };
}

export async function checkAccess(email: string): Promise<{ allowed: boolean; type?: 'staff' | 'participant'; user?: any }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/check-access?email=` + encodeURIComponent(email));
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to check access:', e);
  }
  return { allowed: false };
}



