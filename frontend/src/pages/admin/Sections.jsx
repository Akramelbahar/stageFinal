import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEdit2Line, RiDeleteBin6Line,
  RiCloseCircleLine, RiAlertLine, RiBuilding2Line, 
  RiUserLine
} from 'react-icons/ri';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

// API functions - Import from the sections API file
import { 
  getAllSections, 
  deleteSection 
} from '../../api/sections';

const Sections = () => {
  const { hasPermission } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch sections data
  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllSections();
        setSections(response.data || []);
      } catch (err) {
        console.error('Error fetching sections:', err);
        setError('Erreur lors du chargement des sections');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
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

  // Handle section deletion
  const handleDeleteSection = async (id) => {
    try {
      await deleteSection(id);
      setSections((prevSections) => 
        prevSections.filter(section => section.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting section:', err);
      setError('Erreur lors de la suppression de la section');
    }
  };

  // Filter sections based on search term
  const filteredSections = sections.filter(section => {
    const nameMatch = section.nom && section.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = section.type && section.type.toLowerCase().includes(searchTerm.toLowerCase());
    const responsableMatch = section.responsable && section.responsable.nom && 
                            section.responsable.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = section.id && section.id.toString().includes(searchTerm);
    
    return nameMatch || typeMatch || responsableMatch || idMatch;
  });

  // Filter by type if specified
  const typeFilteredSections = filterType 
    ? filteredSections.filter(section => section.type === filterType)
    : filteredSections;

  // Sort filtered sections
  const sortedSections = [...typeFilteredSections].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'responsable') {
      valA = a.responsable ? a.responsable.nom : '';
      valB = b.responsable ? b.responsable.nom : '';
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

  // Get unique section types for filtering
  const sectionTypes = [...new Set(sections.map(section => section.type))];

  // Check if user can manage sections
  const canManageSections = hasPermission('section-edit');

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
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Sections</h1>
        
        {canManageSections && (
          <Link to="/admin/sections/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouvelle section
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
              placeholder="Rechercher une section..."
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
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">Tous les types</option>
                {sectionTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterType && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterType('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {sortedSections.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <RiBuilding2Line className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucune section trouvée</p>
            <p className="text-sm mt-1">Les sections apparaîtront ici une fois créées</p>
            
            {canManageSections && (
              <Link to="/admin/sections/new">
                <Button 
                  variant="outline" 
                  className="mt-4"
                  icon={<RiAddLine />}
                >
                  Créer une section
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
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {sortField === 'type' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('responsable')}
                  >
                    Responsable
                    {sortField === 'responsable' && (
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
                {sortedSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {section.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <RiBuilding2Line className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{section.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {section.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {section.responsable ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <RiUserLine className="text-gray-600" />
                          </div>
                          <Link to={`/admin/utilisateurs/${section.responsable.id}`} className="hover:text-blue-600">
                            {section.responsable.nom}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {section.utilisateurs ? section.utilisateurs.length : 0} utilisateurs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/sections/${section.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<RiEyeLine />}
                            title="Voir les détails"
                          />
                        </Link>
                        
                        {canManageSections && (
                          <>
                            <Link to={`/admin/sections/${section.id}/edit`}>
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
                              onClick={() => {
                                if (section.utilisateurs && section.utilisateurs.length > 0) {
                                  alert('Impossible de supprimer une section contenant des utilisateurs');
                                } else {
                                  setDeleteConfirm(section.id);
                                }
                              }}
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
              Êtes-vous sûr de vouloir supprimer cette section ? 
              Cette action est irréversible.
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
                onClick={() => handleDeleteSection(deleteConfirm)}
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

export default Sections;

