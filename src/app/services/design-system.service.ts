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
  extractDesignSystem(figmaFile: any, accessToken: string, fileId?: string): DesignSystem {
    const components = this.extractComponents(figmaFile);
    const tokens = this.extractDesignTokens(figmaFile);
    
    return {
      id: this.generateId(),
      name: figmaFile.name,
      figmaFileId: fileId || figmaFile.id || figmaFile.key || 'unknown',
      figmaAccessToken: accessToken,
      lastSync: new Date(),
      components,
      tokens,
      language: 'ar'
    };
  }

  // Get design system by file ID
  getDesignSystemByFileId(fileId: string): DesignSystem | null {
    const current = this.designSystems.value;
    return current.find(ds => ds.figmaFileId === fileId) || null;
  }

  // Check if design system exists for file
  hasDesignSystem(fileId: string): boolean {
    return this.getDesignSystemByFileId(fileId) !== null;
  }

  // Extract components from Figma nodes
  private extractComponents(figmaFile: any): DesignComponent[] {
    const components: DesignComponent[] = [];
    
    console.log('Extracting components from Figma file:', figmaFile.name);
    console.log('Available components:', figmaFile.components);
    
    if (figmaFile.components) {
      Object.keys(figmaFile.components).forEach((componentKey, index) => {
        const figmaComponent = figmaFile.components[componentKey];
        console.log(`Processing component: ${figmaComponent.name}`);
        
        const component: DesignComponent = {
          id: componentKey,
          name: figmaComponent.name || `Component ${index + 1}`,
          category: 'UI Components',
          figmaNodeId: componentKey,
          code: '',
          scss: '',
          html: '',
          typescript: ''
        };
        
        components.push(component);
      });
    }
    
    console.log(`Extracted ${components.length} components`);
    return components;
  }

  // Extract design tokens
  private extractDesignTokens(figmaFile: any): DesignTokens {
    const colors: ColorToken[] = [];
    const typography: TypographyToken[] = [];
    const spacing: SpacingToken[] = [];
    
    console.log('Extracting design tokens from Figma file:', figmaFile.name);
    console.log('Available styles:', figmaFile.styles);
    
    if (figmaFile.styles) {
      Object.keys(figmaFile.styles).forEach((styleKey, index) => {
        const figmaStyle = figmaFile.styles[styleKey];
        console.log(`Processing style: ${figmaStyle.name}`);
        
        if (figmaStyle.styleType === 'FILL') {
          colors.push({
            name: figmaStyle.name,
            value: '#000000', // Default color, would need to extract from style
            category: 'Colors'
          });
        } else if (figmaStyle.styleType === 'TEXT') {
          typography.push({
            name: figmaStyle.name,
            fontFamily: 'Inter',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '1.5'
          });
        }
      });
    }
    
    // Add some default spacing tokens
    spacing.push(
      { name: 'spacing-xs', value: '4px' },
      { name: 'spacing-sm', value: '8px' },
      { name: 'spacing-md', value: '16px' },
      { name: 'spacing-lg', value: '24px' },
      { name: 'spacing-xl', value: '32px' }
    );
    
    console.log(`Extracted ${colors.length} colors, ${typography.length} typography, ${spacing.length} spacing tokens`);
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