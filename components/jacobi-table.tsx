"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "lucide-react";

interface JacobiTableProps {
  valuesTable: Record<string, number[]>;
  nodes: string[];
  maxIteration: number;
  convergenceIteration?: number;
  currentIteration?: number;
}

export default function JacobiTable({
  valuesTable,
  nodes,
  maxIteration,
  convergenceIteration,
  currentIteration = 1,
}: JacobiTableProps) {
  const sortedNodes = nodes.sort(
    (a, b) => Number.parseInt(a) - Number.parseInt(b)
  );

  // N'afficher que les colonnes jusqu'à l'itération actuelle
  const displayedIterations = Math.min(currentIteration, maxIteration);

  return (
    <Card className="shadow-lg border-0 bg-white text-xs">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg py-3">
        <CardTitle className="text-lg flex items-center">
          <Table className="mr-2 h-5 w-5" />
          Tableau Jacobi - Itération {currentIteration}
          {convergenceIteration && currentIteration >= convergenceIteration && (
            <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">
              Convergé à k={convergenceIteration}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-gray-400 px-3 py-2 font-bold text-gray-800 bg-gray-200">
                  k
                </th>
                {Array.from({ length: displayedIterations }, (_, i) => (
                  <th
                    key={i + 1}
                    className={`border-2 border-gray-400 px-3 py-2 font-bold text-center min-w-[50px] ${
                      currentIteration === i + 1
                        ? "bg-blue-200 text-blue-800"
                        : convergenceIteration && i + 1 <= convergenceIteration
                        ? "bg-green-50 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map((nodeId, rowIndex) => (
                <tr
                  key={nodeId}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border-2 border-gray-400 px-3 py-2 font-bold bg-gray-100 text-gray-800">
                    V<sub>{nodeId}</sub>
                    <sup>(k)</sup>
                  </td>
                  {Array.from({ length: displayedIterations }, (_, i) => {
                    const value = valuesTable[nodeId]?.[i + 1];
                    const displayValue =
                      value === Number.MAX_SAFE_INTEGER ? "∞" : value;
                    const isCurrentIteration = currentIteration === i + 1;
                    const isConverged =
                      convergenceIteration && i + 1 <= convergenceIteration;

                    return (
                      <td
                        key={i + 1}
                        className={`border-2 border-gray-400 px-3 py-2 text-center font-mono ${
                          isCurrentIteration
                            ? "bg-blue-100 text-blue-900 font-bold"
                            : isConverged
                            ? "bg-green-50 text-green-800"
                            : "text-gray-700"
                        }`}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Itération actuelle (k = {currentIteration})</span>
            </div>
            {convergenceIteration &&
              currentIteration >= convergenceIteration && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                  <span>Convergence atteinte (k ≤ {convergenceIteration})</span>
                </div>
              )}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                Progression: {displayedIterations}/{maxIteration} itérations
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
