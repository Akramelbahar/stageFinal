import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEdit2Line, RiDeleteBin6Line,
  RiCloseCircleLine, RiAlertLine, RiUserSettingsLine, 
  RiLockPasswordLine, RiShieldUserLine
} from 'react-icons/ri';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

// API functions - You'll need to create these in src/api/utilisateurs.js
const getAllUsers = async () => {
  // Implement this function to fetch users from your backend
  return { data: [] }; // Placeholder
};

const deleteUser = async (id) => {
  // Implement this function to delete a user
};

const Utilisateurs = () => {
  const { hasPermission, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [roles, setRoles] = useState([]);
  const [sections, setSections] = useState([]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsers();
        setUsers(response.data || []);
        
        // Extract unique roles and sections for filters
        const uniqueRoles = [...new Set(
          response.data
            .flatMap(user => user.roles || [])
            .map(role => role.nom)
        )];
        
        const uniqueSections = [...new Set(
          response.data
            .filter(user => user.sectionRelation)
            .map(user => user.sectionRelation.nom)
        )];
        
        setRoles(uniqueRoles);
        setSections(uniqueSections);
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prevUsers) => 
        prevUsers.filter(user => user.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const nameMatch = user.nom && user.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const sectionMatch = user.section && user.section.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = user.id && user.id.toString().includes(searchTerm);
    
    return nameMatch || sectionMatch || idMatch;
  });

  // Filter by role if specified
  const roleFilteredUsers = filterRole 
    ? filteredUsers.filter(user => 
        user.roles && user.roles.some(role => role.nom === filterRole)
      )
    : filteredUsers;

  // Filter by section if specified
  const sectionFilteredUsers = filterSection 
    ? roleFilteredUsers.filter(user => 
        user.sectionRelation && user.sectionRelation.nom === filterSection
      )
    : roleFilteredUsers;

  // Sort filtered users
  const sortedUsers = [...sectionFilteredUsers].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'section') {
      valA = a.sectionRelation ? a.sectionRelation.nom : a.section || '';
      valB = b.sectionRelation ? b.sectionRelation.nom : b.section || '';
    } else if (sortField === 'role') {
      valA = a.roles && a.roles.length > 0 ? a.roles[0].nom : '';
      valB = b.roles && b.roles.length > 0 ? b.roles[0].nom : '';
    }
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Check if current user has admin access (for UI controls)
  const canManageUsers = hasPermission('utilisateur-edit') || isAdmin();

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
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        
        {canManageUsers && (
          <Link to="/admin/utilisateurs/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouvel utilisateur
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
      
      <Card>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterRole && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterRole('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
            
            <div className="relative">
              <select
                className="w-full appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterSection}
                onChange={e => setFilterSection(e.target.value)}
              >
                <option value="">Toutes les sections</option>
                {sections.map((section, index) => (
                  <option key={index} value={section}>
                    {section}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterSection && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterSection('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {sortedUsers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <RiUserSettingsLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
            <p className="text-sm mt-1">Les utilisateurs apparaîtront ici une fois créés</p>
            
            {canManageUsers && (
              <Link to="/admin/utilisateurs/new">
                <Button 
                  variant="outline" 
                  className="mt-4"
                  icon={<RiAddLine />}
                >
                  Créer un utilisateur
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
                    onClick={() => handleSort('section')}
                  >
                    Section
                    {sortField === 'section' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    Rôles
                    {sortField === 'role' && (
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
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-medium">
                            {user.nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                          {user.email && (
                            <div className="text-sm text-gray-500">{user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {user.sectionRelation ? user.sectionRelation.nom : user.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${
                              role.nom === 'Admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {role.nom}
                          </span>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <span className="text-gray-400 italic">Aucun rôle</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('utilisateur-view') && (
                          <Link to={`/admin/utilisateurs/${user.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEyeLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        {canManageUsers && (
                          <>
                            <Link to={`/admin/utilisateurs/${user.id}/edit`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                icon={<RiEdit2Line />}
                                title="Modifier"
                              />
                            </Link>
                            
                            <Link to={`/admin/utilisateurs/${user.id}/permissions`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                icon={<RiShieldUserLine />}
                                title="Gérer les permissions"
                              />
                            </Link>
                            
                            <Link to={`/admin/utilisateurs/${user.id}/password`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                icon={<RiLockPasswordLine />}
                                title="Réinitialiser le mot de passe"
                              />
                            </Link>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              icon={<RiDeleteBin6Line />}
                              title="Supprimer"
                              onClick={() => setDeleteConfirm(user.id)}
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
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? 
              Cette action est irréversible et supprimera également toutes les données associées.
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
                onClick={() => handleDeleteUser(deleteConfirm)}
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

export default Utilisateurs;