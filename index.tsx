
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { install } from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';

// Initialize Twind with the Tailwind preset for compatibility
install({
  presets: [presetTailwind()],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        }
      }
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
