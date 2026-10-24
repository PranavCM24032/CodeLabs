export interface StaffUser {
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface ParticipantEntry {
  email: string;
  name: string;
  teamId?: string;
  registeredAt?: string;
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
  } catch (error) {
    console.error('Error fetching allowed users:', error);
  }
  return { staffUsers: [], participants: [] };
}

export async function checkAccess(email: string): Promise<{ allowed: boolean; type?: 'staff' | 'participant'; user?: any }> {
  if (!email) return { allowed: false };
  const e = email.toLowerCase();
  if (e.includes('@')) {
    return { allowed: true, type: 'participant', user: { email: e, name: e.split('@')[0] } };
  }
  return { allowed: false };
}
