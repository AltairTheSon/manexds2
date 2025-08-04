import { Component, OnInit } from '@angular/core';
import { DesignSystemService, DesignSystem } from '../../services/design-system.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stats',
  template: `
    <div class="stats">
      <div class="stats-header">
        <mat-icon class="header-icon">analytics</mat-icon>
        <h2>Statistics</h2>
        <p>View analytics and usage statistics for your design system</p>
      </div>
      
      <div class="stats-content">
        <!-- Statistics Overview -->
        <div *ngIf="designSystems.length > 0" class="stats-overview">
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon">
                  <mat-icon>folder</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalDesignSystems }}</h3>
                  <p>Design Systems</p>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon">
                  <mat-icon>extension</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalComponents }}</h3>
                  <p>Components</p>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon">
                  <mat-icon>palette</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalColors }}</h3>
                  <p>Color Tokens</p>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon">
                  <mat-icon>text_fields</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalTypography }}</h3>
                  <p>Typography Tokens</p>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon">
                  <mat-icon>space_bar</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalSpacing }}</h3>
                  <p>Spacing Tokens</p>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ lastSyncDays }}</h3>
                  <p>Days Since Last Sync</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Design Systems Details -->
          <div class="systems-details">
            <h3>Design Systems Details</h3>
            
            <div class="systems-table">
              <mat-card *ngFor="let system of designSystems" class="system-row">
                <mat-card-content>
                  <div class="system-info">
                    <div class="system-name">
                      <h4>{{ system.name }}</h4>
                      <p>File ID: {{ system.figmaFileId }}</p>
                    </div>
                    
                    <div class="system-stats">
                      <div class="stat-item">
                        <span class="stat-label">Components:</span>
                        <span class="stat-value">{{ system.components.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Colors:</span>
                        <span class="stat-value">{{ system.tokens.colors.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Typography:</span>
                        <span class="stat-value">{{ system.tokens.typography.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Spacing:</span>
                        <span class="stat-value">{{ system.tokens.spacing.length }}</span>
                      </div>
                    </div>
                    
                    <div class="system-meta">
                      <div class="last-sync">
                        <mat-icon>schedule</mat-icon>
                        <span>{{ system.lastSync | date:'medium' }}</span>
                      </div>
                      <div class="language">
                        <mat-icon>language</mat-icon>
                        <span>{{ system.language.toUpperCase() }}</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Export Statistics -->
          <div class="export-section">
            <h3>Export Statistics</h3>
            <div class="export-actions">
              <button mat-raised-button color="primary" (click)="exportStatistics()">
                <mat-icon>download</mat-icon>
                Export Statistics Report
              </button>
              <button mat-raised-button color="accent" (click)="generateReport()">
                <mat-icon>assessment</mat-icon>
                Generate Detailed Report
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="designSystems.length === 0" class="empty-state">
          <mat-icon class="empty-icon">bar_chart</mat-icon>
          <h3>No Statistics Available</h3>
          <p>Please connect to Figma first to view analytics and usage statistics.</p>
          <button mat-raised-button color="primary" routerLink="/figma-connection">
            <mat-icon>link</mat-icon>
            Connect to Figma
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }

    .stats h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .stats p {
      color: #666;
      margin-bottom: 2rem;
    }

    .stats-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 2rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-state button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 auto;
    }

    .empty-state button mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .stats-overview {
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-icon mat-icon {
      color: white;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .systems-details {
      margin-bottom: 3rem;
    }

    .systems-details h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .systems-table {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .system-row {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .system-row:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .system-info {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      gap: 2rem;
      align-items: center;
    }

    .system-name h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .system-name p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .system-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .stat-value {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }

    .system-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .last-sync,
    .language {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .last-sync mat-icon,
    .language mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .export-section {
      margin-top: 3rem;
    }

    .export-section h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .export-actions {
      display: flex;
      gap: 1rem;
    }

    .export-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .system-info {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .system-stats {
        grid-template-columns: 1fr;
      }

      .export-actions {
        flex-direction: column;
      }
    }
  `]
})
export class StatsComponent implements OnInit {
  designSystems: DesignSystem[] = [];
  
  get totalDesignSystems(): number {
    return this.designSystems.length;
  }
  
  get totalComponents(): number {
    return this.designSystems.reduce((total, system) => total + system.components.length, 0);
  }
  
  get totalColors(): number {
    return this.designSystems.reduce((total, system) => total + system.tokens.colors.length, 0);
  }
  
  get totalTypography(): number {
    return this.designSystems.reduce((total, system) => total + system.tokens.typography.length, 0);
  }
  
  get totalSpacing(): number {
    return this.designSystems.reduce((total, system) => total + system.tokens.spacing.length, 0);
  }
  
  get lastSyncDays(): number {
    if (this.designSystems.length === 0) return 0;
    
    const latestSync = Math.max(...this.designSystems.map(system => system.lastSync.getTime()));
    const daysSince = Math.floor((Date.now() - latestSync) / (1000 * 60 * 60 * 24));
    return daysSince;
  }

  constructor(
    private designSystemService: DesignSystemService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDesignSystems();
  }

  loadDesignSystems(): void {
    this.designSystemService.getDesignSystems().subscribe(systems => {
      this.designSystems = systems;
    });
  }

  exportStatistics(): void {
    const statsData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalDesignSystems: this.totalDesignSystems,
        totalComponents: this.totalComponents,
        totalColors: this.totalColors,
        totalTypography: this.totalTypography,
        totalSpacing: this.totalSpacing,
        lastSyncDays: this.lastSyncDays
      },
      designSystems: this.designSystems.map(system => ({
        name: system.name,
        fileId: system.figmaFileId,
        components: system.components.length,
        colors: system.tokens.colors.length,
        typography: system.tokens.typography.length,
        spacing: system.tokens.spacing.length,
        lastSync: system.lastSync,
        language: system.language
      }))
    };

    const dataStr = JSON.stringify(statsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `design-system-statistics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showSuccess('Statistics report exported successfully!');
  }

  generateReport(): void {
    let reportContent = `# Design System Statistics Report\n`;
    reportContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    reportContent += `## Summary\n`;
    reportContent += `- Total Design Systems: ${this.totalDesignSystems}\n`;
    reportContent += `- Total Components: ${this.totalComponents}\n`;
    reportContent += `- Total Color Tokens: ${this.totalColors}\n`;
    reportContent += `- Total Typography Tokens: ${this.totalTypography}\n`;
    reportContent += `- Total Spacing Tokens: ${this.totalSpacing}\n`;
    reportContent += `- Days Since Last Sync: ${this.lastSyncDays}\n\n`;
    
    reportContent += `## Design Systems Details\n\n`;
    
    this.designSystems.forEach((system, index) => {
      reportContent += `### ${index + 1}. ${system.name}\n`;
      reportContent += `- File ID: ${system.figmaFileId}\n`;
      reportContent += `- Components: ${system.components.length}\n`;
      reportContent += `- Colors: ${system.tokens.colors.length}\n`;
      reportContent += `- Typography: ${system.tokens.typography.length}\n`;
      reportContent += `- Spacing: ${system.tokens.spacing.length}\n`;
      reportContent += `- Language: ${system.language.toUpperCase()}\n`;
      reportContent += `- Last Sync: ${system.lastSync.toLocaleDateString()}\n\n`;
    });

    const dataBlob = new Blob([reportContent], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `design-system-report-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showSuccess('Detailed report generated successfully!');
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}