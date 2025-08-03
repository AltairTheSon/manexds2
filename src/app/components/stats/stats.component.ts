import { Component } from '@angular/core';

@Component({
  selector: 'app-stats',
  template: `
    <div class="stats">
      <h2>Statistics</h2>
      <p>View analytics and usage statistics for your design system</p>
      
      <div class="stats-content">
        <div class="stats-section">
          <h3>Usage Statistics</h3>
          <p>No statistics available. Please connect to Figma first.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .stats p {
      color: #666;
      margin-bottom: 2rem;
    }

    .stats-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class StatsComponent {}