
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ChartBar, Home, Settings } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Capture', path: '/capture', icon: Camera },
    { name: 'Analysis', path: '/analysis', icon: ChartBar },
    { name: 'Goals', path: '/goals', icon: Settings },
  ];

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-subtle border-t border-gray-100">
      <nav className="container mx-auto px-4 py-2">
        <ul className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} className="relative">
                <button 
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center p-2 transition-all duration-300 ${
                    isActive 
                      ? 'text-health-blue' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-xs mt-1">{item.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-health-blue rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
