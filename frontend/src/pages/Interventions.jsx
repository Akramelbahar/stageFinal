import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiEdit2Line, 
  RiDeleteBin6Line, RiFileListLine, RiFilterLine,
  RiCloseCircleLine, RiAlertLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useAuth from '../hooks/useAuth';

// API functions
import { 
  getAllInterventions, 
  getInterventionsByStatus,
  getInterventionsByMachine,
  deleteIntervention
} from '../api/interventions';

const Interventions = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMachine, setFilterMachine] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch interventions data
  useEffect(() => {
    const fetchInterventions = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        
        if (filterStatus) {
          response = await getInterventionsByStatus(filterStatus);
        } else if (filterMachine) {
          response = await getInterventionsByMachine(filterMachine);
        } else {
          response = await getAllInterventions();
        }
        
        setInterventions(response.data || []);
      } catch (err) {
        console.error('Error fetching interventions:', err);
        setError('Erreur lors du chargement des interventions');
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, [filterStatus, filterMachine]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle intervention deletion
  const handleDeleteIntervention = async (id) => {
    try {
      await deleteIntervention(id);
      setInterventions((prevInterventions) => 
        prevInterventions.filter(intervention => intervention.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting intervention:', err);
      setError('Erreur lors de la suppression de l\'intervention');
    }
  };

  // Filter interventions based on search term
  const filteredInterventions = interventions.filter(intervention => 
    (intervention.description && intervention.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (intervention.typeOperation && intervention.typeOperation.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (intervention.machine && intervention.machine.nom && intervention.machine.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (intervention.id && intervention.id.toString().includes(searchTerm))
  );

  // Sort filtered interventions
  const sortedInterventions = [...filteredInterventions].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'machine') {
      valA = a.machine ? a.machine.nom : '';
      valB = b.machine ? b.machine.nom : '';
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
        <h1 className="text-2xl font-bold text-gray-800">Interventions</h1>
        
        {hasPermission('intervention-create') && (
          <Link to="/interventions/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouvelle intervention
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
              placeholder="Rechercher une intervention..."
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
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="PLANNED">Planifiée</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterStatus && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterStatus('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {filteredInterventions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucune intervention trouvée
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
                    onClick={() => handleSort('date')}
                  >
                    Date
                    {sortField === 'date' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('typeOperation')}
                  >
                    Type
                    {sortField === 'typeOperation' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('machine')}
                  >
                    Machine
                    {sortField === 'machine' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('statut')}
                  >
                    Statut
                    {sortField === 'statut' && (
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
                {sortedInterventions.map((intervention) => (
                  <tr key={intervention.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {intervention.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(intervention.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {intervention.typeOperation}
                      {intervention.urgence && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {intervention.machine && (
                        <Link 
                          to={`/machines/${intervention.machine.id}`}
                          className="hover:text-blue-600"
                        >
                          {intervention.machine.nom}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={intervention.statut} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('intervention-view') && (
                          <Link to={`/interventions/${intervention.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiFileListLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('intervention-edit') && intervention.statut !== 'COMPLETED' && (
                          <Link to={`/interventions/${intervention.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEdit2Line />}
                              title="Modifier"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('intervention-delete') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<RiDeleteBin6Line />}
                            title="Supprimer"
                            onClick={() => setDeleteConfirm(intervention.id)}
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
              Êtes-vous sûr de vouloir supprimer cette intervention ? 
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
                onClick={() => handleDeleteIntervention(deleteConfirm)}
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

export default Interventions;