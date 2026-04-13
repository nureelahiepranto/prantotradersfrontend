import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaKey, FaBars, FaSearch, FaSun, FaMoon } from "react-icons/fa";
import { RiNotification3Line, RiUserSettingsLine } from "react-icons/ri";
import logo from "../assets/soft-webmission-logo-icon.png";
import textlogo from "../assets/soft-webmission-text-logo-text.png";
export default function Navbar({ onMenuClick, sidebarCollapsed = false }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowUserDropdown(false);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowUserDropdown(false);
  }, [location.pathname]);

  const userDashboardPath = user?.role === "admin" ? "/admin" : "/dsr/dashboard";

  return (
    <header className={`
      sticky top-0 z-40 transition-all duration-300
      ${isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md'
      }
    `}>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-red-400 hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <FaBars size={20} />
            </button>

            {/* Logo & Brand */}
            <Link 
              to={userDashboardPath} 
              className="flex items-center gap-3 group"
            >
              <div className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105
                ${isScrolled 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                  : 'bg-white'
                }
              `}>
                <div className={`
                  text-lg font-bold
                  ${isScrolled ? 'text-white' : 'text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text'}
                `}>
                  <img 
                  src={logo}       
                  className="h-18 object-contain mx-auto rounded-full"/>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>
              
              {!sidebarCollapsed && (
                <div className="hidden lg:block">
                  <h1 className={`
                    ${isScrolled ? 'text-gray-800' : 'text-white'}
                  `}>
                    <img 
                    src={textlogo}       
                    className="h-10 bg-white rounded"
                  />
                  
                  </h1>
                  
                  <p className={`
                    text-xs
                    ${isScrolled ? 'text-emerald-500' : 'text-indigo-100'}
                  `}>
                    Management System
                  </p>
                </div>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block relative ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-64 lg:w-80 pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300
                    ${isScrolled 
                      ? 'bg-white border-gray-200 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20' 
                      : 'bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white focus:text-gray-800 focus:border-white'
                    }
                  `}
                />
                <FaSearch className={`
                  absolute left-3 top-1/2 transform -translate-y-1/2
                  ${isScrolled ? 'text-gray-400' : 'text-white/60'}
                `} />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`
                p-2.5 rounded-xl transition-colors
                ${isScrolled 
                  ? 'hover:bg-gray-100 text-gray-600' 
                  : 'hover:bg-white/10 text-white'
                }
              `}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Search Button - Mobile */}
            <button className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 text-gray-600">
              <FaSearch size={18} />
            </button>

            {/* Notifications */}
            {user && (
              <div className="relative">
                <button
                  className={`
                    p-2.5 rounded-xl transition-colors relative
                    ${isScrolled 
                      ? 'hover:bg-gray-100 text-gray-600' 
                      : 'hover:bg-white/10 text-white'
                    }
                  `}
                  aria-label="Notifications"
                >
                  <RiNotification3Line size={20} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 group"
                >
                  <div className={`
                    relative w-10 h-10 rounded-full overflow-hidden border-2 transition-transform group-hover:scale-105
                    ${isScrolled ? 'border-indigo-100' : 'border-white/30'}
                  `}>
                    <div className={`
                      w-full h-full flex items-center justify-center
                      ${isScrolled 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                        : 'bg-white/20'
                      }
                    `}>
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FaUserCircle size={22} className={isScrolled ? 'text-white' : 'text-white'} />
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-left">
                    <p className={`
                      font-semibold text-sm
                      ${isScrolled ? 'text-gray-800' : 'text-white'}
                    `}>
                      {user.name || user.username}
                    </p>
                    <p className={`
                      text-xs
                      ${isScrolled ? 'text-gray-500' : 'text-indigo-100'}
                    `}>
                      {user.role === "admin" ? "Administrator" : "DSR Executive"}
                    </p>
                  </div>
                  
                  <span className={`
                    transition-transform duration-300
                    ${showUserDropdown ? 'rotate-180' : ''}
                    ${isScrolled ? 'text-gray-500' : 'text-white/80'}
                  `}>
                    ▼
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <FaUserCircle size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 truncate">{user.name || user.username}</h3>
                          <p className="text-sm text-gray-600 truncate">{user.email || user.phone}</p>
                          <span className="inline-block mt-1 px-2.5 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full font-medium">
                            {user.role === "admin" ? "Admin" : "DSR"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <RiUserSettingsLine size={18} className="text-gray-400" />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <Link 
                        to="/change-password" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <FaKey size={16} className="text-gray-400" />
                        <span>Change Password</span>
                      </Link>
                      
                      <div className="border-t my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                      >
                        <FaSignOutAlt size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <FaSignOutAlt size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar - Mobile (Expanded) */}
      {searchQuery && (
        <div className="md:hidden px-4 pb-3 animate-slideDown">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 100px;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}