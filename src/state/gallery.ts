import { log } from '../utils/log';

export type GalleryState = {
  width: number;
  widths: Array<number>;
  offsets: Array<number>;
  position: number;
  loadPosition: null | number;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

export type Boundary = [number, number, number];

function createState(): GalleryState {
  return {
    width: 0,
    widths: [],
    offsets: [],
    position: 0,
    loadPosition: null,
    canScrollLeft: false,
    canScrollRight: true,
  };
}

// the intent is to convert this to a state manager.
// for now it's just a POJO.
let currentState: GalleryState = createState();

export function replaceState(tmpState?: GalleryState) {
  if (!tmpState) {
    currentState = createState();
    return;
  }

  currentState = tmpState;
}

export function getState(): GalleryState {
  return currentState;
}

export function evaluateGalleryButtons(state: GalleryState) {
  let visible = findVisibleItems(state);
  let pageSize = visible.length - 1;
  let maxIndex = state.offsets.length - 1;
  let hasStateChanged = false;

  if (visible[0] === 0) {
    if (state.canScrollLeft) {
      state.canScrollLeft = false;
      hasStateChanged = true;
    }
  } else {
    if (!state.canScrollLeft) {
      state.canScrollLeft = true;
      hasStateChanged = true;
    }
  }

  if (visible[pageSize] === maxIndex) {
    if (state.canScrollRight) {
      state.canScrollRight = false;
      hasStateChanged = true;
    }
  } else {
    if (!state.canScrollRight) {
      state.canScrollRight = true;
      hasStateChanged = true;
    }
  }
    // probably don't need to do anything here when converted to zustand
    // previously, this would be where we triggered a re-draw or updated the dom etc
  return hasStateChanged;
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


