import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEdit2Line, RiDeleteBin6Line,
  RiCloseCircleLine, RiCalendarEventLine, 
  RiUserLine, RiAlertLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

// API functions - You'll need to create these in src/api/planifications.js
const getAllPlanifications = async () => {
  // Implement this function to fetch planifications from your backend
  return { data: [] }; // Placeholder
};

const deletePlanification = async (id) => {
  // Implement this function to delete a planification
};

const Planifications = () => {
  const { hasPermission, user } = useAuth();
  const [planifications, setPlanifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [sortField, setSortField] = useState('dateCreation');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch planifications data
  useEffect(() => {
    const fetchPlanifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPlanifications();
        setPlanifications(response.data || []);
      } catch (err) {
        console.error('Error fetching planifications:', err);
        setError('Erreur lors du chargement des planifications');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanifications();
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

  // Handle planification deletion
  const handleDeletePlanification = async (id) => {
    try {
      await deletePlanification(id);
      setPlanifications((prevPlanifications) => 
        prevPlanifications.filter(planification => planification.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting planification:', err);
      setError('Erreur lors de la suppression de la planification');
    }
  };

  // Filter planifications based on search term
  const filteredPlanifications = planifications.filter(planification => 
    (planification.utilisateur && planification.utilisateur.nom && 
     planification.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (planification.id && planification.id.toString().includes(searchTerm)) ||
    (planification.interventions && 
     planification.interventions.some(intervention => 
       intervention.machine && 
       intervention.machine.nom.toLowerCase().includes(searchTerm.toLowerCase())
     ))
  );

  // Filter by user if specified
  const userFilteredPlanifications = filterUser 
    ? filteredPlanifications.filter(plan => plan.utilisateur && plan.utilisateur.id === parseInt(filterUser))
    : filteredPlanifications;

  // Sort filtered planifications
  const sortedPlanifications = [...userFilteredPlanifications].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'utilisateur') {
      valA = a.utilisateur?.nom || '';
      valB = b.utilisateur?.nom || '';
    } else if (sortField === 'interventionsCount') {
      valA = a.interventions?.length || 0;
      valB = b.interventions?.length || 0;
    }
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Planification</h1>
        
        {hasPermission('planification-create') && (
          <Link to="/planifications/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouvelle planification
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
              placeholder="Rechercher par utilisateur ou machine..."
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
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
              >
                <option value="">Tous les utilisateurs</option>
                {/* You would populate this with actual user data */}
                <option value={user?.id || ''}>Mes planifications</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterUser && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterUser('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {sortedPlanifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <RiCalendarEventLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucune planification trouvée</p>
            <p className="text-sm mt-1">Les planifications apparaîtront ici une fois créées</p>
            
            {hasPermission('planification-create') && (
              <Link to="/planifications/new">
                <Button 
                  variant="outline" 
                  className="mt-4"
                  icon={<RiAddLine />}
                >
                  Créer une planification
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
                    onClick={() => handleSort('dateCreation')}
                  >
                    Date
                    {sortField === 'dateCreation' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('utilisateur')}
                  >
                    Responsable
                    {sortField === 'utilisateur' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('interventionsCount')}
                  >
                    Interventions
                    {sortField === 'interventionsCount' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Disponibilité
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
                {sortedPlanifications.map((planification) => (
                  <tr key={planification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {planification.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(planification.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <RiUserLine />
                        </div>
                        <span>{planification.utilisateur?.nom || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex flex-col">
                        <span className="font-medium">{planification.interventions?.length || 0} intervention(s)</span>
                        <span className="text-xs text-gray-500 mt-1">Capacité: {planification.capaciteExecution || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${planification.urgencePrise ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>Urgence</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${planification.disponibilitePDR ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>Pièces</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('planification-view') && (
                          <Link to={`/planifications/${planification.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEyeLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('planification-edit') && (
                          <Link to={`/planifications/${planification.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEdit2Line />}
                              title="Modifier"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('planification-delete') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<RiDeleteBin6Line />}
                            title="Supprimer"
                            onClick={() => setDeleteConfirm(planification.id)}
                          />
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
              Êtes-vous sûr de vouloir supprimer cette planification ? 
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
                onClick={() => handleDeletePlanification(deleteConfirm)}
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

export default Planifications;