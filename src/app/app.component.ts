import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <mat-icon class="logo-icon">design_services</mat-icon>
              <h1>Figma Design System Generator</h1>
            </div>
            <nav>
              <a routerLink="/" routerLinkActive="active">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </a>
              <a routerLink="/figma-connection" routerLinkActive="active">
                <mat-icon>link</mat-icon>
                Figma Connection
              </a>
              <a routerLink="/component-generator" routerLinkActive="active">
                <mat-icon>extension</mat-icon>
                Components
              </a>
              <a routerLink="/design-tokens" routerLinkActive="active">
                <mat-icon>palette</mat-icon>
                Design Tokens
              </a>
              <a routerLink="/stats" routerLinkActive="active">
                <mat-icon>analytics</mat-icon>
                Statistics
              </a>
              <a routerLink="/sync" routerLinkActive="active">
                <mat-icon>sync</mat-icon>
                Sync
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main class="app-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: white;
      border-bottom: 1px solid #eee;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .app-header h1 {
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .app-header nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    
    .app-header nav a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 0.5rem 1rem;
      border-radius: 6px;
    }

    .app-header nav a mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }
    
    .app-header nav a:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }
    
    .app-header nav a.active {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }
    
    .app-main {
      flex: 1;
      padding: 2rem 0;
      background-color: #fafafa;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .app-header nav {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
      }

      .app-header nav a {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'Figma Design System Generator';
}