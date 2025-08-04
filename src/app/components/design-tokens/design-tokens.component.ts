import { Component, OnInit } from '@angular/core';
import { DesignSystemService, DesignSystem } from '../../services/design-system.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-design-tokens',
  template: `
    <div class="design-tokens">
      <div class="tokens-header">
        <mat-icon class="header-icon">palette</mat-icon>
        <h2>Design Tokens</h2>
        <p>Manage colors, typography, spacing, and other design tokens</p>
      </div>
      
      <div class="tokens-content">
        <!-- Design Systems with Tokens -->
        <div *ngIf="designSystems.length > 0" class="design-systems">
          <h3>Design Systems with Tokens ({{ designSystems.length }})</h3>
          
          <div class="systems-grid">
            <mat-card *ngFor="let system of designSystems" class="system-card">
              <mat-card-header>
                <mat-card-title>{{ system.name }}</mat-card-title>
                <mat-card-subtitle>File ID: {{ system.figmaFileId }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="tokens-overview">
                  <div class="token-category">
                    <h4>Colors ({{ system.tokens.colors.length }})</h4>
                    <div class="color-tokens">
                      <div *ngFor="let color of system.tokens.colors.slice(0, 6)" 
                           class="color-token" 
                           [style.background-color]="color.value"
                           [title]="color.name + ': ' + color.value">
                        <span class="color-name">{{ color.name }}</span>
                      </div>
                      <div *ngIf="system.tokens.colors.length > 6" class="more-colors">
                        +{{ system.tokens.colors.length - 6 }} more
                      </div>
                    </div>
                  </div>
                  
                  <div class="token-category">
                    <h4>Typography ({{ system.tokens.typography.length }})</h4>
                    <div class="typography-tokens">
                      <div *ngFor="let typo of system.tokens.typography.slice(0, 3)" class="typography-token">
                        <span class="typo-name">{{ typo.name }}</span>
                        <span class="typo-details">{{ typo.fontSize }} {{ typo.fontWeight }}</span>
                      </div>
                      <div *ngIf="system.tokens.typography.length > 3" class="more-typography">
                        +{{ system.tokens.typography.length - 3 }} more
                      </div>
                    </div>
                  </div>
                  
                  <div class="token-category">
                    <h4>Spacing ({{ system.tokens.spacing.length }})</h4>
                    <div class="spacing-tokens">
                      <div *ngFor="let space of system.tokens.spacing.slice(0, 3)" class="spacing-token">
                        <span class="space-name">{{ space.name }}</span>
                        <span class="space-value">{{ space.value }}</span>
                      </div>
                      <div *ngIf="system.tokens.spacing.length > 3" class="more-spacing">
                        +{{ system.tokens.spacing.length - 3 }} more
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="viewAllTokens(system)">
                  <mat-icon>visibility</mat-icon>
                  View All Tokens
                </button>
                <button mat-raised-button color="accent" (click)="exportTokens(system)">
                  <mat-icon>download</mat-icon>
                  Export Tokens
                </button>
                <button mat-button (click)="generateSCSS(system)">
                  <mat-icon>code</mat-icon>
                  Generate SCSS
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Token Details Modal -->
        <div *ngIf="selectedSystem" class="token-details-modal">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ selectedSystem.name }} - All Tokens</mat-card-title>
              <button mat-icon-button (click)="closeTokenDetails()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-card-header>
            
            <mat-card-content>
              <mat-tab-group>
                <!-- Colors Tab -->
                <mat-tab label="Colors">
                  <div class="tokens-grid">
                    <div *ngFor="let color of selectedSystem.tokens.colors" class="token-item">
                      <div class="color-preview" [style.background-color]="color.value"></div>
                      <div class="token-info">
                        <h4>{{ color.name }}</h4>
                        <p>{{ color.value }}</p>
                        <span class="category">{{ color.category }}</span>
                      </div>
                      <button mat-icon-button (click)="copyToClipboard(color.value)">
                        <mat-icon>content_copy</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-tab>
                
                <!-- Typography Tab -->
                <mat-tab label="Typography">
                  <div class="tokens-grid">
                    <div *ngFor="let typo of selectedSystem.tokens.typography" class="token-item">
                      <div class="typography-preview" [style.font-family]="typo.fontFamily" [style.font-size]="typo.fontSize" [style.font-weight]="typo.fontWeight">
                        {{ typo.name }}
                      </div>
                      <div class="token-info">
                        <h4>{{ typo.name }}</h4>
                        <p>{{ typo.fontFamily }} {{ typo.fontSize }} {{ typo.fontWeight }}</p>
                        <span class="line-height">Line height: {{ typo.lineHeight }}</span>
                      </div>
                      <button mat-icon-button (click)="copyToClipboard(typo.fontFamily + ' ' + typo.fontSize)">
                        <mat-icon>content_copy</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-tab>
                
                <!-- Spacing Tab -->
                <mat-tab label="Spacing">
                  <div class="tokens-grid">
                    <div *ngFor="let space of selectedSystem.tokens.spacing" class="token-item">
                      <div class="spacing-preview" [style.width]="space.value" [style.height]="space.value"></div>
                      <div class="token-info">
                        <h4>{{ space.name }}</h4>
                        <p>{{ space.value }}</p>
                      </div>
                      <button mat-icon-button (click)="copyToClipboard(space.value)">
                        <mat-icon>content_copy</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="designSystems.length === 0" class="empty-state">
          <mat-icon class="empty-icon">color_lens</mat-icon>
          <h3>No Design Tokens Available</h3>
          <p>Please connect to Figma first to extract design tokens from your design system.</p>
          <button mat-raised-button color="primary" routerLink="/figma-connection">
            <mat-icon>link</mat-icon>
            Connect to Figma
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .design-tokens {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tokens-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }

    .design-tokens h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .design-tokens p {
      color: #666;
      margin-bottom: 2rem;
    }

    .tokens-content {
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

    .design-systems {
      margin-bottom: 2rem;
    }

    .design-systems h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .systems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .system-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .system-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .tokens-overview {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .token-category h4 {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-weight: 600;
      font-size: 1rem;
    }

    .color-tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .color-token {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .color-token:hover {
      transform: scale(1.05);
    }

    .color-name {
      font-size: 0.7rem;
      font-weight: 600;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      text-align: center;
      line-height: 1.2;
    }

    .more-colors {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .typography-tokens {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .typography-token {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .typo-name {
      font-weight: 500;
      color: #333;
    }

    .typo-details {
      font-size: 0.8rem;
      color: #666;
    }

    .more-typography {
      text-align: center;
      padding: 0.5rem;
      font-size: 0.8rem;
      color: #666;
    }

    .spacing-tokens {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .spacing-token {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .space-name {
      font-weight: 500;
      color: #333;
    }

    .space-value {
      font-size: 0.8rem;
      color: #666;
    }

    .more-spacing {
      text-align: center;
      padding: 0.5rem;
      font-size: 0.8rem;
      color: #666;
    }

    .system-card mat-card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
    }

    .system-card mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .token-details-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .token-details-modal mat-card {
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      width: 100%;
    }

    .token-details-modal mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .token-details-modal mat-card-content {
      padding: 1.5rem;
    }

    .tokens-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .token-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      transition: background 0.2s ease;
    }

    .token-item:hover {
      background: #e9ecef;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .typography-preview {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .spacing-preview {
      background: #007bff;
      border-radius: 4px;
      min-width: 20px;
    }

    .token-info {
      flex: 1;
    }

    .token-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }

    .token-info p {
      margin: 0 0 0.25rem 0;
      font-size: 0.8rem;
      color: #666;
    }

    .token-info .category,
    .token-info .line-height {
      font-size: 0.7rem;
      color: #999;
    }

    @media (max-width: 768px) {
      .systems-grid {
        grid-template-columns: 1fr;
      }

      .system-card mat-card-actions {
        flex-direction: column;
      }

      .token-details-modal {
        padding: 1rem;
      }

      .tokens-grid {
        grid-template-columns: 1fr;
      }

      .token-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class DesignTokensComponent implements OnInit {
  designSystems: DesignSystem[] = [];
  selectedSystem: DesignSystem | null = null;

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

  viewAllTokens(system: DesignSystem): void {
    this.selectedSystem = system;
  }

  closeTokenDetails(): void {
    this.selectedSystem = null;
  }

  exportTokens(system: DesignSystem): void {
    const tokensData = {
      name: system.name,
      colors: system.tokens.colors,
      typography: system.tokens.typography,
      spacing: system.tokens.spacing,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(tokensData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${system.name.toLowerCase().replace(/\s+/g, '-')}-tokens.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showSuccess('Design tokens exported successfully!');
  }

  generateSCSS(system: DesignSystem): void {
    let scssContent = `// Design Tokens for ${system.name}\n`;
    scssContent += `// Generated on ${new Date().toLocaleDateString()}\n\n`;
    
    // Colors
    scssContent += `// Colors\n`;
    system.tokens.colors.forEach(color => {
      scssContent += `$${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.value};\n`;
    });
    scssContent += `\n`;
    
    // Typography
    scssContent += `// Typography\n`;
    system.tokens.typography.forEach(typo => {
      scssContent += `$${typo.name.toLowerCase().replace(/\s+/g, '-')}-font-family: ${typo.fontFamily};\n`;
      scssContent += `$${typo.name.toLowerCase().replace(/\s+/g, '-')}-font-size: ${typo.fontSize};\n`;
      scssContent += `$${typo.name.toLowerCase().replace(/\s+/g, '-')}-font-weight: ${typo.fontWeight};\n`;
      scssContent += `$${typo.name.toLowerCase().replace(/\s+/g, '-')}-line-height: ${typo.lineHeight};\n\n`;
    });
    
    // Spacing
    scssContent += `// Spacing\n`;
    system.tokens.spacing.forEach(space => {
      scssContent += `$${space.name.toLowerCase().replace(/\s+/g, '-')}: ${space.value};\n`;
    });

    const dataBlob = new Blob([scssContent], { type: 'text/scss' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${system.name.toLowerCase().replace(/\s+/g, '-')}-tokens.scss`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showSuccess('SCSS tokens generated successfully!');
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess('Copied to clipboard!');
    }).catch(() => {
      this.showError('Failed to copy to clipboard.');
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}