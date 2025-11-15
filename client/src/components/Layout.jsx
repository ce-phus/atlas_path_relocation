import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SideNav from './SideNav';
import Header from './Header';
import { Login } from '../pages';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();

  const { userInfo, isGuest } = useSelector((state) => state.userLoginReducer);

  // Detect screen size and handle sidebar state accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      
      // On large screens, sidebar should always be open
      // On medium/small screens, sidebar should start closed
      if (!mobile) {
        setSidebarOpen(true); // Always open on large screens
      } else {
        setSidebarOpen(false); // Closed on mobile by default
      }
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = () => {
    // Only allow toggling on medium screens and below
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    }
    // On large screens, do nothing (sidebar stays open)
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  if (!userInfo && !isGuest) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-dark overflow-y-auto flex flex-col">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-row flex-grow pt-16">
        <SideNav isSidebarOpen={isSidebarOpen} ref={sidebarRef} />
        <div
          className={`
            flex-grow bg-white text-dark dark:text-white 
            transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'ml-64' 
              : 'ml-0 md:ml-20' // On large screens, always have margin for the sidebar
            }
          `}
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;