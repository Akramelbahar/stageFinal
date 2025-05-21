import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEdit2Line, RiDeleteBin6Line,
  RiCloseCircleLine, RiAlertLine, RiShieldLine, 
  RiShieldUserLine, RiCheckboxMultipleLine
} from 'react-icons/ri';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';


import { deleteRole, getAllPermissionModules , getAllRoles } from '../../api/roles';
const RolesPermissions = () => {
  const { hasPermission, isAdmin } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissionModules, setPermissionModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'permissions'

  // Fetch roles and permissions data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          getAllRoles(),
          getAllPermissionModules()
        ]);
        
        setRoles(rolesResponse.data || []);
        setPermissionModules(permissionsResponse.data || {});
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (id) => {
    try {
      await deleteRole(id);
      setRoles((prevRoles) => 
        prevRoles.filter(role => role.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Erreur lors de la suppression du rôle');
    }
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => {
    const nameMatch = role.nom && role.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = role.id && role.id.toString().includes(searchTerm);
    
    return nameMatch || idMatch;
  });

  // Sort filtered roles
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'permissionsCount') {
      valA = a.permissions ? a.permissions.length : 0;
      valB = b.permissions ? b.permissions.length : 0;
    } else if (sortField === 'usersCount') {
      valA = a.utilisateurs ? a.utilisateurs.length : 0;
      valB = b.utilisateurs ? b.utilisateurs.length : 0;
    }
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Extract all modules from permissionModules
  const modules = Object.keys(permissionModules);

  // Filter permissions by module if specified
  const filteredPermissionModules = filterModule
    ? { [filterModule]: permissionModules[filterModule] || [] }
    : permissionModules;

  // Filter permissions by search term
  const searchFilteredPermissionModules = Object.entries(filteredPermissionModules)
    .reduce((acc, [module, permissions]) => {
      const filteredPermissions = permissions.filter(permission => 
        permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredPermissions.length > 0) {
        acc[module] = filteredPermissions;
      }
      
      return acc;
    }, {});

  // Check if current user has admin access
  const canManageRoles = hasPermission('admin-roles') || isAdmin();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Rôles & Permissions</h1>
        
        {activeTab === 'roles' && canManageRoles && (
          <Link to="/admin/roles/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouveau rôle
            </Button>
          </Link>
        )}
        
        {activeTab === 'permissions' && canManageRoles && (
          <Link to="/admin/permissions/generate">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Générer permissions
            </Button>
          </Link>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'roles'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          <RiShieldUserLine className="inline-block mr-1" />
          Rôles
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'permissions'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('permissions')}
        >
          <RiCheckboxMultipleLine className="inline-block mr-1" />
          Permissions
        </button>
      </div>
      
      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <Card>
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Rechercher un rôle..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <RiSearchLine className="absolute right-3 top-3 text-gray-400" />
          </div>
          
          {sortedRoles.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <RiShieldLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">Aucun rôle trouvé</p>
              <p className="text-sm mt-1">Les rôles apparaîtront ici une fois créés</p>
              
              {canManageRoles && (
                <Link to="/admin/roles/new">
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    icon={<RiAddLine />}
                  >
                    Créer un rôle
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      ID
                      {sortField === 'id' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('nom')}
                    >
                      Nom
                      {sortField === 'nom' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('permissionsCount')}
                    >
                      Permissions
                      {sortField === 'permissionsCount' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('usersCount')}
                    >
                      Utilisateurs
                      {sortField === 'usersCount' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {role.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <RiShieldLine className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{role.nom}</div>
                            {role.nom === 'Admin' && (
                              <div className="text-xs text-red-500">Super administrateur</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {role.permissions ? role.permissions.length : 0} permissions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {role.utilisateurs ? role.utilisateurs.length : 0} utilisateurs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/admin/roles/${role.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEyeLine />}
                              title="Voir les détails"
                            />
                          </Link>
                          
                          {canManageRoles && role.nom !== 'Admin' && (
                            <>
                              <Link to={`/admin/roles/${role.id}/edit`}>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  icon={<RiEdit2Line />}
                                  title="Modifier"
                                />
                              </Link>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                icon={<RiDeleteBin6Line />}
                                title="Supprimer"
                                onClick={() => role.utilisateurs?.length > 0 
                                  ? alert('Impossible de supprimer un rôle utilisé par des utilisateurs') 
                                  : setDeleteConfirm(role.id)
                                }
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      
      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <Card>
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Rechercher une permission..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <RiSearchLine className="absolute right-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <select
                  className="w-full appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterModule}
                  onChange={e => setFilterModule(e.target.value)}
                >
                  <option value="">Tous les modules</option>
                  {modules.map((module, index) => (
                    <option key={index} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <RiFilterLine className="text-gray-400" />
                </div>
                {filterModule && (
                  <button 
                    className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilterModule('')}
                  >
                    <RiCloseCircleLine />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {Object.keys(searchFilteredPermissionModules).length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <RiCheckboxMultipleLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">Aucune permission trouvée</p>
              <p className="text-sm mt-1">Utilisez les filtres pour afficher les permissions disponibles</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(searchFilteredPermissionModules).map(([module, permissions]) => (
                <div key={module} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-medium text-gray-800 capitalize">Module: {module}</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {permissions.map((permission, index) => (
                        <div 
                          key={index} 
                          className="p-3 border rounded bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <RiCheckboxMultipleLine className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium capitalize">{permission.action}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {permission.description || `Permission pour ${permission.action} dans ${module}`}
                              </div>
                              
                              {/* Show which roles have this permission */}
                              {permission.roles && permission.roles.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-600">Rôles: </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {permission.roles.map((role, roleIndex) => (
                                      <span
                                        key={roleIndex}
                                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                                      >
                                        {role.nom}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer ce rôle ? 
              Cette action est irréversible et supprimera également toutes les attributions de ce rôle.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDeleteConfirm(null)}
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => handleDeleteRole(deleteConfirm)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;