import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SideNav from './SideNav';
import Header from './Header';
import { Login } from '../pages';
import { getProfile, getConsultantProfile } from '../actions/profileActions';
import { CLayout } from '../consultant/components';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();

  const { userInfo, isGuest } = useSelector((state) => state.userLoginReducer);

  const { profile } = useSelector((state)=>state.getProfileReducer);
  const { consultant } = useSelector((state)=>state.getConsultantProfileReducer);

  useEffect(()=> {
    if(userInfo && !isGuest){
      dispatch(getProfile());
      dispatch(getConsultantProfile());
    }
  }, [dispatch, userInfo, isGuest]);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; 
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(true); 
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    }
  };

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

if (consultant) {
  return (
    <div>
      <CLayout />
    </div>
  )
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