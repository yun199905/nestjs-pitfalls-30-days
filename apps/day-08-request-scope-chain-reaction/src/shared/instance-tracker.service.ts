import { Injectable } from '@nestjs/common';

@Injectable()
export class InstanceTrackerService {
  private readonly counts = new Map<string, number>();

  nextId(component: string): string {
    const nextCount = (this.counts.get(component) ?? 0) + 1;
    this.counts.set(component, nextCount);

    return `${component}-${nextCount}`;
  }
}
