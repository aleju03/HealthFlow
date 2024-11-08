import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { 
  User, Mail, Calendar, Users, Save, Lock, X
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        email: user.email || '',
        username: user.username || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        gender: user.gender || '',
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El correo electrónico no es válido');
      return false;
    }

    if (activeSection === 'security') {
      if (!formData.current_password) {
        setError('Debes ingresar tu contraseña actual para cambiarla');
        return false;
      }
      
      if (!formData.new_password || !formData.confirm_password) {
        setError('Debes completar todos los campos de contraseña');
        return false;
      }

      if (formData.new_password !== formData.confirm_password) {
        setError('Las contraseñas nuevas no coinciden');
        return false;
      }

      if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/.test(formData.new_password)) {
        setError('La contraseña debe tener al menos 10 caracteres e incluir letras, números y símbolos');
        return false;
      }
    }

    if (!formData.birthday) {
      setError('La fecha de nacimiento es requerida');
      return false;
    }

    if (!formData.gender) {
      setError('el género es requerido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        email: formData.email,
        username: formData.username,
        birthday: new Date(formData.birthday).toISOString(),
        gender: formData.gender,
      };

      const usernameChanged = formData.username !== user.username;

      if (activeSection === 'security') {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await api.user.updateProfile(user.id, updateData);
      
      if (response.credentials_changed) {
        setSuccess('Contraseña actualizada. Cerrando sesión...');
      } else if (usernameChanged) {
        setSuccess('Nombre de usuario actualizado. Cerrando sesión...');
      } else {
        setSuccess('Perfil actualizado correctamente');
      }
      
      if (response.credentials_changed || usernameChanged) {
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-x-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                {user?.username || 'Usuario'}
              </h1>
              <p className="text-gray-500 mt-1">
                Gestiona tu perfil y preferencias
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-8 bg-white/50 backdrop-blur-sm p-1 rounded-lg w-fit">
            <Button
              variant={activeSection === 'personal' ? 'secondary' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveSection('personal')}
            >
              <User className="w-4 h-4" />
              Información Personal
            </Button>
            <Button
              variant={activeSection === 'security' ? 'secondary' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveSection('security')}
            >
              <Lock className="w-4 h-4" />
              Seguridad
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar */}
          <Card className="md:col-span-1 bg-white/50 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 uppercase">Resumen</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500">Email</p>
                        <p className="text-gray-900 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500">Fecha de Nacimiento</p>
                        <p className="text-gray-900">
                          {user?.birthday ? new Date(user.birthday).toLocaleDateString() : 'No especificada'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-medium text-sm text-gray-500 uppercase">Acciones Rápidas</h3>
                  <div className="mt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => setActiveSection('security')}
                    >
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Cambiar Contraseña</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => logout()}
                    >
                      <X className="w-4 h-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Form Section */}
          <Card className="md:col-span-2 bg-white/50 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-6">
              {activeSection === 'personal' ? (
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="username"
                          className="pl-9"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-9"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Fecha de Nacimiento</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="birthday"
                            type="date"
                            className="pl-9"
                            value={formData.birthday}
                            onChange={(e) => handleInputChange('birthday', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => handleInputChange('gender', value)}
                          >
                            <SelectTrigger className="pl-9">
                              <SelectValue placeholder="Selecciona tu género" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Contraseña Actual</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={formData.current_password}
                      onChange={(e) => handleInputChange('current_password', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nueva Contraseña</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={formData.new_password}
                      onChange={(e) => handleInputChange('new_password', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="mt-6">
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {success && (
                <div className="mt-6">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-600">{success}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;