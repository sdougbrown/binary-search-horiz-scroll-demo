import React, { useCallback, useEffect, useRef } from 'react';
import { useGalleryStore } from '../../state';
import { useShallow } from 'zustand/react/shallow'
import { debounce } from '../../utils/debounce';
import { log } from '../../utils/log';

import { ChevronLeft, ChevronRight } from '../../icons/chevrons';

import './style.scss';


type NavProps = {
  direction: 'left' | 'right';
  onPress: () => void;
};

export function GalleryNav({ direction, onPress }) {
  const canScroll = useGalleryStore(state => direction === 'left' ? state.canScrollLeft : state.canScrollRight);
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <span className={`gallery-strip__nav gallery-strip__nav--${direction}${canScroll ? '' : ' is-disabled'}`}>
      <Icon />
    </span>
  );
}

export function GalleryItem() {
}

function Gallery() {
  const scroller = useRef(null);
  const [
    items,
    loadItems,
    getVisibleItems,
    updateNavigation,
    setLoadPosition,
    setPosition,
    setWidth,
    setItem,
  ] = useGalleryStore(useShallow(state => ([
    state.items,
    state.loadItems,
    state.getVisibleItems,
    state.updateNavigation,
    state.setLoadPosition,
    state.setPosition,
    state.setWidth,
    state.setItem
  ])));

  useEffect(() => {
    if (items.length < 1) {
      log('loading gallery', items);
      loadItems();
    }
  }, [items]);

  const onScroll = useCallback(debounce(() => {
    updateNavigation();
  }, 64), [setPosition, updateNavigation]);

  const onNextPage = useCallback(() => {
    let visible = findVisibleItems();
    let pageSize = visible.length;
    let maxIdx = galleryState.offsets.length - 1;
    let next = Math.min(maxIdx, visible[pageSize - 1] + 1);
    log('⏭️ Next Page Index: ', next);

    if (isNaN(next)) {
      log('🐛 Page Selection Debug: ', visible, galleryState)
    }

    if (next && scroller.current) {
      log(scroller.current);
      // manually scroll here
    }
  }, [scroller.current]);

  const onPrevPage = useCallback(() => {
    var visible = findVisibleItems();
    var prev = Math.max(0, visible[0] - 1);
    log('⏮️ Prev Page Index: ', prev);

    if (isNaN(prev)) {
      log('🐛 Page Selection Debug: ', visible, galleryState)
    }

    if (!isNaN(prev) && scroller.current) {
      // skip jumping to the second index and just go to the start
      prev = prev === 1 ? 0 : prev;
      // manually scroll here
      log(scroller.current);
    }
  }, [scroller.current]);

  return (
    <div className="gallery-wrapper">
      <ul className="gallery-strip" ref={scroller} onScroll={onScroll}>
        <div className="gallery-strip__wrapper">

        </div>
        <GalleryNav direction="left" onPress={onPrevPage} />
        <GalleryNav direction="right" onPress={onNextPage} />
      </ul>
    </div>
  )
}

export default Gallery

