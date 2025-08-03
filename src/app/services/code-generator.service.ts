import { Injectable } from '@angular/core';
import { DesignComponent, DesignTokens } from './design-system.service';

@Injectable({
  providedIn: 'root'
})
export class CodeGeneratorService {

  constructor() {}

  // Generate Angular component
  generateAngularComponent(component: DesignComponent, tokens: DesignTokens): string {
    const className = this.toPascalCase(component.name);
    
    return `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${this.toKebabCase(component.name)}',
  templateUrl: './${this.toKebabCase(component.name)}.component.html',
  styleUrls: ['./${this.toKebabCase(component.name)}.component.scss']
})
export class ${className}Component {
  @Input() variant: string = 'default';
  @Input() disabled: boolean = false;
  
  constructor() {}
}`;
  }

  // Generate HTML template
  generateHTMLTemplate(component: DesignComponent): string {
    return `<div class="${this.toKebabCase(component.name)}" [class.disabled]="disabled">
  <!-- Generated HTML template for ${component.name} -->
  <div class="${this.toKebabCase(component.name)}__content">
    ${component.html || '<!-- Component content will be generated here -->'}
  </div>
</div>`;
  }

  // Generate SCSS styles
  generateSCSS(component: DesignComponent, tokens: DesignTokens): string {
    const className = this.toKebabCase(component.name);
    
    return `@import '../../../styles/tokens';

.${className} {
  display: flex;
  align-items: center;
  justify-content: center;
  
  &__content {
    // Component styles will be generated here
  }
  
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  
  // Variants
  &--primary {
    // Primary variant styles
  }
  
  &--secondary {
    // Secondary variant styles
  }
}`;
  }

  // Generate TypeScript interface
  generateTypeScriptInterface(component: DesignComponent): string {
    const className = this.toPascalCase(component.name);
    
    return `export interface ${className}Props {
  variant?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
  className?: string;
}`;
  }

  // Generate design tokens SCSS
  generateDesignTokensSCSS(tokens: DesignTokens): string {
    return `// Design Tokens - Auto-generated from Figma

// Colors
${tokens.colors.map(color => `$${this.toKebabCase(color.name)}: ${color.value};`).join('\n')}

// Typography
${tokens.typography.map(typography => `$${this.toKebabCase(typography.name)}: {
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize};
  font-weight: ${typography.fontWeight};
  line-height: ${typography.lineHeight};
};`).join('\n\n')}

// Spacing
${tokens.spacing.map(spacing => `$${this.toKebabCase(spacing.name)}: ${spacing.value};`).join('\n')}

// Mixins
@mixin typography($token) {
  @if $token == 'heading-1' {
    font-family: $font-family-primary;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    line-height: $line-height-tight;
  }
  // Add more typography mixins as needed
}`;
  }

  // Generate component documentation
  generateDocumentation(component: DesignComponent): string {
    return `# ${component.name} Component

## Description
${component.name} component generated from Figma design system.

## Usage
\`\`\`html
<app-${this.toKebabCase(component.name)} 
  [variant]="'primary'"
  [disabled]="false">
</app-${this.toKebabCase(component.name)}>
\`\`\`

## Props
- \`variant\`: Component variant ('primary' | 'secondary' | 'default')
- \`disabled\`: Disable the component

## Examples
### Primary variant
\`\`\`html
<app-${this.toKebabCase(component.name)} variant="primary">
  Primary ${component.name}
</app-${this.toKebabCase(component.name)}>
\`\`\`

### Disabled state
\`\`\`html
<app-${this.toKebabCase(component.name)} [disabled]="true">
  Disabled ${component.name}
</app-${this.toKebabCase(component.name)}>
\`\`\``;
  }

  // Utility methods
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .map((word, index) => 
        index === 0 
          ? word.toLowerCase() 
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }
}