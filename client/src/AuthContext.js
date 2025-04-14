import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true); 
      try {
        const response = await fetch('http://localhost:3000/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuth({ username: data.username });
        } else {
          
          setAuth(null);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setAuth(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);
  const value = { auth, setAuth, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };