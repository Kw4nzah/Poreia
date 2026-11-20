import { describe, expect, it } from 'vitest';
import { chevronTarget, motionDuration } from './motionLogic';

describe('motionLogic', () => {
  it('skips animation when motion is reduced', () => {
    expect(motionDuration(true, 200)).toBe(0);
    expect(motionDuration(false, 200)).toBe(200);
  });
  it('maps open state to a rotation target', () => {
    expect(chevronTarget(true)).toBe(1);
    expect(chevronTarget(false)).toBe(0);
  });
});
