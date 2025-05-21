import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEdit2Line, RiDeleteBin6Line,
  RiCloseCircleLine, RiAlertLine, RiCheckboxCircleLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useAuth from '../hooks/useAuth';

import { getAllControles, deleteControle } from '../api/controles';

const ControleQualite = () => {
  const { hasPermission } = useAuth();
  const [controles, setControles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMachine, setFilterMachine] = useState('');
  const [sortField, setSortField] = useState('dateControle');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch controles data
  useEffect(() => {
    const fetchControles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllControles();
        setControles(response.data || []);
      } catch (err) {
        console.error('Error fetching controles:', err);
        setError('Erreur lors du chargement des contrôles qualité');
      } finally {
        setLoading(false);
      }
    };

    fetchControles();
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

  // Handle controle deletion
  const handleDeleteControle = async (id) => {
    try {
      await deleteControle(id);
      setControles((prevControles) => 
        prevControles.filter(controle => controle.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting controle:', err);
      setError('Erreur lors de la suppression du contrôle qualité');
    }
  };

  // Filter controles based on search term
  const filteredControles = controles.filter(controle => 
    (controle.intervention && controle.intervention.description && 
     controle.intervention.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (controle.intervention && controle.intervention.machine && 
     controle.intervention.machine.nom && 
     controle.intervention.machine.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (controle.id && controle.id.toString().includes(searchTerm))
  );

  // Filter by machine if specified
  const machineFilteredControles = filterMachine 
    ? filteredControles.filter(controle => 
        controle.intervention && 
        controle.intervention.machine && 
        controle.intervention.machine.id === parseInt(filterMachine))
    : filteredControles;

  // Sort filtered controles
  const sortedControles = [...machineFilteredControles].sort((a, b) => {
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

  // Get all unique machines from controles
  const machines = [...new Map(
    controles
      .filter(controle => controle.intervention && controle.intervention.machine)
      .map(controle => [
        controle.intervention.machine.id, 
        controle.intervention.machine
      ])
  ).values()];

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
        <h1 className="text-2xl font-bold text-gray-800">Contrôle Qualité</h1>
        
        {hasPermission('controle-create') && (
          <Link to="/controles/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouveau contrôle
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
                value={filterMachine}
                onChange={e => setFilterMachine(e.target.value)}
              >
                <option value="">Toutes les machines</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.nom}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterMachine && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterMachine('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {sortedControles.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <RiCheckboxCircleLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun contrôle qualité trouvé</p>
            <p className="text-sm mt-1">Les contrôles qualité apparaîtront ici une fois créés</p>
            
            {hasPermission('controle-create') && (
              <Link to="/controles/new">
                <Button 
                  variant="outline" 
                  className="mt-4"
                  icon={<RiAddLine />}
                >
                  Créer un contrôle qualité
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
                    onClick={() => handleSort('dateControle')}
                  >
                    Date
                    {sortField === 'dateControle' && (
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
                    Tests effectués
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Conformité
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
                {sortedControles.map((controle) => (
                  <tr key={controle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {controle.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(controle.dateControle)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {controle.intervention && (
                        <Link 
                          to={`/interventions/${controle.intervention.id}`}
                          className="hover:text-blue-600"
                        >
                          {`#${controle.intervention.id} - ${controle.intervention.typeOperation || 'Intervention'}`}
                        </Link>
                      )}
                      {controle.intervention?.statut && (
                        <div className="mt-1">
                          <StatusBadge status={controle.intervention.statut} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {controle.intervention?.machine && (
                        <Link 
                          to={`/machines/${controle.intervention.machine.id}`}
                          className="hover:text-blue-600"
                        >
                          {controle.intervention.machine.nom}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        {controle.resultatsEssais && (
                          <span className="inline-flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            <span>Essais réalisés</span>
                          </span>
                        )}
                        {controle.analyseVibratoire && (
                          <span className="inline-flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            <span>Analyse vibratoire</span>
                          </span>
                        )}
                        {!controle.resultatsEssais && !controle.analyseVibratoire && (
                          <span className="text-gray-400 italic">Aucun test spécifié</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {controle.conformite ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <RiCheckboxCircleLine className="mr-1" /> Conforme
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <RiCloseCircleLine className="mr-1" /> Non conforme
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('controle-view') && (
                          <Link to={`/controles/${controle.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEyeLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('controle-edit') && (
                          <Link to={`/controles/${controle.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEdit2Line />}
                              title="Modifier"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('controle-delete') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<RiDeleteBin6Line />}
                            title="Supprimer"
                            onClick={() => setDeleteConfirm(controle.id)}
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
              Êtes-vous sûr de vouloir supprimer ce contrôle qualité ? 
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
                onClick={() => handleDeleteControle(deleteConfirm)}
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

export default ControleQualite;