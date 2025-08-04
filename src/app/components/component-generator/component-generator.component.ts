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
          
          <!-- Grouped Components -->
          <div class="component-groups">
            <div *ngFor="let groupName of getGroupKeys()" class="component-group">
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

    .current-system-components {
      margin-top: 3rem;
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

    .component-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    /* Preview Modal Styles */
    .preview-modal {
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

    .preview-card {
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      width: 100%;
    }

    .preview-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .preview-frame {
      border: 2px solid #eee;
      border-radius: 8px;
      padding: 2rem;
      background: white;
      min-height: 300px;
    }

    .preview-content {
      width: 100%;
    }

    .preview-content h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-weight: 600;
    }

    .preview-content p {
      margin: 0 0 1.5rem 0;
      color: #666;
      line-height: 1.5;
    }

    .preview-actions {
      display: flex;
      gap: 1rem;
    }

    .preview-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .preview-btn.primary {
      background: #007bff;
      color: white;
    }

    .preview-btn.primary:hover {
      background: #0056b3;
    }

    .preview-btn.secondary {
      background: #6c757d;
      color: white;
    }

    .preview-btn.secondary:hover {
      background: #545b62;
    }

    .preview-info h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-weight: 600;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .info-label {
      font-weight: 500;
      color: #666;
    }

    .info-value {
      font-weight: 600;
      color: #333;
    }

    /* Details Modal Styles */
    .details-modal {
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

    .details-card {
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      width: 100%;
    }

    .details-content {
      padding: 1rem 0;
    }

    .detail-section {
      margin-bottom: 2rem;
    }

    .detail-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-weight: 600;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
    }

    .detail-value {
      font-weight: 600;
      color: #333;
    }

    .code-tabs {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .code-tabs button {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .code-tabs button.active {
      background: #007bff;
      color: white;
    }

    .code-tabs button:not(.active) {
      background: #f8f9fa;
      color: #666;
    }

    .properties-content,
    .usage-content {
      padding: 1rem 0;
    }

    .properties-content h4,
    .usage-content h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-weight: 600;
    }

    .properties-content p {
      margin: 0 0 1.5rem 0;
      color: #666;
    }

    .properties-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .property-item {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .property-name {
      font-weight: 600;
      color: #333;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .property-type {
      font-size: 0.8rem;
      color: #666;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .property-description {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .usage-example {
      margin-bottom: 2rem;
    }

    .usage-example h5 {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-weight: 600;
    }

    .usage-example pre {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      margin: 0;
    }

    .usage-example code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    /* Progress Bar Styles */
    .generation-progress {
      margin-bottom: 2rem;
    }

    .progress-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .progress-header h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .progress-header p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
    }

    .progress-bar-container {
      margin-top: 1rem;
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .single-progress {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .single-progress .progress-text {
      margin-top: 0.5rem;
      font-size: 0.85rem;
    }

    /* Component Grouping Styles */
    .component-groups {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .component-group {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e9ecef;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #dee2e6;
    }

    .group-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      color: #007bff;
    }

    .group-header h4 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      flex-grow: 1;
    }

    .group-count {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
      background: #e9ecef;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
    }

    .component-group .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .component-group .component-card {
      background: white;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;
    }

    .component-group .component-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .component-group .component-card mat-card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }

    .component-group .component-card mat-card-subtitle {
      font-size: 0.85rem;
      color: #666;
    }

    .component-info p {
      margin: 0.25rem 0;
      font-size: 0.85rem;
    }

    .component-info p strong {
      color: #333;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .preview-container {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .code-tabs {
        flex-wrap: wrap;
      }

      .preview-modal,
      .details-modal {
        padding: 1rem;
      }

      .progress-text {
        flex-direction: column;
        gap: 0.25rem;
        text-align: center;
      }

      .component-group {
        padding: 1rem;
      }

      .group-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .group-header h4 {
        font-size: 1.1rem;
      }

      .component-group .components-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ComponentGeneratorComponent implements OnInit {
  designSystems: DesignSystem[] = [];
  generatedComponents: GeneratedComponent[] = [];
  currentDesignSystem: DesignSystem | null = null;
  groupedComponents: { [key: string]: any[] } = {};
  previewComponent: any = null;
  selectedComponent: any = null;
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