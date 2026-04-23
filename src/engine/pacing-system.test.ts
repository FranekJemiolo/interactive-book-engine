import { describe, it, expect } from 'vitest';
import { PacingSystem } from './pacing-system';

describe('PacingSystem', () => {
  it('should skip intro delay for immediate start', async () => {
    const pacingSystem = new PacingSystem();
    const start = Date.now();
    await pacingSystem.applyIntroDelay();
    const end = Date.now();
    // Should complete immediately without delay
    expect(end - start).toBeLessThan(100);
  });

  it('should apply frame delay when not in fast forward mode', async () => {
    const pacingSystem = new PacingSystem({ pacing: { frameDelay: 100 } });
    const start = Date.now();
    await pacingSystem.applyFrameDelay();
    const end = Date.now();
    // Should wait at least 100ms
    expect(end - start).toBeGreaterThanOrEqual(100);
  });

  it('should skip frame delay in fast forward mode', async () => {
    const pacingSystem = new PacingSystem({ pacing: { frameDelay: 100 } });
    pacingSystem.setFastForward(true);
    const start = Date.now();
    await pacingSystem.applyFrameDelay();
    const end = Date.now();
    // Should complete immediately
    expect(end - start).toBeLessThan(100);
  });

  it('should return 3 seconds as default frame delay', () => {
    const pacingSystem = new PacingSystem();
    const delay = pacingSystem.getEffectiveDelay('frame');
    // Default should be 3 seconds (3000ms)
    expect(delay).toBe(3000);
  });

  it('should use arc pacing when available', () => {
    const pacingSystem = new PacingSystem({ 
      pacing: { frameDelay: 5000 }
    });
    const delay = pacingSystem.getEffectiveDelay('frame');
    expect(delay).toBe(5000);
  });

  it('should apply node pacing multiplier', () => {
    const pacingSystem = new PacingSystem({ 
      pacing: { frameDelay: 5000 }
    });
    pacingSystem.setPacing({ frameDelayMultiplier: 2 });
    const delay = pacingSystem.getEffectiveDelay('frame');
    expect(delay).toBe(10000); // 5000 * 2
  });

  it('should handle infinite wait in applyFrameDelay', async () => {
    const pacingSystem = new PacingSystem();
    // This should never resolve, so we'll just check it doesn't throw
    const promise = pacingSystem.applyFrameDelay(Infinity);
    // Don't await it, just verify it's a promise
    expect(promise).toBeInstanceOf(Promise);
  });

  it('should return 3 seconds as default suspense delay', () => {
    const pacingSystem = new PacingSystem();
    const delay = pacingSystem.getEffectiveDelay('suspense');
    // Default should be 3 seconds (3000ms)
    expect(delay).toBe(3000);
  });
});
