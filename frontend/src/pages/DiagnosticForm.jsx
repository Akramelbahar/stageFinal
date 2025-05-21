import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { RiSaveLine, RiCloseLine, RiAlertLine } from 'react-icons/ri';

// API calls
import { getDiagnosticById, createDiagnostic, updateDiagnostic } from '../api/diagnostics';
import { getInterventionsByMachine, getInterventionById } from '../api/interventions';
import { getAllMachines } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const DiagnosticForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Get intervention ID from query params if available
  const queryParams = new URLSearchParams(location.search);
  const interventionId = queryParams.get('intervention');
  
  // Form state with default values
  const [formData, setFormData] = useState({
    dateCreation: new Date().toISOString().split('T')[0],
    intervention_id: interventionId || '',
    description: '',
    resultatAnalyse: '',
    travauxRequis: '',
    besoinsPDR: '',
    chargesRealisees: '',
    observations: ''
  });
  
  const [machines, setMachines] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load diagnostic data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch machines list
        const machinesResponse = await getAllMachines();
        setMachines(machinesResponse.data || []);
        
        // If edit mode, fetch diagnostic data
        if (isEditMode) {
          const response = await getDiagnosticById(id);
          const diagnosticData = response.data;
          
          console.log('Loaded diagnostic data:', diagnosticData);
          
          // Format date for input field if exists
          if (diagnosticData.dateCreation) {
            const date = new Date(diagnosticData.dateCreation);
            const formattedDate = date.toISOString().split('T')[0];
            diagnosticData.dateCreation = formattedDate;
          }
          
          // Prepare form data from diagnostic data
          setFormData({
            dateCreation: diagnosticData.dateCreation || new Date().toISOString().split('T')[0],
            intervention_id: diagnosticData.intervention ? diagnosticData.intervention.id : '',
            description: diagnosticData.description || '',
            resultatAnalyse: diagnosticData.resultatAnalyse || '',
            travauxRequis: diagnosticData.travauxRequis || '',
            besoinsPDR: diagnosticData.besoinsPDR || '',
            chargesRealisees: diagnosticData.chargesRealisees || '',
            observations: diagnosticData.observations || ''
          });
          
          // If intervention is available, set the machine
          if (diagnosticData.intervention && diagnosticData.intervention.machine) {
            setSelectedMachine(diagnosticData.intervention.machine.id);
            
            // Fetch interventions for this machine
            const interventionsResponse = await getInterventionsByMachine(diagnosticData.intervention.machine.id);
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
    
    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    }
    
    if (!formData.resultatAnalyse.trim()) {
      errors.resultatAnalyse = 'Le résultat de l\'analyse est requis';
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
        intervention_id: parseInt(formData.intervention_id, 10)
      };

      console.log('Submitting diagnostic data:', dataToSubmit);
      
      if (isEditMode) {
        await updateDiagnostic(id, dataToSubmit);
      } else {
        await createDiagnostic(dataToSubmit);
      }
      
      // Redirect after successful save
      navigate('/diagnostics');
    } catch (err) {
      console.error('Error saving diagnostic:', err);
      setError('Erreur lors de l\'enregistrement du diagnostic');
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'diagnostic-edit' : 'diagnostic-create';
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
          {isEditMode ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <RiAlertLine className="flex-shrink-0 mt-1 mr-2" />
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
            
            {/* Date de création */}
            <div>
              <label htmlFor="dateCreation" className="block text-sm font-medium text-gray-700 mb-1">
                Date de création *
              </label>
              <input
                type="date"
                id="dateCreation"
                name="dateCreation"
                value={formData.dateCreation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              ></textarea>
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
            
            {/* Résultat analyse */}
            <div className="md:col-span-2">
              <label htmlFor="resultatAnalyse" className="block text-sm font-medium text-gray-700 mb-1">
                Résultat de l'analyse *
              </label>
              <textarea
                id="resultatAnalyse"
                name="resultatAnalyse"
                value={formData.resultatAnalyse}
                onChange={handleChange}
                rows="4"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.resultatAnalyse ? 'border-red-300' : 'border-gray-300'
                }`}
              ></textarea>
              {formErrors.resultatAnalyse && (
                <p className="mt-1 text-sm text-red-600">{formErrors.resultatAnalyse}</p>
              )}
            </div>
            
            {/* Travaux requis */}
            <div className="md:col-span-2">
              <label htmlFor="travauxRequis" className="block text-sm font-medium text-gray-700 mb-1">
                Travaux requis
              </label>
              <textarea
                id="travauxRequis"
                name="travauxRequis"
                value={formData.travauxRequis}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            {/* Besoins pièces de rechange */}
            <div>
              <label htmlFor="besoinsPDR" className="block text-sm font-medium text-gray-700 mb-1">
                Besoins en pièces de rechange
              </label>
              <textarea
                id="besoinsPDR"
                name="besoinsPDR"
                value={formData.besoinsPDR}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            {/* Charges réalisées */}
            <div>
              <label htmlFor="chargesRealisees" className="block text-sm font-medium text-gray-700 mb-1">
                Charges réalisées
              </label>
              <textarea
                id="chargesRealisees"
                name="chargesRealisees"
                value={formData.chargesRealisees}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
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
              onClick={() => navigate('/diagnostics')}
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

export default DiagnosticForm;