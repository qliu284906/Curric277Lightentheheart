
export enum SignupSource {
  LEGACY = 'LEGACY',
  NEW = 'NEW',
  PENDING = 'PENDING'
}

export interface User {
  id: string;
  name: string;
  source: SignupSource;
  timestamp: number;
  label?: string;
  isLit?: boolean; // New field: true = colorful/glowing, false = transparent/dim
}

// Minimal BootData since we aren't using dynamic backend anymore
export interface BootData {
  ok: boolean;
}
