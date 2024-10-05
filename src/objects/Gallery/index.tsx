import React, { useCallback, useEffect, useRef } from 'react';
import { useGalleryStore } from '../../state';
import { useShallow } from 'zustand/react/shallow'
import { debounce } from '../../utils/debounce';
import { log } from '../../utils/log';

import { ChevronLeft, ChevronRight } from '../../icons/chevrons';

import type { GalleryItem } from '../../state/gallery';

import './style.scss';

type NavProps = {
  direction: 'left' | 'right';
  onPress: () => void;
};

export function GalleryNav({ direction, onPress }: NavProps) {
  const canScroll = useGalleryStore(state => direction === 'left' ? state.canScrollLeft : state.canScrollRight);
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <span
      onClick={onPress}
      className={`gallery-strip__nav gallery-strip__nav--${direction}${canScroll ? '' : ' is-disabled'}`}
    >
      <Icon />
    </span>
  );
}

type ItemProps = {
  index: number;
  item: GalleryItem;
  onImageLoad: (e, i: number) => void;
};

export function GalleryItem(props: ItemProps) {
  const { item, index, onImageLoad } = props;

  return (
    <li className="gallery-strip__item">
      <img
        src={item.src}
        alt={item.alt}
        onLoad={(e) => onImageLoad(e, index)}
      />
    </li>
  );
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

  const onScroll = useCallback(debounce((e) => {
    log(e, scroller.current);
    setPosition(e.target.scrollLeft);

    updateNavigation();
  }, 64), [setPosition, updateNavigation]);

  const onImageLoad = useCallback((e, i) => {
    setItem(e.target.offsetWidth, e.target.x, i);
  }, [setItem]);

  const onNextPage = useCallback(() => {
    let visible = getVisibleItems();
    let pageSize = visible.length;
    let maxIdx = items.length - 1;
    let next = Math.min(maxIdx, visible[pageSize - 1] + 1);
    log('⏭️ Next Page Index: ', next);

    if (isNaN(next)) {
      log('🐛 Page Selection Debug: ', visible, useGalleryStore.getState())
    }

    if (next && scroller.current) {
      // manually scroll here
      let node = scroller.current.firstChild.childNodes[next];
      if (node && node.scrollIntoView && next < maxIdx - pageSize) {
        node.scrollIntoView({
          block: 'nearest',
          inline: 'start',
          behavior: 'smooth'
        });
      } else {
        scroller.current.scroll({
          top: 0,
          left: useGalleryStore.getState().offsets[next],
          behavior: 'smooth'
        });
      }
    }
  }, [scroller.current]);

  const onPrevPage = useCallback(() => {
    var visible = getVisibleItems();
    var prev = Math.max(0, visible[0] - 1);
    log('⏮️ Prev Page Index: ', prev);

    if (isNaN(prev)) {
      log('🐛 Page Selection Debug: ', visible, useGalleryStore.getState())
    }

    if (!isNaN(prev) && scroller.current) {
      // skip jumping to the second index and just go to the start
      prev = prev === 1 ? 0 : prev;

      // manually scroll here
      let node = scroller.current.firstChild.childNodes[prev];
      if (node && node.scrollIntoView) {
        node.scrollIntoView({
          block: 'nearest',
          inline: 'start',
          behavior: 'smooth'
        });
      } else {
        scroller.current.scroll({
          top: 0,
          left: Math.max(0, useGalleryStore.getState().offsets[prev]),
          behavior: 'smooth'
        });
      }
    }
  }, [scroller.current]);

  return (
    <div className="gallery-wrapper">
      <ul className="gallery-strip" ref={scroller} onScroll={onScroll}>
        <div className="gallery-strip__wrapper">
          {items.map((item, index) => (
            <GalleryItem
              key={item.id}
              index={index}
              item={item}
              onImageLoad={onImageLoad}
            />
          ))}
        </div>
        <GalleryNav direction="left" onPress={onPrevPage} />
        <GalleryNav direction="right" onPress={onNextPage} />
      </ul>
    </div>
  );
}

export default Gallery

