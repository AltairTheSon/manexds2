import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <h1>Figma Design System Generator</h1>
          <nav>
            <a routerLink="/" routerLinkActive="active">Dashboard</a>
            <a routerLink="/figma-connection" routerLinkActive="active">Figma Connection</a>
            <a routerLink="/component-generator" routerLinkActive="active">Components</a>
            <a routerLink="/design-tokens" routerLinkActive="active">Design Tokens</a>
            <a routerLink="/stats" routerLinkActive="active">Statistics</a>
            <a routerLink="/sync" routerLinkActive="active">Sync</a>
          </nav>
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
    }
    
    .app-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .app-header nav {
      margin-top: 1rem;
    }
    
    .app-header nav a {
      margin-right: 1.5rem;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    
    .app-header nav a:hover,
    .app-header nav a.active {
      color: #3f51b5;
    }
    
    .app-main {
      flex: 1;
      padding: 2rem 0;
      background-color: #fafafa;
    }
  `]
})
export class AppComponent {
  title = 'Figma Design System Generator';
}