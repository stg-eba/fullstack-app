import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = () => {
  const { auth, isLoading } = useAuth(); 

  if (isLoading) {

    return <div>Loading authentication...</div>;
  }

  return auth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;