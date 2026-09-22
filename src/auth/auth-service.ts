// OAuth Authentication Module
// Custom auth solution for KJV Bible app

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "google" | "github" | "apple" | "local";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate OAuth authorization URL
  getOAuthUrl(provider: "google" | "github" | "apple"): string {
    const baseUrl = this.getBaseUrl(provider);
    
    const params = new URLSearchParams({
      client_id: this.getClientId(provider),
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope: this.getScope(provider),
      state: this.generateState(),
    });

    // Apple-specific parameters
    if (provider === "apple") {
      params.append("response_mode", "form_post");
    }

    return `${baseUrl}?${params.toString()}`;
  }

  private getBaseUrl(provider: string): string {
    const urls: Record<string, string> = {
      google: "https://accounts.google.com/o/oauth2/v2/auth",
      github: "https://github.com/login/oauth/authorize",
      apple: "https://appleid.apple.com/auth/authorize",
    };
    return urls[provider];
  }

  private getScope(provider: string): string {
    const scopes: Record<string, string> = {
      google: "openid email profile",
      github: "user:email",
      apple: "name email",
    };
    return scopes[provider];
  }

  private getClientId(provider: string): string {
    // These should be configured via environment variables
    const ids: Record<string, string> = {
      google: Bun.env.GOOGLE_CLIENT_ID || "",
      github: Bun.env.GITHUB_CLIENT_ID || "",
      apple: Bun.env.APPLE_CLIENT_ID || "",
    };
    return ids[provider];
  }

  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Handle OAuth callback
  async handleCallback(code: string, state: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      this.setAuthState(data.user, data.token);
      return data.user;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  private setAuthState(user: User, token: string): void {
    this.authState = {
      user,
      token,
      isAuthenticated: true,
    };
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  // Check if user is authenticated
  checkAuth(): boolean {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState = {
          user,
          token,
          isAuthenticated: true,
        };
        return true;
      } catch {
        this.clearAuth();
        return false;
      }
    }
    return false;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Get auth token
  getToken(): string | null {
    return this.authState.token;
  }

  // Logout
  logout(): void {
    this.authState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Get auth headers for API requests
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export { AuthService, type User, type AuthState };
