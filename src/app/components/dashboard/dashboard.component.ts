import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Design System Dashboard</h2>
        <p>Manage and generate your Figma design systems</p>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="card-icon">
            <mat-icon class="gradient-icon palette">palette</mat-icon>
          </div>
          <h3>Figma Connection</h3>
          <p>Connect to your Figma files and extract design systems</p>
          <button mat-raised-button color="primary" routerLink="/figma-connection">
            Connect Figma
          </button>
        </div>

        <div class="dashboard-card">
          <div class="card-icon">
            <mat-icon class="gradient-icon puzzle">extension</mat-icon>
          </div>
          <h3>Component Generator</h3>
          <p>Generate Angular components from your design system</p>
          <button mat-raised-button color="accent" routerLink="/component-generator">
            Generate Components
          </button>
        </div>

        <div class="dashboard-card">
          <div class="card-icon">
            <mat-icon class="gradient-icon target">gps_fixed</mat-icon>
          </div>
          <h3>Design Tokens</h3>
          <p>Manage colors, typography, spacing, and other design tokens</p>
          <button mat-raised-button color="warn" routerLink="/design-tokens">
            Manage Tokens
          </button>
        </div>

        <div class="dashboard-card">
          <div class="card-icon">
            <mat-icon class="gradient-icon analytics">analytics</mat-icon>
          </div>
          <h3>Statistics</h3>
          <p>View analytics and usage statistics for your design system</p>
          <button mat-raised-button routerLink="/stats">
            View Stats
          </button>
        </div>

        <div class="dashboard-card">
          <div class="card-icon">
            <mat-icon class="gradient-icon sync">sync</mat-icon>
          </div>
          <h3>Sync</h3>
          <p>Keep your components in sync with Figma changes</p>
          <button mat-raised-button routerLink="/sync">
            Sync Changes
          </button>
        </div>

        <div class="dashboard-card">
          <div class="card-icon">
            <mat-icon class="gradient-icon settings">settings</mat-icon>
          </div>
          <h3>Settings</h3>
          <p>Configure your design system preferences and options</p>
          <button mat-raised-button>
            Configure
          </button>
        </div>
      </div>

      <div class="dashboard-stats">
        <h3>Quick Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">Connected Files</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">Components</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">Design Tokens</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">0</div>
            <div class="stat-label">Generated Files</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      margin-bottom: 1rem;
    }

    .gradient-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-icon.palette {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-icon.puzzle {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-icon.target {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-icon.analytics {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-icon.sync {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-icon.settings {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dashboard-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .dashboard-card p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .dashboard-stats {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .dashboard-stats h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-header h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}