import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = () => {
  const { auth } = useAuth();

  
  if (!auth) {
    return <Navigate to="/login" />;
  }


  return <Outlet />;
};

export default PrivateRoute;