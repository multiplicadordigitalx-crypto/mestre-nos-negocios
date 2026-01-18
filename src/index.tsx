import './index.css';
import * as React from 'react';
import { StrictMode } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Robustly retrieve createRoot to handle differences in CDN ESM builds
// Some CDNs export named 'createRoot', others export a 'default' object containing it.
const createRoot = (ReactDOMClient as any).createRoot || (ReactDOMClient as any).default?.createRoot;

if (typeof createRoot !== 'function') {
  throw new Error("React DOM createRoot function not found. Check module imports.");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
