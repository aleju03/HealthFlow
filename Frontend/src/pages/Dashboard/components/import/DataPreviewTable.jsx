import { Card, CardContent } from "../../../../components/ui/card";

const DataPreviewTable = ({ type, data, importTypes }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card>
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
  );
};

export default DataPreviewTable;