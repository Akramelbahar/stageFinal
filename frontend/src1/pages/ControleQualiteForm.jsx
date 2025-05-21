import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

// API calls
import { getControleById, createControle, updateControle } from '../api/controles';
import { getInterventionsByMachine, getInterventionById } from '../api/interventions';
import { getAllMachines } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const ControleQualiteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Get intervention ID from query params if available
  const queryParams = new URLSearchParams(location.search);
  const interventionId = queryParams.get('intervention');
  
  // Form state
  const [formData, setFormData] = useState({
    dateControle: new Date().toISOString().split('T')[0],
    intervention_id: interventionId || '',
    resultatGlobal: '',
    resultatsEssais: '',
    analyseVibratoire: '',
    observations: '',
    conformite: false,
    actionsCorrectives: ''
  });
  
  const [machines, setMachines] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load control data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch machines list
        const machinesResponse = await getAllMachines();
        setMachines(machinesResponse.data || []);
        
        // If edit mode, fetch control data
        if (isEditMode) {
          const response = await getControleById(id);
          const controleData = response.data;
          
          // Format date for input field if exists
          if (controleData.dateControle) {
            const date = new Date(controleData.dateControle);
            const formattedDate = date.toISOString().split('T')[0];
            controleData.dateControle = formattedDate;
          }
          
          setFormData({
            ...controleData,
            intervention_id: controleData.intervention ? controleData.intervention.id : '',
          });
          
          // If intervention is available, set the machine
          if (controleData.intervention && controleData.intervention.machine) {
            setSelectedMachine(controleData.intervention.machine.id);
            
            // Fetch interventions for this machine
            const interventionsResponse = await getInterventionsByMachine(controleData.intervention.machine.id);
            setInterventions(interventionsResponse.data || []);
          }
        }
        // If interventionId is provided via query parameter
        else if (interventionId) {
          try {
            const interventionResponse = await getInterventionById(interventionId);
            const intervention = interventionResponse.data;
            
            if (intervention && intervention.machine) {
              setSelectedMachine(intervention.machine.id);
              
              // Fetch interventions for this machine
              const interventionsResponse = await getInterventionsByMachine(intervention.machine.id);
              setInterventions(interventionsResponse.data || []);
            }
          } catch (err) {
            console.error('Error fetching intervention:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, interventionId]);

  // Handle machine selection change - load related interventions
  const handleMachineChange = async (e) => {
    const machineId = e.target.value;
    setSelectedMachine(machineId);
    
    if (machineId) {
      try {
        const response = await getInterventionsByMachine(machineId);
        setInterventions(response.data || []);
        
        // Clear intervention selection
        setFormData(prev => ({ ...prev, intervention_id: '' }));
      } catch (err) {
        console.error('Error fetching interventions:', err);
      }
    } else {
      setInterventions([]);
      setFormData(prev => ({ ...prev, intervention_id: '' }));
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.intervention_id) {
      errors.intervention_id = 'L\'intervention est requise';
    }
    
    if (!formData.resultatGlobal.trim()) {
      errors.resultatGlobal = 'Le résultat global est requis';
    }
    
    if (!formData.conformite && !formData.actionsCorrectives.trim()) {
      errors.actionsCorrectives = 'Les actions correctives sont requises en cas de non-conformité';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const dataToSubmit = {
        ...formData,
        intervention_id: parseInt(formData.intervention_id)
      };
      
      if (isEditMode) {
        await updateControle(id, dataToSubmit);
      } else {
        await createControle(dataToSubmit); // This is the ADD operation
      }
      
      // Redirect after successful save
      navigate('/controles');
    } catch (err) {
      console.error('Error saving controle qualité:', err);
      setError('Erreur lors de l\'enregistrement du contrôle qualité');
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'controle-edit' : 'controle-create';
    if (!hasPermission(requiredPermission)) {
      navigate('/forbidden');
    }
  }, [hasPermission, isEditMode, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Modifier le contrôle qualité' : 'Nouveau contrôle qualité'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Machine selection - first select machine, then intervention */}
            <div>
              <label htmlFor="machine" className="block text-sm font-medium text-gray-700 mb-1">
                Machine *
              </label>
              <select
                id="machine"
                name="machine"
                value={selectedMachine}
                onChange={handleMachineChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={interventionId !== null}
              >
                <option value="">Sélectionner une machine</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.nom} ({machine.type || 'Non spécifié'})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Intervention selection */}
            <div>
              <label htmlFor="intervention_id" className="block text-sm font-medium text-gray-700 mb-1">
                Intervention *
              </label>
              <select
                id="intervention_id"
                name="intervention_id"
                value={formData.intervention_id}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.intervention_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={interventionId !== null || !selectedMachine}
              >
                <option value="">Sélectionner une intervention</option>
                {interventions.map(intervention => (
                  <option key={intervention.id} value={intervention.id}>
                    #{intervention.id} - {intervention.typeOperation} ({new Date(intervention.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {formErrors.intervention_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.intervention_id}</p>
              )}
            </div>
            
            {/* Date de contrôle */}
            <div>
              <label htmlFor="dateControle" className="block text-sm font-medium text-gray-700 mb-1">
                Date de contrôle *
              </label>
              <input
                type="date"
                id="dateControle"
                name="dateControle"
                value={formData.dateControle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Conformité */}
            <div className="flex items-center mt-8">
              <input
                type="checkbox"
                id="conformite"
                name="conformite"
                checked={formData.conformite}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="conformite" className="ml-2 block text-sm text-gray-700">
                Conforme aux exigences
              </label>
            </div>
            
            {/* Résultat global */}
            <div className="md:col-span-2">
              <label htmlFor="resultatGlobal" className="block text-sm font-medium text-gray-700 mb-1">
                Résultat global *
              </label>
              <textarea
                id="resultatGlobal"
                name="resultatGlobal"
                value={formData.resultatGlobal}
                onChange={handleChange}
                rows="3"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.resultatGlobal ? 'border-red-300' : 'border-gray-300'
                }`}
              ></textarea>
              {formErrors.resultatGlobal && (
                <p className="mt-1 text-sm text-red-600">{formErrors.resultatGlobal}</p>
              )}
            </div>
            
            {/* Résultats des essais */}
            <div>
              <label htmlFor="resultatsEssais" className="block text-sm font-medium text-gray-700 mb-1">
                Résultats des essais
              </label>
              <textarea
                id="resultatsEssais"
                name="resultatsEssais"
                value={formData.resultatsEssais || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            {/* Analyse vibratoire */}
            <div>
              <label htmlFor="analyseVibratoire" className="block text-sm font-medium text-gray-700 mb-1">
                Analyse vibratoire
              </label>
              <textarea
                id="analyseVibratoire"
                name="analyseVibratoire"
                value={formData.analyseVibratoire || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            {/* Actions correctives (required if not conformant) */}
            {/* Actions correctives (required if not conformant) */}
            <div className="md:col-span-2">
              <label htmlFor="actionsCorrectives" className="block text-sm font-medium text-gray-700 mb-1">
                Actions correctives {!formData.conformite && '*'}
              </label>
              <textarea
                id="actionsCorrectives"
                name="actionsCorrectives"
                value={formData.actionsCorrectives || ''}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.actionsCorrectives ? 'border-red-300' : 'border-gray-300'
                }`}
              ></textarea>
              {formErrors.actionsCorrectives && (
                <p className="mt-1 text-sm text-red-600">{formErrors.actionsCorrectives}</p>
              )}
            </div>
            
            {/* Observations */}
            <div className="md:col-span-2">
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                Observations supplémentaires
              </label>
              <textarea
                id="observations"
                name="observations"
                value={formData.observations || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={() => navigate('/controles')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              icon={<RiSaveLine />}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ControleQualiteForm;