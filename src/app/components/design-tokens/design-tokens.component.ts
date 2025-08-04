import { Component } from '@angular/core';

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
        <div class="empty-state">
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
  `]
})
export class DesignTokensComponent {}