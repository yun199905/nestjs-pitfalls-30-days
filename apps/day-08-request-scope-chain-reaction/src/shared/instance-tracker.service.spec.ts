import { InstanceTrackerService } from './instance-tracker.service';

describe('InstanceTrackerService', () => {
  it('counts each component independently', () => {
    const tracker = new InstanceTrackerService();

    expect(tracker.nextId('service')).toBe('service-1');
    expect(tracker.nextId('controller')).toBe('controller-1');
    expect(tracker.nextId('service')).toBe('service-2');
  });
});
