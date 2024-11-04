import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Check, Upload } from 'lucide-react';
import { useState } from 'react';

const ImportTypeCard = ({ 
  type, 
  isSelected, 
  onSelect, 
  file, 
  parsedData,
  onFileSelect,
  onFileRemove 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      const syntheticEvent = {
        target: {
          files: [droppedFile]
        }
      };
      onFileSelect(syntheticEvent);
    }
  };

  return (
    <div>
      <Card
        className={`transition-colors cursor-pointer ${
          isSelected ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div>{type.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{type.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              </div>
              {isSelected && <Check className="h-5 w-5 text-purple-600" />}
            </div>

            {/* Upload Area with Drag & Drop */}
            {isSelected && (
              <div className="pt-4 border-t border-gray-100">
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                      isDragging 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <Upload className={`mx-auto h-8 w-8 ${
                        isDragging ? 'text-purple-500' : 'text-gray-400'
                      }`} />
                      <div className="mt-2">
                        <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                          <span>Seleccionar archivo</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".csv"
                            onChange={onFileSelect}
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
                            {file.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {parsedData?.length || 0} registros
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onFileRemove}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportTypeCard;