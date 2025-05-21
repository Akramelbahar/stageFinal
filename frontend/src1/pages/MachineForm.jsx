import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

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
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load machine data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchMachine = async () => {
        setLoading(true);
        try {
          const response = await getMachineById(id);
          const machineData = response.data;
          
          // Format date for input field if exists
          if (machineData.dateProchaineMaint) {
            const date = new Date(machineData.dateProchaineMaint);
            const formattedDate = date.toISOString().split('T')[0];
            machineData.dateProchaineMaint = formattedDate;
          }
          
          setFormData(machineData);
        } catch (err) {
          console.error('Error fetching machine:', err);
          setError('Erreur lors du chargement des données de la machine');
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
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!formData.etat.trim()) {
      errors.etat = 'L\'état est requis';
    }
    
    if (!formData.valeur.trim()) {
      errors.valeur = 'La valeur est requise';
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
      if (isEditMode) {
        await updateMachine(id, formData);
      } else {
        await createMachine(formData);
      }
      
      // Redirect after successful save
      navigate('/machines');
    } catch (err) {
      console.error('Error saving machine:', err);
      setError('Erreur lors de l\'enregistrement de la machine');
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'machine-edit' : 'machine-create';
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
          {isEditMode ? 'Modifier la machine' : 'Nouvelle machine'}
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
                value={formData.nom}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.nom ? 'border-red-300' : 'border-gray-300'
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un type</option>
                <option value="Alternateur">Alternateur</option>
                <option value="Moteur asynchrone">Moteur asynchrone</option>
                <option value="Moteur synchrone">Moteur synchrone</option>
                <option value="Transformateur">Transformateur</option>
                <option value="Générateur">Générateur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            {/* Machine Status */}
            <div>
              <label htmlFor="etat" className="block text-sm font-medium text-gray-700 mb-1">
                État *
              </label>
              <select
                id="etat"
                name="etat"
                value={formData.etat}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.etat ? 'border-red-300' : 'border-gray-300'
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
                value={formData.valeur}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.valeur ? 'border-red-300' : 'border-gray-300'
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={() => navigate('/machines')}
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

export default MachineForm;
