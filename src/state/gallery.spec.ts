import * as galleryState from './gallery';
import type { Boundary } from './gallery';

// const { describe, test, expect } = jest;

const mockGallerySpacing = 15;

function createOffsets(widths: Array<number>, spacing: number) {
  return widths.reduce((arr, width, i) => {
    arr[i] = i === 0 ? 0 : arr[i - 1] + widths[i - 1] + spacing;
    return arr;
  }, []);
}

const mockGalleryWidths = [
  200, 100, 300, 250, 150, 400, 175, 200, 300, 300, 400, 250, 250, 150, 450,
  500, 200, 300,
];

const mockGalleryOffsets = createOffsets(mockGalleryWidths, mockGallerySpacing);

// @ts-expect-error yes I know this doesn't match the profile
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve(
        mockGalleryWidths.map((w) => ({
          id: `${Math.floor(w * Math.random())}`,
          src: `${w}.jpg`,
          alt: `${w}`,
        }))
      ),
  })
);

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
    const initialState = galleryState.createNewState();

    expect(initialState.width).toBe(0);
    expect(initialState.position).toBe(0);
  });
});

describe('🪟 visible window', () => {
  const state = galleryState.createNewState();

  state.position = 100;
  state.width = 300;

  it('should return the expected tuple', () => {
    expect(galleryState.getVisibleWindow(state)).toStrictEqual([100, 400, 300]);
  });
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
    });
    it('should reject offscreen right', () => {
      expect(isVisible(limits, [1000, 1100, 100])).toBe(false);
    });
  });

  describe('isPartiallyVisibleLeft', () => {
    const isVisible = galleryState.isPartiallyVisibleLeft;
    it('should identify values partially in view', () => {
      expect(isVisible(limits, [200, 500, 300])).toBe(true);
    });
    it('should allow for double overlap on small screens', () => {
      expect(isVisible([250, 550, 300], [200, 600, 400])).toBe(true);
    });
    it('will false-positive values fully in view oops', () => {
      // want to change this
      expect(isVisible(limits, [400, 500, 100])).toBe(true);
    });
    it('should reject offscreen left', () => {
      expect(isVisible(limits, [100, 200, 100])).toBe(false);
    });
    it('should reject offscreen right', () => {
      expect(isVisible(limits, [1000, 1100, 100])).toBe(false);
    });
  });

  describe('isPartiallyVisibleRight', () => {
    const isVisible = galleryState.isPartiallyVisibleRight;
    it('should identify values partially in view', () => {
      expect(isVisible(limits, [800, 1100, 300])).toBe(true);
    });
    it('should allow for double overlap on small screens', () => {
      expect(isVisible([250, 550, 300], [200, 600, 400])).toBe(true);
    });
    it('will false-positive values fully in view oops', () => {
      // want to change this
      expect(isVisible(limits, [400, 500, 100])).toBe(true);
    });
    it('should reject offscreen left', () => {
      expect(isVisible(limits, [100, 200, 100])).toBe(false);
    });
    it('should reject offscreen right', () => {
      expect(isVisible(limits, [1000, 1100, 100])).toBe(false);
    });
  });
});

describe('🔎 binary search visibility algo', () => {
  const findVisibleItems = galleryState.findVisibleItems;
  const state = galleryState.createNewState();

  state.loadPosition = 0;
  state.offsets = [...mockGalleryOffsets];
  state.widths = [...mockGalleryWidths];

  beforeEach(() => {
    state.width = 1000;
    state.position = 700;
  });

  it('should find some values', () => {
    const visible = findVisibleItems(state);
    // console.log(visible);
    expect(visible.length > 1).toBe(true);
  });

  it('should find different values based on scroll position', () => {
    const initialVisible = findVisibleItems(state);

    expect(initialVisible.length > 1).toBe(true);

    state.position = 2100;

    const nextVisible = findVisibleItems(state);

    expect(nextVisible.length > 1).toBe(true);

    expect(initialVisible).not.toStrictEqual(nextVisible);
  });

  it('should find the same values as a linear search', () => {
    const isVisible = galleryState.isFullyVisible;
    const visible = findVisibleItems(state);
    const linearFound = [];

    const limits = galleryState.getVisibleWindow(state);

    state.offsets.forEach((offset, i) => {
      const width = state.widths[i];
      if (isVisible(limits, [offset, offset + width, width])) {
        linearFound.push(i);
      }
    });

    // console.log('📈 linear validity check:', limits, visible, linearFound);

    expect(visible).toStrictEqual(linearFound);
  });

  it('will still find values on small screens', () => {
    // based on the mock data this should be a tricky width and position
    // and will likely only leave one partially visible item
    state.width = 320;
    state.position = 1100;

    const visible = findVisibleItems(state);

    expect(visible.length).toBe(1);
  });

  it('will find the expected value on small screens', () => {
    state.width = 320;
    state.position = 1100;
    const limits = galleryState.getVisibleWindow(state);

    // find the expected position first
    const { isFullyVisible, isPartiallyVisibleLeft, isPartiallyVisibleRight } =
      galleryState;
    const { offsets, widths } = state;

    let found = null;
    let i = 0;
    while (i < offsets.length) {
      let bounds: Boundary = [offsets[i], offsets[i] + widths[i], widths[i]];

      if (
        isFullyVisible(limits, bounds) ||
        isPartiallyVisibleLeft(limits, bounds) ||
        isPartiallyVisibleRight(limits, bounds)
      ) {
        found = i;
        break;
      }

      i = i + 1;
    }

    // test the actual function
    const visible = findVisibleItems(state);

    expect(visible[0]).toBe(found);
  });

  describe('🪚 testing with irregular values', () => {
    const mockWidths = [
      180, 320, 180, 320, 180, 320, 180, 180, 361, 361, 361, 511, 320, 360, 361,
      361, 361, 180, 361, 321, 320,
    ];
    const mockOffsets = createOffsets(mockWidths, mockGallerySpacing * 2);

    const findVisibleItems = galleryState.findVisibleItems;
    const state = galleryState.createNewState();
    state.width = 1181;

    state.loadPosition = 0;
    state.offsets = [...mockOffsets];
    state.widths = [...mockWidths];

    it('will pass at given problem mid-point scroll positions', () => {
      const checkPositions = [4157, 4158, 4159, 4160, 4161, 4162];

      checkPositions.forEach((position) => {
        state.position = position;
        let visible = findVisibleItems(state);
        expect(visible.length).toBeGreaterThan(2);
        // console.log('🪵 problem position first index: ', visible[0]);
      });
    });
  });
});

describe('🦴 fetching external json data', () => {
  const { useGalleryStore } = galleryState;

  beforeEach(async () => {
    await useGalleryStore.getState().loadItems();
  });

  it('fetches the gallery data', async () => {
    expect(global.fetch).toHaveBeenCalled();
  });

  it('gets valid data', () => {
    const newState = useGalleryStore.getState();
    expect(newState.items.length > 1).toBe(true);
  });

  it('populates offsets and widths', () => {
    const newState = useGalleryStore.getState();

    expect(newState.items.length).toEqual(mockGalleryWidths.length);
    expect(newState.items.length).toEqual(newState.widths.length);
    expect(newState.items.length).toEqual(newState.offsets.length);
  });
});
