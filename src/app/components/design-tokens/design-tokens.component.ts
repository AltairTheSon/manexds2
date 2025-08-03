import { Component } from '@angular/core';

@Component({
  selector: 'app-design-tokens',
  template: `
    <div class="design-tokens">
      <h2>Design Tokens</h2>
      <p>Manage colors, typography, spacing, and other design tokens</p>
      
      <div class="tokens-content">
        <div class="tokens-section">
          <h3>Design Tokens</h3>
          <p>No design tokens available. Please connect to Figma first.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .design-tokens {
      max-width: 1200px;
      margin: 0 auto;
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
  `]
})
export class DesignTokensComponent {}