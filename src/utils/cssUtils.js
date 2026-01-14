// CSS utility functions

/**
 * Convert kebab-case CSS properties to camelCase for React/JS
 * @param {string} cssProperty - kebab-case CSS property
 * @returns {string} - camelCase CSS property
 */
export const kebabToCamelCase = (cssProperty) => {
  return cssProperty.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase CSS properties back to kebab-case for CSS strings
 * @param {string} camelProperty - camelCase CSS property  
 * @returns {string} - kebab-case CSS property
 */
export const camelToKebabCase = (camelProperty) => {
  return camelProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Fix transition property values to use proper CSS property names
 * @param {string} transitionValue - transition property value
 * @returns {string} - corrected transition property value
 */
export const fixTransitionProperty = (transitionValue) => {
  if (!transitionValue) return transitionValue;
  
  // Common CSS property mappings for transitions
  const propertyMappings = {
    'box-shadow': 'boxShadow',
    'background-color': 'backgroundColor', 
    'border-color': 'borderColor',
    'text-color': 'color',
    'font-size': 'fontSize',
    'line-height': 'lineHeight',
    'margin-top': 'marginTop',
    'margin-bottom': 'marginBottom',
    'padding-top': 'paddingTop',
    'padding-bottom': 'paddingBottom',
  };
  
  // Replace kebab-case properties in the transition string
  let fixed = transitionValue;
  Object.entries(propertyMappings).forEach(([kebab, camel]) => {
    fixed = fixed.replace(new RegExp(kebab, 'g'), kebab); // Keep as kebab for CSS strings
  });
  
  return fixed;
};

/**
 * Validate and clean CSS property object
 * @param {Object} styleObject - CSS properties object
 * @returns {Object} - cleaned CSS properties object
 */
export const cleanCSSProperties = (styleObject) => {
  if (!styleObject || typeof styleObject !== 'object') return styleObject;
  
  const cleaned = {};
  
  Object.entries(styleObject).forEach(([key, value]) => {
    // Convert kebab-case keys to camelCase
    const camelKey = kebabToCamelCase(key);
    cleaned[camelKey] = value;
  });
  
  return cleaned;
};

/**
 * Create safe inline styles for React components
 * @param {Object} styles - styles object
 * @returns {Object} - React-safe styles object
 */
export const createSafeStyles = (styles) => {
  const safeStyles = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    // Ensure property names are camelCase
    const safeProp = kebabToCamelCase(key);
    safeStyles[safeProp] = value;
  });
  
  return safeStyles;
};

export default {
  kebabToCamelCase,
  camelToKebabCase, 
  fixTransitionProperty,
  cleanCSSProperties,
  createSafeStyles,
};
