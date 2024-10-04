import * as galleryState from './gallery';

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

  return mockGalleryWidths[i - 1] + mockGallerySpacing * 2;
});

test('📀 mock data validity', () => {
  expect(mockGalleryWidths.length).toEqual(mockGalleryOffsets.length);
});

test('⚙️  initial gallery setup', () => {
  expect(galleryState.getState).toBeTruthy();

  const initialState = galleryState.getState();

  expect(initialState.width).toBe(0);
  expect(initialState.position).toBe(0);
});

test('🔄 gallery state modification and reset', () => {
  const initialState = galleryState.getState();
  // modify some things
  initialState.width = 1000;
  initialState.position = 70;
  initialState.loadPosition = 0;
  initialState.widths.push(200);
  initialState.widths.push(100);
  initialState.widths.push(300);

  const nextState = galleryState.getState();

  expect(nextState).toBe(initialState);

  galleryState.replaceState();

  const newState = galleryState.getState();

  expect(newState).not.toBe(nextState);

  galleryState.replaceState();
});


