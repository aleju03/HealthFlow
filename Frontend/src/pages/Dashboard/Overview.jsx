import React from 'react';
import { Card } from '../../components/ui/card';

const Overview = () => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Panel General</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Bienvenido</h2>
          <p className="text-gray-600">
            Resumen de datos creativo aquí
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Overview;