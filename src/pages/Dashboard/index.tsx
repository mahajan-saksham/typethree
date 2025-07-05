// React import removed
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

// Import all dashboard pages
// Overview removed
import Investments from './Investments';
import Credits from './Credits';
import History from './History';
import Support from './Support';
import Profile from './Profile';

// Debug: Console log to check if the Dashboard index module is loaded
console.log('Dashboard index module loaded');

/**
 * Dashboard routes component for Type 3 Solar Platform
 * This component defines the routing structure for the dashboard
 * The parent route is DashboardLayout which provides the navigation and common UI
 * Child routes are rendered inside the Outlet component in DashboardLayout
 */
const DashboardRoutes = () => {
  console.log('Rendering DashboardRoutes component');
  
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Dashboard homepage redirects to Profile */}
        <Route index element={<Profile />} />
        
        {/* Other dashboard pages */}
        {/* Overview route removed */}
        <Route path="investments" element={<Investments />} />
        <Route path="credits" element={<Credits />} />
        <Route path="history" element={<History />} />
        <Route path="support" element={<Support />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

// Export the dashboard routes component
export default DashboardRoutes;