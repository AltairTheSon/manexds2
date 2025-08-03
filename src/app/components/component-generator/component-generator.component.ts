import { Component } from '@angular/core';

@Component({
  selector: 'app-component-generator',
  template: `
    <div class="component-generator">
      <h2>Component Generator</h2>
      <p>Generate Angular components from your design system</p>
      
      <div class="generator-content">
        <div class="component-list">
          <h3>Available Components</h3>
          <p>No components available. Please connect to Figma first.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .component-generator {
      max-width: 1200px;
      margin: 0 auto;
    }

    .component-generator h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .component-generator p {
      color: #666;
      margin-bottom: 2rem;
    }

    .generator-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ComponentGeneratorComponent {}