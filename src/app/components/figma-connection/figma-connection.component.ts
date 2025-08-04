import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FigmaService } from '../../services/figma.service';
import { DesignSystemService } from '../../services/design-system.service';

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
                  [disabled]="isTesting || !connectionForm.valid"
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
        <h3>Extracted Files</h3>
        <div class="files-grid">
          <mat-card *ngFor="let file of extractedFiles" class="file-card">
            <mat-card-header>
              <mat-card-title>{{ file.name }}</mat-card-title>
              <mat-card-subtitle>File ID: {{ file.id }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Last modified: {{ file.lastModified | date }}</p>
              <p>Components: {{ file.components?.length || 0 }}</p>
              <p>Styles: {{ file.styles?.length || 0 }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="viewFileDetails(file)">
                View Details
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
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

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }

      .files-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FigmaConnectionComponent implements OnInit {
  connectionForm: FormGroup;
  isTesting = false;
  isExtracting = false;
  connectionStatus: any = null;
  extractedFiles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private figmaService: FigmaService,
    private designSystemService: DesignSystemService,
    private snackBar: MatSnackBar
  ) {
    this.connectionForm = this.fb.group({
      accessToken: ['', Validators.required],
      fileIds: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  async testConnection() {
    if (!this.connectionForm.valid) {
      this.showError('Please fill in all required fields');
      return;
    }

    this.isTesting = true;
    this.connectionStatus = null;

    try {
      const accessToken = this.connectionForm.get('accessToken')?.value;
      const response = await this.figmaService.testConnection(accessToken).toPromise();
      
      this.connectionStatus = {
        type: 'success',
        icon: 'check_circle',
        title: 'Connection Successful',
        message: `Connected to Figma as ${response.handle || 'User'}`
      };

      this.showSuccess('Figma connection test successful!');
    } catch (error: any) {
      this.connectionStatus = {
        type: 'error',
        icon: 'error',
        title: 'Connection Failed',
        message: error.error?.message || 'Failed to connect to Figma. Please check your access token.'
      };

      this.showError('Figma connection test failed. Please check your access token.');
    } finally {
      this.isTesting = false;
    }
  }

  async onSubmit() {
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

      const extractedFiles = [];

      for (const fileId of fileIds) {
        try {
          const file = await this.figmaService.getFile(fileId, accessToken).toPromise();
          extractedFiles.push(file);
          
          // Extract design system from the file
          const designSystem = this.designSystemService.extractDesignSystem(file, accessToken);
          this.designSystemService.addDesignSystem(designSystem);
        } catch (error: any) {
          console.error(`Failed to extract file ${fileId}:`, error);
        }
      }

      this.extractedFiles = extractedFiles;

      if (extractedFiles.length > 0) {
        this.connectionStatus = {
          type: 'success',
          icon: 'check_circle',
          title: 'Extraction Successful',
          message: `Successfully extracted ${extractedFiles.length} design system(s)`
        };

        this.showSuccess(`Successfully extracted ${extractedFiles.length} design system(s)!`);
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
      this.connectionStatus = {
        type: 'error',
        icon: 'error',
        title: 'Extraction Failed',
        message: error.error?.message || 'Failed to extract design systems.'
      };

      this.showError('Failed to extract design systems. Please try again.');
    } finally {
      this.isExtracting = false;
    }
  }

  viewFileDetails(file: any) {
    console.log('File details:', file);
    this.showInfo(`Viewing details for ${file.name}`);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}