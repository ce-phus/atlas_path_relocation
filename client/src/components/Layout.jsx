import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SideNav from './SideNav';
import Header from './Header';
import { Login } from '../pages';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();

  const { userInfo, isGuest } = useSelector((state) => state.userLoginReducer);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (!userInfo && !isGuest) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-dark overflow-y-auto flex flex-col">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-row flex-grow pt-16"> {/* Account for fixed header */}
        <SideNav isSidebarOpen={isSidebarOpen} ref={sidebarRef} />
        <div
          className={`
            flex-grow bg-white text-dark dark:text-white 
            transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'ml-64 md:ml-64' 
              : 'ml-0 md:ml-20'
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