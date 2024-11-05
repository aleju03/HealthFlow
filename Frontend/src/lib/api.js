const API_URL = 'http://localhost:8000';

export const api = {
  auth: {
    login: async ({ username, password }) => {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login fallido');
      }
      
      return response.json();
    },

    register: async (userData) => {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registro fallido');
      }
      
      return response.json();
    },

    logout: async () => {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Cierre de sesión fallido');
      }
      
      return response.json();
    }
  },

  user: {
    // método para obtener detalles del usuario
    getDetails: async (userId) => {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) throw new Error('Error al obtener datos del usuario');
      return response.json();
    },

    getCurrentStats: async (userId) => {
      const response = await fetch(`${API_URL}/dashboard/${userId}/current`);
      if (!response.ok) throw new Error('Error al obtener estadísticas actuales');
      return response.json();
    },

    getHistory: async (userId, metric, period) => {
      const response = await fetch(
        `${API_URL}/dashboard/${userId}/history?metric=${metric}&period=${period}`
      );
      if (!response.ok) throw new Error('Error al obtener historial');
      return response.json();
    },

    importData: async (userId, type, data) => {
      const response = await fetch(`${API_URL}/users/${userId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import_type: type, data }),
      });
      
      if (!response.ok) throw new Error('Error al importar datos');
      return response.json();
    },

    updateProfile: async (userId, data) => {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Error al actualizar perfil');
      return response.json();
    },
  }
};