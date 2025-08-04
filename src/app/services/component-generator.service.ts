import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DesignSystem, DesignComponent } from './design-system.service';

export interface GenerationProgress {
  current: number;
  total: number;
  currentComponent: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  message: string;
}

export interface GeneratedComponent {
  name: string;
  html: string;
  scss: string;
  typescript: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentGeneratorService {
  private progressSubject = new BehaviorSubject<GenerationProgress>({
    current: 0,
    total: 0,
    currentComponent: '',
    status: 'idle',
    message: ''
  });

  constructor() {}

  getProgress(): Observable<GenerationProgress> {
    return this.progressSubject.asObservable();
  }

  async generateComponents(designSystem: DesignSystem): Promise<GeneratedComponent[]> {
    const components = designSystem.components;
    const total = components.length;
    
    this.progressSubject.next({
      current: 0,
      total,
      currentComponent: '',
      status: 'generating',
      message: 'Starting component generation...'
    });

    const generatedComponents: GeneratedComponent[] = [];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      this.progressSubject.next({
        current: i + 1,
        total,
        currentComponent: component.name,
        status: 'generating',
        message: `Generating ${component.name}...`
      });

      try {
        // Simulate generation time
        await this.delay(500);
        
        const generatedComponent = await this.generateSingleComponent(component);
        generatedComponents.push(generatedComponent);
        
        console.log(`Generated component: ${component.name}`);
      } catch (error) {
        console.error(`Failed to generate component ${component.name}:`, error);
        this.progressSubject.next({
          current: i + 1,
          total,
          currentComponent: component.name,
          status: 'error',
          message: `Failed to generate ${component.name}`
        });
        throw error;
      }
    }

    this.progressSubject.next({
      current: total,
      total,
      currentComponent: '',
      status: 'completed',
      message: `Successfully generated ${total} components!`
    });

    return generatedComponents;
  }

  async generateSingleComponent(component: DesignComponent): Promise<GeneratedComponent> {
    // Generate HTML template
    const html = this.generateHTMLTemplate(component);
    
    // Generate SCSS styles
    const scss = this.generateSCSS(component);
    
    // Generate TypeScript class
    const typescript = this.generateTypeScript(component);

    return {
      name: component.name,
      html,
      scss,
      typescript,
      category: component.category
    };
  }

  private generateHTMLTemplate(component: DesignComponent): string {
    return `<div class="${component.name.toLowerCase()}-container">
  <div class="${component.name.toLowerCase()}-content">
    <!-- Generated content for ${component.name} -->
    <div class="component-wrapper">
      <h3>${component.name}</h3>
      <p>This is a generated component from your design system.</p>
    </div>
  </div>
</div>`;
  }

  private generateSCSS(component: DesignComponent): string {
    return `.${component.name.toLowerCase()}-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  .${component.name.toLowerCase()}-content {
    max-width: 100%;
    width: 100%;
    
    .component-wrapper {
      background: #ffffff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: #666;
        line-height: 1.5;
      }
    }
  }
}`;
  }

  private generateTypeScript(component: DesignComponent): string {
    return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${component.name.toLowerCase()}',
  templateUrl: './${component.name.toLowerCase()}.component.html',
  styleUrls: ['./${component.name.toLowerCase()}.component.scss']
})
export class ${component.name}Component {
  @Input() data: any;
  @Output() action = new EventEmitter<any>();

  constructor() {}

  onAction(event: any): void {
    this.action.emit(event);
  }
}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  resetProgress(): void {
    this.progressSubject.next({
      current: 0,
      total: 0,
      currentComponent: '',
      status: 'idle',
      message: ''
    });
  }
}