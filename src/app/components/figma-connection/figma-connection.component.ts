import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FigmaService } from '../../services/figma.service';
import { DesignSystemService } from '../../services/design-system.service';
import { ComponentGeneratorService, GenerationProgress } from '../../services/component-generator.service';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-figma-connection',
  template: `
    <div class="figma-connection">
      <div class="connection-header">
        <mat-icon class="header-icon">link</mat-icon>
        <h2>Figma Connection</h2>
        <p>Connect to your Figma files to extract design systems</p>
      </div>
      
      <form [formGroup]="connectionForm" (ngSubmit)="onSubmit()" class="connection-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Figma Access Token</mat-label>
          <input matInput 
                 type="password" 
                 formControlName="accessToken"
                 placeholder="Enter your Figma access token">
          <mat-icon matSuffix class="gradient-icon">vpn_key</mat-icon>
          <mat-hint>Get your access token from Figma Account Settings</mat-hint>
          <mat-error *ngIf="connectionForm.get('accessToken')?.hasError('required')">
            Access token is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Figma File IDs</mat-label>
          <textarea matInput 
                    formControlName="fileIds"
                    placeholder="Enter Figma file IDs (one per line)"></textarea>
          <mat-icon matSuffix class="gradient-icon">description</mat-icon>
          <mat-hint>You can add multiple file IDs</mat-hint>
          <mat-error *ngIf="connectionForm.get('fileIds')?.hasError('required')">
            At least one file ID is required
          </mat-error>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button 
                  color="primary" 
                  type="button"
                  [disabled]="isTesting || !connectionForm.get('accessToken')?.valid"
                  (click)="testConnection()">
            <mat-icon *ngIf="!isTesting">wifi_tethering</mat-icon>
            <mat-spinner *ngIf="isTesting" diameter="20"></mat-spinner>
            {{ isTesting ? 'Testing...' : 'Test Connection' }}
          </button>
          <button mat-raised-button 
                  color="accent" 
                  type="submit"
                  [disabled]="isExtracting || !connectionForm.valid">
            <mat-icon *ngIf="!isExtracting">download</mat-icon>
            <mat-spinner *ngIf="isExtracting" diameter="20"></mat-spinner>
            {{ isExtracting ? 'Extracting...' : 'Extract Design System' }}
          </button>
        </div>
      </form>

      <!-- Connection Status -->
      <div *ngIf="connectionStatus" class="connection-status">
        <mat-card [ngClass]="connectionStatus.type">
          <mat-card-content>
            <div class="status-content">
              <mat-icon>{{ connectionStatus.icon }}</mat-icon>
              <div class="status-text">
                <h4>{{ connectionStatus.title }}</h4>
                <p>{{ connectionStatus.message }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Extracted Files -->
      <div *ngIf="extractedFiles.length > 0" class="extracted-files">
        <h3>Extracted Files ({{ extractedFiles.length }})</h3>
        <div class="files-grid">
          <mat-card *ngFor="let file of extractedFiles" class="file-card">
            <mat-card-header>
              <mat-card-title>{{ file.name }}</mat-card-title>
              <mat-card-subtitle>File ID: {{ file.key || file.id }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Last modified:</strong> {{ file.lastModified | date:'medium' }}</p>
              <p><strong>Components:</strong> {{ getComponentCount(file) }}</p>
              <p><strong>Styles:</strong> {{ getStyleCount(file) }}</p>
              <p><strong>Version:</strong> {{ file.version }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="viewFileDetails(file)">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              <button mat-button 
                      color="accent" 
                      (click)="generateComponents(file)"
                      [disabled]="isGenerating">
                <mat-icon *ngIf="!isGenerating">code</mat-icon>
                <mat-spinner *ngIf="isGenerating" diameter="20"></mat-spinner>
                {{ isGenerating ? 'Generating...' : 'Generate Components' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Generation Progress -->
      <div *ngIf="generationProgress.status !== 'idle'" class="generation-progress">
        <mat-card>
          <mat-card-content>
            <div class="progress-header">
              <h4>Component Generation Progress</h4>
              <p>{{ generationProgress.message }}</p>
            </div>
            
            <div class="progress-bar-container">
              <mat-progress-bar 
                [value]="generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0"
                [color]="generationProgress.status === 'error' ? 'warn' : 'primary'">
              </mat-progress-bar>
              <div class="progress-text">
                <span>{{ generationProgress.current }} / {{ generationProgress.total }} components</span>
                <span *ngIf="generationProgress.currentComponent">- {{ generationProgress.currentComponent }}</span>
              </div>
            </div>

            <div class="progress-actions" *ngIf="generationProgress.status === 'completed'">
              <button mat-raised-button color="primary" (click)="downloadGeneratedComponents()">
                <mat-icon>download</mat-icon>
                Download Components
              </button>
              <button mat-button (click)="resetGenerationProgress()">
                <mat-icon>refresh</mat-icon>
                Generate Again
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .figma-connection {
      max-width: 800px;
      margin: 0 auto;
    }

    .connection-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }

    .figma-connection h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .figma-connection p {
      color: #666;
      margin-bottom: 2rem;
    }

    .connection-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .gradient-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-actions button mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .connection-status {
      margin-bottom: 2rem;
    }

    .connection-status mat-card {
      border-radius: 8px;
    }

    .connection-status.success {
      border-left: 4px solid #4caf50;
    }

    .connection-status.error {
      border-left: 4px solid #f44336;
    }

    .connection-status.info {
      border-left: 4px solid #2196f3;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-content mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .status-content.success mat-icon {
      color: #4caf50;
    }

    .status-content.error mat-icon {
      color: #f44336;
    }

    .status-content.info mat-icon {
      color: #2196f3;
    }

    .status-text h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .status-text p {
      margin: 0;
      color: #666;
    }

    .extracted-files {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .extracted-files h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .file-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .file-card mat-card-content p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .file-card mat-card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
    }

          .file-card mat-card-actions button {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .generation-progress {
        margin-top: 2rem;
      }

      .generation-progress mat-card {
        border-radius: 8px;
      }

      .progress-header {
        margin-bottom: 1.5rem;
      }

      .progress-header h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-weight: 600;
      }

      .progress-header p {
        margin: 0;
        color: #666;
      }

      .progress-bar-container {
        margin-bottom: 1.5rem;
      }

      .progress-text {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #666;
      }

      .progress-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .progress-actions button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      @media (max-width: 768px) {
        .form-actions {
          flex-direction: column;
        }

        .files-grid {
          grid-template-columns: 1fr;
        }

        .file-card mat-card-actions {
          flex-direction: column;
        }

        .progress-actions {
          flex-direction: column;
        }
      }
  `]
})
export class FigmaConnectionComponent implements OnInit {
  connectionForm: FormGroup;
  isTesting = false;
  isExtracting = false;
  isGenerating = false;
  connectionStatus: any = null;
  extractedFiles: any[] = [];
  generationProgress: GenerationProgress = {
    current: 0,
    total: 0,
    currentComponent: '',
    status: 'idle',
    message: ''
  };
  generatedComponents: any[] = [];

