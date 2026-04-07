import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import * as Babel from '@babel/standalone';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Error Boundary to catch runtime errors in the generated component
class JSXErrorBoundary extends Component<{ children: ReactNode; fallback: (error: string) => ReactNode }, { hasError: boolean; error: string | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("JSX Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error || "Unknown runtime error");
    }
    return this.props.children;
  }
}

interface JSXRendererProps {
  code: string;
  className?: string;
}

export default function JSXRenderer({ code, className }: JSXRendererProps) {
  const [GeneratedComponent, setGeneratedComponent] = useState<React.ComponentType | null>(null);
  const [transpileError, setTranspileError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const transpile = async () => {
      try {
        // 1. Clean up the code: remove imports and exports
        let processedCode = code
          .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '') // Remove imports
          .replace(/export\s+default\s+/, 'const ArtifyComponent = ') // Replace export default
          .replace(/export\s+/, ''); // Remove other exports

        // If no component was named, find the function
        if (!processedCode.includes('const ArtifyComponent = ')) {
          const functionMatch = processedCode.match(/function\s+(\w+)\s*\(/);
          if (functionMatch) {
            processedCode += `\nconst ArtifyComponent = ${functionMatch[1]};`;
          } else {
            // If still no component, try to wrap the whole thing if it looks like a component body
            // or just throw error if it's too ambiguous
            if (processedCode.trim().startsWith('(') || processedCode.trim().startsWith('<')) {
               processedCode = `const ArtifyComponent = () => (${processedCode});`;
            }
          }
        }

        // 2. Transpile with Babel
        const transformed = Babel.transform(processedCode, {
          presets: ['react', 'typescript'],
          filename: 'artifact.tsx'
        }).code;

        if (!transformed) throw new Error('Transpilation failed: Babel returned empty code.');

        // 3. Create the component function
        const scope: Record<string, any> = {
          React,
          ...LucideIcons,
          motion,
          AnimatePresence,
          // Add common hooks to scope just in case they are used without React. prefix
          useState: React.useState,
          useEffect: React.useEffect,
          useMemo: React.useMemo,
          useCallback: React.useCallback,
          useRef: React.useRef,
          useContext: React.useContext,
          useReducer: React.useReducer,
          useLayoutEffect: React.useLayoutEffect,
        };

        // Protected globals that often cause "Cannot set property" errors
        const protectedGlobals = ['fetch', 'location', 'history', 'navigator', 'screen', 'window', 'document', 'self', 'globalThis'];
        
        const filteredKeys: string[] = [];
        const filteredValues: any[] = [];

        // Add scope items
        Object.entries(scope).forEach(([key, value]) => {
          filteredKeys.push(key);
          filteredValues.push(value);
        });

        // Create a safe proxy for window/self/globalThis
        const createSafeGlobal = (original: any) => {
          return new Proxy(original, {
            get(target, prop) {
              const value = target[prop];
              if (typeof value === 'function') {
                return value.bind(target);
              }
              return value;
            },
            set(target, prop, value) {
              if (protectedGlobals.includes(prop as string)) {
                console.warn(`Prevented overwrite of protected global: ${String(prop)}`);
                return true; 
              }
              try {
                target[prop] = value;
              } catch (e) {
                // Ignore errors
              }
              return true;
            }
          });
        };

        const safeWindow = createSafeGlobal(window);

        // We will NOT pass protected globals as parameters to the Function constructor
        // to avoid "Identifier 'x' has already been declared" if the code uses const/let.
        // Instead, we will inject a preamble that shadows them using 'var'.
        const preamble = protectedGlobals
          .filter(g => !['window', 'self', 'globalThis'].includes(g))
          .map(g => `var ${g} = window.${g};`)
          .join('\n');

        // Add safe window reference to scope as a hidden argument
        // We'll use a unique name that won't collide with user code
        const SAFE_WINDOW_KEY = '__ARTIFY_SAFE_WINDOW__';
        filteredKeys.push(SAFE_WINDOW_KEY);
        filteredValues.push(safeWindow);
        
        const componentFactory = new Function(...filteredKeys, `
          "use strict";
          const window = ${SAFE_WINDOW_KEY};
          const self = window;
          const globalThis = window;
          
          return (function() {
            ${preamble}
            // Wrap transformed code in a block to allow user to redeclare globals with const/let
            try {
              ${transformed}
              if (typeof ArtifyComponent === 'undefined') {
                return null;
              }
              return ArtifyComponent;
            } catch (e) {
              // If execution fails, we try to find the component in the scope
              if (typeof ArtifyComponent !== 'undefined') return ArtifyComponent;
              throw e;
            }
          })();
        `);
        
        const ResultComponent = componentFactory(...filteredValues);

        if (!ResultComponent) {
          throw new Error('No component found. Ensure you have a default export or a main function.');
        }

        if (isMounted) {
          setGeneratedComponent(() => ResultComponent);
          setTranspileError(null);
        }
      } catch (err) {
        console.error('JSX Transpile Error:', err);
        if (isMounted) {
          setTranspileError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    transpile();
    return () => { isMounted = false; };
  }, [code]);

  const renderError = (msg: string) => (
    <div className="p-8 bg-zinc-900 border border-red-500/30 rounded-3xl text-red-400 font-mono text-sm overflow-auto max-w-full shadow-2xl">
      <div className="flex items-center gap-3 mb-4 text-red-500">
        <LucideIcons.AlertCircle className="w-6 h-6" />
        <span className="font-bold text-lg">Execution Error</span>
      </div>
      <pre className="whitespace-pre-wrap bg-black/50 p-4 rounded-xl border border-white/5">{msg}</pre>
    </div>
  );

  if (transpileError) {
    return renderError(transpileError);
  }

  if (!GeneratedComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Compiling component...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <JSXErrorBoundary fallback={renderError}>
        <GeneratedComponent />
      </JSXErrorBoundary>
    </div>
  );
}
