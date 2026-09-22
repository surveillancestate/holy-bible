// Login Button Web Component with OAuth
import { BaseComponent } from './base-component.js';
import { AuthService } from '../auth/auth-service.js';
import type { User } from '../auth/auth-service.js';

class LoginButtonComponent extends BaseComponent {
  private authService: AuthService;
  private user: User | null = null;
  private isLoading: boolean = false;
  private error: string | null = null;
  private authSyncInterval: number | null = null;

  constructor() {
    super();
    this.authService = AuthService.getInstance();
  }

  protected onConnect(): void {
    this.user = this.authService.getCurrentUser();
    this.startAuthSync();
    
    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  protected onDisconnect(): void {
    this.stopAuthSync();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  private startAuthSync(): void {
    // Check for auth changes every 5 seconds
    this.authSyncInterval = window.setInterval(() => {
      const currentUser = this.authService.getCurrentUser();
      if (JSON.stringify(currentUser) !== JSON.stringify(this.user)) {
        this.user = currentUser;
        this.render();
      }
    }, 5000);
  }

  private stopAuthSync(): void {
    if (this.authSyncInterval !== null) {
      clearInterval(this.authSyncInterval);
      this.authSyncInterval = null;
    }
  }

  private handleStorageChange(e: StorageEvent): void {
    if (e.key === 'auth_token' || e.key === 'auth_user') {
      this.user = this.authService.getCurrentUser();
      this.render();
    }
  }

  protected render(): void {
    const styles = `
      <style>
        :host {
          display: inline-block;
        }

        .auth-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .login-btn, .logout-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .login-btn {
          background: #4CAF50;
          color: white;
        }

        .login-btn:hover {
          background: #45a049;
        }

        .logout-btn {
          background: #f44336;
          color: white;
        }

        .logout-btn:hover {
          background: #da190b;
        }

        .oauth-buttons {
          display: flex;
          gap: 10px;
        }

        .oauth-btn {
          padding: 10px 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .oauth-btn:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .oauth-btn.google {
          background: #4285F4;
          color: white;
          border-color: #4285F4;
        }

        .oauth-btn.github {
          background: #333;
          color: white;
          border-color: #333;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ddd;
        }

        .user-name {
          font-weight: 500;
        }

        .hidden {
          display: none;
        }
      </style>
    `;

    if (this.user) {
      this.shadow.innerHTML = `
        ${styles}
        <div class="auth-container">
          <div class="user-info">
            <img 
              class="user-avatar" 
              src="${this.user.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23ddd%22/></svg>'}" 
              alt="${this.user.name}"
            />
            <span class="user-name">${this.user.name}</span>
          </div>
          <button class="logout-btn" id="logout-btn">Logout</button>
        </div>
      `;
    } else {
      this.shadow.innerHTML = `
        ${styles}
        <div class="auth-container">
          <div class="oauth-buttons">
            <button class="oauth-btn google" id="google-login">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="currentColor" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="currentColor" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.716H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="currentColor" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="currentColor" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.158 6.656 3.58 9 3.58z"/>
              </svg>
              Google
            </button>
            <button class="oauth-btn github" id="github-login">
              <svg width="18" height="18" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-4.22 0-.93.33-1.79.87-2.45-.35-.87-.8-1.79-.17-2.45.67-.21 2.2.84 2.2.84.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 0 0 1.53-1.05 2.2-.84.63.66.18 1.58-.17 2.45.54.66.87 1.52.87 2.45 0 3.34-1.87 4.01-3.65 4.22.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.21 0 .21.15.45.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>
      `;
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const googleBtn = this.querySelector('#google-login');
    const githubBtn = this.querySelector('#github-login');
    const logoutBtn = this.querySelector('#logout-btn');

    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleOAuthLogin('google'));
    }

    if (githubBtn) {
      githubBtn.addEventListener('click', () => this.handleOAuthLogin('github'));
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  private handleOAuthLogin(provider: 'google' | 'github'): void {
    const url = this.authService.getOAuthUrl(provider);
    window.location.href = url;
  }

  private handleLogout(): void {
    this.authService.logout();
    this.user = null;
    this.render();
    this.dispatchCustomEvent('logout', {});
  }
}

customElements.define('login-button', LoginButtonComponent);

export { LoginButtonComponent };
