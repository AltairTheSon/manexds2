import { Component, OnInit } from '@angular/core';
import { DesignSystemService, DesignSystem, DesignComponent } from '../../services/design-system.service';
import { ComponentGeneratorService, GeneratedComponent } from '../../services/component-generator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-component-generator',
  template: `
    <div class="component-generator">
      <div class="generator-header">
        <mat-icon class="header-icon">extension</mat-icon>
        <h2>Component Generator</h2>
        <p>Generate Angular components from your design system</p>
      </div>
      
      <div class="generator-content">
        <!-- Design Systems List -->
        <div *ngIf="designSystems.length > 0" class="design-systems">
          <h3>Design Systems ({{ designSystems.length }})</h3>
          
          <div class="systems-grid">
            <mat-card *ngFor="let system of designSystems" class="system-card">
              <mat-card-header>
                <mat-card-title>{{ system.name }}</mat-card-title>
                <mat-card-subtitle>File ID: {{ system.figmaFileId }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="system-stats">
                  <div class="stat">
                    <span class="stat-label">Components:</span>
                    <span class="stat-value">{{ system.components.length }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Colors:</span>
                    <span class="stat-value">{{ system.tokens.colors.length }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Typography:</span>
                    <span class="stat-value">{{ system.tokens.typography.length }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Last Sync:</span>
                    <span class="stat-value">{{ system.lastSync | date:'short' }}</span>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button 
                        color="primary" 
                        (click)="generateComponents(system)"
                        [disabled]="isGenerating">
                  <mat-icon *ngIf="!isGenerating">code</mat-icon>
                  <mat-spinner *ngIf="isGenerating" diameter="20"></mat-spinner>
                  {{ isGenerating ? 'Generating...' : 'Generate Components' }}
                </button>
                <button mat-button 
                        color="accent" 
                        (click)="viewComponents(system)">
                  <mat-icon>visibility</mat-icon>
                  View Components
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Generated Components -->
        <div *ngIf="generatedComponents.length > 0" class="generated-components">
          <div class="components-header">
            <h3>Generated Components ({{ generatedComponents.length }})</h3>
            <div class="header-actions">
              <button mat-raised-button color="primary" (click)="downloadAllComponents()">
                <mat-icon>download</mat-icon>
                Download All
              </button>
              <button mat-button (click)="clearGeneratedComponents()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </div>
          
          <div class="components-grid">
            <mat-card *ngFor="let component of generatedComponents" class="component-card">
              <mat-card-header>
                <mat-card-title>{{ component.name }}</mat-card-title>
                <mat-card-subtitle>{{ component.category }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="component-preview">
                  <div class="preview-header">
                    <span>Preview:</span>
                    <div class="preview-tabs">
                      <button mat-button 
                              [class.active]="activeTab === 'html'"
                              (click)="setActiveTab('html')">
                        HTML
                      </button>
                      <button mat-button 
                              [class.active]="activeTab === 'scss'"
                              (click)="setActiveTab('scss')">
                        SCSS
                      </button>
                      <button mat-button 
                              [class.active]="activeTab === 'ts'"
                              (click)="setActiveTab('ts')">
                        TypeScript
                      </button>
                    </div>
                  </div>
                  
                  <div class="code-preview">
                    <pre><code>{{ getComponentCode(component, activeTab) }}</code></pre>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button color="primary" (click)="downloadComponent(component)">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
                <button mat-button color="accent" (click)="copyToClipboard(component, activeTab)">
                  <mat-icon>content_copy</mat-icon>
                  Copy {{ activeTab.toUpperCase() }}
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="designSystems.length === 0" class="empty-state">
          <mat-icon class="empty-icon">inbox</mat-icon>
          <h3>No Design Systems Available</h3>
          <p>Please connect to Figma first to extract components from your design system.</p>
          <button mat-raised-button color="primary" routerLink="/figma-connection">
            <mat-icon>link</mat-icon>
            Connect to Figma
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .component-generator {
      max-width: 1200px;
      margin: 0 auto;
    }

    .generator-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }

    .component-generator h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .component-generator p {
      color: #666;
      margin-bottom: 2rem;
    }

    .generator-content {
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
      margin-bottom: 3rem;
    }

    .design-systems h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .systems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .system-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .system-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .system-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .stat-label {
      font-weight: 500;
      color: #666;
    }

    .stat-value {
      font-weight: 600;
      color: #333;
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

    .generated-components {
      margin-top: 3rem;
    }

    .components-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .components-header h3 {
      color: #333;
      font-weight: 600;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .header-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .component-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .component-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .component-preview {
      margin-top: 1rem;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .preview-header span {
      font-weight: 500;
      color: #666;
    }

    .preview-tabs {
      display: flex;
      gap: 0.25rem;
    }

    .preview-tabs button {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .preview-tabs button.active {
      background: #007bff;
      color: white;
    }

    .preview-tabs button:not(.active) {
      background: #f8f9fa;
      color: #666;
    }

    .code-preview {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .code-preview pre {
      margin: 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.4;
      color: #333;
    }

    .component-card mat-card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
    }

    .component-card mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    @media (max-width: 768px) {
      .systems-grid,
      .components-grid {
        grid-template-columns: 1fr;
      }

      .components-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }

      .system-stats {
        grid-template-columns: 1fr;
      }

      .system-card mat-card-actions,
      .component-card mat-card-actions {
        flex-direction: column;
      }

      .preview-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .preview-tabs {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class ComponentGeneratorComponent implements OnInit {
  designSystems: DesignSystem[] = [];
  generatedComponents: GeneratedComponent[] = [];
  isGenerating = false;
  activeTab = 'html';

  constructor(
    private designSystemService: DesignSystemService,
    private componentGeneratorService: ComponentGeneratorService,
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

  async generateComponents(designSystem: DesignSystem): Promise<void> {
    if (designSystem.components.length === 0) {
      this.showError('No components found in this design system.');
      return;
    }

    this.isGenerating = true;
    this.showInfo(`Generating components for ${designSystem.name}...`);

    try {
      this.generatedComponents = await this.componentGeneratorService.generateComponents(designSystem);
      this.showSuccess(`Successfully generated ${this.generatedComponents.length} components!`);
    } catch (error: any) {
      console.error('Component generation failed:', error);
      this.showError('Failed to generate components. Please try again.');
    } finally {
      this.isGenerating = false;
    }
  }

  viewComponents(designSystem: DesignSystem): void {
    this.showInfo(`Viewing components for ${designSystem.name}`);
    // TODO: Navigate to component viewer or show modal
  }

  downloadAllComponents(): void {
    if (this.generatedComponents.length === 0) {
      this.showError('No components to download.');
      return;
    }

    const zip = new JSZip();
    
    this.generatedComponents.forEach(component => {
      const componentFolder = zip.folder(component.name);
      if (componentFolder) {
        componentFolder.file(`${component.name.toLowerCase()}.component.html`, component.html);
        componentFolder.file(`${component.name.toLowerCase()}.component.scss`, component.scss);
        componentFolder.file(`${component.name.toLowerCase()}.component.ts`, component.typescript);
      }
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'generated-components.zip';
      link.click();
      URL.revokeObjectURL(link.href);
      
      this.showSuccess('All components downloaded successfully!');
    });
  }

  downloadComponent(component: GeneratedComponent): void {
    const zip = new JSZip();
    const componentFolder = zip.folder(component.name);
    
    if (componentFolder) {
      componentFolder.file(`${component.name.toLowerCase()}.component.html`, component.html);
      componentFolder.file(`${component.name.toLowerCase()}.component.scss`, component.scss);
      componentFolder.file(`${component.name.toLowerCase()}.component.ts`, component.typescript);
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${component.name.toLowerCase()}-component.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      this.showSuccess(`${component.name} component downloaded successfully!`);
    });
  }

  copyToClipboard(component: GeneratedComponent, type: string): void {
    const code = this.getComponentCode(component, type);
    navigator.clipboard.writeText(code).then(() => {
      this.showSuccess(`${type.toUpperCase()} code copied to clipboard!`);
    }).catch(() => {
      this.showError('Failed to copy to clipboard.');
    });
  }

  getComponentCode(component: GeneratedComponent, type: string): string {
    switch (type) {
      case 'html':
        return component.html;
      case 'scss':
        return component.scss;
      case 'ts':
        return component.typescript;
      default:
        return component.html;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  clearGeneratedComponents(): void {
    this.generatedComponents = [];
    this.showInfo('Generated components cleared.');
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

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}