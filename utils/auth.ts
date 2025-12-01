export const PASSCODE = 'F|0d3$K!';

export const validatePasscode = (input: string): boolean => {
  return input === PASSCODE;
};

export interface AuthState {
  authenticated: boolean;
  timestamp: number;
}

export const getAuthFromStorage = (): AuthState | null => {
  try {
    const stored = localStorage.getItem('instrumentator_auth');
    if (!stored) return null;
    return JSON.parse(stored) as AuthState;
  } catch {
    return null;
  }
};

export const saveAuthToStorage = (): void => {
  const authState: AuthState = {
    authenticated: true,
    timestamp: Date.now()
  };
  localStorage.setItem('instrumentator_auth', JSON.stringify(authState));
};

export const clearAuthFromStorage = (): void => {
  localStorage.removeItem('instrumentator_auth');
};
