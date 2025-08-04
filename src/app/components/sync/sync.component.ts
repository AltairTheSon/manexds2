import { Component, OnInit } from '@angular/core';
import { DesignSystemService, DesignSystem } from '../../services/design-system.service';
import { FigmaService } from '../../services/figma.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sync',
  template: `
    <div class="sync">
      <div class="sync-header">
        <mat-icon class="header-icon">sync</mat-icon>
        <h2>Sync</h2>
        <p>Keep your components in sync with Figma changes</p>
      </div>
      
      <div class="sync-content">
        <!-- Sync Configuration -->
        <div *ngIf="designSystems.length > 0" class="sync-configuration">
          <div class="sync-header-section">
            <h3>Sync Configuration</h3>
            <p>Keep your design systems in sync with Figma changes</p>
          </div>

          <!-- Auto Sync Settings -->
          <mat-card class="sync-settings">
            <mat-card-header>
              <mat-card-title>Auto Sync Settings</mat-card-title>
              <mat-card-subtitle>Configure automatic synchronization</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Enable Auto Sync</h4>
                  <p>Automatically sync changes from Figma files</p>
                </div>
                <mat-slide-toggle 
                  [(ngModel)]="autoSyncEnabled"
                  (change)="toggleAutoSync()">
                </mat-slide-toggle>
              </div>
              
              <div class="setting-item" *ngIf="autoSyncEnabled">
                <div class="setting-info">
                  <h4>Sync Interval</h4>
                  <p>How often to check for updates</p>
                </div>
                <mat-form-field appearance="outline">
                  <mat-select [(ngModel)]="syncInterval">
                    <mat-option value="5">Every 5 minutes</mat-option>
                    <mat-option value="15">Every 15 minutes</mat-option>
                    <mat-option value="30">Every 30 minutes</mat-option>
                    <mat-option value="60">Every hour</mat-option>
                    <mat-option value="1440">Daily</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Design Systems Sync Status -->
          <div class="systems-sync">
            <h3>Design Systems Sync Status</h3>
            
            <div class="systems-grid">
              <mat-card *ngFor="let system of designSystems" class="system-card">
                <mat-card-header>
                  <mat-card-title>{{ system.name }}</mat-card-title>
                  <mat-card-subtitle>File ID: {{ system.figmaFileId }}</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="sync-status">
                    <div class="status-item">
                      <mat-icon [class.synced]="system.lastSync" [class.not-synced]="!system.lastSync">
                        {{ system.lastSync ? 'check_circle' : 'error' }}
                      </mat-icon>
                      <span>{{ system.lastSync ? 'Last synced' : 'Never synced' }}</span>
                      <span class="sync-time" *ngIf="system.lastSync">
                        {{ system.lastSync | date:'medium' }}
                      </span>
                    </div>
                    
                    <div class="sync-stats">
                      <div class="stat">
                        <span class="stat-label">Components:</span>
                        <span class="stat-value">{{ system.components.length }}</span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">Tokens:</span>
                        <span class="stat-value">
                          {{ system.tokens.colors.length + system.tokens.typography.length + system.tokens.spacing.length }}
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions>
                  <button mat-raised-button 
                          color="primary" 
                          (click)="syncSystem(system)"
                          [disabled]="isSyncing">
                    <mat-icon *ngIf="!isSyncing">sync</mat-icon>
                    <mat-spinner *ngIf="isSyncing" diameter="20"></mat-spinner>
                    {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
                  </button>
                  <button mat-button 
                          color="accent" 
                          (click)="viewSyncHistory(system)">
                    <mat-icon>history</mat-icon>
                    History
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>

          <!-- Manual Sync -->
          <div class="manual-sync">
            <h3>Manual Sync</h3>
            <div class="sync-actions">
              <button mat-raised-button 
                      color="primary" 
                      (click)="syncAllSystems()"
                      [disabled]="isSyncing">
                <mat-icon>sync</mat-icon>
                Sync All Systems
              </button>
              <button mat-raised-button 
                      color="accent" 
                      (click)="checkForUpdates()"
                      [disabled]="isChecking">
                <mat-icon>update</mat-icon>
                Check for Updates
              </button>
            </div>
          </div>

          <!-- Sync History -->
          <div class="sync-history" *ngIf="syncHistory.length > 0">
            <h3>Recent Sync History</h3>
            <div class="history-list">
              <mat-card *ngFor="let entry of syncHistory" class="history-item">
                <mat-card-content>
                  <div class="history-info">
                    <div class="history-system">
                      <h4>{{ entry.systemName }}</h4>
                      <p>{{ entry.timestamp | date:'medium' }}</p>
                    </div>
                    <div class="history-status">
                      <mat-icon [class.success]="entry.success" [class.error]="!entry.success">
                        {{ entry.success ? 'check_circle' : 'error' }}
                      </mat-icon>
                      <span>{{ entry.success ? 'Success' : 'Failed' }}</span>
                    </div>
                    <div class="history-details">
                      <p>{{ entry.message }}</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="designSystems.length === 0" class="empty-state">
          <mat-icon class="empty-icon">cloud_sync</mat-icon>
          <h3>No Sync Configuration Available</h3>
          <p>Please connect to Figma first to configure sync settings.</p>
          <button mat-raised-button color="primary" routerLink="/figma-connection">
            <mat-icon>link</mat-icon>
            Connect to Figma
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sync {
      max-width: 1200px;
      margin: 0 auto;
    }

    .sync-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
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

    .sync-configuration {
      margin-bottom: 2rem;
    }

    .sync-header-section {
      margin-bottom: 2rem;
    }

    .sync-header-section h3 {
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
    }

    .sync-header-section p {
      color: #666;
      margin: 0;
    }

    .sync-settings {
      margin-bottom: 3rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-weight: 600;
    }

    .setting-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .systems-sync {
      margin-bottom: 3rem;
    }

    .systems-sync h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .systems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .system-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .system-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .sync-status {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .status-item mat-icon.synced {
      color: #4caf50;
    }

    .status-item mat-icon.not-synced {
      color: #f44336;
    }

    .sync-time {
      margin-left: auto;
      font-size: 0.8rem;
      color: #666;
    }

    .sync-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 6px;
    }

    .stat-label {
      font-size: 0.8rem;
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

    .manual-sync {
      margin-bottom: 3rem;
    }

    .manual-sync h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .sync-actions {
      display: flex;
      gap: 1rem;
    }

    .sync-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sync-history {
      margin-bottom: 2rem;
    }

    .sync-history h3 {
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 600;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .history-item {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .history-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .history-info {
      display: grid;
      grid-template-columns: 1fr auto 2fr;
      gap: 1rem;
      align-items: center;
    }

    .history-system h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-weight: 600;
    }

    .history-system p {
      margin: 0;
      color: #666;
      font-size: 0.8rem;
    }

    .history-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      background: #f8f9fa;
    }

    .history-status mat-icon.success {
      color: #4caf50;
    }

    .history-status mat-icon.error {
      color: #f44336;
    }

    .history-status span {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .history-details p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .systems-grid {
        grid-template-columns: 1fr;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .system-card mat-card-actions {
        flex-direction: column;
      }

      .sync-actions {
        flex-direction: column;
      }

      .history-info {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .history-status {
        justify-content: center;
      }
    }
  `]
})
export class SyncComponent implements OnInit {
  designSystems: DesignSystem[] = [];
  autoSyncEnabled = false;
  syncInterval = '30';
  isSyncing = false;
  isChecking = false;
  syncHistory: any[] = [];

