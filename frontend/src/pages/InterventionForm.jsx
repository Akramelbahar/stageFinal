import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

// API calls - Fixed import paths
import { getInterventionById, createIntervention, updateIntervention } from '../api/interventions';
import { getAllMachines } from '../api/machines';

// Component imports
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Hook imports
import useAuth from '../hooks/useAuth';

const InterventionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Get machine ID from query params if available
  const queryParams = new URLSearchParams(location.search);
  const machineId = queryParams.get('machine');
  
  // Form state
  const [formData, setFormData] = useState({
    typeOperation: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    statut: 'PENDING',
    urgence: false,
    machine_id: machineId || '',
    observation: ''
  });
  
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load intervention data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch machines list
        const machinesResponse = await getAllMachines();
        setMachines(machinesResponse.data || []);
        
        // If edit mode, fetch intervention data
        if (isEditMode) {
          const response = await getInterventionById(id);
          const interventionData = response.data;
          
          // Format date for input field if exists
          if (interventionData.date) {
            const date = new Date(interventionData.date);
            const formattedDate = date.toISOString().split('T')[0];
            interventionData.date = formattedDate;
          }
          
          setFormData({
            ...interventionData,
            machine_id: interventionData.machine ? interventionData.machine.id : '',
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

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
    
    if (!formData.typeOperation.trim()) {
      errors.typeOperation = 'Le type d\'opération est requis';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    }
    
    if (!formData.date) {
      errors.date = 'La date est requise';
    }
    
    if (!formData.machine_id) {
      errors.machine_id = 'La machine est requise';
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
        machine_id: parseInt(formData.machine_id)
      };
      
      if (isEditMode) {
        await updateIntervention(id, dataToSubmit);
      } else {
        await createIntervention(dataToSubmit); // This is the ADD operation
      }
      
      // Redirect after successful save
      navigate('/interventions');
    } catch (err) {
      console.error('Error saving intervention:', err);
      setError('Erreur lors de l\'enregistrement de l\'intervention');
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'intervention-edit' : 'intervention-create';
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
          {isEditMode ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
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
            {/* Machine selection */}
            <div>
              <label htmlFor="machine_id" className="block text-sm font-medium text-gray-700 mb-1">
                Machine *
              </label>
              <select
                id="machine_id"
                name="machine_id"
                value={formData.machine_id}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.machine_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={machineId !== null && !isEditMode}
              >
                <option value="">Sélectionner une machine</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.nom} ({machine.type || 'Non spécifié'})
                  </option>
                ))}
              </select>
              {formErrors.machine_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.machine_id}</p>
              )}
            </div>
            
            {/* Intervention Type */}
            <div>
              <label htmlFor="typeOperation" className="block text-sm font-medium text-gray-700 mb-1">
                Type d'opération *
              </label>
              <select
                id="typeOperation"
                name="typeOperation"
                value={formData.typeOperation}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.typeOperation ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un type</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Rénovation">Rénovation</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="Urgente">Urgente</option>
                <option value="Préventive">Préventive</option>
              </select>
              {formErrors.typeOperation && (
                <p className="mt-1 text-sm text-red-600">{formErrors.typeOperation}</p>
              )}
            </div>
            
            {/* Intervention Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
              )}
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.statut ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="PENDING">En attente</option>
                <option value="PLANNED">Planifiée</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
              {formErrors.statut && (
                <p className="mt-1 text-sm text-red-600">{formErrors.statut}</p>
              )}
            </div>
            
            {/* Urgency checkbox */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="urgence"
                name="urgence"
                checked={formData.urgence}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="urgence" className="ml-2 block text-sm text-gray-700">
                Intervention urgente
              </label>
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
            
            {/* Observations */}
            <div className="md:col-span-2">
              <label htmlFor="observation" className="block text-sm font-medium text-gray-700 mb-1">
                Observations supplémentaires
              </label>
              <textarea
                id="observation"
                name="observation"
                value={formData.observation || ''}
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
              onClick={() => navigate('/interventions')}
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

export default InterventionForm;