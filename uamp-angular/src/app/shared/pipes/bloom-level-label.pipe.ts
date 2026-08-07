import { Pipe, PipeTransform } from '@angular/core';

type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

const BLOOM_LABELS: Record<BloomLevel, string> = {
  remember: 'Remember',
  understand: 'Understand',
  apply: 'Apply',
  analyze: 'Analyze',
  evaluate: 'Evaluate',
  create: 'Create',
};

@Pipe({
  name: 'bloomLevelLabel',
  standalone: true,
})
export class BloomLevelLabelPipe implements PipeTransform {
  transform(value: BloomLevel): string {
    return BLOOM_LABELS[value] ?? value;
  }
}
