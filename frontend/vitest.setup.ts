/// <reference types="vite/client" />
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Variable d'environnement requise par @/core/config/api.ts
// (utilisée dans buildUrl, n'a pas besoin d'être réelle car request est mocké)
if (!import.meta.env.VITE_API_URL) {
  (import.meta.env as Record<string, string>).VITE_API_URL =
    'http://localhost:3001';
}

// Stub jsdom : matchMedia (utilisé par certains composants shadcn)
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// Stub jsdom : IntersectionObserver
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IntersectionObserverStub {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  });
}

// Stub jsdom : HTMLCanvasElement.getContext (utilisé par react-secure-storage)
if (typeof HTMLCanvasElement !== 'undefined') {
  const proto = HTMLCanvasElement.prototype as unknown as {
    getContext: () => unknown;
  };
  proto.getContext = () => ({
    fillRect: () => undefined,
    clearRect: () => undefined,
    getImageData: () => ({ data: new Uint8ClampedArray() }),
    putImageData: () => undefined,
    createImageData: () => ({ data: new Uint8ClampedArray() }),
    setTransform: () => undefined,
    drawImage: () => undefined,
    save: () => undefined,
    fillText: () => undefined,
    restore: () => undefined,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    closePath: () => undefined,
    stroke: () => undefined,
    translate: () => undefined,
    scale: () => undefined,
    rotate: () => undefined,
    arc: () => undefined,
    fill: () => undefined,
    measureText: () => ({ width: 0 }),
    transform: () => undefined,
    rect: () => undefined,
    clip: () => undefined,
    textBaseline: '',
    font: '',
    fillStyle: '',
    strokeStyle: '',
    toDataURL: () => '',
  });
}

afterEach(() => {
  cleanup();
});
