import { Component, Input, forwardRef, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input, input[app-input]',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper" [class.input-wrapper-sm]="size === 'sm'" [class.input-wrapper-lg]="size === 'lg'">
      <label *ngIf="label" class="input-label" [class.required]="required">
        {{ label }}
      </label>
      <div class="input-container" [class.input-container-focused]="isFocused" [class.input-container-error]="error">
        <ng-content select="[prefix]"></ng-content>
        <input
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [attr.min]="min"
          [attr.max]="max"
          [attr.step]="step"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="input-field"
        />
        <ng-content select="[suffix]"></ng-content>
      </div>
      <div class="input-error" *ngIf="error && showError">
        {{ error }}
      </div>
      <div class="input-hint" *ngIf="hint && !error">
        {{ hint }}
      </div>
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-wrapper-sm {
      gap: 0.25rem;
    }

    .input-wrapper-lg {
      gap: 0.75rem;
    }

    .input-label {
      color: #e6ebf5;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .input-label.required::after {
      content: ' *';
      color: #f87171;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      transition: all 0.15s ease;
    }

    .input-container-focused {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .input-container-error {
      border-color: #f87171;
      box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
    }

    .input-field {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #e6ebf5;
      font-size: 1rem;
      font-family: inherit;
    }

    .input-field::placeholder {
      color: #94a3b8;
    }

    .input-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input-error {
      color: #f87171;
      font-size: 0.875rem;
    }

    .input-hint {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    /* Sizes */
    .input-wrapper-sm .input-container {
      padding: 0.5rem 0.75rem;
    }

    .input-wrapper-sm .input-field {
      font-size: 0.875rem;
    }

    .input-wrapper-lg .input-container {
      padding: 1rem 1.25rem;
    }

    .input-wrapper-lg .input-field {
      font-size: 1.125rem;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() error = '';
  @Input() hint = '';
  @Input() size: InputSize = 'md';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() showError = true;

  value = '';
  isFocused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}