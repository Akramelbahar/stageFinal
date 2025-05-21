import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { RiSaveLine, RiCloseLine, RiAlertLine, RiBug2Line } from 'react-icons/ri';

// API calls
import { getRapportById, createRapport, updateRapport } from '../api/rapports';
import { getAllMachines } from '../api/machines';
import { getAllInterventions } from '../api/interventions';
import { getAllRenovations } from '../api/renovations';
import { getAllMaintenances } from '../api/maintenances';
import { getAllPrestataires } from '../api/prestataires';

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
  const renovationIdFromUrl = searchParams.get('renovation');
  const maintenanceIdFromUrl = searchParams.get('maintenance');
  const prestataireIdFromUrl = searchParams.get('prestataire');
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    typeRapport: '',
    dateCreation: new Date().toISOString().split('T')[0],
    validation: false,
    renovation_id: renovationIdFromUrl || '',
    maintenance_id: maintenanceIdFromUrl || '',
    prestataire_id: prestataireIdFromUrl || ''
  });
  
  // Available data lists
  const [machines, setMachines] = useState([]);
  const [renovations, setRenovations] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  
  // Debug states - to see if data is loading properly
  const [debugInfo, setDebugInfo] = useState({
    isLoaded: false,
    renovationsCount: 0,
    maintenancesCount: 0,
    prestatairesCount: 0
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  // Set type initially based on params
  useEffect(() => {
    if (renovationIdFromUrl) {
      setFormData(prev => ({ ...prev, typeRapport: 'Rénovation' }));
    } else if (maintenanceIdFromUrl) {
      setFormData(prev => ({ ...prev, typeRapport: 'Maintenance' }));
    } else if (prestataireIdFromUrl) {
      setFormData(prev => ({ ...prev, typeRapport: 'Prestataire' }));
    }
  }, [renovationIdFromUrl, maintenanceIdFromUrl, prestataireIdFromUrl]);
  
  // Load rapport data if in edit mode and fetch references
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data for RapportForm...");
        
        // Fetch reference data one by one with logging for debugging
        try {
          console.log("Fetching renovations...");
          const renovationsResponse = await getAllRenovations();
          console.log("Renovations response:", renovationsResponse);
          const renovationsData = renovationsResponse.data || [];
          setRenovations(renovationsData);
          console.log(`Loaded ${renovationsData.length} renovations`);
          
          setDebugInfo(prev => ({
            ...prev,
            renovationsCount: renovationsData.length
          }));
        } catch (err) {
          console.error("Error fetching renovations:", err);
          setError("Erreur lors du chargement des rénovations: " + err.message);
        }
        
        try {
          console.log("Fetching maintenances...");
          const maintenancesResponse = await getAllMaintenances();
          console.log("Maintenances response:", maintenancesResponse);
          const maintenancesData = maintenancesResponse.data || [];
          setMaintenances(maintenancesData);
          console.log(`Loaded ${maintenancesData.length} maintenances`);
          
          setDebugInfo(prev => ({
            ...prev,
            maintenancesCount: maintenancesData.length
          }));
        } catch (err) {
          console.error("Error fetching maintenances:", err);
          setError("Erreur lors du chargement des maintenances: " + err.message);
        }
        
        try {
          console.log("Fetching prestataires...");
          const prestatairesResponse = await getAllPrestataires();
          console.log("Prestataires response:", prestatairesResponse);
          const prestatairesData = prestatairesResponse.data || [];
          setPrestataires(prestatairesData);
          console.log(`Loaded ${prestatairesData.length} prestataires`);
          
          setDebugInfo(prev => ({
            ...prev,
            prestatairesCount: prestatairesData.length
          }));
        } catch (err) {
          console.error("Error fetching prestataires:", err);
          setError("Erreur lors du chargement des prestataires: " + err.message);
        }
        
        try {
          console.log("Fetching machines...");
          const machinesResponse = await getAllMachines();
          const machinesData = machinesResponse.data || [];
          setMachines(machinesData);
          console.log(`Loaded ${machinesData.length} machines`);
        } catch (err) {
          console.error("Error fetching machines:", err);
        }
        
        // If edit mode, fetch rapport data
        if (isEditMode) {
          console.log(`Fetching rapport with ID: ${id}`);
          const response = await getRapportById(id);
          const rapportData = response.data;
          console.log("Rapport data:", rapportData);
          
          // Determine report type
          let reportType = '';
          if (rapportData.renovation_id) reportType = 'Rénovation';
          else if (rapportData.maintenance_id) reportType = 'Maintenance';
          else if (rapportData.prestataire_id) reportType = 'Prestataire';
          
          // Format date for input field if exists
          if (rapportData.dateCreation) {
            const date = new Date(rapportData.dateCreation);
            const formattedDate = date.toISOString().split('T')[0];
            rapportData.dateCreation = formattedDate;
          }
          
          setFormData({
            ...rapportData,
            typeRapport: reportType
          });
        }
        
        setDebugInfo(prev => ({
          ...prev,
          isLoaded: true
        }));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If type changes, reset the related IDs
    if (name === 'typeRapport') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        renovation_id: value === 'Rénovation' ? prev.renovation_id : '',
        maintenance_id: value === 'Maintenance' ? prev.maintenance_id : '',
        prestataire_id: value === 'Prestataire' ? prev.prestataire_id : ''
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
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
    
    if (!formData.contenu.trim()) {
      errors.contenu = 'Le contenu est requis';
    }
    
    if (!formData.typeRapport) {
      errors.typeRapport = 'Le type de rapport est requis';
    }
    
    // For Renovation type, renovation_id is required
    if (formData.typeRapport === 'Rénovation' && !formData.renovation_id) {
      errors.renovation_id = 'La rénovation est requise pour ce type de rapport';
    }
    
    // For Maintenance type, maintenance_id is required
    if (formData.typeRapport === 'Maintenance' && !formData.maintenance_id) {
      errors.maintenance_id = 'La maintenance est requise pour ce type de rapport';
    }
    
    // For Prestataire type, prestataire_id is required
    if (formData.typeRapport === 'Prestataire' && !formData.prestataire_id) {
      errors.prestataire_id = 'Le prestataire est requis pour ce type de rapport';
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
      console.log("Submitting form data:", formData);
      const dataToSubmit = { ...formData };
      
      // Convert IDs to integers where needed
      if (dataToSubmit.renovation_id) dataToSubmit.renovation_id = parseInt(dataToSubmit.renovation_id);
      if (dataToSubmit.maintenance_id) dataToSubmit.maintenance_id = parseInt(dataToSubmit.maintenance_id);
      if (dataToSubmit.prestataire_id) dataToSubmit.prestataire_id = parseInt(dataToSubmit.prestataire_id);
      
      // Remove unused IDs based on type
      if (dataToSubmit.typeRapport !== 'Rénovation') delete dataToSubmit.renovation_id;
      if (dataToSubmit.typeRapport !== 'Maintenance') delete dataToSubmit.maintenance_id;
      if (dataToSubmit.typeRapport !== 'Prestataire') delete dataToSubmit.prestataire_id;
      
      // Remove typeRapport as it's not in the database schema
      delete dataToSubmit.typeRapport;
      
      console.log("Cleaned data to submit:", dataToSubmit);
      
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

  // Get machine name for a renovation or maintenance
  const getMachineName = (item) => {
    try {
      if (item && 
          item.intervention && 
          item.intervention.machine) {
        return item.intervention.machine.nom;
      }
    } catch (e) {
      console.error("Error getting machine name:", e);
    }
    return 'N/A';
  };

  // Toggle debug information
  const toggleDebug = () => {
    setShowDebug(!showDebug);
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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Modifier le rapport' : 'Nouveau rapport'}
        </h1>
        
        <Button 
          variant="outline"
          size="sm"
          icon={<RiBug2Line />}
          onClick={toggleDebug}
        >
          {showDebug ? 'Cacher debug' : 'Afficher debug'}
        </Button>
      </div>
      
      {showDebug && (
        <Card className="mb-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Informations de débogage</h3>
          <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded">
            {JSON.stringify({
              isLoaded: debugInfo.isLoaded,
              renovations: debugInfo.renovationsCount,
              maintenances: debugInfo.maintenancesCount,
              prestataires: debugInfo.prestatairesCount,
              selectedType: formData.typeRapport,
              selectedRenovationId: formData.renovation_id,
              selectedMaintenanceId: formData.maintenance_id,
              selectedPrestataireId: formData.prestataire_id
            }, null, 2)}
          </pre>
          
          {formData.typeRapport === 'Rénovation' && (
            <div className="mt-2">
              <h4 className="font-medium">Rénovations disponibles ({renovations.length})</h4>
              <ul className="text-xs bg-gray-100 p-3 rounded mt-1 max-h-40 overflow-y-auto">
                {renovations.length > 0 ? (
                  renovations.map(renovation => (
                    <li key={renovation.intervention_id}>
                      ID: {renovation.intervention_id}, 
                      Objectif: {renovation.objectif && renovation.objectif.substring(0, 30)}...
                    </li>
                  ))
                ) : (
                  <li className="text-red-500">Aucune rénovation disponible</li>
                )}
              </ul>
            </div>
          )}
          
          {formData.typeRapport === 'Maintenance' && (
            <div className="mt-2">
              <h4 className="font-medium">Maintenances disponibles ({maintenances.length})</h4>
              <ul className="text-xs bg-gray-100 p-3 rounded mt-1 max-h-40 overflow-y-auto">
                {maintenances.length > 0 ? (
                  maintenances.map(maintenance => (
                    <li key={maintenance.intervention_id}>
                      ID: {maintenance.intervention_id}, 
                      Type: {maintenance.typeMaintenance}
                    </li>
                  ))
                ) : (
                  <li className="text-red-500">Aucune maintenance disponible</li>
                )}
              </ul>
            </div>
          )}
          
          {formData.typeRapport === 'Prestataire' && (
            <div className="mt-2">
              <h4 className="font-medium">Prestataires disponibles ({prestataires.length})</h4>
              <ul className="text-xs bg-gray-100 p-3 rounded mt-1 max-h-40 overflow-y-auto">
                {prestataires.length > 0 ? (
                  prestataires.map(prestataire => (
                    <li key={prestataire.id}>
                      ID: {prestataire.id}, 
                      Nom: {prestataire.nom}
                    </li>
                  ))
                ) : (
                  <li className="text-red-500">Aucun prestataire disponible</li>
                )}
              </ul>
            </div>
          )}
        </Card>
      )}
      
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
            
            {/* Rapport Type */}
            <div>
              <label htmlFor="typeRapport" className="block text-sm font-medium text-gray-700 mb-1">
                Type de rapport *
              </label>
              <select
                id="typeRapport"
                name="typeRapport"
                value={formData.typeRapport}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.typeRapport ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un type</option>
                <option value="Rénovation">Rénovation</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Prestataire">Prestataire</option>
              </select>
              {formErrors.typeRapport && (
                <p className="mt-1 text-sm text-red-600">{formErrors.typeRapport}</p>
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
            
            {/* Related entity fields - shown based on rapport type */}
            {formData.typeRapport === 'Rénovation' && (
              <div>
                <label htmlFor="renovation_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rénovation * {renovations.length === 0 && <span className="text-red-500">(Aucune rénovation disponible)</span>}
                </label>
                {renovations.length > 0 ? (
                  <select
                    id="renovation_id"
                    name="renovation_id"
                    value={formData.renovation_id}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.renovation_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner une rénovation</option>
                    {renovations.map(renovation => (
                      <option key={renovation.intervention_id} value={renovation.intervention_id}>
                        Rénovation #{renovation.intervention_id} - 
                        {getMachineName(renovation)} - 
                        {renovation.objectif ? (renovation.objectif.substring(0, 20) + '...') : 'Sans objectif'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value="Aucune rénovation disponible"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
                {formErrors.renovation_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.renovation_id}</p>
                )}
              </div>
            )}
            
            {formData.typeRapport === 'Maintenance' && (
              <div>
                <label htmlFor="maintenance_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance * {maintenances.length === 0 && <span className="text-red-500">(Aucune maintenance disponible)</span>}
                </label>
                {maintenances.length > 0 ? (
                  <select
                    id="maintenance_id"
                    name="maintenance_id"
                    value={formData.maintenance_id}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.maintenance_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner une maintenance</option>
                    {maintenances.map(maintenance => (
                      <option key={maintenance.intervention_id} value={maintenance.intervention_id}>
                        Maintenance #{maintenance.intervention_id} - 
                        {getMachineName(maintenance)} - 
                        {maintenance.typeMaintenance}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value="Aucune maintenance disponible"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
                {formErrors.maintenance_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.maintenance_id}</p>
                )}
              </div>
            )}
            
            {formData.typeRapport === 'Prestataire' && (
              <div>
                <label htmlFor="prestataire_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Prestataire * {prestataires.length === 0 && <span className="text-red-500">(Aucun prestataire disponible)</span>}
                </label>
                {prestataires.length > 0 ? (
                  <select
                    id="prestataire_id"
                    name="prestataire_id"
                    value={formData.prestataire_id}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.prestataire_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un prestataire</option>
                    {prestataires.map(prestataire => (
                      <option key={prestataire.id} value={prestataire.id}>
                        {prestataire.nom}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value="Aucun prestataire disponible"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
                {formErrors.prestataire_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.prestataire_id}</p>
                )}
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
                value={formData.contenu}
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