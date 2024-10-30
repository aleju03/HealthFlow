import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

// Creamos un contexto vacío que usaremos para compartir el estado de autenticación
const AuthContext = createContext(null);

// AuthProvider es el componente que envuelve nuestra app y provee la lógica de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para guardar info del usuario, con inicialización especial:
  // Revisa si hay un userId en localStorage al cargar la página
  const [user, setUser] = useState(() => {
    const userId = localStorage.getItem('userId');
    return userId ? { id: userId } : null;
  });
  // nuevo estado para almacenar los detalles completos del usuario
  const [userDetails, setUserDetails] = useState(null);
  
  const navigate = useNavigate();

  // efecto para cargar los detalles del usuario cuando tenemos un id
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.id) {
        try {
          const details = await api.user.getDetails(user.id);
          setUserDetails(details);
        } catch (error) {
          console.error('Error al cargar detalles del usuario:', error);
        }
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  // Función de login: recibe credenciales, llama al API y maneja el resultado
  const login = async (username, password) => {
    try {
      // Llama al endpoint de login usando nuestro api.js
      const data = await api.auth.login({ username, password });
      const userId = data.user_id;
      
      // Si el login es exitoso:
      // 1. Guarda el userId en localStorage (persistencia)
      // 2. Actualiza el estado del usuario
      // 3. Navega al dashboard
      localStorage.setItem('userId', userId);
      setUser({ id: userId });
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      // Si hay error, retorna el mensaje para mostrarlo en el UI
      return { success: false, error: error.message };
    }
  };

  // Función de registro: similar a login pero con más datos
  const register = async (userData) => {
    try {
      await api.auth.register(userData);
      // Si el registro es exitoso, navega a login con un mensaje de éxito
      navigate('/login', { 
        state: { message: 'Registro exitoso!' }
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Función de logout: limpia el estado y storage
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout fallido:', error);
    } finally {
      // Aunque falle el API call, siempre:
      // 1. Limpia el localStorage
      // 2. Resetea el estado del usuario y sus detalles
      // 3. Regresa a login
      localStorage.removeItem('userId');
      setUser(null);
      setUserDetails(null);
      navigate('/login');
    }
  };

  // Provee todas las funciones de auth y los datos completos del usuario a los componentes hijos
  return (
    <AuthContext.Provider value={{ 
      user: { ...user, ...userDetails }, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Si tratan de usar useAuth fuera del Provider, lanza error
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};