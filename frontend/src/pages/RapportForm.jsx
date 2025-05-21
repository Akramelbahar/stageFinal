import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { RiSaveLine, RiCloseLine, RiAlertLine } from 'react-icons/ri';

// API calls
import { getRapportById, createRapport, updateRapport } from '../api/rapports';
import { getAllInterventions } from '../api/interventions';
import { getAllMachines } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const RapportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Use URL params to pre-populate form
  const searchParams = new URLSearchParams(location.search);
  const interventionIdFromUrl = searchParams.get('intervention');
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    dateCreation: new Date().toISOString().split('T')[0],
    validation: false,
    intervention_id: interventionIdFromUrl || ''
  });
  
  // Available data lists
  const [interventions, setInterventions] = useState([]);
  const [machines, setMachines] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load rapport data if in edit mode and fetch references
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch reference data in parallel
        const [
          interventionsResponse,
          machinesResponse
        ] = await Promise.all([
          getAllInterventions(),
          getAllMachines()
        ]);
        
        setInterventions(interventionsResponse.data || []);
        setMachines(machinesResponse.data || []);
        
        // If edit mode, fetch rapport data
        if (isEditMode) {
          const response = await getRapportById(id);
          const rapportData = response.data;
          
          // Format date for input field if exists
          if (rapportData.dateCreation) {
            const date = new Date(rapportData.dateCreation);
            const formattedDate = date.toISOString().split('T')[0];
            rapportData.dateCreation = formattedDate;
          }
          
          setFormData({
            ...rapportData,
            titre: rapportData.titre || `Rapport #${rapportData.id}`
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
    
    if (!formData.titre.trim()) {
      errors.titre = 'Le titre est requis';
    }
    
    if (!formData.contenu?.trim()) {
      errors.contenu = 'Le contenu est requis';
    }
    
    if (!formData.intervention_id) {
      errors.intervention_id = 'L\'intervention est requise';
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
      const dataToSubmit = { ...formData };
      
      // Convert IDs to integers
      if (dataToSubmit.intervention_id) dataToSubmit.intervention_id = parseInt(dataToSubmit.intervention_id);
      
      if (isEditMode) {
        await updateRapport(id, dataToSubmit);
      } else {
        await createRapport(dataToSubmit);
      }
      
      // Redirect after successful save
      navigate('/rapports');
    } catch (err) {
      console.error('Error saving rapport:', err);
      setError('Erreur lors de l\'enregistrement du rapport: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setSaving(false);
    }
  };

  // Get machine for an intervention
  const getMachineName = (interventionId) => {
    const intervention = interventions.find(i => i.id === parseInt(interventionId));
    if (intervention && intervention.machine) {
      return intervention.machine.nom;
    }
    return 'N/A';
  };

  // Get intervention type
  const getInterventionType = (interventionId) => {
    const intervention = interventions.find(i => i.id === parseInt(interventionId));
    if (intervention) {
      return intervention.typeOperation;
    }
    return 'N/A';
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'rapport-edit' : 'rapport-create';
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
          {isEditMode ? 'Modifier le rapport' : 'Nouveau rapport'}
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
            {/* Rapport Title */}
            <div className="md:col-span-2">
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.titre ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.titre && (
                <p className="mt-1 text-sm text-red-600">{formErrors.titre}</p>
              )}
            </div>
            
            {/* Intervention */}
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
              >
                <option value="">Sélectionner une intervention</option>
                {interventions.map(intervention => (
                  <option key={intervention.id} value={intervention.id}>
                    #{intervention.id} - {intervention.typeOperation} - 
                    {intervention.machine ? intervention.machine.nom : 'N/A'} - 
                    {intervention.statut}
                  </option>
                ))}
              </select>
              {formErrors.intervention_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.intervention_id}</p>
              )}
            </div>
            
            {/* Date de Création */}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.dateCreation ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.dateCreation && (
                <p className="mt-1 text-sm text-red-600">{formErrors.dateCreation}</p>
              )}
            </div>
            
            {/* Machine info (read-only) */}
            {formData.intervention_id && (
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-700 mb-2">Informations sur l'intervention</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Machine</p>
                    <p className="font-medium">{getMachineName(formData.intervention_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type d'opération</p>
                    <p className="font-medium">{getInterventionType(formData.intervention_id)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Validation checkbox (only for edit mode or admin) */}
            {(isEditMode || hasPermission('rapport-validate')) && (
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="validation"
                  name="validation"
                  checked={formData.validation}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="validation" className="ml-2 block text-sm text-gray-700">
                  Valider le rapport
                </label>
              </div>
            )}
            
            {/* Contenu */}
            <div className="md:col-span-2">
              <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu *
              </label>
              <textarea
                id="contenu"
                name="contenu"
                value={formData.contenu || ''}
                onChange={handleChange}
                rows="10"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.contenu ? 'border-red-300' : 'border-gray-300'
                }`}
              ></textarea>
              {formErrors.contenu && (
                <p className="mt-1 text-sm text-red-600">{formErrors.contenu}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={() => navigate('/rapports')}
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

export default RapportForm;