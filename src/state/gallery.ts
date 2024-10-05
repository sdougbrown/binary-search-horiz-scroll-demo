import { create } from 'zustand';
import { produce } from 'immer';
import { log } from '../utils/log';

// this is very project-specific obviously, don't copy this mess
const GALLERY_JSON = '/gallery.json';

export type Boundary = [number, number, number];

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

export type GalleryState = {
  width: number;
  items: Array<GalleryItem>;
  widths: Array<number>;
  offsets: Array<number>;
  position: number;
  loadPosition: null | number;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

export type GalleryActions = {
  getVisibleItems: () => Array<number>;
  loadItems: () => Promise<void>;
  updateNavigation: () => void;
  setLoadPosition: (p: number) => void;
  setPosition: (p: number) => void;
  setWidth: (w: number) => void;
  setItem: (w: number, x: number, i: number) => void;
};

export type GalleryStore = GalleryState & GalleryActions;

export function createNewState(): GalleryState {
  return {
    width: 0,
    items: [],
    widths: [],
    offsets: [],
    position: 0,
    loadPosition: null,
    canScrollLeft: false,
    canScrollRight: true,
  };
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  ...createNewState(),
  loadItems: async () => {
    if (get().items.length > 1) {
      return;
    }
    try {
      const response = await fetch(GALLERY_JSON);
      const items = await response.json();

      set({
        ...get(),
        items,
        widths: Array(items.length).fill(void 0),
        offsets: Array(items.length).fill(void 0),
      });
    } catch (e) {
      log('💥 you did something wrong: ', e);
    }
  },
  getVisibleItems: () => {
    return findVisibleItems(get() as GalleryState);
  },
  updateNavigation: () => set(produce(state => evaluateGalleryButtons(state as GalleryState))),
  setLoadPosition: (position: number) => set(produce(
    state => {
      log('setting load position', position);
      state.loadPosition = position;
      state.offsets.forEach((offset, i) => {
        if (isNaN(offset)) {
          return;
        }
        state.offsets[i] = offset + position;
      });
      return state;
    }
  )),
  setPosition: (position: number) => set(produce(
    state => {
      log('setting position', position);
      state.position = position;
      return state;
    }
  )),
  setWidth: (width: number) => set(produce(state => {
      log('setting width', width);
      state.width = width;
      return state;
    }
  )),
  // the below setters are unique and kind of an anti-pattern.
  // intentionally modifying inline rather than doing a shallow clone
  // because it does not have an effect on render cycles etc and we don't
  // want it to! this will fire a lot on page load and through scrolling
  // we don't want those cycles to fire a re-render, but the underlying state
  // will effect the evaluations done above
  setItem: (width: number, x: number, index: number) => set(
    state => {
      log('setting item', index, width, x);
      state.widths[index] = width;
      state.offsets[index] = x + (state.loadPosition || 0);
      return state;
    }
  ),
}));

export const getState = useGalleryStore.getState;

export function evaluateGalleryButtons(state: GalleryState) {
  let visible = findVisibleItems(state);
  let pageSize = visible.length - 1;
  let maxIndex = state.offsets.length - 1;

  if (visible[0] === 0) {
    if (state.canScrollLeft) {
      state.canScrollLeft = false;
    }
  } else {
    if (!state.canScrollLeft) {
      state.canScrollLeft = true;
    }
  }

  if (visible[pageSize] === maxIndex) {
    if (state.canScrollRight) {
      state.canScrollRight = false;
    }
  } else {
    if (!state.canScrollRight) {
      state.canScrollRight = true;
    }
  }

  return state;
}

export function getVisibleWindow(state: GalleryState): Boundary {
  return [state.position, state.position + state.width, state.width];
};

export function isFullyVisible(limits: Boundary, bounds: Boundary) {
  return limits[0] < bounds[0] && limits[1] > bounds[1];
}

export function isPartiallyVisibleLeft(limits: Boundary, bounds: Boundary) {
  return Math.max(0, limits[0] - bounds[2]) < bounds[0] && limits[1] > bounds[1];
}

export function isPartiallyVisibleRight(limits: Boundary, bounds: Boundary) {
  var maxWidth = limits[0] + limits[1];

  return Math.min(limits[1] + bounds[2], maxWidth) > bounds[1] && limits[0] < bounds[0];
}

export function findVisibleItems(state: GalleryState) {
  let offsets = state.offsets;
  let widths = state.widths;
  let limits = getVisibleWindow(state);

  let visible = [];

  let start = 0;
  let end = offsets.length - 1;

  let maxWidth = limits[0] + limits[1];

  while (start <= end) {
    let middle = Math.floor((start + end) / 2);
    let bounds: Boundary = [offsets[middle], offsets[middle] + widths[middle], widths[middle]];

    let isFull = isFullyVisible(limits, bounds);
    let isPartialLeft = !isFull && isPartiallyVisibleLeft(limits, bounds);
    let isPartialRight = !isFull && isPartiallyVisibleRight(limits, bounds);

    if (isFull || isPartialLeft || isPartialRight) {
      // found a visible position!
      log('✅ Match found: ', middle);

      // now we just need to walk to find the start, starting left
      if (isFullyVisible) {
        visible.push(middle);
      }

      // reset atart/stop so that we don't exit too early
      start = 0;
      end = offsets.length;

      let step = middle;
      while (step > start && !isPartialLeft) {
        step = step - 1;
        log('🚶 left stepping: ', step);
        // check how close to the left edge it is
        let positionDiff = Math.max(0, offsets[step] - limits[0]);
        if (positionDiff < offsets[step] + widths[step]) {
          // less distance than the given width
          // just check to see if the previous item is smaller too
          visible.push(step);
          if (positionDiff < widths[step - 1]) {
            // starting position is one item before the established visible item
            start = step - 1;
            visible.push(start);
            break;
          }
        }
      }
      step = middle;
      // now walk right to make sure we have both sides
      while (step < end && !isPartialRight) {
        step = step + 1;
        log('🚶 right stepping: ', step);
        if (limits[1] > offsets[step] + widths[step]) {
          visible.push(step);
        } else {
          end = step;
          break;
        }
      }
      break;
    } else if (limits[1] <= bounds[1]) {
      log('🔎 searching left: ', start, middle, end, limits[1], bounds);
      // offscreen right, search left
      end = middle - 1;
    } else {
      log('🔎 searching right: ', start, middle, end, limits[1], bounds);
      // searched too far right, go back and search left
      start = middle + 1;
    }
  }

  return visible.sort((a, b) => {
    return a - b;
  });
};

export default useGalleryStore;

