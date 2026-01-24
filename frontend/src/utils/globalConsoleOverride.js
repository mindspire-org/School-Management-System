// Global console override for aggressive warning suppression

// Store original console methods
const originalConsole = {
  log: window.console.log,
  warn: window.console.warn,
  error: window.console.error,
  info: window.console.info,
  debug: window.console.debug,
};

// Patterns to completely block
const blockPatterns = [
  /kebab-case/i,
  /css.*properties/i,
  /emotion-serialize/i,
  /react-dom\.development/i,
  /scheduler\.development/i,
  /emotion-element/i,
  /styled-components/i,
  /createFromReadableStream/i,
  /handleInterpolation/i,
  /serializeStyles/i,
  /processStyleValue/i,
  /emotion-styled-base/i,
  /validateDOMNesting/i,
  /chunk-.*\.js/i,
  /development\.esm\.js/i,
];

// Keywords that indicate development warnings
const developmentKeywords = [
  'emotion',
  'styled',
  'kebab',
  'css properties',
  'development.js',
  'scheduler',
  'react-dom',
  'chunk-',
];

// Function to check if message should be suppressed
const shouldBlock = (message) => {
  const messageStr = String(message).toLowerCase();
  
  // Check regex patterns
  if (blockPatterns.some(pattern => pattern.test(messageStr))) {
    return true;
  }
  
  // Check keyword combinations
  const hasMultipleKeywords = developmentKeywords.filter(keyword => 
    messageStr.includes(keyword)
  ).length >= 2;
  
  return hasMultipleKeywords;
};

// Override console methods
window.console.warn = (...args) => {
  const message = args.join(' ');
  if (!shouldBlock(message)) {
    originalConsole.warn.apply(window.console, args);
  }
};

window.console.error = (...args) => {
  const message = args.join(' ');
  
  // Always show critical errors
  if (message.includes('Uncaught') || 
      message.includes('TypeError') ||
      message.includes('ReferenceError') ||
      message.includes('SyntaxError') ||
      message.includes('Network Error') ||
      message.includes('Failed to fetch')) {
    originalConsole.error.apply(window.console, args);
    return;
  }
  
  if (!shouldBlock(message)) {
    originalConsole.error.apply(window.console, args);
  }
};

window.console.log = (...args) => {
  const message = args.join(' ');
  if (!shouldBlock(message)) {
    originalConsole.log.apply(window.console, args);
  }
};

window.console.info = (...args) => {
  const message = args.join(' ');
  if (!shouldBlock(message)) {
    originalConsole.info.apply(window.console, args);
  }
};

// Also override the global console object
if (typeof global !== 'undefined') {
  global.console = window.console;
}

// Add event listener to catch and suppress window errors
window.addEventListener('error', (event) => {
  if (shouldBlock(event.message)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (shouldBlock(String(event.reason))) {
    event.preventDefault();
    return false;
  }
});

// Export restore function
export const restoreOriginalConsole = () => {
  Object.assign(window.console, originalConsole);
};

// Silent mode - suppress everything except critical errors
export const enableSilentMode = () => {
  window.console.warn = () => {};
  window.console.log = () => {};
  window.console.info = () => {};
  window.console.debug = () => {};
  
  window.console.error = (...args) => {
    const message = args.join(' ');
    // Only show truly critical errors
    if (message.includes('Uncaught') || 
        message.includes('TypeError') ||
        message.includes('ReferenceError') ||
        message.includes('SyntaxError')) {
      originalConsole.error.apply(window.console, args);
    }
  };
};

// Enable by default in development
if (process.env.NODE_ENV === 'development') {
  console.log('%c🔇 Console warnings suppressed for clean development', 'color: #00C49F; font-weight: bold');
}

export default {
  restoreOriginalConsole,
  enableSilentMode,
};
