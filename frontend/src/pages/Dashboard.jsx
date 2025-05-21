import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiDashboardLine, RiToolsLine, RiCalendarCheckLine, 
  RiFileTextLine, RiSearchLine, RiAddLine
} from 'react-icons/ri';

// API calls - Properly implemented
import { 
  getDashboardStatistics, 
  getUrgentInterventions,
  getRecentActivities,
  getUpcomingMaintenance
} from '../api/dashboard';
import { getAllMachines } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/dashboard/StatCard';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [machines, setMachines] = useState([]);
  const [urgentInterventions, setUrgentInterventions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use Promise.allSettled to handle partial failures
        const [statsResult, machinesResult, urgentResult, activitiesResult] = 
          await Promise.allSettled([
            getDashboardStatistics(),
            getAllMachines(),
            getUrgentInterventions(),
            getRecentActivities()
          ]);

        // Handle statistics data
        if (statsResult.status === 'fulfilled') {
          setStatistics(statsResult.value);
        } else {
          console.error('Failed to fetch statistics:', statsResult.reason);
        }

        // Handle machines data
        if (machinesResult.status === 'fulfilled') {
          setMachines(machinesResult.value?.data || []);
        } else {
          console.error('Failed to fetch machines:', machinesResult.reason);
        }

        // Handle urgent interventions data
        if (urgentResult.status === 'fulfilled') {
          setUrgentInterventions(urgentResult.value?.data || []);
        } else {
          console.error('Failed to fetch urgent interventions:', urgentResult.reason);
        }

        // Handle recent activities data
        if (activitiesResult.status === 'fulfilled') {
          setRecentActivities(activitiesResult.value?.data || []);
        } else {
          console.error('Failed to fetch recent activities:', activitiesResult.reason);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter machines based on search term
  const filteredMachines = machines.filter(machine => 
    machine.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Safely access statistics
  const getMachineStat = (status) => {
    try {
      return statistics?.machines?.byStatus.find(s => s.etat === status)?.total || 0;
    } catch (e) {
      return 0;
    }
  };

  const getInterventionStat = (status) => {
    try {
      return statistics?.interventions?.byStatus.find(s => s.statut === status)?.total || 0;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="underline mt-2" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Machines en service"
          value={getMachineStat('OPERATIONNEL')}
          subtitle={`Total: ${statistics?.machines?.total || 0}`}
          icon={<RiDashboardLine />}
          color="blue"
        />
        
        <StatCard
          title="Interventions en cours"
          value={getInterventionStat('IN_PROGRESS')}
          subtitle={`${statistics?.interventions?.urgent || 0} urgentes`}
          icon={<RiToolsLine />}
          color="orange"
        />
        
        <StatCard
          title="Maintenances planifiées"
          value={statistics?.maintenance?.total || 0}
          subtitle="Cette semaine"
          icon={<RiCalendarCheckLine />}
          color="green"
        />
        
        <StatCard
          title="Rapports en attente"
          value="5" // Default fallback
          subtitle="À valider"
          icon={<RiFileTextLine />}
          color="red"
        />
      </div>
      
      {/* Machines Section */}
      <Card
        title="Machines électriques"
        action={
          hasPermission('machine-create') ? (
            <Link to="/machines/new">
              <Button 
                variant="primary" 
                size="sm"
                icon={<RiAddLine />}
              >
                Nouvelle machine
              </Button>
            </Link>
          ) : null
        }
      >
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
          <div className="text-center py-4 text-gray-500">
            Aucune machine trouvée
          </div>
        ) : (
          <div className="divide-y">
            {filteredMachines.slice(0, 3).map((machine) => (
              <div key={machine.id} className="py-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      <Link to={`/machines/${machine.id}`} className="hover:text-blue-600">
                        {machine.id} - {machine.nom}
                      </Link>
                    </h4>
                    <div className="text-sm text-gray-500 mt-1">
                      Type: {machine.type || 'Non spécifié'} | 
                      {machine.dateProchaineMaint ? 
                        ` Prochaine maintenance: ${new Date(machine.dateProchaineMaint).toLocaleDateString()}` : 
                        ` Garantie: ${machine.garantie || 'Non spécifiée'}`
                      }
                    </div>
                  </div>
                  <StatusBadge status={machine.etat} />
                </div>
                <div className="flex gap-2 mt-2">
                  {hasPermission('diagnostic-view') && (
                    <Link to={`/diagnostics/machine/${machine.id}`}>
                      <Button variant="outline" size="sm">Diagnostic</Button>
                    </Link>
                  )}
                  {hasPermission('intervention-view') && (
                    <Link to={`/interventions/machine/${machine.id}`}>
                      <Button variant="outline" size="sm">Intervention</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {machines.length > 3 && (
          <div className="mt-4 text-center">
            <Link to="/machines">
              <Button variant="outline">
                Voir toutes les machines ({machines.length})
              </Button>
            </Link>
          </div>
        )}
      </Card>
      
      {/* Recent Interventions History */}
      <Card title="Historique des interventions récentes">
        <div className="space-y-4">
          {recentActivities.slice(0, 3).map((activity, index) => (
            <div key={index} className="flex">
              <div className="mr-4 relative">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                {index < recentActivities.length - 1 && (
                  <div className="absolute top-10 bottom-0 left-1/2 w-0.5 -ml-px h-full bg-gray-200 z-0"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {activity.date ? new Date(activity.date).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Date inconnue'}
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{activity.type === 'intervention' ? activity.operation : activity.maintenance_type}</span> - {activity.machine}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.description || "Pas de description disponible"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/interventions">
            <Button variant="outline">
              Voir tout l'historique
            </Button>
          </Link>
        </div>
      </Card>
      
      {/* Bottom Section - Two Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Control */}
        <Card title="Contrôle Qualité - Récent">
          <div className="space-y-4">
            {urgentInterventions.slice(0, 2).map((intervention) => (
              <div key={intervention.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <div className="font-medium">
                  <Link to={`/controles/intervention/${intervention.id}`} className="hover:text-blue-600">
                    {intervention.machine?.nom || 'Machine inconnue'}
                  </Link>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="inline-block mr-2">
                    <StatusBadge status={intervention.statut} />
                  </span>
                  Date: {intervention.date ? new Date(intervention.date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
            
            <Link to="/controles" className="block text-blue-600 hover:underline text-sm mt-2">
              Voir tous les contrôles
            </Link>
          </div>
        </Card>
        
        {/* Recent Reports */}
        <Card title="Rapports récents">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivities.slice(0, 3).map((activity, index) => (
                <tr key={index}>
                  <td className="px-3 py-2.5 text-sm text-gray-800">
                    {activity.type === 'intervention' ? activity.operation : activity.maintenance_type}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-800">
                    {activity.machine}
                  </td>
                  <td className="px-3 py-2.5 text-sm">
                    <StatusBadge status={activity.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Link to="/rapports" className="block text-blue-600 hover:underline text-sm mt-4">
            Voir tous les rapports
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;