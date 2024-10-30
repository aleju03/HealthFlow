import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, ArrowLeft, User, Mail, Lock, Weight, Ruler, Calendar, Users, Check } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    current_weight: '',
    current_height: '',
    birthday: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // clear errors when user types
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.username) {
          setError('Por favor, completa todos los campos');
          return false;
        }
        // email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Por favor, introduce un correo electrónico válido');
          return false;
        }
        return true;

      case 2:
        if (!formData.password || !formData.confirmPassword) {
          setError('Por favor, completa todos los campos');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return false;
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/.test(formData.password)) {
          setError('La contraseña debe tener al menos 10 caracteres e incluir letras, números y símbolos');
          return false;
        }
        return true;

      case 3:
        if (!formData.current_weight || !formData.current_height || !formData.birthday || !formData.gender) {
          setError('Por favor, completa todos los campos');
          return false;
        }
        return true;

      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsLoading(true);
    setError('');

    const userData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      current_weight: parseFloat(formData.current_weight),
      current_height: parseFloat(formData.current_height),
      birthday: new Date(formData.birthday).toISOString(),
      gender: formData.gender === 'male' ? 'Masculino' : 'Femenino'
    };

    const result = await register(userData);
    
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <CardHeader>
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>Comencemos con tu información básica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                  <Input
                    id="username"
                    placeholder="Elige un nombre de usuario"
                    className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </motion.div>
        );
        case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <CardHeader>
              <CardTitle className="text-2xl">Asegura Tu Cuenta</CardTitle>
              <CardDescription>Elige una contraseña segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <CardHeader>
              <CardTitle className="text-2xl">Perfil de Salud</CardTitle>
              <CardDescription>Cuéntanos sobre ti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <div className="relative">
                    <Weight className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Peso"
                      className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                      value={formData.current_weight}
                      onChange={(e) => handleInputChange('current_weight', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <div className="relative">
                    <Ruler className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                    <Input
                      id="height"
                      type="number"
                      placeholder="Altura"
                      className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                      value={formData.current_height}
                      onChange={(e) => handleInputChange('current_height', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Fecha de Nacimiento</Label>
                <div className="relative">
                  <Calendar className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                  <Input
                    id="birthday"
                    type="date"
                    className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <div className="relative">
                  <Users className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger className="pl-9 bg-white/50 backdrop-blur-sm border-purple-100">
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </motion.div>
        );
      default:
        return null;
    }
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
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-md bg-white/30 border border-purple-100">
          <div className="px-6 pt-6">
            <div className="flex justify-between items-center mb-8">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                      step > index + 1 
                        ? 'bg-purple-200 text-purple-700'
                        : step === index + 1 
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-400'
                    }`}
                  >
                    {step > index + 1 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-4 h-4 text-purple-700" />
                      </motion.div>
                    ) : (
                      index + 1
                    )}
                  </motion.div>
                  {index < totalSteps - 1 && (
                    <div className="flex-1 h-1 mx-2 rounded-full bg-purple-100">
                      <motion.div
                        className="h-full bg-purple-600 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{
                          width: step > index + 1 ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6"
            >
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <CardFooter className="flex justify-between p-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="bg-white/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={step === totalSteps ? handleSubmit : nextStep}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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
                    {step === totalSteps ? 'Completar' : 'Siguiente'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div 
        className="flex items-center gap-2 mt-8 text-sm text-purple-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>¿Ya tienes una cuenta?</span>
        <Button 
          variant="link" 
          className="font-medium text-purple-600 hover:text-purple-700 p-0"
          onClick={() => navigate('/login')}
        >
          Iniciar sesión
        </Button>
      </motion.div>
    </div>
  );
};

export default Register;