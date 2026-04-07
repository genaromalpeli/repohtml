import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Protection: Make common globals writable to prevent "Cannot set property" errors
// from AI-generated code that attempts to overwrite them.
(function() {
  const protectedGlobals = ['fetch', 'location', 'history', 'navigator', 'screen'];
  protectedGlobals.forEach(prop => {
    try {
      const original = (window as any)[prop];
      Object.defineProperty(window, prop, {
        value: original,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      // If we can't make it writable on the instance, try the prototype
      try {
        const proto = Object.getPrototypeOf(window);
        const original = proto[prop];
        Object.defineProperty(proto, prop, {
          get: function() { return (this as any)['__' + prop] !== undefined ? (this as any)['__' + prop] : original; },
          set: function(v) { (this as any)['__' + prop] = v; },
          configurable: true
        });
      } catch (e2) {
        console.warn(`Could not protect global property: ${prop}`);
      }
    }
  });
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
