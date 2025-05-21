// Updated MachineForm.jsx with proper type field handling

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { RiSaveLine, RiCloseLine, RiArrowLeftLine } from 'react-icons/ri';

// API calls
import { getMachineById, createMachine, updateMachine } from '../api/machines';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const MachineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    etat: 'OPERATIONNEL',
    valeur: '',
    type: '',
    dateProchaineMaint: '',
    details: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load machine data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchMachine = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getMachineById(id);
          const machineData = response.data;
          
          console.log('Fetched machine data:', machineData);
          
          // Format date for input field if exists
          if (machineData.dateProchaineMaint) {
            const date = new Date(machineData.dateProchaineMaint);
            const formattedDate = date.toISOString().split('T')[0];
            machineData.dateProchaineMaint = formattedDate;
          }
          
          // Initialize type to empty string if null
          machineData.type = machineData.type || '';
          
          // Initialize details to empty string if null
          machineData.details = machineData.details || '';
          
          setFormData(machineData);
        } catch (err) {
          console.error('Error fetching machine:', err);
          setError(
            err.response?.data?.message || 
            'Erreur lors du chargement des données de la machine'
          );
        } finally {
          setLoading(false);
        }
      };

      fetchMachine();
    }
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormTouched(true);
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom?.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!formData.etat?.trim()) {
      errors.etat = 'L\'état est requis';
    }
    
    if (!formData.valeur?.toString().trim()) {
      errors.valeur = 'La valeur est requise';
    } else if (isNaN(Number(formData.valeur))) {
      errors.valeur = 'La valeur doit être un nombre';
    }
    
    if (formData.dateProchaineMaint) {
      const selectedDate = new Date(formData.dateProchaineMaint);
      if (isNaN(selectedDate.getTime())) {
        errors.dateProchaineMaint = 'Date invalide';
      }
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
      let response;
      
      if (isEditMode) {
        response = await updateMachine(id, formData);
        console.log('Machine updated:', response);
      } else {
        response = await createMachine(formData);
        console.log('Machine created:', response);
      }
      
      setSuccessMessage(isEditMode 
        ? `Machine "${formData.nom}" mise à jour avec succès` 
        : `Machine "${formData.nom}" créée avec succès`
      );
      
      // Auto-hide success message after 3 seconds, then redirect
      setTimeout(() => {
        // Redirect after successful save
        navigate('/machines', { 
          state: { 
            successMessage: successMessage
          }
        });
      }, 1500);
      
    } catch (err) {
      console.error('Error saving machine:', err);
      
      // Handle validation errors from the server
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setError(
          err.response?.data?.message || 
          'Erreur lors de l\'enregistrement de la machine'
        );
      }
      
      // Scroll to the top of the form to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel with unsaved changes warning
  const handleCancel = () => {
    if (formTouched && !window.confirm('Abandonner les modifications ?')) {
      return;
    }
    navigate('/machines');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/machines">
            <Button variant="outline" size="sm" icon={<RiArrowLeftLine />}>
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Modifier la machine' : 'Nouvelle machine'}
          </h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Machine ID (only in edit mode) */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <input
                  type="text"
                  value={formData.id || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}
            
            {/* Machine Name */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom || ''}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.nom ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.nom && (
                <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>
              )}
            </div>
            
            {/* Machine Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un type</option>
                <option value="Alternateur">Alternateur</option>
                <option value="Moteur asynchrone">Moteur asynchrone</option>
                <option value="Moteur synchrone">Moteur synchrone</option>
                <option value="Transformateur">Transformateur</option>
                <option value="Générateur">Générateur</option>
                <option value="Autre">Autre</option>
              </select>
              {formErrors.type && (
                <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>
              )}
            </div>
            
            {/* Machine Status */}
            <div>
              <label htmlFor="etat" className="block text-sm font-medium text-gray-700 mb-1">
                État *
              </label>
              <select
                id="etat"
                name="etat"
                value={formData.etat || 'OPERATIONNEL'}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.etat ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="OPERATIONNEL">Opérationnel</option>
                <option value="EN MAINTENANCE">En maintenance</option>
                <option value="HORS SERVICE">Hors service</option>
              </select>
              {formErrors.etat && (
                <p className="mt-1 text-sm text-red-600">{formErrors.etat}</p>
              )}
            </div>
            
            {/* Machine Value */}
            <div>
              <label htmlFor="valeur" className="block text-sm font-medium text-gray-700 mb-1">
                Valeur *
              </label>
              <input
                type="text"
                id="valeur"
                name="valeur"
                value={formData.valeur || ''}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.valeur ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.valeur && (
                <p className="mt-1 text-sm text-red-600">{formErrors.valeur}</p>
              )}
            </div>
            
            {/* Next Maintenance Date */}
            <div>
              <label htmlFor="dateProchaineMaint" className="block text-sm font-medium text-gray-700 mb-1">
                Date prochaine maintenance
              </label>
              <input
                type="date"
                id="dateProchaineMaint"
                name="dateProchaineMaint"
                value={formData.dateProchaineMaint || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.dateProchaineMaint ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.dateProchaineMaint && (
                <p className="mt-1 text-sm text-red-600">{formErrors.dateProchaineMaint}</p>
              )}
            </div>
            
            {/* Additional Details */}
            <div className="md:col-span-2">
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                Détails supplémentaires
              </label>
              <textarea
                id="details"
                name="details"
                value={formData.details || ''}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.details ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              ></textarea>
              {formErrors.details && (
                <p className="mt-1 text-sm text-red-600">{formErrors.details}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              icon={<RiSaveLine />}
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MachineForm;