import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  RiEdit2Line, RiArrowLeftLine, RiUserLine, 
  RiCalendarEventLine, RiTimeLine, RiCheckboxCircleLine,
  RiCloseCircleLine, RiListCheck, RiAlertLine
} from 'react-icons/ri';

// API calls
import { getPlanificationById } from '../api/planifications';
import { getUrgentInterventions } from '../api/interventions';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const PlanificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [planification, setPlanification] = useState(null);
  const [urgentInterventions, setUrgentInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch planification data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch planification details
        const planificationResponse = await getPlanificationById(id);
        setPlanification(planificationResponse.data);
        
        // Fetch urgent interventions for comparison
        const urgentResponse = await getUrgentInterventions();
        setUrgentInterventions(urgentResponse.data || []);
        
      } catch (err) {
        console.error('Error fetching planification details:', err);
        setError('Erreur lors du chargement des détails de la planification: ' + (err.message || err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Check permissions
  useEffect(() => {
    if (!hasPermission('planification-view')) {
      navigate('/forbidden');
    }
  }, [hasPermission, navigate]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Check if an intervention is urgent
  const isUrgentIntervention = (interventionId) => {
    return urgentInterventions.some(urgent => urgent.id === interventionId);
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <Button 
          variant="outline"
          className="mt-4"
          icon={<RiArrowLeftLine />}
          onClick={() => navigate('/planifications')}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  if (!planification) {
    return (
      <div className="text-center py-10 text-gray-500">
        <RiAlertLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium">Planification non trouvée</p>
        <Button 
          variant="outline"
          className="mt-4"
          icon={<RiArrowLeftLine />}
          onClick={() => navigate('/planifications')}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline"
            className="mr-4"
            icon={<RiArrowLeftLine />}
            onClick={() => navigate('/planifications')}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Planification #{planification.id}
          </h1>
        </div>
        
        {hasPermission('planification-edit') && (
          <Link to={`/planifications/${planification.id}/edit`}>
            <Button 
              variant="outline"
              icon={<RiEdit2Line />}
            >
              Modifier
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main information card */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <RiUserLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsable</p>
                <p className="font-medium">
                  {planification.utilisateur?.nom || 'Non assigné'}
                  {planification.utilisateur?.section && (
                    <span className="text-gray-500 text-sm ml-1">
                      ({planification.utilisateur.section})
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <RiCalendarEventLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="font-medium">{formatDate(planification.dateCreation)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <RiTimeLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacité d'exécution</p>
                <p className="font-medium">{planification.capaciteExecution || 'Non spécifiée'}</p>
              </div>
            </div>
            
            <div className="flex items-start md:col-span-2">
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  {planification.urgencePrise ? (
                    <RiCheckboxCircleLine className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <RiCloseCircleLine className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>Prise en charge des urgences possible</span>
                </div>
                
                <div className="flex items-center">
                  {planification.disponibilitePDR ? (
                    <RiCheckboxCircleLine className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <RiCloseCircleLine className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>Disponibilité des pièces de rechange</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Interventions card */}
        <Card className="md:col-span-3">
          <div className="flex items-center mb-4">
            <RiListCheck className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold">Interventions planifiées</h2>
          </div>
          
          {(!planification.interventions || planification.interventions.length === 0) ? (
            <div className="py-8 text-center text-gray-500">
              <p>Aucune intervention n'est associée à cette planification</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type d'opération
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Machine
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgence
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {planification.interventions.map((intervention, index) => (
                    <tr key={intervention.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link to={`/interventions/${intervention.id}`} className="hover:underline">
                          #{intervention.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {intervention.typeOperation || 'Non spécifié'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {intervention.machine ? (
                          <Link to={`/machines/${intervention.machine.id}`} className="hover:underline text-blue-600">
                            {intervention.machine.nom}
                          </Link>
                        ) : (
                          'Non spécifiée'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          intervention.statut === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                          intervention.statut === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          intervention.statut === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {intervention.statut || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {intervention.urgence || isUrgentIntervention(intervention.id) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgente
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(intervention.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PlanificationDetail;