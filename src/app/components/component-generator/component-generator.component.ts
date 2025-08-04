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
          
          <!-- Bulk Generation Progress -->
          <div *ngIf="isGeneratingAll" class="generation-progress">
            <mat-card class="progress-card">
              <mat-card-content>
                <div class="progress-header">
                  <h4>Generating Components</h4>
                  <p>{{ currentGeneratingComponent || 'Preparing...' }}</p>
                </div>
                
                <div class="progress-bar-container">
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="generationProgress"
                    color="primary">
                  </mat-progress-bar>
                  <div class="progress-text">
                    <span>{{ generationProgress }}%</span>
                    <span>{{ generatedComponents.length }} / {{ totalComponentsToGenerate }} components</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
          
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
                        [disabled]="isGeneratingAll || isGeneratingSingle">
                  <mat-icon *ngIf="!isGeneratingAll">code</mat-icon>
                  <mat-spinner *ngIf="isGeneratingAll" diameter="20"></mat-spinner>
                  {{ isGeneratingAll ? 'Generating...' : 'Generate Components' }}
                </button>
                <button mat-button 
                        color="accent" 
                        (click)="viewComponents(system)"
                        [disabled]="isGeneratingAll || isGeneratingSingle">
                  <mat-icon>visibility</mat-icon>
                  View Components
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Current Design System Components -->
        <div *ngIf="currentDesignSystem" class="current-system-components">
          <div class="components-header">
            <h3>{{ currentDesignSystem.name }} - Components ({{ getComponentCount() }} in {{ getGroupCount() }} groups)</h3>
            <div class="header-actions">
              <button mat-raised-button color="primary" (click)="generateComponents(currentDesignSystem)">
                <mat-icon>code</mat-icon>
                Generate All Components
              </button>
              <button mat-button (click)="currentDesignSystem = null">
                <mat-icon>close</mat-icon>
                Close
              </button>
            </div>
          </div>
          
          <!-- Group Navigation Tags -->
          <div class="group-navigation">
            <div class="nav-header">
              <h4>Navigate Groups</h4>
              <button mat-button color="primary" (click)="clearGroupSelection()">
                <mat-icon>clear_all</mat-icon>
                Show All
              </button>
            </div>
            <div class="group-tags">
              <button mat-chip 
                      *ngFor="let groupName of getGroupKeys()" 
                      [class.selected]="isGroupSelected(groupName)"
                      (click)="selectGroup(groupName)"
                      class="group-tag">
                <mat-icon class="tag-icon">{{ getGroupIcon(groupName) }}</mat-icon>
                {{ groupName }}
                <span class="tag-count">({{ groupedComponents[groupName].length }})</span>
              </button>
            </div>
          </div>

          <!-- Grouped Components -->
          <div class="component-groups">
            <div *ngFor="let groupName of getGroupKeys()" 
                 [id]="'group-' + groupName"
                 class="component-group"
                 [class.highlighted]="isGroupSelected(groupName)">
              <div class="group-header">
                <mat-icon class="group-icon">{{ getGroupIcon(groupName) }}</mat-icon>
                <h4>{{ groupName }}</h4>
                <span class="group-count">({{ groupedComponents[groupName].length }} components)</span>
              </div>
              
              <div class="components-grid">
                <mat-card *ngFor="let component of groupedComponents[groupName]" class="component-card">
                  <mat-card-header>
                    <mat-card-title>{{ getComponentDisplayName(component.name) }}</mat-card-title>
                    <mat-card-subtitle>{{ component.category }}</mat-card-subtitle>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <div class="component-info">
                      <p><strong>ID:</strong> {{ component.id }}</p>
                      <p><strong>Figma Node:</strong> {{ component.figmaNodeId }}</p>
                      <p><strong>Category:</strong> {{ component.category }}</p>
                      <p><strong>Full Name:</strong> {{ component.name }}</p>
                    </div>
                  </mat-card-content>
                  
                  <mat-card-actions>
                    <button mat-button 
                            color="primary" 
                            (click)="generateSingleComponent(component)"
                            [disabled]="isGeneratingAll || isGeneratingSingle">
                      <mat-icon *ngIf="!isGeneratingSingle">code</mat-icon>
                      <mat-spinner *ngIf="isGeneratingSingle" diameter="16"></mat-spinner>
                      {{ isGeneratingSingle ? 'Generating...' : 'Generate Component' }}
                    </button>
                    <button mat-button 
                            color="accent" 
                            (click)="viewComponentDetails(component)"
                            [disabled]="isGeneratingAll || isGeneratingSingle">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-button 
                            color="warn" 
                            (click)="showComponentPreview(component)"
                            [disabled]="isGeneratingAll || isGeneratingSingle">
                      <mat-icon>preview</mat-icon>
                      Preview
                    </button>
                  </mat-card-actions>
                  
                  <!-- Single Component Generation Progress -->
                  <div *ngIf="isGeneratingSingle && currentGeneratingComponent === component.name" class="single-progress">
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="generationProgress"
                      color="accent">
                    </mat-progress-bar>
                    <div class="progress-text">
                      <span>{{ generationProgress }}%</span>
                      <span>Generating {{ component.name }}</span>
                    </div>
                  </div>
                </mat-card>
              </div>
            </div>
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

      <!-- Component Preview Modal -->
      <div *ngIf="previewComponent" class="preview-modal">
        <mat-card class="preview-card">
          <mat-card-header>
            <mat-card-title>{{ previewComponent.name }} - Preview</mat-card-title>
            <button mat-icon-button (click)="closePreview()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          
          <mat-card-content>
            <div class="preview-container">
              <div class="preview-frame">
                <div class="preview-content" [innerHTML]="getComponentPreview(previewComponent)"></div>
              </div>
              
              <div class="preview-info">
                <h4>Component Information</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">{{ previewComponent.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Category:</span>
                    <span class="info-value">{{ previewComponent.category }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">ID:</span>
                    <span class="info-value">{{ previewComponent.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Figma Node:</span>
                    <span class="info-value">{{ previewComponent.figmaNodeId }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="generateSingleComponent(previewComponent)">
              <mat-icon>code</mat-icon>
              Generate Component
            </button>
            <button mat-button (click)="closePreview()">
              <mat-icon>close</mat-icon>
              Close
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Component Details Modal -->
      <div *ngIf="selectedComponent" class="details-modal">
        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>{{ selectedComponent.name }} - Details</mat-card-title>
            <button mat-icon-button (click)="closeDetails()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          
          <mat-card-content>
            <mat-tab-group>
              <!-- Component Info Tab -->
              <mat-tab label="Information">
                <div class="details-content">
                  <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">{{ selectedComponent.name }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">{{ selectedComponent.category }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">ID:</span>
                        <span class="detail-value">{{ selectedComponent.id }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Figma Node ID:</span>
                        <span class="detail-value">{{ selectedComponent.figmaNodeId }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="detail-section">
                    <h4>Generated Code</h4>
                    <div class="code-tabs">
                      <button mat-button 
                              [class.active]="detailActiveTab === 'html'"
                              (click)="setDetailActiveTab('html')">
                        HTML
                      </button>
                      <button mat-button 
                              [class.active]="detailActiveTab === 'scss'"
                              (click)="setDetailActiveTab('scss')">
                        SCSS
                      </button>
                      <button mat-button 
                              [class.active]="detailActiveTab === 'ts'"
                              (click)="setDetailActiveTab('ts')">
                        TypeScript
                      </button>
                    </div>
                    
                    <div class="code-preview">
                      <pre><code>{{ getComponentCode(selectedComponent, detailActiveTab) }}</code></pre>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <!-- Properties Tab -->
              <mat-tab label="Properties">
                <div class="properties-content">
                  <h4>Component Properties</h4>
                  <p>This component can be customized with the following properties:</p>
                  
                  <div class="properties-list">
                    <div class="property-item">
                      <div class="property-header">
                        <span class="property-name">&#64;Input() data</span>
                        <span class="property-type">any</span>
                      </div>
                      <p class="property-description">Data object to be passed to the component</p>
                    </div>
                    
                    <div class="property-item">
                      <div class="property-header">
                        <span class="property-name">&#64;Output() action</span>
                        <span class="property-type">EventEmitter&lt;any&gt;</span>
                      </div>
                      <p class="property-description">Event emitter for component actions</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <!-- Usage Tab -->
              <mat-tab label="Usage">
                <div class="usage-content">
                  <h4>How to Use</h4>
                  
                  <div class="usage-example">
                    <h5>Basic Usage</h5>
                    <pre><code>&lt;app-{{ selectedComponent.name.toLowerCase() }}&gt;&lt;/app-{{ selectedComponent.name.toLowerCase() }}&gt;</code></pre>
                  </div>
                  
                  <div class="usage-example">
                    <h5>With Data</h5>
                    <pre><code>&lt;app-{{ selectedComponent.name.toLowerCase() }} 
  [data]="componentData"
  (action)="handleAction($event)"&gt;
&lt;/app-{{ selectedComponent.name.toLowerCase() }}&gt;</code></pre>
                  </div>
                  
                  <div class="usage-example">
                    <h5>In Module</h5>
                    <pre><code>import {{ '{' }} {{ selectedComponent.name }}Component {{ '}' }} from './{{ selectedComponent.name.toLowerCase() }}.component';

&#64;NgModule({{ '{' }}
  declarations: [{{ selectedComponent.name }}Component],
  exports: [{{ selectedComponent.name }}Component]
{{ '}' }})
export class {{ selectedComponent.name }}Module {{ '{' }} {{ '}' }}</code></pre>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="generateSingleComponent(selectedComponent)">
              <mat-icon>code</mat-icon>
              Generate Component
            </button>
            <button mat-button color="accent" (click)="copyComponentCode(selectedComponent)">
              <mat-icon>content_copy</mat-icon>
              Copy Code
            </button>
            <button mat-button (click)="closeDetails()">
              <mat-icon>close</mat-icon>
              Close
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./component-generator.component.scss']
})
export class ComponentGeneratorComponent implements OnInit {
  designSystems: DesignSystem[] = [];
  generatedComponents: GeneratedComponent[] = [];
  currentDesignSystem: DesignSystem | null = null;
  groupedComponents: { [key: string]: any[] } = {};
  previewComponent: any = null;
  selectedComponent: any = null;
  selectedGroup: string | null = null;
  isGenerating = false;
  isGeneratingSingle = false;
  isGeneratingAll = false;
  generationProgress = 0;
  currentGeneratingComponent = '';
  totalComponentsToGenerate = 0;
  activeTab = 'html';
  detailActiveTab = 'html';

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

    this.isGeneratingAll = true;
    this.generationProgress = 0;
    this.totalComponentsToGenerate = designSystem.components.length;
    this.currentGeneratingComponent = '';
    this.generatedComponents = [];
    
    this.showInfo(`Generating ${designSystem.components.length} components for ${designSystem.name}...`);

    try {
      // Subscribe to progress updates
      this.componentGeneratorService.getProgress().subscribe(progress => {
        this.generationProgress = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
        this.currentGeneratingComponent = progress.currentComponent;
      });

      this.generatedComponents = await this.componentGeneratorService.generateComponents(designSystem);
      this.showSuccess(`Successfully generated ${this.generatedComponents.length} components!`);
    } catch (error: any) {
      console.error('Component generation failed:', error);
      this.showError('Failed to generate components. Please try again.');
    } finally {
      this.resetGenerationState();
    }
  }

  viewComponents(designSystem: DesignSystem): void {
    // Set the current design system and show its components
    this.currentDesignSystem = designSystem;
    this.groupComponents(designSystem.components);
    this.showInfo(`Viewing components for ${designSystem.name}`);
  }

  groupComponents(components: any[]): void {
    this.groupedComponents = {};
    
    components.forEach(component => {
      const rootCategory = this.getRootCategory(component.name);
      if (!this.groupedComponents[rootCategory]) {
        this.groupedComponents[rootCategory] = [];
      }
      this.groupedComponents[rootCategory].push(component);
    });
  }

  getRootCategory(componentName: string): string {
    // Split by '/' and get the first part, or use the full name if no '/'
    const parts = componentName.split('/');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }

  getComponentCount(): number {
    if (!this.currentDesignSystem) return 0;
    return this.currentDesignSystem.components.length;
  }

  getGroupCount(): number {
    return Object.keys(this.groupedComponents).length;
  }

  getGroupKeys(): string[] {
    return Object.keys(this.groupedComponents).sort();
  }

  getComponentDisplayName(fullName: string): string {
    const parts = fullName.split('/');
    return parts.length > 1 ? parts.slice(1).join('/') : fullName;
  }

  getGroupIcon(groupName: string): string {
    const iconMap: { [key: string]: string } = {
      'Icons': 'star',
      'Buttons': 'smart_button',
      'Cards': 'credit_card',
      'Forms': 'input',
      'Navigation': 'navigation',
      'Layout': 'view_quilt',
      'Typography': 'text_fields',
      'Colors': 'palette',
      'Spacing': 'space_bar',
      'Components': 'extension',
      'Elements': 'widgets',
      'Widgets': 'dashboard',
      'Modules': 'apps',
      'Sections': 'view_column',
      'Pages': 'pages',
      'Templates': 'template',
      'Blocks': 'view_module',
      'Atoms': 'radio_button_unchecked',
      'Molecules': 'scatter_plot',
      'Organisms': 'account_tree'
    };
    
    return iconMap[groupName] || 'extension';
  }

  selectGroup(groupName: string): void {
    this.selectedGroup = groupName;
    this.scrollToGroup(groupName);
  }

  scrollToGroup(groupName: string): void {
    setTimeout(() => {
      const element = document.getElementById(`group-${groupName}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  }

  isGroupSelected(groupName: string): boolean {
    return this.selectedGroup === groupName;
  }

  clearGroupSelection(): void {
    this.selectedGroup = null;
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

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
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

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
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

  async generateSingleComponent(component: any): Promise<void> {
    this.isGeneratingSingle = true;
    this.currentGeneratingComponent = component.name;
    this.generationProgress = 0;
    
    try {
      // Simulate progress for single component
      const progressInterval = setInterval(() => {
        if (this.generationProgress < 90) {
          this.generationProgress += 10;
        }
      }, 100);

      const generatedComponent = await this.componentGeneratorService.generateSingleComponent(component);
      this.generatedComponents.push(generatedComponent);
      this.showSuccess(`Generated component: ${component.name}`);
      
      clearInterval(progressInterval);
      this.generationProgress = 100;
      
      // Reset after a short delay to show completion
      setTimeout(() => {
        this.resetSingleGenerationState();
      }, 500);
    } catch (error) {
      this.showError(`Failed to generate component: ${component.name}`);
      this.resetSingleGenerationState();
    }
  }

  showComponentPreview(component: any): void {
    this.previewComponent = component;
  }

  closePreview(): void {
    this.previewComponent = null;
  }

  viewComponentDetails(component: any): void {
    this.selectedComponent = component;
  }

  closeDetails(): void {
    this.selectedComponent = null;
  }

  setDetailActiveTab(tab: string): void {
    this.detailActiveTab = tab;
  }

  getComponentPreview(component: any): string {
    // Generate a preview HTML for the component
    return `
      <div class="${component.name.toLowerCase()}-container">
        <div class="${component.name.toLowerCase()}-content">
          <div class="component-wrapper">
            <h3>${component.name}</h3>
            <p>This is a preview of the ${component.name} component.</p>
            <div class="preview-actions">
              <button class="preview-btn primary">Primary Action</button>
              <button class="preview-btn secondary">Secondary Action</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  copyComponentCode(component: any): void {
    const code = this.getComponentCode(component, this.detailActiveTab);
    navigator.clipboard.writeText(code).then(() => {
      this.showSuccess(`${this.detailActiveTab.toUpperCase()} code copied to clipboard!`);
    }).catch(() => {
      this.showError('Failed to copy to clipboard.');
    });
  }

  private resetGenerationState(): void {
    this.isGeneratingAll = false;
    this.generationProgress = 0;
    this.currentGeneratingComponent = '';
    this.totalComponentsToGenerate = 0;
  }

  private resetSingleGenerationState(): void {
    this.isGeneratingSingle = false;
    this.generationProgress = 0;
    this.currentGeneratingComponent = '';
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