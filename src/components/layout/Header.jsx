import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user || !user.nom) return '?';
    
    // Split name by spaces and get first letter of each part
    const nameParts = user.nom.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    // Get first letter of first name and first letter of last name
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="bg-blue-800 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">GestionMachines</div>
      
      {user && (
        <div className="flex items-center">
          <div className="mr-4 text-sm text-right">
            <div>{user.nom}</div>
            <div className="text-blue-200 text-xs">{user.sectionRelation?.nom || user.section}</div>
          </div>
          
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer">
              {getUserInitials()}
            </div>
            
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{user.nom}</div>
                <div className="text-gray-500 text-xs">{user.roles?.map(role => role.nom).join(', ')}</div>
              </div>
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Mon profil
              </a>
              <button 
                onClick={handleLogout} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;