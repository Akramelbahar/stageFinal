import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Import icons
import { 
  RiDashboardLine, RiSettings3Line, 
  RiToolsLine, RiFileTextLine, 
  RiCalendarCheckLine, RiCheckboxCircleLine, 
  RiDatabase2Line, RiUserSettingsLine 
} from 'react-icons/ri';

const Sidebar = () => {
  const { hasPermission } = useAuth();

  // Menu items with their permissions and icons
  const menuItems = [
    {
      name: 'Tableau de bord',
      path: '/',
      icon: <RiDashboardLine className="text-xl" />,
      permission: null // Everyone can see dashboard
    },
    {
      name: 'Machines',
      path: '/machines',
      icon: <RiDatabase2Line className="text-xl" />,
      permission: 'machine-list'
    },
    {
      name: 'Interventions',
      path: '/interventions',
      icon: <RiToolsLine className="text-xl" />,
      permission: 'intervention-list'
    },
    {
      name: 'Diagnostics',
      path: '/diagnostics',
      icon: <RiSettings3Line className="text-xl" />,
      permission: 'diagnostic-list'
    },
    {
      name: 'Planification',
      path: '/planifications',
      icon: <RiCalendarCheckLine className="text-xl" />,
      permission: 'planification-list'
    },
    {
      name: 'Contrôle Qualité',
      path: '/controles',
      icon: <RiCheckboxCircleLine className="text-xl" />,
      permission: 'controle-list'
    },
    {
      name: 'Rapports',
      path: '/rapports',
      icon: <RiFileTextLine className="text-xl" />,
      permission: 'rapport-list'
    },
    {
      name: 'Administration',
      path: '/admin',
      icon: <RiUserSettingsLine className="text-xl" />,
      permission: 'admin-roles', // Admin permission
      subItems: [
        {
          name: 'Utilisateurs',
          path: '/admin/utilisateurs',
          permission: 'utilisateur-list'
        },
        {
          name: 'Rôles & Permissions',
          path: '/admin/roles',
          permission: 'admin-roles'
        },
        {
          name: 'Sections',
          path: '/admin/sections',
          permission: 'section-list'
        }
      ]
    }
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => {
    // If no permission required or user has the required permission
    return !item.permission || hasPermission(item.permission);
  });

  return (
    <aside className="w-64 bg-blue-100 h-screen sticky top-0 overflow-y-auto">
      <nav className="mt-4">
        <ul>
          {filteredMenuItems.map((item) => (
            <li key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-800 hover:bg-blue-200 transition-colors ${
                    isActive ? 'bg-blue-700 text-white font-medium' : ''
                  }`
                }
                end={item.path === '/'}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
              
              {/* Render sub-items if they exist */}
              {item.subItems && (
                <ul className="ml-8 mt-1">
                  {item.subItems
                    .filter(subItem => !subItem.permission || hasPermission(subItem.permission))
                    .map(subItem => (
                      <li key={subItem.path}>
                        <NavLink
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-blue-200 transition-colors ${
                              isActive ? 'text-blue-700 font-medium' : 'text-gray-700'
                            }`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;