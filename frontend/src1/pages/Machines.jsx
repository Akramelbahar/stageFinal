import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiEdit2Line, 
  RiDeleteBin6Line, RiToolsLine, RiFileListLine 
} from 'react-icons/ri';

// API calls
import { getAllMachines, deleteMachine } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useAuth from '../hooks/useAuth';

const Machines = () => {
  const { hasPermission } = useAuth();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch machines data
  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      try {
        const response = await getAllMachines();
        setMachines(response.data || []);
      } catch (err) {
        console.error('Error fetching machines:', err);
        setError('Erreur lors du chargement des machines');
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
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

  // Handle machine deletion
  const handleDeleteMachine = async (id) => {
    try {
      await deleteMachine(id);
      setMachines((prevMachines) => prevMachines.filter(machine => machine.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting machine:', err);
      setError('Erreur lors de la suppression de la machine');
    }
  };

  // Filter machines based on search term
  const filteredMachines = machines.filter(machine => 
    machine.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (machine.type && machine.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (machine.etat && machine.etat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort filtered machines
  const sortedMachines = [...filteredMachines].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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
        <h1 className="text-2xl font-bold text-gray-800">Machines</h1>
        
        {hasPermission('machine-create') && (
          <Link to="/machines/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouvelle machine
            </Button>
          </Link>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Rechercher une machine..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <RiSearchLine className="absolute right-3 top-3 text-gray-400" />
        </div>
        
        {filteredMachines.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucune machine trouvée
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
                    onClick={() => handleSort('etat')}
                  >
                    État
                    {sortField === 'etat' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('dateProchaineMaint')}
                  >
                    Maintenance
                    {sortField === 'dateProchaineMaint' && (
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
                {sortedMachines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {machine.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <Link 
                        to={`/machines/${machine.id}`}
                        className="hover:text-blue-600 font-medium"
                      >
                        {machine.nom}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {machine.type || 'Non spécifié'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={machine.etat} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {machine.dateProchaineMaint ? 
                        new Date(machine.dateProchaineMaint).toLocaleDateString() : 
                        'Non planifiée'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('intervention-create') && (
                          <Link to={`/interventions/new?machine=${machine.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiToolsLine />}
                              title="Créer une intervention"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('machine-view') && (
                          <Link to={`/machines/${machine.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiFileListLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('machine-edit') && (
                          <Link to={`/machines/${machine.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEdit2Line />}
                              title="Modifier"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('machine-delete') && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              icon={<RiDeleteBin6Line />}
                              title="Supprimer"
                              onClick={() => setDeleteConfirm(machine.id)}
                            />
                            
                            {deleteConfirm === machine.id && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                                  <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
                                  <p className="text-sm text-gray-500 mb-4">
                                    Êtes-vous sûr de vouloir supprimer la machine "{machine.nom}" ? 
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
                                      onClick={() => handleDeleteMachine(machine.id)}
                                    >
                                      Supprimer
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
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
    </div>
  );
};

export default Machines;
