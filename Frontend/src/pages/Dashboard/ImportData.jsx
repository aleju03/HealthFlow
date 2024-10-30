import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileUp, ArrowRight, ArrowLeft, Check, AlertCircle,
  Ruler, Activity, Percent, Droplet, Footprints, Dumbbell,
  Weight
} from 'lucide-react';
import Papa from 'papaparse';

const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  // si falla, intenta formato dd/mm/yyyy
  const [day, month, year] = dateString.split(/[/\-]/).map(Number);
  const newDate = new Date(year, month - 1, day);
  
  if (isNaN(newDate.getTime())) {
    throw new Error(`Fecha inválida: ${dateString}`);
  }
  
  return newDate.toISOString().slice(0, 19).replace('T', ' ');
};

const ImportData = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [files, setFiles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedData, setParsedData] = useState({});

  const importTypes = [
    {
      value: 'weight',
      label: 'Pesos',
      icon: <Weight className="w-6 h-6 text-purple-600" />,
      description: 'Registros de peso corporal',
      format: 'fecha,peso'
    },
    {
      value: 'height',
      label: 'Alturas',
      icon: <Ruler className="w-6 h-6 text-purple-600" />,
      description: 'Mediciones de altura',
      format: 'fecha,altura'
    },
    {
      value: 'body_composition',
      label: 'Composición Corporal',
      icon: <Activity className="w-6 h-6 text-purple-600" />,
      description: 'Mediciones de grasa, músculo y agua',
      format: 'fecha,grasa,musculo,agua'
    },
    {
      value: 'body_fat',
      label: 'Porcentaje de Grasa',
      icon: <Percent className="w-6 h-6 text-purple-600" />,
      description: 'Mediciones de porcentaje de grasa corporal',
      format: 'fecha,porcentajeGrasa'
    },
    {
      value: 'water',
      label: 'Vasos de Agua',
      icon: <Droplet className="w-6 h-6 text-purple-600" />,
      description: 'Registro de consumo de agua',
      format: 'fecha,vasosDeAgua'
    },
    {
      value: 'steps',
      label: 'Pasos Diarios',
      icon: <Footprints className="w-6 h-6 text-purple-600" />,
      description: 'Conteo diario de pasos',
      format: 'fecha,cantidadPasos'
    },
    {
      value: 'exercise',
      label: 'Ejercicios',
      icon: <Dumbbell className="w-6 h-6 text-purple-600" />,
      description: 'Registro de ejercicios realizados',
      format: 'fecha,nombreEjercicio,duracion'
    }
  ];

  const validateData = (data, type) => {
    if (!data || data.length === 0) {
      throw new Error('El archivo está vacío');
    }

    const validateRow = (row, index) => {
      try {
        // Obtener fecha de la primera columna
        const dateValue = Object.values(row)[0];
        if (!dateValue) {
          throw new Error(`Fila ${index + 1}: Fecha vacía`);
        }

        // Normalizar fecha
        const normalizedDate = normalizeDate(dateValue);

        // Validaciones específicas por tipo
        switch (type) {
          case 'weight': {
            const weight = parseFloat(Object.values(row)[1]);
            if (isNaN(weight)) throw new Error(`Fila ${index + 1}: Peso inválido`);
            return { date: normalizedDate, weight };
          }

          case 'height': {
            const height = parseFloat(Object.values(row)[1]);
            if (isNaN(height)) throw new Error(`Fila ${index + 1}: Altura inválida`);
            return { date: normalizedDate, height };
          }

          case 'body_composition': {
            const [, fat, muscle, water] = Object.values(row).map(parseFloat);
            if (isNaN(fat) || isNaN(muscle) || isNaN(water)) {
              throw new Error(`Fila ${index + 1}: Valores de composición corporal inválidos`);
            }
            return { date: normalizedDate, fat, muscle, water };
          }

          case 'body_fat': {
            const fatPercentage = parseFloat(Object.values(row)[1]);
            if (isNaN(fatPercentage)) {
              throw new Error(`Fila ${index + 1}: Porcentaje de grasa inválido`);
            }
            return { date: normalizedDate, fat_percentage: fatPercentage };
          }

          case 'water': {
            const waterAmount = parseInt(Object.values(row)[1]);
            if (isNaN(waterAmount)) {
              throw new Error(`Fila ${index + 1}: Cantidad de vasos inválida`);
            }
            return { date: normalizedDate, water_amount: waterAmount };
          }

          case 'steps': {
            const stepsAmount = parseInt(Object.values(row)[1]);
            if (isNaN(stepsAmount)) {
              throw new Error(`Fila ${index + 1}: Cantidad de pasos inválida`);
            }
            return { date: normalizedDate, steps_amount: stepsAmount };
          }

          case 'exercise': {
            const [, exerciseName, duration] = Object.values(row);
            const parsedDuration = parseInt(duration);
            if (!exerciseName || isNaN(parsedDuration)) {
              throw new Error(`Fila ${index + 1}: Datos de ejercicio inválidos`);
            }
            return {
              date: normalizedDate,
              exercise_name: exerciseName,
              duration: parsedDuration
            };
          }

          default:
            throw new Error('Tipo de datos no soportado');
        }
      } catch (error) {
        throw new Error(error.message);
      }
    };

    return data.map((row, index) => validateRow(row, index));
  };

  const handleTypeSelect = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
    setError('');
  };

  const handleFileSelect = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const results = await new Promise((resolve, reject) => 
        Papa.parse(file, {
          header: true,
          complete: resolve,
          error: reject
        })
      );
      
      const validatedData = validateData(results.data, type);
      setParsedData(prev => ({ ...prev, [type]: validatedData }));
      setFiles(prev => ({ ...prev, [type]: file }));
    } catch (error) {
      handleError(type, error.message);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Importar todos los tipos seleccionados en paralelo
      await Promise.all(
        Object.entries(parsedData).map(([type, data]) =>
          api.user.importData(user.id, type, data)
        )
      );
      
      setSuccess('¡Datos importados correctamente!');
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTypes([]);
    setFiles({});
    setParsedData({});
    setSuccess('');
    setError('');
    // reset file inputs
    document.querySelectorAll('input[type="file"]').forEach(input => {
      input.value = '';
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importTypes.map((type) => (
                <motion.div
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`transition-colors cursor-pointer ${
                      selectedTypes.includes(type.value)
                        ? 'bg-purple-50 border-purple-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleTypeSelect(type.value)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div>{type.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {type.label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {type.description}
                            </p>
                          </div>
                          {selectedTypes.includes(type.value) && (
                            <Check className="h-5 w-5 text-purple-600" />
                          )}
                        </div>

                        {/* Upload Area - Solo visible si está seleccionado */}
                        {selectedTypes.includes(type.value) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-4 border-t border-gray-100"
                          >
                            {!files[type.value] ? (
                              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4"
                                   onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-center">
                                  <FileUp className="mx-auto h-8 w-8 text-gray-400" />
                                  <div className="mt-2">
                                    <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                                      <span>Seleccionar archivo</span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept=".csv"
                                        onChange={(e) => handleFileSelect(e, type.value)}
                                      />
                                    </label>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Formato: {type.format}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-green-50 rounded-lg p-3"
                                   onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-900 truncate">
                                        {files[type.value].name}
                                      </p>
                                      <p className="text-xs text-green-700">
                                        {parsedData[type.value]?.length || 0} registros
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setFiles(prev => {
                                        const newFiles = { ...prev };
                                        delete newFiles[type.value];
                                        return newFiles;
                                      });
                                      setParsedData(prev => {
                                        const newData = { ...prev };
                                        delete newData[type.value];
                                        return newData;
                                      });
                                    }}
                                  >
                                    Cambiar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {Object.entries(parsedData).map(([type, data]) => (
              <Card key={type}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          {importTypes.find(t => t.value === type)?.icon}
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {importTypes.find(t => t.value === type)?.label}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {data.length} registros encontrados
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {data[0] && 
                              Object.keys(data[0]).map((header) => (
                                <th
                                  key={header}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.slice(0, 3).map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((value, j) => (
                                <td
                                  key={j}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.length > 3 && (
                        <div className="text-center text-sm text-gray-500 py-4 bg-gray-50">
                          Mostrando 3 de {data.length} registros
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  const handleError = (type, message) => {
    const typeLabel = importTypes.find(t => t.value === type)?.label;
    setError(`Error en ${typeLabel}: ${message}`);
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[type];
      return newFiles;
    });
    setParsedData(prev => {
      const newData = { ...prev };
      delete newData[type];
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Importar Datos
          </h1>
          <p className="text-gray-500 mt-1">
            Selecciona los tipos de datos e importa tus archivos
          </p>
        </div>

        {/* Progress Steps - Ahora solo 2 pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />
            {['Selección y Carga', 'Confirmación'].map((label, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-2 ${
                  step > i + 1 ? 'text-purple-600' : 
                  step === i + 1 ? 'text-gray-900' : 
                  'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > i + 1
                      ? 'bg-purple-100 text-purple-600'
                      : step === i + 1
                      ? 'bg-white border-2 border-purple-600 text-purple-600'
                      : 'bg-white border-2 border-gray-200'
                  }`}
                >
                  {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {step < 2 ? (
            <Button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={
                (step === 1 && selectedTypes.length === 0) ||
                (step === 2 && Object.keys(parsedData).length === 0)
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleImport}
              disabled={isLoading || Object.keys(parsedData).length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <Upload className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Datos
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportData;