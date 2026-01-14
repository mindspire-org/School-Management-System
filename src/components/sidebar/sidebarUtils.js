// Utility functions for sidebar management

/**
 * Get all active routes from sidebar configuration
 * @param {Array} sidebarPages - The sidebar configuration array
 * @returns {Array} - Array of all active routes
 */
export const getActiveRoutes = (sidebarPages) => {
  let activeRoutes = [];
  
  sidebarPages.forEach((page) => {
    if (page.collapse && page.items) {
      // If it's a collapsible section, get routes from items
      page.items.forEach((item) => {
        if (item.path && !item.hidden) {
          activeRoutes.push({
            name: item.name,
            layout: item.layout,
            path: item.path,
            component: item.component,
          });
        }
      });
    } else if (page.path && !page.hidden) {
      // If it's a direct route
      activeRoutes.push({
        name: page.name,
        layout: page.layout,
        path: page.path,
        component: page.component,
      });
    }
  });
  
  return activeRoutes;
};

/**
 * Get sidebar navigation structure for rendering
 * @param {Array} sidebarPages - The sidebar configuration array
 * @returns {Array} - Processed sidebar structure
 */
export const getSidebarNavigation = (sidebarPages) => {
  return sidebarPages.filter(page => !page.hidden);
};

/**
 * Find a specific route by path
 * @param {Array} sidebarPages - The sidebar configuration array  
 * @param {String} searchPath - The path to search for
 * @returns {Object|null} - Found route object or null
 */
export const findRouteByPath = (sidebarPages, searchPath) => {
  for (const page of sidebarPages) {
    if (page.path === searchPath) {
      return page;
    }
    
    if (page.items) {
      for (const item of page.items) {
        if (item.path === searchPath) {
          return item;
        }
      }
    }
  }
  
  return null;
};

/**
 * Get breadcrumb data for a specific path
 * @param {Array} sidebarPages - The sidebar configuration array
 * @param {String} currentPath - Current active path
 * @returns {Array} - Breadcrumb array
 */
export const getBreadcrumb = (sidebarPages, currentPath) => {
  const breadcrumb = [];
  
  for (const page of sidebarPages) {
    if (page.items) {
      for (const item of page.items) {
        if (item.path === currentPath) {
          breadcrumb.push({
            name: page.name,
            path: null, // Parent doesn't have direct path
          });
          breadcrumb.push({
            name: item.name,
            path: item.path,
          });
          return breadcrumb;
        }
      }
    } else if (page.path === currentPath) {
      breadcrumb.push({
        name: page.name,
        path: page.path,
      });
      return breadcrumb;
    }
  }
  
  return breadcrumb;
};

export default {
  getActiveRoutes,
  getSidebarNavigation,
  findRouteByPath,
  getBreadcrumb,
};
