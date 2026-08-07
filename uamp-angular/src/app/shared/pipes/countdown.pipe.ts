import { Pipe, PipeTransform, OnDestroy } from '@angular/core';

@Pipe({
  name: 'countdown',
  standalone: true,
  pure: false,
})
export class CountdownPipe implements PipeTransform {
  transform(targetDate: Date | string | number): string {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
