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
    const componentName = component.name.toLowerCase();
    const displayName = this.getComponentDisplayName(component.name);
    
    // Generate different HTML based on component category
    switch (component.category.toLowerCase()) {
      case 'button':
        return `<button class="${componentName}" 
                [class.primary]="variant === 'primary'"
                [class.secondary]="variant === 'secondary'"
                [class.outline]="variant === 'outline'"
                [disabled]="disabled"
                (click)="onClick($event)">
  <mat-icon *ngIf="icon" class="button-icon">{{ icon }}</mat-icon>
  <span class="button-text">{{ text || '${displayName}' }}</span>
</button>`;

      case 'card':
        return `<div class="${componentName}" 
             [class.elevated]="elevated"
             [class.outlined]="outlined">
  <div class="card-header" *ngIf="showHeader">
    <h3 class="card-title">{{ title || '${displayName}' }}</h3>
    <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
  </div>
  <div class="card-content">
    <ng-content></ng-content>
  </div>
  <div class="card-actions" *ngIf="showActions">
    <button mat-button (click)="onPrimaryAction()">{{ primaryActionText || 'Action' }}</button>
    <button mat-button (click)="onSecondaryAction()">{{ secondaryActionText || 'Cancel' }}</button>
  </div>
</div>`;

      case 'input':
        return `<div class="${componentName}-wrapper">
  <mat-form-field class="${componentName}-field" 
                  [appearance]="appearance || 'outline'"
                  [floatLabel]="floatLabel || 'auto'">
    <mat-label>{{ label || '${displayName}' }}</mat-label>
    <input matInput 
           [type]="type || 'text'"
           [placeholder]="placeholder"
           [required]="required"
           [disabled]="disabled"
           [(ngModel)]="value"
           (input)="onInput($event)"
           (blur)="onBlur($event)">
    <mat-icon matSuffix *ngIf="suffixIcon">{{ suffixIcon }}</mat-icon>
    <mat-error *ngIf="errorMessage">{{ errorMessage }}</mat-error>
  </mat-form-field>
</div>`;

      case 'icon':
        return `<div class="${componentName}-wrapper" 
             [class.clickable]="clickable"
             [class.animated]="animated"
             (click)="onClick($event)">
  <mat-icon class="${componentName}-icon" 
            [class.small]="size === 'small'"
            [class.medium]="size === 'medium'"
            [class.large]="size === 'large'">
    {{ iconName || '${displayName.toLowerCase()}' }}
  </mat-icon>
  <span class="icon-label" *ngIf="showLabel">{{ label || '${displayName}' }}</span>
</div>`;

      case 'navigation':
        return `<nav class="${componentName}-nav" 
             [class.horizontal]="orientation === 'horizontal'"
             [class.vertical]="orientation === 'vertical'">
  <ul class="nav-list">
    <li class="nav-item" *ngFor="let item of navigationItems; let i = index">
      <a class="nav-link" 
         [routerLink]="item.route"
         routerLinkActive="active"
         [class.active]="item.isActive">
        <mat-icon *ngIf="item.icon" class="nav-icon">{{ item.icon }}</mat-icon>
        <span class="nav-text">{{ item.label }}</span>
      </a>
    </li>
  </ul>
</nav>`;

      case 'form':
        return `<form class="${componentName}-form" 
              [formGroup]="formGroup"
              (ngSubmit)="onSubmit()">
  <div class="form-header">
    <h3 class="form-title">{{ title || '${displayName}' }}</h3>
    <p class="form-description" *ngIf="description">{{ description }}</p>
  </div>
  
  <div class="form-content">
    <ng-content></ng-content>
  </div>
  
  <div class="form-actions">
    <button type="submit" 
            mat-raised-button 
            color="primary"
            [disabled]="!formGroup.valid || loading">
      <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
      {{ submitText || 'Submit' }}
    </button>
    <button type="button" 
            mat-button 
            (click)="onCancel()">
      {{ cancelText || 'Cancel' }}
    </button>
  </div>
</form>`;

      default:
        return `<div class="${componentName}-container">
  <div class="${componentName}-content">
    <div class="component-wrapper">
      <h3>{{ title || '${displayName}' }}</h3>
      <p>{{ description || 'This is a ${displayName} component from your design system.' }}</p>
      <div class="component-actions" *ngIf="showActions">
        <button mat-button (click)="onPrimaryAction()">{{ primaryActionText || 'Action' }}</button>
        <button mat-button (click)="onSecondaryAction()">{{ secondaryActionText || 'Cancel' }}</button>
      </div>
    </div>
  </div>
</div>`;
    }
  }

  private generateSCSS(component: DesignComponent): string {
    const componentName = component.name.toLowerCase();
    const displayName = this.getComponentDisplayName(component.name);
    
    // Generate different SCSS based on component category
    switch (component.category.toLowerCase()) {
      case 'button':
        return `.${componentName} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  outline: none;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
  
  &.outline {
    background: transparent;
    color: #007bff;
    border: 2px solid #007bff;
    
    &:hover {
      background: #007bff;
      color: white;
    }
  }
  
  .button-icon {
    font-size: 1rem;
    width: 1rem;
    height: 1rem;
  }
  
  .button-text {
    font-weight: 500;
  }
}`;

      case 'card':
        return `.${componentName} {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &.elevated {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
  
  &.outlined {
    border: 1px solid #e9ecef;
  }
  
  .card-header {
    padding: 1.5rem 1.5rem 0;
    
    .card-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }
    
    .card-subtitle {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .card-actions {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }
}`;

      case 'input':
        return `.${componentName}-wrapper {
  width: 100%;
  
  .${componentName}-field {
    width: 100%;
    
    ::ng-deep .mat-form-field-wrapper {
      padding-bottom: 0;
    }
    
    ::ng-deep .mat-form-field-outline {
      color: #e9ecef;
    }
    
    ::ng-deep .mat-form-field-outline-thick {
      color: #007bff;
    }
    
    ::ng-deep .mat-form-field-label {
      color: #666;
    }
    
    ::ng-deep .mat-form-field-required-marker {
      color: #dc3545;
    }
    
    input {
      font-size: 0.875rem;
      
      &::placeholder {
        color: #999;
      }
    }
    
    &.mat-form-field-invalid {
      ::ng-deep .mat-form-field-outline {
        color: #dc3545;
      }
    }
  }
}`;

      case 'icon':
        return `.${componentName}-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: default;
  transition: all 0.2s ease;
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &.animated {
    .${componentName}-icon {
      transition: all 0.3s ease;
    }
    
    &:hover .${componentName}-icon {
      transform: rotate(360deg);
    }
  }
  
  .${componentName}-icon {
    color: #333;
    
    &.small {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    
    &.medium {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }
    
    &.large {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
  }
  
  .icon-label {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }
}`;

      case 'navigation':
        return `.${componentName}-nav {
  width: 100%;
  
  &.horizontal {
    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0;
    }
  }
  
  &.vertical {
    .nav-list {
      display: flex;
      flex-direction: column;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0;
    }
  }
  
  .nav-item {
    margin: 0;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: #666;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f8f9fa;
      color: #333;
    }
    
    &.active {
      background: #007bff;
      color: white;
    }
    
    .nav-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    
    .nav-text {
      font-weight: 500;
    }
  }
}`;

      case 'form':
        return `.${componentName}-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  
  .form-header {
    margin-bottom: 2rem;
    text-align: center;
    
    .form-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }
    
    .form-description {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
  }
  
  .form-content {
    margin-bottom: 2rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    
    button {
      min-width: 120px;
    }
  }
}`;

      default:
        return `.${componentName}-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  .${componentName}-content {
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
      
      .component-actions {
        margin-top: 1.5rem;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }
    }
  }
}`;
    }
  }

  private generateTypeScript(component: DesignComponent): string {
    const componentName = component.name;
    const selectorName = component.name.toLowerCase();
    const displayName = this.getComponentDisplayName(component.name);
    
    // Generate different TypeScript based on component category
    switch (component.category.toLowerCase()) {
      case 'button':
        return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() text: string = '${displayName}';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  
  @Output() click = new EventEmitter<MouseEvent>();

  constructor() {}

  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.click.emit(event);
    }
  }
}`;

      case 'card':
        return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() title: string = '${displayName}';
  @Input() subtitle: string = '';
  @Input() elevated: boolean = true;
  @Input() outlined: boolean = false;
  @Input() showHeader: boolean = true;
  @Input() showActions: boolean = false;
  @Input() primaryActionText: string = 'Action';
  @Input() secondaryActionText: string = 'Cancel';
  
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  constructor() {}

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }
}`;

      case 'input':
        return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() label: string = '${displayName}';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() appearance: 'outline' | 'fill' | 'standard' = 'outline';
  @Input() floatLabel: 'auto' | 'always' | 'never' = 'auto';
  @Input() suffixIcon: string = '';
  @Input() value: string = '';
  @Input() errorMessage: string = '';
  
  @Output() input = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() valueChange = new EventEmitter<string>();

  constructor() {}

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.input.emit(event);
  }

  onBlur(event: Event): void {
    this.blur.emit(event);
  }
}`;

      case 'icon':
        return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() iconName: string = '${displayName.toLowerCase()}';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() label: string = '${displayName}';
  @Input() showLabel: boolean = false;
  @Input() clickable: boolean = false;
  @Input() animated: boolean = false;
  
  @Output() click = new EventEmitter<MouseEvent>();

  constructor() {}

  onClick(event: MouseEvent): void {
    if (this.clickable) {
      this.click.emit(event);
    }
  }
}`;

      case 'navigation':
        return `import { Component, Input } from '@angular/core';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() navigationItems: NavigationItem[] = [
    { label: 'Home', route: '/home', icon: 'home' },
    { label: 'About', route: '/about', icon: 'info' },
    { label: 'Contact', route: '/contact', icon: 'contact_support' }
  ];
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  constructor() {}
}`;

      case 'form':
        return `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() title: string = '${displayName}';
  @Input() description: string = '';
  @Input() submitText: string = 'Submit';
  @Input() cancelText: string = 'Cancel';
  @Input() loading: boolean = false;
  @Input() formGroup: FormGroup = new FormGroup({});
  
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor() {}

  onSubmit(): void {
    if (this.formGroup.valid && !this.loading) {
      this.submit.emit();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}`;

      default:
        return `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${selectorName}',
  templateUrl: './${selectorName}.component.html',
  styleUrls: ['./${selectorName}.component.scss']
})
export class ${componentName}Component {
  @Input() title: string = '${displayName}';
  @Input() description: string = 'This is a ${displayName} component from your design system.';
  @Input() showActions: boolean = false;
  @Input() primaryActionText: string = 'Action';
  @Input() secondaryActionText: string = 'Cancel';
  
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  constructor() {}

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }
}`;
    }
  }

  private getComponentDisplayName(fullName: string): string {
    const parts = fullName.split('/');
    return parts.length > 1 ? parts.slice(1).join('/') : fullName;
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