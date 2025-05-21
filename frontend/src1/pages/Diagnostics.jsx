import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiFileList3Line, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEditLine, RiDeleteBin6Line,
  RiAlertLine, RiCloseCircleLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useAuth from '../hooks/useAuth';

// API functions - You'll need to create these in src/api/diagnostics.js
const getAllDiagnostics = async () => {
  // Implement this function to fetch diagnostics from your backend
  return { data: [] }; // Placeholder
};

const deleteDiagnostic = async (id) => {
  // Implement this function to delete a diagnostic
};

const Diagnostics = () => {
  const { hasPermission } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIntervention, setFilterIntervention] = useState('');
  const [sortField, setSortField] = useState('dateCreation');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch diagnostics data
  useEffect(() => {
    const fetchDiagnostics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllDiagnostics();
        setDiagnostics(response.data || []);
      } catch (err) {
        console.error('Error fetching diagnostics:', err);
        setError('Erreur lors du chargement des diagnostics');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
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

  // Handle diagnostic deletion
  const handleDeleteDiagnostic = async (id) => {
    try {
      await deleteDiagnostic(id);
      setDiagnostics((prevDiagnostics) => 
        prevDiagnostics.filter(diagnostic => diagnostic.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting diagnostic:', err);
      setError('Erreur lors de la suppression du diagnostic');
    }
  };

  // Filter diagnostics based on search term
  const filteredDiagnostics = diagnostics.filter(diagnostic => 
    (diagnostic.intervention && diagnostic.intervention.id && 
     diagnostic.intervention.id.toString().includes(searchTerm)) ||
    (diagnostic.intervention && diagnostic.intervention.description && 
     diagnostic.intervention.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (diagnostic.intervention && diagnostic.intervention.machine && 
     diagnostic.intervention.machine.nom && 
     diagnostic.intervention.machine.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort filtered diagnostics
  const sortedDiagnostics = [...filteredDiagnostics].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'machine') {
      valA = a.intervention?.machine?.nom || '';
      valB = b.intervention?.machine?.nom || '';
    } else if (sortField === 'intervention') {
      valA = a.intervention?.id || '';
      valB = b.intervention?.id || '';
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
        <h1 className="text-2xl font-bold text-gray-800">Diagnostics</h1>
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
              placeholder="Rechercher par machine ou intervention..."
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
                value={filterIntervention}
                onChange={e => setFilterIntervention(e.target.value)}
              >
                <option value="">Toutes les interventions</option>
                {/* You would populate this with actual intervention IDs */}
                <option value="1">Intervention #1</option>
                <option value="2">Intervention #2</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterIntervention && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterIntervention('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {filteredDiagnostics.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <RiFileList3Line className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun diagnostic trouvé</p>
            <p className="text-sm mt-1">Les diagnostics apparaîtront ici une fois créés lors d'interventions</p>
            
            {hasPermission('intervention-list') && (
              <Link to="/interventions">
                <Button 
                  variant="outline" 
                  className="mt-4"
                >
                  Voir les interventions
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
                    onClick={() => handleSort('intervention')}
                  >
                    Intervention
                    {sortField === 'intervention' && (
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Éléments
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
                {sortedDiagnostics.map((diagnostic) => (
                  <tr key={diagnostic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {diagnostic.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(diagnostic.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {diagnostic.intervention && (
                        <Link 
                          to={`/interventions/${diagnostic.intervention.id}`}
                          className="hover:text-blue-600"
                        >
                          {`#${diagnostic.intervention.id} - ${diagnostic.intervention.typeOperation || 'Intervention'}`}
                        </Link>
                      )}
                      {diagnostic.intervention?.urgence && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {diagnostic.intervention?.machine && (
                        <Link 
                          to={`/machines/${diagnostic.intervention.machine.id}`}
                          className="hover:text-blue-600"
                        >
                          {diagnostic.intervention.machine.nom}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium">Travaux:</span>
                          <span className="ml-2 text-gray-700">
                            {diagnostic.travauxRequis?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Besoins:</span>
                          <span className="ml-2 text-gray-700">
                            {diagnostic.besoinsPDR?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Charges:</span>
                          <span className="ml-2 text-gray-700">
                            {diagnostic.chargesRealisees?.length || 0}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('diagnostic-view') && (
                          <Link to={`/diagnostics/${diagnostic.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEyeLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('diagnostic-edit') && (
                          <Link to={`/diagnostics/${diagnostic.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEditLine />}
                              title="Modifier"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('diagnostic-delete') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<RiDeleteBin6Line />}
                            title="Supprimer"
                            onClick={() => setDeleteConfirm(diagnostic.id)}
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
              Êtes-vous sûr de vouloir supprimer ce diagnostic ? 
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
                onClick={() => handleDeleteDiagnostic(deleteConfirm)}
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

export default Diagnostics;