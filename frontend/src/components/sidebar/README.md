# Sidebar Configuration System

یہ folder sidebar کی complete configuration اور management کے لیے بنایا گیا ہے۔

## Files Structure:

### 📁 **Main Files:**
- `Sidebar.js` - Main sidebar component (Desktop & Mobile)
- `sidebarConfig.js` - **Sidebar pages configuration** 
- `sidebarUtils.js` - Utility functions
- `index.js` - Module exports

### 📁 **Components:**
- `components/Content.js` - Sidebar content wrapper
- `components/Brand.js` - Logo/Brand area
- `components/LinksNew.js` - Navigation links

## 🔧 **How to Use:**

### **Adding New Pages:**
```javascript
// sidebarConfig.js میں نیا page add کریں:
{
  name: 'New Section',
  layout: '/admin',
  icon: <Icon as={MdNewIcon} width="20px" height="20px" color="inherit" />,
  collapse: true,
  items: [
    {
      name: 'New Page',
      layout: '/admin', 
      path: '/new/page',
      icon: <Icon as={MdPage} width="16px" height="16px" color="inherit" />,
    }
  ]
}
```

### **Direct Page (No Submenu):**
```javascript
{
  name: 'Direct Page',
  layout: '/admin',
  path: '/direct-page',
  icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
}
```

## 🎯 **Current Sections:**

1. **Dashboard** - Main dashboard
2. **Students** - Student management (List, Add, Attendance, Performance, Transport)
3. **Teachers** - Teacher management (List, Add, Attendance, Salary, Performance, Schedule, Subjects)
4. **Academics** - Academic management (Classes, Subjects, Timetable, Exams, Grades)
5. **Attendance** - Attendance system (Mark, Reports, Calendar)
6. **Transport** - Transport management (Routes, Vehicles, Drivers, Assignments)
7. **Finance** - Financial management (Fees, Salary, Expenses, Reports)
8. **Communication** - Communication system (Announcements, Messages, Notifications)
9. **Reports & Analytics** - Reporting system (Academic, Attendance, Financial, Custom)

## 🛠 **Utility Functions:**

```javascript
import { getActiveRoutes, getBreadcrumb, findRouteByPath } from 'components/sidebar';

// Get all active routes
const routes = getActiveRoutes(sidebarPages);

// Get breadcrumb for current path
const breadcrumb = getBreadcrumb(sidebarPages, '/teachers/list');

// Find specific route
const route = findRouteByPath(sidebarPages, '/students/add');
```

## 🎨 **Icons Used:**

- **Material Design Icons** (react-icons/md)
- **Font Awesome Icons** (react-icons/fa)
- **Chakra UI Icons** (@chakra-ui/icons)

## 📝 **Notes:**

- Sidebar اب props سے routes نہیں لیتا
- Configuration file سے directly routes load ہوتے ہیں
- New pages add کرنے کے لیے صرف `sidebarConfig.js` modify کریں
- Icons کے لیے proper imports add کریں
- Layout ہمیشہ `/admin` use کریں

## 🚀 **Benefits:**

✅ **Centralized Configuration** - سب کچھ ایک جگہ  
✅ **Easy Management** - آسان سے نئے pages add کریں  
✅ **Consistent Structure** - Standardized format  
✅ **Utility Functions** - Helper functions available  
✅ **Better Organization** - Clean code structure  

---

**Created by:** School Management System Team  
**Last Updated:** November 2025
