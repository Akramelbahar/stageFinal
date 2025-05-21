import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  RiEdit2Line, RiArrowLeftLine, RiDeleteBin6Line,
  RiAlertLine, RiCheckboxCircleLine, RiCloseCircleLine
} from 'react-icons/ri';

// API calls
import { getControleById, deleteControle } from '../api/controles';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import useAuth from '../hooks/useAuth';

const ControleQualiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [controle, setControle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch contrôle data
  useEffect(() => {
    const fetchControle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getControleById(id);
        setControle(response.data || null);
      } catch (err) {
        console.error('Error fetching controle:', err);
        setError('Erreur lors du chargement du contrôle qualité');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchControle();
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle deletion
  const handleDeleteControle = async () => {
    try {
      await deleteControle(id);
      navigate('/controles');
    } catch (err) {
      console.error('Error deleting controle:', err);
      setError('Erreur lors de la suppression du contrôle qualité');
    }
  };

  // Check permissions
  useEffect(() => {
    if (!hasPermission('controle-view')) {
      navigate('/forbidden');
    }
  }, [hasPermission, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!controle && !loading) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Contrôle qualité non trouvé.</p>
        <Link to="/controles" className="underline">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Détails du contrôle qualité #{controle?.id}
        </h1>
        <div className="flex space-x-2">
          <Link to="/controles">
            <Button
              variant="outline"
              icon={<RiArrowLeftLine />}
            >
              Retour
            </Button>
          </Link>
          
          {hasPermission('controle-edit') && (
            <Link to={`/controles/${id}/edit`}>
              <Button
                variant="primary"
                icon={<RiEdit2Line />}
              >
                Modifier
              </Button>
            </Link>
          )}
          
          {hasPermission('controle-delete') && (
            <Button
              variant="danger"
              icon={<RiDeleteBin6Line />}
              onClick={() => setDeleteConfirm(true)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="col-span-1">
          <h2 className="text-xl font-semibold mb-4">Informations principales</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date du contrôle</h3>
              <p className="mt-1">{formatDate(controle?.dateControle)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Machine</h3>
              {controle?.intervention?.machine ? (
                <Link 
                  to={`/machines/${controle.intervention.machine.id}`}
                  className="mt-1 text-blue-600 hover:underline block"
                >
                  {controle.intervention.machine.nom}
                </Link>
              ) : (
                <p className="mt-1 text-gray-400 italic">Non spécifiée</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Intervention associée</h3>
              {controle?.intervention ? (
                <div>
                  <Link 
                    to={`/interventions/${controle.intervention.id}`}
                    className="mt-1 text-blue-600 hover:underline block"
                  >
                    #{controle.intervention.id} - {controle.intervention.typeOperation || 'Intervention'}
                  </Link>
                  {controle.intervention.statut && (
                    <div className="mt-1">
                      <StatusBadge status={controle.intervention.statut} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-gray-400 italic">Non spécifiée</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">État de conformité</h3>
              <div className="mt-1">
                {controle?.conformite ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <RiCheckboxCircleLine className="mr-1" /> Conforme
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <RiCloseCircleLine className="mr-1" /> Non conforme
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Tests effectués</h3>
              <div className="mt-2 space-y-1">
                {controle?.resultatsEssais && (
                  <span className="inline-flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span>Essais réalisés</span>
                  </span>
                )}
                {controle?.analyseVibratoire && (
                  <span className="inline-flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span>Analyse vibratoire</span>
                  </span>
                )}
                {!controle?.resultatsEssais && !controle?.analyseVibratoire && (
                  <span className="text-gray-400 italic">Aucun test spécifié</span>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Résultats détaillés */}
        <Card className="col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Résultats et observations</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Résultat global</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {controle?.resultatGlobal ? (
                  <p className="whitespace-pre-wrap">{controle.resultatGlobal}</p>
                ) : (
                  <p className="text-gray-400 italic">Non spécifié</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Résultats des essais</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {controle?.resultatsEssais ? (
                  <p className="whitespace-pre-wrap">{controle.resultatsEssais}</p>
                ) : (
                  <p className="text-gray-400 italic">Non spécifié</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Analyse vibratoire</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {controle?.analyseVibratoire ? (
                  <p className="whitespace-pre-wrap">{controle.analyseVibratoire}</p>
                ) : (
                  <p className="text-gray-400 italic">Non spécifié</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Actions correctives</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {controle?.actionsCorrectives ? (
                  <p className="whitespace-pre-wrap">{controle.actionsCorrectives}</p>
                ) : (
                  <p className="text-gray-400 italic">Non spécifié</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Observations supplémentaires</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                {controle?.observations ? (
                  <p className="whitespace-pre-wrap">{controle.observations}</p>
                ) : (
                  <p className="text-gray-400 italic">Non spécifié</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
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
                onClick={() => setDeleteConfirm(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleDeleteControle}
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

export default ControleQualiteDetail;