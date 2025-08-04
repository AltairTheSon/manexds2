import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DesignSystem {
  id: string;
  name: string;
  figmaFileId: string;
  figmaAccessToken: string;
  lastSync: Date;
  components: DesignComponent[];
  tokens: DesignTokens;
  language: 'ar' | 'en';
}

export interface DesignComponent {
  id: string;
  name: string;
  category: string;
  figmaNodeId: string;
  code: string;
  scss: string;
  html: string;
  typescript: string;
}

export interface DesignTokens {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
}

export interface ColorToken {
  name: string;
  value: string;
  category: string;
}

export interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
}

export interface SpacingToken {
  name: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class DesignSystemService {
  private designSystems = new BehaviorSubject<DesignSystem[]>([]);

  constructor() {
    this.loadDesignSystems();
  }

  // Get all design systems
  getDesignSystems(): Observable<DesignSystem[]> {
    return this.designSystems.asObservable();
  }

  // Add new design system
  addDesignSystem(designSystem: DesignSystem): void {
    const current = this.designSystems.value;
    this.designSystems.next([...current, designSystem]);
    this.saveDesignSystems();
  }

  // Update design system
  updateDesignSystem(id: string, updates: Partial<DesignSystem>): void {
    const current = this.designSystems.value;
    const updated = current.map(ds => 
      ds.id === id ? { ...ds, ...updates } : ds
    );
    this.designSystems.next(updated);
    this.saveDesignSystems();
  }

  // Delete design system
  deleteDesignSystem(id: string): void {
    const current = this.designSystems.value;
    const filtered = current.filter(ds => ds.id !== id);
    this.designSystems.next(filtered);
    this.saveDesignSystems();
  }

  // Extract design system from Figma file
  extractDesignSystem(figmaFile: any, accessToken: string): DesignSystem {
    const components = this.extractComponents(figmaFile);
    const tokens = this.extractDesignTokens(figmaFile);
    
    return {
      id: this.generateId(),
      name: figmaFile.name,
      figmaFileId: figmaFile.id || figmaFile.key,
      figmaAccessToken: accessToken,
      lastSync: new Date(),
      components,
      tokens,
      language: 'ar'
    };
  }

  // Extract components from Figma nodes
  private extractComponents(figmaFile: any): DesignComponent[] {
    const components: DesignComponent[] = [];
    
    // Implementation for component extraction
    // This would parse the Figma file structure and extract components
    
    return components;
  }

  // Extract design tokens
  private extractDesignTokens(figmaFile: any): DesignTokens {
    const colors: ColorToken[] = [];
    const typography: TypographyToken[] = [];
    const spacing: SpacingToken[] = [];
    
    // Implementation for token extraction
    // This would parse the Figma file structure and extract design tokens
    
    return { colors, typography, spacing };
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Save to localStorage
  private saveDesignSystems(): void {
    localStorage.setItem('designSystems', JSON.stringify(this.designSystems.value));
  }

  // Load from localStorage
  private loadDesignSystems(): void {
    const saved = localStorage.getItem('designSystems');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.designSystems.next(parsed);
      } catch (error) {
        console.error('Error loading design systems:', error);
      }
    }
  }
}