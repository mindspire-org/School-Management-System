// Console warning suppression for development
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

// Comprehensive list of warnings to suppress
const suppressedWarnings = [
  'Found 2 elements with non-unique id',
  'validateDOMNesting', 
  'React Router Future Flag Warning',
  'Using kebab-case for css properties',
  'kebab-case for css properties in objects is not supported',
  'Did you mean &:hover, &[dataHover]',
  'chunk-',
  'processStyleValue',
  'background-color',
  'box-shadow',
  'transition-property',
  'emotion-serialize-development',
  'react-dom.development.js',
  'scheduler.development.js',
  'emotion-element',
  'createFromReadableStream',
  'handleInterpolation',
  'serializeStyles',
  'renderRootSync',
  'performSyncWorkOnRoot',
  'performWorkUntilDeadline',
  'workLoop',
  'flushWork',
  'commitRoot',
  'finishConcurrentRender',
  'beginWorkKill',
  'performInitWork',
  'emotion-styled-base',
  'flushSyncCallbacks',
  'commitRootImpl',
];

// More aggressive suppression function
const shouldSuppressMessage = (message) => {
  // Convert to string and check all patterns
  const messageStr = String(message).toLowerCase();
  
  return suppressedWarnings.some(warning => 
    messageStr.includes(warning.toLowerCase())
  ) || 
  // Additional pattern matching for React/CSS warnings
  messageStr.includes('kebab') ||
  messageStr.includes('css') && messageStr.includes('properties') ||
  messageStr.includes('emotion') ||
  messageStr.includes('styled') ||
  messageStr.includes('development.js') ||
  messageStr.includes('scheduler') ||
  messageStr.includes('react-dom');
};

// Suppress console.warn
console.warn = (...args) => {
  const message = args.join(' ');
  if (!shouldSuppressMessage(message)) {
    originalWarn.apply(console, args);
  }
};

// Suppress console.error (only non-critical)
console.error = (...args) => {
  const message = args.join(' ');
  
  // Don't suppress actual application errors
  if (message.includes('Uncaught') || 
      message.includes('TypeError') ||
      message.includes('ReferenceError') ||
      message.includes('SyntaxError')) {
    originalError.apply(console, args);
    return;
  }
  
  if (!shouldSuppressMessage(message)) {
    originalError.apply(console, args);
  }
};

// Also suppress console.log for development warnings
console.log = (...args) => {
  const message = args.join(' ');
  if (!shouldSuppressMessage(message)) {
    originalLog.apply(console, args);
  }
};

// Export for potential cleanup
export const restoreConsole = () => {
  console.warn = originalWarn;
  console.error = originalError;
};

export default {
  restoreConsole
};
