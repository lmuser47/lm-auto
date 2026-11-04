'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import type { VehicleImage } from '../lib/api';
import { VehicleArt } from './VehicleCard';

export default function VehicleGallery({ images, title }: { images: VehicleImage[]; title: string }) {
  // Reset selection if switching to a vehicle with a different photo collection.
  return <Gallery key={images.map(image => image.id + ':' + image.url).join('|')} images={images} title={title} />;
}

function Gallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const viewer = useRef<HTMLDialogElement>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const ignoreClickUntil = useRef(0);
  const multiple = images.length > 1;
  const current = images[selected];

  useEffect(() => {
    thumbnails.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected]);

  useEffect(() => {
    if (!expanded) return;
    const dialog = viewer.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  if (!current) return <VehicleArt />;

  function move(direction: number) {
    setSelected(index => (index + direction + images.length) % images.length);
  }

  function keyboard(event: KeyboardEvent) {
    if (!multiple) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  function startSwipe(event: TouchEvent) {
    if (event.touches.length !== 1) { touchStart.current = null; return; }
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  function endSwipe(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (multiple && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      ignoreClickUntil.current = Date.now() + 400;
      move(dx < 0 ? 1 : -1);
    }
  }

  function photo(fullscreen = false) {
    return failed[current.url]
      ? <div className="gallery-unavailable" role="status">Photo unavailable. {multiple && 'Try another photo.'}</div>
      : <img className={fullscreen ? 'gallery-full-image' : 'gallery-main'} src={current.url}
          alt={`${title} — photo ${selected + 1} of ${images.length}`} draggable={false}
          onError={() => setFailed(previous => ({ ...previous, [current.url]: true }))} />;
  }

  function arrows() {
    return multiple && <>
      <button type="button" className="gallery-arrow gallery-prev" aria-label="Previous photo" onClick={() => move(-1)}>‹</button>
      <button type="button" className="gallery-arrow gallery-next" aria-label="Next photo" onClick={() => move(1)}>›</button>
    </>;
  }

  return <section className="vehicle-gallery" aria-label={`${title} photos`} onKeyDown={keyboard}>
    <div className="gallery-stage" onTouchStart={startSwipe} onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null; }}>
      <button type="button" className="gallery-expand" aria-label={`Open photo ${selected + 1} fullscreen`}
        onClick={() => { if (Date.now() > ignoreClickUntil.current) setExpanded(true); }}>
        {photo()}<span className="gallery-expand-label">⤢ &nbsp; View fullscreen</span>
      </button>
      {arrows()}
      <span className="gallery-counter" aria-live="polite" aria-atomic="true">{selected + 1} / {images.length}</span>
    </div>
    {multiple && <div className="gallery-thumbnails" ref={thumbnails} aria-label="Choose a photo">
      {images.map((image, index) => <button type="button" key={image.id}
        aria-label={`View photo ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
        <img src={image.url} alt="" loading="lazy" /><span>{index + 1}</span>
      </button>)}
    </div>}
    <dialog className="gallery-lightbox" ref={viewer} aria-label={`${title} fullscreen photos`} onClose={() => setExpanded(false)}>
      <div className="gallery-lightbox-top"><span>{title}</span><button type="button" autoFocus className="gallery-close" aria-label="Close fullscreen photos" onClick={() => setExpanded(false)}>✕</button></div>
      <div className="gallery-full-stage" onTouchStart={startSwipe} onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null; }}>
        {photo(true)}{arrows()}
      </div>
      <div className="gallery-lightbox-bottom"><span aria-live="polite" aria-atomic="true">{selected + 1} / {images.length}</span><span>{multiple ? 'Swipe or use ← → to browse · ' : ''}Esc to close</span></div>
    </dialog>
  </section>;
}
