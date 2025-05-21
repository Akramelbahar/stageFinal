import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RiSaveLine, RiCloseLine, RiAddLine, RiDeleteBin6Line } from 'react-icons/ri';

// API calls
import { getPlanificationById, createPlanification, updatePlanification, 
         addInterventionToPlanification, removeInterventionFromPlanification } from '../api/planifications';
import { getAllUsers } from '../api/utilisateurs';
import { getUrgentInterventions, getAllInterventions } from '../api/interventions';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const PlanificationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    dateCreation: new Date().toISOString().split('T')[0],
    utilisateur_id: user?.id || '',
    urgencePrise: false,
    disponibilitePDR: false,
    capaciteExecution: '',
    interventions: []
  });
  
  const [availableInterventions, setAvailableInterventions] = useState([]);
  const [selectedInterventions, setSelectedInterventions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load planification data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching data for PlanificationForm...");
        
        // Fetch users list
        const usersResponse = await getAllUsers();
        setUsers(usersResponse.data || []);
        console.log("Users loaded:", usersResponse.data?.length || 0);
        
        // Fetch all interventions - we'll filter them as needed later
        console.log("Fetching all interventions...");
        const allInterventionsResponse = await getAllInterventions();
        const allInterventions = allInterventionsResponse.data || [];
        console.log("All interventions loaded:", allInterventions.length);
        
        // Also fetch urgent interventions to add to the list
        console.log("Fetching urgent interventions...");
        const urgentInterventionsResponse = await getUrgentInterventions();
        const urgentInterventions = urgentInterventionsResponse.data || [];
        console.log("Urgent interventions loaded:", urgentInterventions.length);
        
        // Combine and deduplicate interventions
        let combinedInterventions = [...allInterventions];
        
        // Add urgent interventions that may not be in the full list
        for (const urgentIntervention of urgentInterventions) {
          if (!combinedInterventions.some(int => int.id === urgentIntervention.id)) {
            combinedInterventions.push(urgentIntervention);
          }
        }
        
        console.log("Combined interventions:", combinedInterventions.length);
        
        // If in edit mode, fetch planification data
        if (isEditMode) {
          console.log("Edit mode - fetching planification:", id);
          const response = await getPlanificationById(id);
          const planificationData = response.data;
          console.log("Planification data:", planificationData);
          
          // Format date for input field if exists
          if (planificationData.dateCreation) {
            const date = new Date(planificationData.dateCreation);
            const formattedDate = date.toISOString().split('T')[0];
            planificationData.dateCreation = formattedDate;
          }
          
          // Extract intervention IDs from the planification
          const plannedInterventionIds = [];
          
          if (planificationData.interventions && planificationData.interventions.length > 0) {
            // Handle both cases: array of objects or array of IDs
            planificationData.interventions.forEach(intervention => {
              if (typeof intervention === 'object' && intervention !== null) {
                plannedInterventionIds.push(intervention.id);
              } else if (typeof intervention === 'number' || typeof intervention === 'string') {
                plannedInterventionIds.push(parseInt(intervention));
              }
            });
          }
          
          console.log("Planned intervention IDs:", plannedInterventionIds);
          
          // Find full intervention objects for the selected interventions
          const selectedInterventionsWithData = combinedInterventions.filter(
            intervention => plannedInterventionIds.includes(intervention.id)
          );
          
          console.log("Selected interventions with data:", selectedInterventionsWithData.length);
          
          // Set form data 
          setFormData({
            dateCreation: planificationData.dateCreation || new Date().toISOString().split('T')[0],
            utilisateur_id: planificationData.utilisateur_id || (planificationData.utilisateur ? planificationData.utilisateur.id : user?.id || ''),
            urgencePrise: planificationData.urgencePrise || false,
            disponibilitePDR: planificationData.disponibilitePDR || false,
            capaciteExecution: planificationData.capaciteExecution || '',
            interventions: plannedInterventionIds || []
          });
          
          // Set selected interventions
          setSelectedInterventions(selectedInterventionsWithData);
        }
        
        // Set all available interventions
        setAvailableInterventions(combinedInterventions);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données: ' + (err.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, user]);

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

  // Handle adding an intervention to the planification
  const handleAddIntervention = (interventionId) => {
    if (!interventionId) return;
    
    const intId = parseInt(interventionId);
    console.log("Adding intervention:", intId);
    
    const intervention = availableInterventions.find(int => int.id === intId);
    
    if (!intervention) {
      console.warn("Intervention not found in available interventions:", intId);
      return;
    }
    
    // Check if intervention is already added
    if (selectedInterventions.some(int => int.id === intId)) {
      console.warn("Intervention already added:", intId);
      return;
    }
    
    console.log("Adding intervention to selected:", intervention);
    
    // Add intervention to selected list
    setSelectedInterventions(prev => [...prev, intervention]);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      interventions: [...prev.interventions, intId]
    }));
    
    // If in edit mode and we have an ID, call the API to add the intervention
    if (isEditMode && id) {
      addInterventionToPlanification(id, intId)
        .then(response => {
          console.log("Intervention added to planification:", response);
        })
        .catch(err => {
          console.error("Error adding intervention to planification:", err);
          // Don't show an error, as we'll handle this when the entire form is submitted
        });
    }
  };

  // Handle removing an intervention from the planification
  const handleRemoveIntervention = (interventionId) => {
    const intId = parseInt(interventionId);
    console.log("Removing intervention:", intId);
    
    // Remove intervention from selected list
    setSelectedInterventions(prev => prev.filter(int => int.id !== intId));
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      interventions: prev.interventions.filter(id => 
        typeof id === 'number' ? id !== intId : parseInt(id) !== intId
      )
    }));
    
    // If in edit mode and we have an ID, call the API to remove the intervention
    if (isEditMode && id) {
      removeInterventionFromPlanification(id, intId)
        .then(response => {
          console.log("Intervention removed from planification:", response);
        })
        .catch(err => {
          console.error("Error removing intervention from planification:", err);
          // Don't show an error, as we'll handle this when the entire form is submitted
        });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.utilisateur_id) {
      errors.utilisateur_id = 'L\'utilisateur est requis';
    }
    
    if (!formData.capaciteExecution) {
      errors.capaciteExecution = 'La capacité d\'exécution est requise';
    }
    
    if (formData.interventions.length === 0) {
      errors.interventions = 'Au moins une intervention doit être sélectionnée';
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
        utilisateur_id: parseInt(formData.utilisateur_id),
        capaciteExecution: parseInt(formData.capaciteExecution),
        interventions: formData.interventions.map(id => typeof id === 'number' ? id : parseInt(id))
      };
      
      console.log("Submitting data:", dataToSubmit);
      
      if (isEditMode) {
        await updatePlanification(id, dataToSubmit);
      } else {
        await createPlanification(dataToSubmit);
      }
      
      // Redirect after successful save
      navigate('/planifications');
    } catch (err) {
      console.error('Error saving planification:', err);
      setError('Erreur lors de l\'enregistrement de la planification: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'planification-edit' : 'planification-create';
    if (!hasPermission(requiredPermission)) {
      navigate('/forbidden');
    }
  }, [hasPermission, isEditMode, navigate]);

  // Get interventions that are available to add (not already selected)
  const getFilteredAvailableInterventions = () => {
    // Check if we already have selected all available interventions
    const selectedIds = selectedInterventions.map(int => int.id);
    
    return availableInterventions.filter(intervention => 
      !selectedIds.includes(intervention.id)
    );
  };

  const filteredAvailableInterventions = getFilteredAvailableInterventions();

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
          {isEditMode ? 'Modifier la planification' : 'Nouvelle planification'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {availableInterventions.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Information:</strong> Aucune intervention n'est disponible dans le système. 
            Veuillez d'abord créer des interventions avant de créer une planification.
          </p>
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User selection */}
            <div>
              <label htmlFor="utilisateur_id" className="block text-sm font-medium text-gray-700 mb-1">
                Responsable *
              </label>
              <select
                id="utilisateur_id"
                name="utilisateur_id"
                value={formData.utilisateur_id}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.utilisateur_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un responsable</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nom} ({user.sectionRelation?.nom || user.section || 'Aucune section'})
                  </option>
                ))}
              </select>
              {formErrors.utilisateur_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.utilisateur_id}</p>
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
            
            {/* Capacité d'exécution */}
            <div>
              <label htmlFor="capaciteExecution" className="block text-sm font-medium text-gray-700 mb-1">
                Capacité d'exécution *
              </label>
              <input
                type="number"
                id="capaciteExecution"
                name="capaciteExecution"
                value={formData.capaciteExecution}
                onChange={handleChange}
                required
                placeholder="Ex: 5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.capaciteExecution ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.capaciteExecution && (
                <p className="mt-1 text-sm text-red-600">{formErrors.capaciteExecution}</p>
              )}
            </div>
            
            {/* Checkboxes for urgence and availability */}
            <div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="urgencePrise"
                  name="urgencePrise"
                  checked={formData.urgencePrise}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="urgencePrise" className="ml-2 block text-sm text-gray-700">
                  Prise en charge des urgences possible
                </label>
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="disponibilitePDR"
                  name="disponibilitePDR"
                  checked={formData.disponibilitePDR}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="disponibilitePDR" className="ml-2 block text-sm text-gray-700">
                  Disponibilité des pièces de rechange
                </label>
              </div>
            </div>
            
            {/* Interventions section */}
            <div className="md:col-span-2 border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Interventions planifiées *</h3>
              
              {/* Selected interventions list */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interventions sélectionnées</h4>
                
                {selectedInterventions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Aucune intervention sélectionnée
                  </p>
                ) : (
                  <ul className="border rounded-md divide-y">
                    {selectedInterventions.map(intervention => (
                      <li key={intervention.id} className="px-4 py-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium">#{intervention.id}</span> - 
                          <span className="ml-2">
                            {intervention.typeOperation || intervention.type_operation || "Type inconnu"}
                          </span>
                          {intervention.machine && (
                            <span className="ml-2 text-gray-600">
                              ({intervention.machine.nom})
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          icon={<RiDeleteBin6Line />}
                          onClick={() => handleRemoveIntervention(intervention.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
                
                {formErrors.interventions && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.interventions}</p>
                )}
              </div>
              
              {/* Add intervention section */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ajouter une intervention</h4>
                
                <div className="flex space-x-2">
                  <select
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                    id="intervention-select"
                    disabled={filteredAvailableInterventions.length === 0}
                  >
                    <option value="" disabled>Sélectionner une intervention</option>
                    {filteredAvailableInterventions.map(intervention => (
                      <option key={intervention.id} value={intervention.id}>
                        #{intervention.id} - {intervention.typeOperation || intervention.type_operation || "Type inconnu"}
                        {intervention.machine ? ` - ${intervention.machine.nom}` : ' - Machine inconnue'}
                      </option>
                    ))}
                  </select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    icon={<RiAddLine />}
                    onClick={() => {
                      const select = document.getElementById('intervention-select');
                      if (select && select.value) {
                        handleAddIntervention(select.value);
                        select.value = ""; // Reset selection
                      }
                    }}
                    disabled={filteredAvailableInterventions.length === 0}
                  >
                    Ajouter
                  </Button>
                </div>
                
                {filteredAvailableInterventions.length === 0 && availableInterventions.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Toutes les interventions disponibles ont déjà été sélectionnées
                  </p>
                )}
                
                {availableInterventions.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600">
                    Aucune intervention n'est disponible. Veuillez d'abord créer des interventions.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={() => navigate('/planifications')}
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

export default PlanificationForm;