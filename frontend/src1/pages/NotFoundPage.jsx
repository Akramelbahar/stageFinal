import React from 'react';
import { Link } from 'react-router-dom';
import { RiErrorWarningLine, RiHome2Line } from 'react-icons/ri';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiErrorWarningLine className="text-blue-600 text-3xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page non trouvée</h2>
        
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Veuillez vérifier l'URL ou retourner à l'accueil.
        </p>
        
        <Link to="/">
          <Button 
            variant="primary" 
            icon={<RiHome2Line />}
            className="w-full"
          >
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
