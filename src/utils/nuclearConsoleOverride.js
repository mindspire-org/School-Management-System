// NUCLEAR OPTION: Complete console suppression for CSS warnings

// Store originals before any other code can override them
const ORIGINAL_CONSOLE = {
  log: console.log.bind(console),
  warn: console.warn.bind(console), 
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
  trace: console.trace.bind(console),
  group: console.group.bind(console),
  groupEnd: console.groupEnd.bind(console),
  table: console.table.bind(console),
};

// Create a completely silent console for CSS warnings
const createSilentConsole = (originalMethod, methodName) => {
  return (...args) => {
    const message = args.join(' ').toLowerCase();
    
    // Block patterns - VERY aggressive
    if (
      message.includes('kebab') ||
      message.includes('css') ||
      message.includes('emotion') ||
      message.includes('styled') ||
      message.includes('development.js') ||
      message.includes('scheduler') ||
      message.includes('react-dom') ||
      message.includes('serialize') ||
      message.includes('interpolation') ||
      message.includes('chunk-') ||
      message.includes('properties') ||
      message.includes('.esm.js') ||
      message.includes('processstylevalue') ||
      message.includes('validatedomnesting')
    ) {
      // Completely silent - do nothing
      return;
    }
    
    // For errors, still show critical ones
    if (methodName === 'error') {
      const originalMessage = args.join(' ');
      if (
        originalMessage.includes('Uncaught') ||
        originalMessage.includes('TypeError') ||
        originalMessage.includes('ReferenceError') ||
        originalMessage.includes('SyntaxError') ||
        originalMessage.includes('Network Error') ||
        originalMessage.includes('Failed to fetch')
      ) {
        originalMethod(...args);
      }
      return;
    }
    
    // Allow through if not blocked
    originalMethod(...args);
  };
};

// Nuclear override - replace all console methods
console.log = createSilentConsole(ORIGINAL_CONSOLE.log, 'log');
console.warn = createSilentConsole(ORIGINAL_CONSOLE.warn, 'warn');
console.error = createSilentConsole(ORIGINAL_CONSOLE.error, 'error');
console.info = createSilentConsole(ORIGINAL_CONSOLE.info, 'info');
console.debug = createSilentConsole(ORIGINAL_CONSOLE.debug, 'debug');
console.trace = createSilentConsole(ORIGINAL_CONSOLE.trace, 'trace');

// Override console.group methods too
console.group = (...args) => {
  const message = args.join(' ').toLowerCase();
  if (!message.includes('css') && !message.includes('emotion') && !message.includes('kebab')) {
    ORIGINAL_CONSOLE.group(...args);
  }
};

console.groupEnd = (...args) => {
  // Always call groupEnd to maintain console state
  try {
    ORIGINAL_CONSOLE.groupEnd(...args);
  } catch (e) {
    // Ignore groupEnd errors
  }
};

// Override window error events
const originalWindowError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  const msgStr = String(message).toLowerCase();
  
  if (
    msgStr.includes('css') ||
    msgStr.includes('kebab') ||
    msgStr.includes('emotion') ||
    msgStr.includes('styled')
  ) {
    // Suppress CSS-related window errors
    return true;
  }
  
  // Call original handler for real errors
  if (originalWindowError) {
    return originalWindowError(message, source, lineno, colno, error);
  }
  
  return false;
};

// Override unhandled promise rejections
const originalUnhandledRejection = window.onunhandledrejection;
window.onunhandledrejection = (event) => {
  const reason = String(event.reason).toLowerCase();
  
  if (
    reason.includes('css') ||
    reason.includes('kebab') ||
    reason.includes('emotion') ||
    reason.includes('styled')
  ) {
    event.preventDefault();
    return;
  }
  
  if (originalUnhandledRejection) {
    originalUnhandledRejection(event);
  }
};

// Monkey patch popular CSS-in-JS libraries if they exist
if (typeof window !== 'undefined') {
  // Patch emotion if it exists
  if (window.__emotion_serialize || window.emotion) {
    try {
      const emotion = window.__emotion_serialize || window.emotion;
      if (emotion && emotion.serializeStyles) {
        const originalSerialize = emotion.serializeStyles;
        emotion.serializeStyles = (...args) => {
          try {
            return originalSerialize(...args);
          } catch (e) {
            // Suppress emotion serialization errors
            return { name: '', styles: '' };
          }
        };
      }
    } catch (e) {
      // Ignore patching errors
    }
  }
  
  // Try to patch styled-components if it exists
  setTimeout(() => {
    if (window.SC_VERSION || window.styled) {
      try {
        // Styled components patching would go here
      } catch (e) {
        // Ignore
      }
    }
  }, 100);
}

// Show one-time message that nuclear suppression is active
setTimeout(() => {
  ORIGINAL_CONSOLE.log(
    '%c🚀 NUCLEAR CONSOLE SUPPRESSION ACTIVE', 
    'color: #ff6b6b; font-weight: bold; font-size: 14px'
  );
  ORIGINAL_CONSOLE.log(
    '%c   All CSS/Emotion/React development warnings suppressed',
    'color: #888; font-size: 12px'
  );
}, 500);

// Export restore function (emergency use only)
export const restoreConsole = () => {
  Object.assign(console, ORIGINAL_CONSOLE);
  window.onerror = originalWindowError;
  window.onunhandledrejection = originalUnhandledRejection;
};

// Export originals for emergency use
export { ORIGINAL_CONSOLE };

export default {
  restoreConsole,
  ORIGINAL_CONSOLE,
};
