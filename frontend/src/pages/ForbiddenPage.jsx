import React from 'react';
import { Link } from 'react-router-dom';
import { RiLockLine, RiHome2Line } from 'react-icons/ri';
import Button from '../components/common/Button';

const ForbiddenPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RiLockLine className="text-red-600 text-3xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Veuillez contacter votre administrateur si vous pensez que c'est une erreur.
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

export default ForbiddenPage;
