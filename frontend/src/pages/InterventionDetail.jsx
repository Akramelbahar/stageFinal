import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  RiEditLine, 
  RiDeleteBin6Line, 
  RiArrowLeftLine, 
  RiCheckLine, 
  RiCloseCircleLine,
  RiAlertLine,
  RiTimeLine,
  RiFileListLine,
  RiToolsLine,
  RiHistoryLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';

// API functions
import { getInterventionById, deleteIntervention } from '../api/interventions';
import { getDiagnosticByIntervention } from '../api/diagnostics';
import { getControleByIntervention } from '../api/controles';

// Hooks
import useAuth from '../hooks/useAuth';

const InterventionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [intervention, setIntervention] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [controle, setControle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [relatedDataLoading, setRelatedDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch intervention details
        const response = await getInterventionById(id);
        setIntervention(response.data);
        
        // After loading the intervention, fetch related data
        fetchRelatedData(id);
      } catch (err) {
        console.error('Error fetching intervention:', err);
        setError('Erreur lors du chargement des données de l\'intervention');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch related data like diagnostic and quality control
  const fetchRelatedData = async (interventionId) => {
    setRelatedDataLoading(true);
    try {
      // Try to fetch diagnostic if exists
      try {
        const diagResponse = await getDiagnosticByIntervention(interventionId);
        if (diagResponse && diagResponse.data) {
          setDiagnostic(diagResponse.data);
        }
      } catch (diagErr) {
        // It's ok if diagnostic doesn't exist yet
        console.log('No diagnostic found for this intervention');
      }
      
      // Try to fetch quality control if exists
      try {
        const controleResponse = await getControleByIntervention(interventionId);
        if (controleResponse && controleResponse.data) {
          setControle(controleResponse.data);
        }
      } catch (controleErr) {
        // It's ok if quality control doesn't exist yet
        console.log('No quality control found for this intervention');
      }
    } catch (err) {
      console.error('Error fetching related data:', err);
    } finally {
      setRelatedDataLoading(false);
    }
  };

  // Handle intervention deletion
  const handleDelete = async () => {
    try {
      await deleteIntervention(id);
      navigate('/interventions');
    } catch (err) {
      console.error('Error deleting intervention:', err);
      setError('Erreur lors de la suppression de l\'intervention');
      setDeleteConfirm(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
        <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Intervention non trouvée</p>
        <Link to="/interventions" className="text-blue-500 mt-4 inline-block">
          Retour à la liste des interventions
        </Link>
      </div>
    );
  }

  // Determine if this intervention has a maintenance or renovation record
  const hasMaintenance = intervention.maintenance !== null;
  const hasRenovation = intervention.renovation !== null;

  return (
    <div>
      {/* Header section with title and action buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/interventions" className="mr-4">
            <Button 
              variant="outline" 
              size="sm" 
              icon={<RiArrowLeftLine />}
            >
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Intervention #{intervention.id}
          </h1>
          {intervention.urgence && (
            <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md flex items-center">
              <RiAlertLine className="mr-1" /> Urgente
            </span>
          )}
          <div className="ml-4">
            <StatusBadge status={intervention.statut} size="lg" />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {/* Edit button - only show if not completed and user has permission */}
          {hasPermission('intervention-edit') && intervention.statut !== 'COMPLETED' && (
            <Link to={`/interventions/${intervention.id}/edit`}>
              <Button 
                variant="outline"
                icon={<RiEditLine />}
              >
                Modifier
              </Button>
            </Link>
          )}
          
          {/* Delete button - only show if user has permission */}
          {hasPermission('intervention-delete') && (
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
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main information */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Détails de l'intervention</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type d'opération</h3>
                <p className="text-lg">{intervention.typeOperation}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-lg">{formatDate(intervention.date)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Machine</h3>
                {intervention.machine ? (
                  <Link to={`/machines/${intervention.machine.id}`} className="text-lg text-blue-600 hover:underline">
                    {intervention.machine.nom}
                  </Link>
                ) : (
                  <p className="text-lg text-gray-600">Non spécifiée</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                <StatusBadge status={intervention.statut} />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-base whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                {intervention.description || "Aucune description disponible."}
              </p>
            </div>
            
            {/* Show observations field if exists */}
            {intervention.observation && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Observations supplémentaires</h3>
                <p className="text-base whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {intervention.observation}
                </p>
              </div>
            )}
            
            {/* Show technicians/users associated with this intervention */}
            {intervention.utilisateurs && intervention.utilisateurs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Techniciens assignés</h3>
                <div className="flex flex-wrap gap-2">
                  {intervention.utilisateurs.map(user => (
                    <div key={user.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {user.nom}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* If this intervention is in a planification, show that info */}
            {intervention.planifications && intervention.planifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Planifications</h3>
                <div className="space-y-2">
                  {intervention.planifications.map(plan => (
                    <div key={plan.id} className="flex items-center">
                      <RiTimeLine className="text-gray-500 mr-2" />
                      <Link to={`/planifications/${plan.id}`} className="text-blue-600 hover:underline">
                        Planification #{plan.id} ({formatDate(plan.dateCreation)})
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          {/* Diagnostic section (if exists) */}
          {diagnostic && (
            <Card className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Diagnostic</h2>
                {hasPermission('diagnostic-edit') && (
                  <Link to={`/diagnostics/${diagnostic.id}/edit`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<RiEditLine />}
                    >
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Date de création</h3>
                <p>{formatDate(diagnostic.dateCreation)}</p>
              </div>
              
              {/* Display travail requis, besoins PDR, and charges réalisées if available */}
              {diagnostic.travailRequis && diagnostic.travailRequis.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Travail requis</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnostic.travailRequis.map((travail, index) => (
                      <li key={index} className="text-gray-700">{travail}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {diagnostic.besoinPDR && diagnostic.besoinPDR.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Besoins en pièces détachées</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnostic.besoinPDR.map((piece, index) => (
                      <li key={index} className="text-gray-700">{piece}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {diagnostic.chargesRealisees && diagnostic.chargesRealisees.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Charges réalisées</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnostic.chargesRealisees.map((charge, index) => (
                      <li key={index} className="text-gray-700">{charge}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {(!diagnostic.travailRequis || diagnostic.travailRequis.length === 0) && 
               (!diagnostic.besoinPDR || diagnostic.besoinPDR.length === 0) && 
               (!diagnostic.chargesRealisees || diagnostic.chargesRealisees.length === 0) && (
                <p className="text-gray-600 italic">Aucun détail supplémentaire disponible.</p>
              )}
            </Card>
          )}
          
          {/* Maintenance details if this is a maintenance intervention */}
          {hasMaintenance && (
            <Card className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Détails de maintenance</h2>
                {hasPermission('maintenance-edit') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    icon={<RiEditLine />}
                    onClick={() => navigate(`/maintenances/${intervention.maintenance.intervention_id}/edit`)}
                  >
                    Modifier
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type de maintenance</h3>
                  <p className="text-lg">{intervention.maintenance.typeMaintenance}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Durée (heures)</h3>
                  <p className="text-lg">{intervention.maintenance.duree}</p>
                </div>
              </div>
              
              {/* Display pieces used if available */}
              {intervention.maintenance.pieces && intervention.maintenance.pieces.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Pièces utilisées</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {intervention.maintenance.pieces.map((piece, index) => (
                      <li key={index} className="text-gray-700">{piece}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
          
          {/* Renovation details if this is a renovation intervention */}
          {hasRenovation && (
            <Card className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Détails de rénovation</h2>
                {hasPermission('renovation-edit') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    icon={<RiEditLine />}
                    onClick={() => navigate(`/renovations/${intervention.renovation.intervention_id}/edit`)}
                  >
                    Modifier
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Coût</h3>
                  <p className="text-lg">{intervention.renovation.cout} €</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Durée estimée (jours)</h3>
                  <p className="text-lg">{intervention.renovation.dureeEstimee}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Disponibilité pièces détachées</h3>
                  <div className="flex items-center mt-1">
                    {intervention.renovation.disponibilitePDR ? (
                      <><RiCheckLine className="text-green-500 mr-1" /> <span>Disponible</span></>
                    ) : (
                      <><RiCloseCircleLine className="text-red-500 mr-1" /> <span>Non disponible</span></>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Objectif</h3>
                <p className="text-base whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {intervention.renovation.objectif}
                </p>
              </div>
            </Card>
          )}
          
          {/* Quality control section */}
          {controle && (
            <Card className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Contrôle Qualité</h2>
                {hasPermission('controle-edit') && (
                  <Link to={`/controles/${controle.id}/edit`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<RiEditLine />}
                    >
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Date de contrôle</h3>
                <p>{formatDate(controle.dateControle)}</p>
              </div>
              
              {controle.resultatsEssais && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Résultats des essais</h3>
                  <p className="text-base whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {controle.resultatsEssais}
                  </p>
                </div>
              )}
              
              {controle.analyseVibratoire && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Analyse vibratoire</h3>
                  <p className="text-base whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {controle.analyseVibratoire}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
        
        {/* Right column - Actions & Quick Links */}
        <div className="lg:col-span-1">
          {/* Actions card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              {/* Show appropriate action buttons based on intervention state and type */}
              
              {/* Create diagnostic if doesn't exist yet */}
              {!diagnostic && hasPermission('diagnostic-create') && (
                <Link 
                  to={`/diagnostics/new?intervention=${intervention.id}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md w-full"
                >
                  <RiFileListLine className="text-blue-500 mr-3 text-xl" />
                  <span>Créer un diagnostic</span>
                </Link>
              )}
              
              {/* Create maintenance if this is a maintenance intervention type and doesn't exist yet */}
              {!hasMaintenance && !hasRenovation && 
               intervention.typeOperation === 'Maintenance' && 
               hasPermission('maintenance-create') && (
                <Link 
                  to={`/maintenances/new?intervention=${intervention.id}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md w-full"
                >
                  <RiToolsLine className="text-blue-500 mr-3 text-xl" />
                  <span>Créer une fiche maintenance</span>
                </Link>
              )}
              
              {/* Create renovation if this is a renovation intervention type and doesn't exist yet */}
              {!hasRenovation && !hasMaintenance && 
               intervention.typeOperation === 'Rénovation' && 
               hasPermission('renovation-create') && (
                <Link 
                  to={`/renovations/new?intervention=${intervention.id}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md w-full"
                >
                  <RiHistoryLine className="text-blue-500 mr-3 text-xl" />
                  <span>Créer une fiche rénovation</span>
                </Link>
              )}
              
              {/* Create quality control if doesn't exist yet */}
              {!controle && hasPermission('controle-create') && (
                <Link 
                  to={`/controles/new?intervention=${intervention.id}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md w-full"
                >
                  <RiCheckboxCircleLine className="text-blue-500 mr-3 text-xl" />
                  <span>Créer un contrôle qualité</span>
                </Link>
              )}
              
              {/* Create rapport */}
              {(hasMaintenance || hasRenovation) && hasPermission('rapport-create') && (
                <Link 
                  to={`/rapports/new?${hasMaintenance ? 'maintenance=' + intervention.maintenance.intervention_id : 'renovation=' + intervention.renovation.intervention_id}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md w-full"
                >
                  <RiFileListLine className="text-blue-500 mr-3 text-xl" />
                  <span>Créer un rapport</span>
                </Link>
              )}
              
              {/* If no actions available */}
              {!diagnostic && !hasPermission('diagnostic-create') &&
               !hasPermission('maintenance-create') && !hasPermission('renovation-create') &&
               !hasPermission('controle-create') && !hasPermission('rapport-create') && (
                <p className="text-gray-500 italic">Aucune action disponible</p>
              )}
            </div>
          </Card>
          
          {/* Related reports if any */}
          {intervention.rapports && intervention.rapports.length > 0 && (
            <Card className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Rapports associés</h2>
              
              <div className="space-y-2">
                {intervention.rapports.map(rapport => (
                  <Link 
                    key={rapport.id}
                    to={`/rapports/${rapport.id}`}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md w-full"
                  >
                    <div className={`mr-3 h-2 w-2 rounded-full ${rapport.validation ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-medium">Rapport #{rapport.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(rapport.dateCreation)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
          
          {/* Machine info card */}
          {intervention.machine && (
            <Card className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Machine concernée</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                  <Link to={`/machines/${intervention.machine.id}`} className="text-blue-600 hover:underline">
                    {intervention.machine.nom}
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">État</h3>
                  <p>{intervention.machine.etat}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Valeur</h3>
                  <p>{intervention.machine.valeur}</p>
                </div>
                
                {intervention.machine.dateProchaineMaint && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prochaine maintenance</h3>
                    <p>{formatDate(intervention.machine.dateProchaineMaint)}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Link 
                    to={`/interventions?machine=${intervention.machine.id}`}
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    <RiHistoryLine className="mr-1" />
                    Voir l'historique des interventions
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer cette intervention ? 
              Cette action est irréversible et supprimera également les données associées 
              (diagnostic, contrôle qualité, etc.).
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
                onClick={handleDelete}
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

export default InterventionDetail;