  constructor(
    private fb: FormBuilder,
    private figmaService: FigmaService,
    private designSystemService: DesignSystemService,
    private componentGeneratorService: ComponentGeneratorService,
    private snackBar: MatSnackBar
  ) {
    this.connectionForm = this.fb.group({
      accessToken: ['', Validators.required],
      fileIds: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('FigmaConnectionComponent initialized');
    this.loadExistingDesignSystems();
    this.subscribeToGenerationProgress();
  }

  private subscribeToGenerationProgress(): void {
    this.componentGeneratorService.getProgress().subscribe(progress => {
      this.generationProgress = progress;
      this.isGenerating = progress.status === 'generating';
    });
  }

  private loadExistingDesignSystems(): void {
    this.designSystemService.getDesignSystems().subscribe(designSystems => {
      // Convert design systems back to file format for display
      this.extractedFiles = designSystems.map(ds => ({
        id: ds.figmaFileId,
        name: ds.name,
        lastModified: ds.lastSync,
        version: '1.0',
        components: ds.components.reduce((acc, comp) => {
          acc[comp.id] = comp;
          return acc;
        }, {} as any),
        styles: ds.tokens
      }));
    });
  }

  async testConnection() {
    console.log('Test Connection button clicked!');
    
    if (!this.connectionForm.get('accessToken')?.valid) {
      this.showError('Please enter a valid access token');
      return;
    }

    this.isTesting = true;
    this.connectionStatus = null;

    try {
      const accessToken = this.connectionForm.get('accessToken')?.value;
      console.log('Testing connection with token:', accessToken ? 'Token provided' : 'No token');
      
      const response = await this.figmaService.testConnection(accessToken).toPromise();
      
      this.connectionStatus = {
        type: 'success',
        icon: 'check_circle',
        title: 'Connection Successful',
        message: `Connected to Figma as ${response.handle || response.email || 'User'}`
      };

      this.showSuccess('Figma connection test successful!');
    } catch (error: any) {
      console.error('Connection test failed:', error);
      
      this.connectionStatus = {
        type: 'error',
        icon: 'error',
        title: 'Connection Failed',
        message: error.error?.message || error.message || 'Failed to connect to Figma. Please check your access token.'
      };

      this.showError('Figma connection test failed. Please check your access token.');
    } finally {
      this.isTesting = false;
    }
  }

  async onSubmit() {
    console.log('Extract Design System button clicked!');
    
    if (!this.connectionForm.valid) {
      this.showError('Please fill in all required fields');
      return;
    }

    this.isExtracting = true;
    this.connectionStatus = null;

    try {
      const accessToken = this.connectionForm.get('accessToken')?.value;
      const fileIds = this.connectionForm.get('fileIds')?.value
        .split('\n')
        .map((id: string) => id.trim())
        .filter((id: string) => id.length > 0);

      console.log('Extracting files:', fileIds);

      const extractedFiles = [];
      let successCount = 0;
      let errorCount = 0;

      for (const fileId of fileIds) {
        try {
          console.log(`Processing file: ${fileId}`);
          const file = await this.figmaService.getFile(fileId, accessToken).toPromise();
          if (file) {
            // Check if design system already exists
            if (this.designSystemService.hasDesignSystem(file.id || file.key)) {
              console.log(`Design system already exists for file: ${file.name}`);
              // Update existing design system
              const existingDs = this.designSystemService.getDesignSystemByFileId(file.id || file.key);
              if (existingDs) {
                const updatedDs = this.designSystemService.extractDesignSystem(file, accessToken);
                updatedDs.id = existingDs.id; // Keep the same ID
                this.designSystemService.updateDesignSystem(existingDs.id, updatedDs);
              }
            } else {
              // Create new design system
              const designSystem = this.designSystemService.extractDesignSystem(file, accessToken);
              this.designSystemService.addDesignSystem(designSystem);
            }
            
            extractedFiles.push(file);
            successCount++;
            console.log(`Successfully extracted file: ${file.name}`);
          }
        } catch (error: any) {
          console.error(`Failed to extract file ${fileId}:`, error);
          errorCount++;
        }
      }

      // Reload all design systems to show updated data
      this.loadExistingDesignSystems();

      if (extractedFiles.length > 0) {
        this.connectionStatus = {
          type: 'success',
          icon: 'check_circle',
          title: 'Extraction Successful',
          message: `Successfully extracted ${successCount} file(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        };

        this.showSuccess(`Successfully extracted ${successCount} design system(s)!`);
      } else {
        this.connectionStatus = {
          type: 'error',
          icon: 'error',
          title: 'Extraction Failed',
          message: 'No files could be extracted. Please check your file IDs and access token.'
        };

        this.showError('Failed to extract any design systems. Please check your file IDs and access token.');
      }
    } catch (error: any) {
      console.error('Extraction failed:', error);
      
      this.connectionStatus = {
        type: 'error',
        icon: 'error',
        title: 'Extraction Failed',
        message: error.error?.message || error.message || 'Failed to extract design systems.'
      };

      this.showError('Failed to extract design systems. Please try again.');
    } finally {
      this.isExtracting = false;
    }
  }

  viewFileDetails(file: any) {
    console.log('View file details clicked for:', file.name);
    this.showInfo(`Viewing details for ${file.name}`);
    // TODO: Implement file details modal or navigation
  }

  async generateComponents(file: any) {
    console.log('Generate components clicked for:', file.name);
    
    try {
      // Get the design system for this file
      const designSystem = this.designSystemService.getDesignSystemByFileId(file.id || file.key);
      
      if (!designSystem) {
        this.showError('No design system found for this file. Please extract the design system first.');
        return;
      }

      if (designSystem.components.length === 0) {
        this.showError('No components found in this design system.');
        return;
      }

      this.showInfo(`Starting component generation for ${file.name}...`);
      
      // Generate components
      this.generatedComponents = await this.componentGeneratorService.generateComponents(designSystem);
      
      this.showSuccess(`Successfully generated ${this.generatedComponents.length} components!`);
      
    } catch (error: any) {
      console.error('Component generation failed:', error);
      this.showError('Failed to generate components. Please try again.');
    }
  }

  downloadGeneratedComponents(): void {
    if (this.generatedComponents.length === 0) {
      this.showError('No components to download.');
      return;
    }

    // Create a zip file with all generated components
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
      
      this.showSuccess('Components downloaded successfully!');
    });
  }

  resetGenerationProgress(): void {
    this.componentGeneratorService.resetProgress();
    this.generatedComponents = [];
  }

  getComponentCount(file: any): number {
    return file?.components ? Object.keys(file.components).length : 0;
  }

  getStyleCount(file: any): number {
    return file?.styles ? Object.keys(file.styles).length : 0;
  }

  private showSuccess(message: string) {
    console.log('Success:', message);
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    console.log('Error:', message);
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string) {
    console.log('Info:', message);
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}