  constructor(
    private designSystemService: DesignSystemService,
    private figmaService: FigmaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDesignSystems();
    this.loadSyncSettings();
    this.loadSyncHistory();
  }

  loadDesignSystems(): void {
    this.designSystemService.getDesignSystems().subscribe(systems => {
      this.designSystems = systems;
    });
  }

  loadSyncSettings(): void {
    const settings = localStorage.getItem('syncSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.autoSyncEnabled = parsed.autoSyncEnabled || false;
      this.syncInterval = parsed.syncInterval || '30';
    }
  }

  loadSyncHistory(): void {
    const history = localStorage.getItem('syncHistory');
    if (history) {
      this.syncHistory = JSON.parse(history);
    }
  }

  toggleAutoSync(): void {
    const settings = {
      autoSyncEnabled: this.autoSyncEnabled,
      syncInterval: this.syncInterval
    };
    localStorage.setItem('syncSettings', JSON.stringify(settings));
    
    if (this.autoSyncEnabled) {
      this.showSuccess('Auto sync enabled');
      this.startAutoSync();
    } else {
      this.showSuccess('Auto sync disabled');
      this.stopAutoSync();
    }
  }

  startAutoSync(): void {
    // In a real implementation, this would set up a timer
    console.log('Auto sync started with interval:', this.syncInterval, 'minutes');
  }

  stopAutoSync(): void {
    // In a real implementation, this would clear the timer
    console.log('Auto sync stopped');
  }

  async syncSystem(system: DesignSystem): Promise<void> {
    this.isSyncing = true;
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the system's last sync time
      const updatedSystem = { ...system, lastSync: new Date() };
      this.designSystemService.updateDesignSystem(system.id, updatedSystem);
      
      // Add to sync history
      this.addSyncHistory(system.name, true, 'Successfully synced design system');
      
      this.showSuccess(`Successfully synced ${system.name}`);
    } catch (error) {
      this.addSyncHistory(system.name, false, 'Sync failed: ' + error);
      this.showError(`Failed to sync ${system.name}`);
    } finally {
      this.isSyncing = false;
    }
  }

  async syncAllSystems(): Promise<void> {
    this.isSyncing = true;
    
    try {
      for (const system of this.designSystems) {
        await this.syncSystem(system);
      }
      this.showSuccess('All design systems synced successfully');
    } catch (error) {
      this.showError('Failed to sync all systems');
    } finally {
      this.isSyncing = false;
    }
  }

  async checkForUpdates(): Promise<void> {
    this.isChecking = true;
    
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatesFound = Math.random() > 0.5; // Random for demo
      
      if (updatesFound) {
        this.showInfo('Updates found! Some design systems have been modified in Figma.');
      } else {
        this.showInfo('No updates found. All design systems are up to date.');
      }
    } catch (error) {
      this.showError('Failed to check for updates');
    } finally {
      this.isChecking = false;
    }
  }

  viewSyncHistory(system: DesignSystem): void {
    this.showInfo(`Viewing sync history for ${system.name}`);
    // In a real implementation, this would show a modal with detailed history
  }

  addSyncHistory(systemName: string, success: boolean, message: string): void {
    const entry = {
      systemName,
      success,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.syncHistory.unshift(entry);
    
    // Keep only last 50 entries
    if (this.syncHistory.length > 50) {
      this.syncHistory = this.syncHistory.slice(0, 50);
    }
    
    localStorage.setItem('syncHistory', JSON.stringify(this.syncHistory));
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