import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import ImportTypeCard from './components/import/ImportTypeCard';
import DataPreviewTable from './components/import/DataPreviewTable';
import { 
  Upload, ArrowRight, ArrowLeft, Check, AlertCircle,
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
        const dateValue = Object.values(row)[0];
        if (!dateValue) {
          throw new Error(`Fila ${index + 1}: Fecha vacía`);
        }

        const normalizedDate = normalizeDate(dateValue);

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
        // Si el tipo ya está seleccionado, lo remueve
        return prev.filter(t => t !== type);
      }
      // Si el tipo no está seleccionado, lo añade
      return [...prev, type];
    });
    setError(''); // Limpia cualquier error previo
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
    document.querySelectorAll('input[type="file"]').forEach(input => {
      input.value = '';
    });
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importTypes.map((type) => (
                <ImportTypeCard
                  key={type.value}
                  type={type}
                  isSelected={selectedTypes.includes(type.value)}
                  onSelect={() => handleTypeSelect(type.value)}
                  file={files[type.value]}
                  parsedData={parsedData[type.value]}
                  onFileSelect={(e) => handleFileSelect(e, type.value)}
                  onFileRemove={() => {
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
                />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {Object.entries(parsedData).map(([type, data]) => (
              <DataPreviewTable
                key={type}
                type={type}
                data={data}
                importTypes={importTypes}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-600">
            Importar Datos
          </h1>
          <p className="text-gray-500 mt-1">
            Selecciona los tipos de datos e importa tus archivos
          </p>
        </div>

        {/* Progress Steps */}
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
        {renderStep()}

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {success && (
          <div className="mt-6">
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          </div>
        )}

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
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleImport}
              disabled={isLoading || Object.keys(parsedData).length === 0}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {isLoading ? (
                <Upload className="h-4 w-4" />
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