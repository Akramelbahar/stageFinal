import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  RiFileTextLine, RiCalendarLine, RiUser3Line, RiSettings4Line, 
  RiCheckLine, RiEdit2Line, RiArrowLeftLine, RiDownload2Line,
  RiAlertLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

// API functions
import { getRapportById, validateRapport } from '../api/rapports';

const RapportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(false);
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);

  // Fetch rapport data
  useEffect(() => {
    const fetchRapport = async () => {
      setLoading(true);
      try {
        const response = await getRapportById(id);
        setRapport(response.data);
      } catch (err) {
        console.error('Error fetching rapport:', err);
        setError('Erreur lors du chargement du rapport');
      } finally {
        setLoading(false);
      }
    };

    fetchRapport();
  }, [id]);

  // Handle validation
  const handleValidateRapport = async () => {
    setValidating(true);
    setError(null);
    
    try {
      await validateRapport(id);
      
      // Update local state
      setRapport(prev => ({
        ...prev,
        validation: true
      }));
      
      setShowValidateConfirm(false);
    } catch (err) {
      console.error('Error validating rapport:', err);
      setError('Erreur lors de la validation du rapport');
    } finally {
      setValidating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Determine rapport type
  const getRapportType = (rapport) => {
    if (rapport.renovation) return 'Rénovation';
    if (rapport.maintenance) return 'Maintenance';
    return 'Autre';
  };

  // Get machine name if available
  const getMachineName = (rapport) => {
    if (rapport.intervention && rapport.intervention.machine) {
      return rapport.intervention.machine.nom;
    }
    return 'N/A';
  };

  // Get intervention type
  const getInterventionType = (rapport) => {
    if (rapport.intervention) {
      return rapport.intervention.typeOperation;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !rapport) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div className="flex items-start">
          <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
          <div>
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              icon={<RiArrowLeftLine />}
              onClick={() => navigate('/rapports')}
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!rapport) {
    return (
      <div className="text-center py-10 text-gray-500">
        <RiFileTextLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium">Rapport non trouvé</p>
        <Button 
          variant="outline" 
          className="mt-4"
          icon={<RiArrowLeftLine />}
          onClick={() => navigate('/rapports')}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Détails du rapport</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            icon={<RiArrowLeftLine />}
            onClick={() => navigate('/rapports')}
          >
            Retour
          </Button>
          
          <Button 
            variant="outline"
            icon={<RiDownload2Line />}
            onClick={() => {/* Implement download logic */}}
          >
            Télécharger
          </Button>
          
          {hasPermission('rapport-edit') && !rapport.validation && (
            <Link to={`/rapports/${id}/edit`}>
              <Button 
                variant="primary"
                icon={<RiEdit2Line />}
              >
                Modifier
              </Button>
            </Link>
          )}
          
          {hasPermission('rapport-validate') && !rapport.validation && (
            <Button 
              variant="success"
              icon={<RiCheckLine />}
              onClick={() => setShowValidateConfirm(true)}
            >
              Valider
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{rapport.titre || `Rapport #${rapport.id}`}</h2>
              <span 
                className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                  rapport.validation 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {rapport.validation ? 'Validé' : 'En attente'}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Contenu du rapport</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap">
                {rapport.contenu || 'Aucun contenu disponible'}
              </div>
            </div>
            
            {rapport.gestionAdministrative && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Gestion administrative</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Commande d'achat</p>
                    <p className="font-medium">{rapport.gestionAdministrative.commandeAchat || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Facturation</p>
                    <p className="font-medium">{rapport.gestionAdministrative.facturation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <span 
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        rapport.gestionAdministrative.validation 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {rapport.gestionAdministrative.validation ? 'Validé' : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {!rapport.gestionAdministrative && rapport.validation && hasPermission('gestion-create') && (
              <div className="border-t pt-4 mt-4">
                <p className="text-gray-600 mb-2">Ce rapport est validé mais n'a pas encore de gestion administrative.</p>
                <Link to={`/gestions/new?rapport=${rapport.id}`}>
                  <Button variant="outline">
                    Créer une gestion administrative
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
        
        <div>
          <Card>
            <h3 className="text-lg font-medium mb-4">Informations</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <RiCalendarLine className="mr-1" />
                  Date de création
                </div>
                <p className="font-medium">{formatDate(rapport.dateCreation)}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <RiFileTextLine className="mr-1" />
                  Type de rapport
                </div>
                <p className="font-medium">{getRapportType(rapport)}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <RiSettings4Line className="mr-1" />
                  Machine concernée
                </div>
                <p className="font-medium">{getMachineName(rapport)}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <RiFileTextLine className="mr-1" />
                  Type d'intervention
                </div>
                <p className="font-medium">{getInterventionType(rapport)}</p>
              </div>
              
              {rapport.intervention && (
                <div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <RiFileTextLine className="mr-1" />
                    Intervention liée
                  </div>
                  <p className="font-medium">
                    <Link 
                      to={`/interventions/${rapport.intervention_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Voir l'intervention #{rapport.intervention_id}
                    </Link>
                  </p>
                </div>
              )}
              
              {rapport.renovation && (
                <div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <RiFileTextLine className="mr-1" />
                    Rénovation liée
                  </div>
                  <p className="font-medium">
                    <Link 
                      to={`/interventions/${rapport.intervention_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Voir l'intervention
                    </Link>
                  </p>
                </div>
              )}
              
              {rapport.maintenance && (
                <div>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <RiFileTextLine className="mr-1" />
                    Maintenance liée
                  </div>
                  <p className="font-medium">
                    <Link 
                      to={`/interventions/${rapport.intervention_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Voir l'intervention
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Validate Confirmation Modal */}
      {showValidateConfirm && (
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
                onClick={() => setShowValidateConfirm(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="success" 
                size="sm"
                onClick={handleValidateRapport}
                disabled={validating}
              >
                {validating ? 'Validation...' : 'Valider'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportDetail;