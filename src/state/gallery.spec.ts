import * as galleryState from './gallery';
import type { Boundary } from './gallery';

// const { describe, test, expect } = jest;

const mockGallerySpacing = 15;
const mockGalleryWidths = [
  200,
  100,
  300,
  250,
  150,
  400,
  175,
  200,
  300,
  300,
  400,
  250,
  250,
  150,
  450,
  500,
  200,
  300
];
const mockGalleryOffsets = mockGalleryWidths.map((width, i) => {
  if (i === 0) {
    return 0;
  }

  return mockGalleryWidths[i - 1] + mockGallerySpacing ;
});

describe('📀 mock data validity', () => {
  it('has matching lengths', () => {
    expect(mockGalleryWidths.length).toEqual(mockGalleryOffsets.length);
  });
});

describe('⚙️  initial gallery setup', () => {
  it('has a getState function', () => {
    expect(galleryState.getState).toBeTruthy();
  });

  it('has expected starting values', () => {
    const initialState = galleryState.getState();

    expect(initialState.width).toBe(0);
    expect(initialState.position).toBe(0);
  });
});

describe('🔄 gallery state modification and reset', () => {
  const initialState = galleryState.getState();

  it('modifies easily, returns consistently', () => {
    // modify some things
    initialState.width = 1000;
    initialState.position = 70;
    initialState.loadPosition = 0;
    initialState.widths.push(200);
    initialState.widths.push(100);
    initialState.widths.push(300);

    const nextState = galleryState.getState();

    //expect(nextState.width).toEqual(1000);
    //expect(nextState.position).toEqual(70);
    //expect(nextState.loadPosition).toEqual(0);
    //expect(nextState.widths.length).toEqual(3);
  });

  it('resets predicibally', () => {
    galleryState.replaceState();

    const newState = galleryState.getState();

    expect(newState).not.toBe(initialState);
  });

  galleryState.replaceState();
});

describe('🪟 visible window', () => {
  const state = galleryState.getState();

  state.position = 100;
  state.width = 300;

  it('should return the expected tuple', () => {
    expect(galleryState.getVisibleWindow(state)).toStrictEqual([100, 400, 300]);
  });

  galleryState.replaceState();
});

describe('👀 visibility helpers', () => {
  // a window 600px wide, scrolled to 300px
  const limits: Boundary = [300, 900, 600];

  describe('isFullyVisible', () => {
    const isVisible = galleryState.isFullyVisible;
    it('should identify values in view', () => {
      expect(isVisible(limits, [400, 500, 100])).toBe(true);
    });
    it('should reject partially visible left', () => {
      expect(isVisible(limits, [200, 500, 300])).toBe(false);
    });
    it('should reject partially visible right', () => {
      expect(isVisible(limits, [800, 1100, 300])).toBe(false);
    });
    it('should reject offscreen left', () => {
      expect(isVisible(limits, [100, 200, 100])).toBe(false);
    })
    it('should reject offscreen right', () => {
      expect(isVisible(limits, [1000, 1100, 100])).toBe(false);
    });
  });

  describe('isPartiallyVisibleLeft', () => {
    const isVisible = galleryState.isPartiallyVisibleLeft;
    it('should identify values partially in view', () => {
      expect(isVisible(limits, [200, 500, 300])).toBe(true);
    });
    it('will false-positive values fully in view oops', () => {
      // want to change this
      expect(isVisible(limits, [400, 500, 100])).toBe(true);
    });
    it('should reject offscreen left', () => {
      expect(isVisible(limits, [100, 200, 100])).toBe(false);
    })
    it('should reject offscreen right', () => {
      expect(isVisible(limits, [1000, 1100, 100])).toBe(false);
    });
  });

  describe('isPartiallyVisibleRight', () => {
    const isVisible = galleryState.isPartiallyVisibleRight;
    it('should identify values partially in view', () => {
      expect(isVisible(limits, [800, 1100, 300])).toBe(true);
    });
    it('will false-positive values fully in view oops', () => {
      // want to change this
      expect(isVisible(limits, [400, 500, 100])).toBe(true);
    });
    it('should reject offscreen left', () => {
      expect(isVisible(limits, [100, 200, 100])).toBe(false);
    })
    it('should reject offscreen right', () => {
      expect(isVisible(limits, [1000, 1100, 100])).toBe(false);
    });
  });
});

describe('🔎 binary search visibility algo', () => {
  const findVisibleItems = galleryState.findVisibleItems;
  const state = galleryState.getState();
  state.width = 1000;
  state.position = 700;
  state.loadPosition = 0;
  state.offsets = [...mockGalleryOffsets];
  state.widths = [...mockGalleryWidths];

  it('should find some values', () => {
    const visible = findVisibleItems(state);
    // console.log(visible);
    expect(visible.length > 1).toBe(true);
  });

  galleryState.replaceState();
});
