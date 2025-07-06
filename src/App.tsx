import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import TaskWorkflowManager from './components/TaskMasterWebGUI/TaskWorkflowManager';
import WhatsAppCTA from './components/WhatsAppCTA';

// Import custom Google Translate styles
import './styles/google-translate.css';

// Import test components
import PasswordStrengthTest from './components/PasswordStrengthTest';
import AdminGuardTest from './components/AdminGuardTest';

// Use standard React.lazy for code splitting
// The error handling is now managed by the ErrorBoundary component

// Lazy load pages with standard React.lazy and static imports
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Install = React.lazy(() => import('./pages/Install'));
const About = React.lazy(() => import('./pages/About'));

// Import routes - Fixed paths
import AdminRoutes from './pages/AdminRoutes';
import DashboardRoutes from './pages/Dashboard'; // Fixed: imports from index.tsx

// Define Layout component
const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);
function App() {
  return (
    <Router>
      <div className="App">
        <React.Suspense fallback={
          <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        }>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="install" element={<Install />} />
                <Route path="about" element={<About />} />
              </Route>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/dashboard/*" element={<DashboardRoutes />} />
              <Route path="/taskmaster" element={<TaskWorkflowManager />} />
              <Route path="/test/password" element={<PasswordStrengthTest />} />
              <Route path="/test/admin" element={<AdminGuardTest />} />
            </Routes>
          </ErrorBoundary>
        </React.Suspense>
      </div>
      
      {/* Floating WhatsApp Button */}
      <WhatsAppCTA 
        variant="floating" 
        size="md" 
        context="general" 
        analyticsEvent="floating_whatsapp_click" 
      />
    </Router>
  );
}

export default App;