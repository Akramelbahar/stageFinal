import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  RiEdit2Line, RiDeleteBin6Line, RiArrowLeftLine, 
  RiToolsLine, RiHistoryLine, RiAlertLine 
} from 'react-icons/ri';

// API calls
import { getMachineById, deleteMachine } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useAuth from '../hooks/useAuth';

const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch machine data
  useEffect(() => {
    const fetchMachine = async () => {
      setLoading(true);
      try {
        const response = await getMachineById(id);
        setMachine(response.data);
      } catch (err) {
        console.error('Error fetching machine:', err);
        setError('Erreur lors du chargement des données de la machine');
      } finally {
        setLoading(false);
      }
    };

    fetchMachine();
  }, [id]);

  // Handle machine deletion
  const handleDeleteMachine = async () => {
    try {
      await deleteMachine(id);
      navigate('/machines');
    } catch (err) {
      console.error('Error deleting machine:', err);
      setError('Erreur lors de la suppression de la machine');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          className="underline mt-2" 
          onClick={() => navigate('/machines')}
        >
          Retour à la liste des machines
        </button>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">Machine non trouvée</h2>
        <p className="mt-2 text-gray-500">La machine demandée n'existe pas ou a été supprimée.</p>
        <Link to="/machines" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour à la liste des machines
        </Link>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/machines" className="mr-4">
            <Button 
              variant="outline" 
              size="sm"
              icon={<RiArrowLeftLine />}
            >
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{machine.nom}</h1>
          <div className="ml-4">
            <StatusBadge status={machine.etat} />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {hasPermission('intervention-create') && (
            <Link to={`/interventions/new?machine=${machine.id}`}>
              <Button 
                variant="primary" 
                icon={<RiToolsLine />}
              >
                Nouvelle intervention
              </Button>
            </Link>
          )}
          
          {hasPermission('machine-edit') && (
            <Link to={`/machines/${machine.id}/edit`}>
              <Button 
                variant="outline" 
                icon={<RiEdit2Line />}
              >
                Modifier
              </Button>
            </Link>
          )}
          
          {hasPermission('machine-delete') && (
            <Button 
              variant="outline" 
              className="text-red-600 hover:bg-red-50 border-red-300"
              icon={<RiDeleteBin6Line />}
              onClick={() => setDeleteConfirm(true)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>
      
      {/* Machine Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Informations générales" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">ID</p>
              <p className="mt-1">{machine.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="mt-1">{machine.type || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">État</p>
              <p className="mt-1">
                <StatusBadge status={machine.etat} />
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Valeur</p>
              <p className="mt-1">{machine.valeur}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Date prochaine maintenance</p>
              <p className="mt-1">{formatDate(machine.dateProchaineMaint)}</p>
            </div>
            {machine.details && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Détails</p>
                <p className="mt-1 whitespace-pre-line">{machine.details}</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Maintenance">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Prochaine maintenance</p>
            <p className="mt-1 font-medium">
              {machine.dateProchaineMaint ? (
                formatDate(machine.dateProchaineMaint)
              ) : (
                <span className="text-orange-500">Non planifiée</span>
              )}
            </p>
          </div>
          
          {machine.dateProchaineMaint && new Date(machine.dateProchaineMaint) <= new Date() && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
              <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
              <div>
                <p className="font-medium">Maintenance requise</p>
                <p className="text-sm mt-1">
                  La date de maintenance est dépassée. Planifiez une intervention rapidement.
                </p>
              </div>
            </div>
          )}
          
          <Link to={`/maintenances/machine/${machine.id}`} className="text-blue-600 hover:underline text-sm flex items-center">
            <RiHistoryLine className="mr-1" />
            Voir l'historique des maintenances
          </Link>
        </Card>
        
        {/* Recent Interventions */}
        <Card 
          title="Interventions récentes" 
          className="md:col-span-3"
          action={
            hasPermission('intervention-list') && (
              <Link to={`/interventions/machine/${machine.id}`}>
                <Button variant="outline" size="sm">
                  Voir toutes
                </Button>
              </Link>
            )
          }
        >
          {machine.interventions && machine.interventions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {machine.interventions.slice(0, 5).map((intervention) => (
                    <tr key={intervention.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(intervention.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {intervention.typeOperation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {intervention.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={intervention.statut} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          to={`/interventions/${intervention.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Aucune intervention enregistrée
            </div>
          )}
        </Card>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer la machine "{machine.nom}" ? Cette action est irréversible.
            </p>
            
            {machine.interventions && machine.interventions.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
                <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
                <div>
                  <p className="font-medium">Attention</p>
                  <p className="text-sm mt-1">
                    Cette machine possède {machine.interventions.length} intervention(s) associée(s).
                    La suppression de cette machine entraînera également la suppression de ces interventions.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirm(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="danger"
                onClick={handleDeleteMachine}
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

export default MachineDetail;
