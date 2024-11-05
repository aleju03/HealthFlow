import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Activity, Heart, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 p-4">
      <div
        className="flex items-center gap-2 mb-8"
      >
        <Activity className="h-8 w-8 text-purple-600" />
        <h1 className="text-2xl font-bold text-purple-600">
          HealthFlow
        </h1>
      </div>

      <div>
        <Card className="w-[380px] overflow-hidden backdrop-blur-md bg-white/30 border border-purple-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-purple-600">
              Bienvenido de nuevo
            </CardTitle>
            <CardDescription className="text-center text-purple-600/80">
              Continúa tu viaje de salud
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="mb-4">
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-purple-700">Nombre de usuario</Label>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                    <Input
                      id="username"
                      placeholder="Ingresa tu nombre de usuario"
                      className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100 transition-all duration-200 hover:border-purple-200 focus:border-purple-300"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-700">Contraseña</Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100 transition-all duration-200 hover:border-purple-200 focus:border-purple-300"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div>
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-600">{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div>
                      <Activity className="h-5 w-5" />
                    </div>
                  ) : (
                    <>
                      Iniciar sesión
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-purple-600 bg-white/80 backdrop-blur-sm">o</span>
              </div>
            </div>

            <div>
              <Button 
                variant="outline" 
                className="w-full bg-white/50 hover:bg-white/60 transition-all duration-200"
                onClick={() => navigate('/register')}
              >
                Crear cuenta
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div 
        className="flex gap-2 mt-8 text-purple-600 items-center"
      >
        <Heart className="h-4 w-4 text-pink-500" />
        <span className="text-sm">Monitorea tu salud</span>
      </div>
    </div>
  );
};

export default Login;