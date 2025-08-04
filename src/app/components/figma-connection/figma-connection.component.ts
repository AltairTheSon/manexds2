import { Component } from '@angular/core';

@Component({
  selector: 'app-figma-connection',
  template: `
    <div class="figma-connection">
      <div class="connection-header">
        <mat-icon class="header-icon">link</mat-icon>
        <h2>Figma Connection</h2>
        <p>Connect to your Figma files to extract design systems</p>
      </div>
      
      <div class="connection-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Figma Access Token</mat-label>
          <input matInput type="password" placeholder="Enter your Figma access token">
          <mat-icon matSuffix class="gradient-icon">vpn_key</mat-icon>
          <mat-hint>Get your access token from Figma Account Settings</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Figma File IDs</mat-label>
          <textarea matInput placeholder="Enter Figma file IDs (one per line)"></textarea>
          <mat-icon matSuffix class="gradient-icon">description</mat-icon>
          <mat-hint>You can add multiple file IDs</mat-hint>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button color="primary" (click)="testConnection()">
            <mat-icon>wifi_tethering</mat-icon>
            Test Connection
          </button>
          <button mat-raised-button color="accent" (click)="extractDesignSystem()">
            <mat-icon>download</mat-icon>
            Extract Design System
          </button>
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

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class FigmaConnectionComponent {
  testConnection() {
    console.log('Testing Figma connection...');
  }

  extractDesignSystem() {
    console.log('Extracting design system...');
  }
}