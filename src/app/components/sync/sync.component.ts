import { Component } from '@angular/core';

@Component({
  selector: 'app-sync',
  template: `
    <div class="sync">
      <h2>Sync</h2>
      <p>Keep your components in sync with Figma changes</p>
      
      <div class="sync-content">
        <div class="sync-section">
          <h3>Sync Status</h3>
          <p>No sync configuration available. Please connect to Figma first.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sync {
      max-width: 1200px;
      margin: 0 auto;
    }

    .sync h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .sync p {
      color: #666;
      margin-bottom: 2rem;
    }

    .sync-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class SyncComponent {}