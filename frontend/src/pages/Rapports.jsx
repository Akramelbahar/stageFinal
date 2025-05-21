import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiAddLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiEdit2Line, RiDeleteBin6Line, RiFileTextLine,
  RiCheckLine, RiCloseCircleLine, RiAlertLine, RiFileDownloadLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

// API functions
import { 
  getAllRapports, 
  validateRapport, 
  deleteRapport 
} from '../api/rapports';

const Rapports = () => {
  const { hasPermission } = useAuth();
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValidation, setFilterValidation] = useState('');
  const [sortField, setSortField] = useState('dateCreation');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [validateConfirm, setValidateConfirm] = useState(null);

  // Fetch rapports data
  useEffect(() => {
    const fetchRapports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllRapports();
        setRapports(response.data || []);
      } catch (err) {
        console.error('Error fetching rapports:', err);
        setError('Erreur lors du chargement des rapports');
      } finally {
        setLoading(false);
      }
    };

    fetchRapports();
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

  // Handle rapport deletion
  const handleDeleteRapport = async (id) => {
    try {
      await deleteRapport(id);
      setRapports((prevRapports) => 
        prevRapports.filter(rapport => rapport.id !== id)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting rapport:', err);
      setError('Erreur lors de la suppression du rapport');
    }
  };

  // Handle rapport validation
  const handleValidateRapport = async (id) => {
    try {
      await validateRapport(id);
      
      // Update local state
      setRapports(prevRapports => 
        prevRapports.map(rapport => 
          rapport.id === id 
            ? { ...rapport, validation: true } 
            : rapport
        )
      );
      
      setValidateConfirm(null);
    } catch (err) {
      console.error('Error validating rapport:', err);
      setError('Erreur lors de la validation du rapport');
    }
  };

  // Determine rapport type
  const getRapportType = (rapport) => {
    if (rapport.renovation) return 'Rénovation';
    if (rapport.maintenance) return 'Maintenance';
    return rapport.intervention ? rapport.intervention.typeOperation : 'Autre';
  };

  // Get machine name if available
  const getMachineName = (rapport) => {
    if (rapport.intervention && rapport.intervention.machine) {
      return rapport.intervention.machine.nom;
    }
    return 'N/A';
  };

  // Filter rapports based on search term
  const filteredRapports = rapports.filter(rapport => {
    const machineMatch = getMachineName(rapport).toLowerCase().includes(searchTerm.toLowerCase());
    const contentMatch = rapport.contenu && rapport.contenu.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = rapport.id && rapport.id.toString().includes(searchTerm);
    const titleMatch = rapport.titre && rapport.titre.toLowerCase().includes(searchTerm.toLowerCase());
    
    return machineMatch || contentMatch || idMatch || titleMatch;
  });

  // Filter by type if specified
  const typeFilteredRapports = filterType 
    ? filteredRapports.filter(rapport => {
        const type = getRapportType(rapport);
        return type.toLowerCase() === filterType.toLowerCase();
      })
    : filteredRapports;

  // Filter by validation status if specified
  const validationFilteredRapports = filterValidation === ''
    ? typeFilteredRapports
    : typeFilteredRapports.filter(rapport => 
        filterValidation === 'true' ? rapport.validation : !rapport.validation
      );

  // Sort filtered rapports
  const sortedRapports = [...validationFilteredRapports].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField === 'machine') {
      valA = getMachineName(a);
      valB = getMachineName(b);
    } else if (sortField === 'type') {
      valA = getRapportType(a);
      valB = getRapportType(b);
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
        <h1 className="text-2xl font-bold text-gray-800">Rapports</h1>
        
        {hasPermission('rapport-create') && (
          <Link to="/rapports/new">
            <Button 
              variant="primary"
              icon={<RiAddLine />}
            >
              Nouveau rapport
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
              placeholder="Rechercher par titre, contenu ou machine..."
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
                <option value="Rénovation">Rénovation</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Autre">Autre</option>
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
            
            <div className="relative">
              <select
                className="w-full appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterValidation}
                onChange={e => setFilterValidation(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="true">Validés</option>
                <option value="false">Non validés</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <RiFilterLine className="text-gray-400" />
              </div>
              {filterValidation !== '' && (
                <button 
                  className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterValidation('')}
                >
                  <RiCloseCircleLine />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {sortedRapports.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <RiFileTextLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Aucun rapport trouvé</p>
            <p className="text-sm mt-1">Les rapports apparaîtront ici une fois créés</p>
            
            {hasPermission('rapport-create') && (
              <Link to="/rapports/new">
                <Button 
                  variant="outline" 
                  className="mt-4"
                  icon={<RiAddLine />}
                >
                  Créer un rapport
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
                    onClick={() => handleSort('titre')}
                  >
                    Titre
                    {sortField === 'titre' && (
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
                    Statut
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
                {sortedRapports.map((rapport) => (
                  <tr key={rapport.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rapport.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rapport.titre || `Rapport #${rapport.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rapport.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {getRapportType(rapport)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {getMachineName(rapport)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rapport.validation 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rapport.validation ? 'Validé' : 'En attente'}
                      </span>
                      {rapport.gestionAdministrative && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Géré
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {hasPermission('rapport-view') && (
                          <Link to={`/rapports/${rapport.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEyeLine />}
                              title="Voir les détails"
                            />
                          </Link>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          icon={<RiFileDownloadLine />}
                          title="Télécharger le rapport"
                          onClick={() => {/* Implement download logic */}}
                        />
                        
                        {hasPermission('rapport-validate') && !rapport.validation && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            icon={<RiCheckLine />}
                            title="Valider le rapport"
                            onClick={() => setValidateConfirm(rapport.id)}
                          />
                        )}
                        
                        {hasPermission('rapport-edit') && !rapport.validation && (
                          <Link to={`/rapports/${rapport.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<RiEdit2Line />}
                              title="Modifier"
                            />
                          </Link>
                        )}
                        
                        {hasPermission('rapport-delete') && !rapport.validation && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<RiDeleteBin6Line />}
                            title="Supprimer"
                            onClick={() => setDeleteConfirm(rapport.id)}
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
              Êtes-vous sûr de vouloir supprimer ce rapport ? 
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
                onClick={() => handleDeleteRapport(deleteConfirm)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Validate Confirmation Modal */}
      {validateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la validation</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir valider ce rapport ? 
              Cette action est irréversible et le rapport ne pourra plus être modifié ou supprimé.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setValidateConfirm(null)}
              >
                Annuler
              </Button>
              <Button 
                variant="success" 
                size="sm"
                onClick={() => handleValidateRapport(validateConfirm)}
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rapports;