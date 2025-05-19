import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

// API calls
import { getRapportById, createRapport, updateRapport } from '../api/rapports';
import { getAllMachines } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const RapportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    typeRapport: '',
    dateCreation: new Date().toISOString().split('T')[0],
    validation: false,
    renovation_id: '',
    maintenance_id: '',
    prestataire_id: ''
  });
  
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load rapport data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch machines list for reference
        const machinesResponse = await getAllMachines();
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
          
          setFormData(rapportData);
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
    
    if (!formData.contenu.trim()) {
      errors.contenu = 'Le contenu est requis';
    }
    
    if (!formData.typeRapport) {
      errors.typeRapport = 'Le type de rapport est requis';
    }
    
    // For Renovation type, renovation_id is required
    if (formData.typeRapport === 'Rénovation' && !formData.renovation_id) {
      errors.renovation_id = 'L\'ID de rénovation est requis pour ce type de rapport';
    }
    
    // For Maintenance type, maintenance_id is required
    if (formData.typeRapport === 'Maintenance' && !formData.maintenance_id) {
      errors.maintenance_id = 'L\'ID de maintenance est requis pour ce type de rapport';
    }
    
    // For Prestataire type, prestataire_id is required
    if (formData.typeRapport === 'Prestataire' && !formData.prestataire_id) {
      errors.prestataire_id = 'L\'ID de prestataire est requis pour ce type de rapport';
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
      
      // Convert IDs to integers where needed
      if (dataToSubmit.renovation_id) dataToSubmit.renovation_id = parseInt(dataToSubmit.renovation_id);
      if (dataToSubmit.maintenance_id) dataToSubmit.maintenance_id = parseInt(dataToSubmit.maintenance_id);
      if (dataToSubmit.prestataire_id) dataToSubmit.prestataire_id = parseInt(dataToSubmit.prestataire_id);
      
      if (isEditMode) {
        await updateRapport(id, dataToSubmit);
      } else {
        await createRapport(dataToSubmit); // This is the ADD operation
      }
      
      // Redirect after successful save
      navigate('/rapports');
    } catch (err) {
      console.error('Error saving rapport:', err);
      setError('Erreur lors de l\'enregistrement du rapport');
    } finally {
      setSaving(false);
    }
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
            
            {/* Related ID fields - shown based on rapport type */}
            {formData.typeRapport === 'Rénovation' && (
              <div>
                <label htmlFor="renovation_id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID de rénovation *
                </label>
                <input
                  type="text"
                  id="renovation_id"
                  name="renovation_id"
                  value={formData.renovation_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.renovation_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.renovation_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.renovation_id}</p>
                )}
              </div>
            )}
            
            {formData.typeRapport === 'Maintenance' && (
              <div>
                <label htmlFor="maintenance_id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID de maintenance *
                </label>
                <input
                  type="text"
                  id="maintenance_id"
                  name="maintenance_id"
                  value={formData.maintenance_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.maintenance_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.maintenance_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.maintenance_id}</p>
                )}
              </div>
            )}
            
            {formData.typeRapport === 'Prestataire' && (
              <div>
                <label htmlFor="prestataire_id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID de prestataire *
                </label>
                <input
                  type="text"
                  id="prestataire_id"
                  name="prestataire_id"
                  value={formData.prestataire_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.prestataire_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
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