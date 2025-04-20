import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Use standard React.lazy for code splitting
// The error handling is now managed by the ErrorBoundary component

// Lazy load pages with standard React.lazy and static imports
const Home = React.lazy(() => import('./pages/Home'));
// Commenting out Services import as the file doesn't exist
// const Services = React.lazy(() => import('./pages/Services'));
const Products = React.lazy(() => import('./pages/Products'));
const Install = React.lazy(() => import('./pages/Install'));
// ROICalculator component not found in filesystem - commenting out
// const ROICalculator = React.lazy(() => import('./pages/ROICalculator'));
const About = React.lazy(() => import('./pages/About'));
// Contact page removed

// Import routes
const DashboardRoutes = React.lazy(() => import('./pages/Dashboard'));
const AdminRoutes = React.lazy(() => import('./pages/AdminRoutes'));
const Auth = React.lazy(() => import('./pages/Auth'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#CCFF00]"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
        <React.Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary>
            <Routes>
              {/* Dashboard and Admin routes */}
              <Route path="/dashboard/*" element={<DashboardRoutes />} />
              <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* Main routes with shared layout */}
            <Route
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Outlet />
                  </main>
                  <Footer />
                </>
              }
            >
              <Route index element={<Home />} />
              {/* Route for Services removed as the component doesn't exist */}
              <Route path="products" element={<Products />} />
              <Route path="install" element={<Install />} />
              {/* ROI Calculator route commented out as component is missing */}
              {/* <Route path="roi" element={<ROICalculator />} /> */}
              <Route path="about" element={<About />} />
              {/* Contact route removed */}
              <Route path="auth" element={<Auth />} />
            </Route>
            </Routes>
          </ErrorBoundary>
        </React.Suspense>
      </div>
    </Router>
  );
}

export default App;