import { Component } from '@angular/core';

@Component({
  selector: 'app-figma-connection',
  template: `
    <div class="figma-connection">
      <h2>Figma Connection</h2>
      <p>Connect to your Figma files to extract design systems</p>
      
      <div class="connection-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Figma Access Token</mat-label>
          <input matInput type="password" placeholder="Enter your Figma access token">
          <mat-hint>Get your access token from Figma Account Settings</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Figma File IDs</mat-label>
          <textarea matInput placeholder="Enter Figma file IDs (one per line)"></textarea>
          <mat-hint>You can add multiple file IDs</mat-hint>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button color="primary" (click)="testConnection()">
            Test Connection
          </button>
          <button mat-raised-button color="accent" (click)="extractDesignSystem()">
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

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
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