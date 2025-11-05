import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  IoHomeOutline,
  IoCalendarClearOutline,
  IoCheckboxOutline,
  IoDocumentTextOutline,
  IoChatbubbleOutline,
  IoCashOutline,
  IoBusinessOutline,
  IoStatsChartOutline,
  IoHelpCircleOutline,
  IoBookOutline,
  IoPersonOutline,
  IoLogOutOutline
} from "react-icons/io5";
import { logout } from '../actions/userActions';

const SideNav = React.forwardRef(({ isSidebarOpen }, ref) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const primaryColor = '#1F1C7A';

  const navItems = [
    {
      name: 'Dashboard',
      icon: IoHomeOutline,
      path: '/',
      badge: null
    },
    {
      name: 'Relocation Timeline',
      icon: IoStatsChartOutline,
      path: '/timeline',
      badge: '65%'
    },
    {
      name: 'My Tasks',
      icon: IoCheckboxOutline,
      path: '/tasks',
      badge: '3'
    },
    {
      name: 'Documents',
      icon: IoDocumentTextOutline,
      path: '/documents',
      badge: '2'
    },
    {
      name: 'Appointments',
      icon: IoCalendarClearOutline,
      path: '/appointments',
      badge: null
    },
    {
      name: 'Budget Tracker',
      icon: IoCashOutline,
      path: '/budget',
      badge: null
    },
    {
      name: 'Property Search',
      icon: IoBusinessOutline,
      path: '/properties',
      badge: null
    },
    {
      name: 'Messages',
      icon: IoChatbubbleOutline,
      path: '/messages',
      badge: '5'
    }
  ];

  const resourceItems = [
    {
      name: 'Knowledge Library',
      icon: IoBookOutline,
      path: '/resources'
    },
    {
      name: 'Help & Support',
      icon: IoHelpCircleOutline,
      path: '/support'
    }
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div
      ref={ref}
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out z-40 overflow-y-auto custom-scrollbar
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
      `}
      style={{ paddingTop: '64px' }} // Account for header height
    >
      {/* Main Navigation */}
      <div className="py-4">
        
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                style={{
                  backgroundColor: isActive ? primaryColor : 'transparent'
                }}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon 
                  size={20} 
                  className={`
                    flex-shrink-0
                    ${isActive ? 'text-white' : 'text-gray-500'}
                  `} 
                />
                <span className={`
                  ml-3 transition-opacity duration-200
                  ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}
                  ${!isSidebarOpen && 'md:hidden'}
                `}>
                  {item.name}
                </span>
                
                {item.badge && (
                  <span className={`
                    ml-auto px-2 py-1 text-xs font-medium rounded-full
                    ${isActive 
                      ? 'bg-white text-' + primaryColor 
                      : 'bg-gray-200 text-gray-700'
                    }
                    ${isSidebarOpen ? 'block' : 'hidden md:block'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Resources Section */}
        <div className="mt-8 px-4 mb-4">
          <h3 className={`
            font-semibold text-gray-500 uppercase text-xs tracking-wider 
            ${isSidebarOpen ? 'block' : 'hidden md:block'}
          `}>
            Resources
          </h3>
        </div>
        
        <nav className="space-y-1 px-3">
          {resourceItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100 '
                  }
                `}
                style={{
                  backgroundColor: isActive ? primaryColor : 'transparent'
                }}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon 
                  size={20} 
                  className={`
                    flex-shrink-0
                    ${isActive ? 'text-white' : 'text-gray-500'}
                  `} 
                />
                <span className={`
                  ml-3 transition-opacity duration-200
                  ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}
                  ${!isSidebarOpen && 'md:hidden'}
                `}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Consultant Info Section */}

        {isSidebarOpen && (
          <div className={`
          mt-8 mx-3 p-4 bg-gray-50 rounded-lg border border-gray-200
          ${isSidebarOpen ? 'block' : 'hidden md:block'}
        `}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Your Consultant
          </h4>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <IoPersonOutline size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Sarah Johnson
              </p>
              <p className="text-xs text-gray-500 truncate">
                ATP0001
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-500 ">Available</span>
              </div>
            </div>
          </div>
        </div>
        )}
        
        
      </div>
      
      {isSidebarOpen && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              Upload Docs
            </button>
            <button className="text-xs bg-green-50 text-green-700  py-2 px-3 rounded-lg font-medium hover:bg-green-100 transition-colors">
              Schedule
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-gray-200 ">
        <button
          onClick={handleLogout}
          className={`
            flex items-center w-full px-3 py-4 text-sm font-medium rounded-lg transition-all duration-200 group
            text-red-600 hover:bg-red-50 cursor-pointer
          `}
          title={!isSidebarOpen ? 'Logout' : undefined}
        >
          <IoLogOutOutline 
            size={20} 
            className="flex-shrink-0" 
          />
          <span className={`
            ml-3 transition-opacity duration-200
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}
            ${!isSidebarOpen && 'md:hidden'}
          `}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
});

SideNav.displayName = 'SideNav';

export default SideNav;