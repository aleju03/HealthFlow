import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-purple-50 to-white p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-8"
      >
        <Activity className="h-8 w-8 text-purple-600" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          HealthFlow
        </h1>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="w-[380px] overflow-hidden backdrop-blur-md bg-white/30 border border-purple-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Bienvenido de nuevo
            </CardTitle>
            <CardDescription className="text-center text-purple-600/80">
              Continúa tu viaje de salud
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
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
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-600">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                className="pt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <>
                      Iniciar sesión
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
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

            <motion.div 
              className="w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                className="w-full bg-white/50 hover:bg-white/60 transition-all duration-200"
                onClick={() => navigate('/register')}
              >
                Crear cuenta
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div 
        className="flex gap-2 mt-8 text-purple-600 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Heart className="h-4 w-4 text-pink-500" />
        <span className="text-sm">Monitorea tu salud</span>
      </motion.div>
    </div>
  );
};

export default Login;