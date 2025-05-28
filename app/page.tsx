"use client";

import React, { useState, useEffect } from "react";
import Graph from "@/components/graph/graph";
import JacobiTable from "@/components/jacobi-table";
import {
  bellmanKalabaGaussSeidel,
  bellmanKalabaJacobi,
  reconstructPath,
} from "@/lib/bellman-algorithms";
import type {
  Node,
  Edge,
  Graph as GraphType,
  BellmanKalabaResult,
} from "@/types/graph.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Settings,
  Play,
  Calculator,
  Table,
  Move,
  Info,
} from "lucide-react";
import AnimationControls from "@/components/controls/animation-controls";
import { Badge } from "@/components/ui/badge";
import { predefinedEdges } from "@/data/predefined-edges";

export default function Home() {
  // États pour la gestion des entrées utilisateur
  const [nodeCount, setNodeCount] = useState<number>(16);
  const [tempNodeCount, setTempNodeCount] = useState<string>("16");
  const [showNodeForm, setShowNodeForm] = useState<boolean>(true);
  const [edgeInputs, setEdgeInputs] = useState<
    { source: string; target: string; weight: string }[]
  >([{ source: "1", target: "2", weight: "10" }]);
  const [sourceNodeId, setSourceNodeId] = useState<string>("1");
  const [targetNodeId, setTargetNodeId] = useState<string>("16");
  const [method, setMethod] = useState<"gauss-seidel" | "jacobi">("jacobi");

  // États pour le graphe et l'algorithme
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [result, setResult] = useState<BellmanKalabaResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const setupPredefinedGraph = () => {
    setNodeCount(16);
    setTempNodeCount("16");
    setSourceNodeId("1");
    setTargetNodeId("16");

    setEdgeInputs(predefinedEdges);
  };

  const generateNodePositions = (
    count: number
  ): { [key: string]: { x: number; y: number } } => {
    const positions: { [key: string]: { x: number; y: number } } = {};

    if (count === 16) {
      positions["1"] = { x: 80, y: 250 };
      positions["2"] = { x: 180, y: 200 };
      positions["3"] = { x: 220, y: 320 };
      positions["4"] = { x: 220, y: 120 };
      positions["5"] = { x: 320, y: 80 };
      positions["6"] = { x: 320, y: 180 };
      positions["7"] = { x: 420, y: 240 };
      positions["8"] = { x: 480, y: 180 };
      positions["9"] = { x: 380, y: 120 };
      positions["10"] = { x: 540, y: 120 };
      positions["11"] = { x: 420, y: 360 };
      positions["12"] = { x: 600, y: 180 };
      positions["13"] = { x: 540, y: 300 };
      positions["14"] = { x: 660, y: 240 };
      positions["15"] = { x: 720, y: 180 };
      positions["16"] = { x: 760, y: 240 };
    } else {
      const radius = Math.min(count * 40, 300);
      const centerX = 350;
      const centerY = 250;

      if (count <= 10) {
        for (let i = 1; i <= count; i++) {
          const angle = (2 * Math.PI * (i - 1)) / count - Math.PI / 2;
          positions[i.toString()] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          };
        }
      } else {
        const gridSize = Math.ceil(Math.sqrt(count));
        const cellSize = 700 / gridSize;
        for (let i = 1; i <= count; i++) {
          const row = Math.floor((i - 1) / gridSize);
          const col = (i - 1) % gridSize;
          positions[i.toString()] = {
            x: 50 + col * cellSize,
            y: 50 + row * cellSize,
          };
        }
      }
    }
    return positions;
  };

  const initializeNodes = (count: number) => {
    const positions = generateNodePositions(count);
    const newNodes: Node[] = [];

    for (let i = 1; i <= count; i++) {
      newNodes.push({
        id: i.toString(),
        label: `x${i}`,
        position: positions[i.toString()],
        type:
          i.toString() === sourceNodeId
            ? "start"
            : i.toString() === targetNodeId
            ? "end"
            : undefined,
      });
    }

    setNodes(newNodes);
  };

  const createEdges = () => {
    const newEdges: Edge[] = edgeInputs
      .filter((input) => input.source && input.target && input.weight)
      .map((input, index) => ({
        id: `e${input.source}-${input.target}`,
        source: input.source,
        target: input.target,
        weight: Number.parseInt(input.weight, 10) || 0,
      }));

    setEdges(newEdges);
  };

  const addEdgeInput = () => {
    setEdgeInputs([...edgeInputs, { source: "", target: "", weight: "" }]);
  };

  const handleEdgeInputChange = (
    index: number,
    field: "source" | "target" | "weight",
    value: string
  ) => {
    const newInputs = [...edgeInputs];
    newInputs[index][field] = value;
    setEdgeInputs(newInputs);
  };

  const removeEdgeInput = (index: number) => {
    const newInputs = [...edgeInputs];
    newInputs.splice(index, 1);
    setEdgeInputs(newInputs);
  };

  const handleSubmit = () => {
    initializeNodes(nodeCount);
    createEdges();
    setShowNodeForm(false);
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setShowNodeForm(true);
  };

  const handleNodePositionChange = (
    nodeId: string,
    position: { x: number; y: number }
  ) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
    );
  };

  useEffect(() => {
    if (!showNodeForm && nodes.length > 0 && edges.length > 0) {
      const graph: GraphType = {
        nodes: nodes,
        edges: edges,
      };

      const algorithmResult =
        method === "gauss-seidel"
          ? bellmanKalabaGaussSeidel(graph, sourceNodeId, targetNodeId)
          : bellmanKalabaJacobi(graph, sourceNodeId, targetNodeId);

      setResult(algorithmResult);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [showNodeForm, nodes, edges, sourceNodeId, targetNodeId, method]);

  const optimalPath = result?.finalPredecessors
    ? reconstructPath(result.finalPredecessors, sourceNodeId, targetNodeId)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-full">
        {/* En-tête moderne */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Algorithme de Bellman-Kalaba
              </h1>
              <p className="text-gray-600">
                Recherche du chemin optimal - Méthodes Gauss-Seidel et Jacobi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={method === "gauss-seidel" ? "default" : "secondary"}
                className="text-sm"
              >
                {method === "gauss-seidel" ? (
                  <>
                    <Calculator className="w-4 h-4 mr-1" />
                    Gauss-Seidel
                  </>
                ) : (
                  <>
                    <Table className="w-4 h-4 mr-1" />
                    Jacobi
                  </>
                )}
              </Badge>
              {!showNodeForm && (
                <Badge variant="outline" className="text-sm">
                  <Move className="w-4 h-4 mr-1" />
                  Drag & Drop
                </Badge>
              )}
            </div>
          </div>
        </div>

        {showNodeForm ? (
          // Configuration
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Settings className="mr-3 h-6 w-6" />
                Configuration du graphe
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Paramètres généraux */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Paramètres généraux
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="nodeCount"
                        className="text-sm font-medium text-gray-700"
                      >
                        Nombre de sommets
                      </Label>
                      <Input
                        id="nodeCount"
                        type="number"
                        min="2"
                        value={tempNodeCount}
                        onChange={(e) => setTempNodeCount(e.target.value)}
                        onBlur={() => {
                          const count = Number.parseInt(tempNodeCount, 10);
                          if (!isNaN(count) && count >= 2) {
                            setNodeCount(count);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="method"
                        className="text-sm font-medium text-gray-700"
                      >
                        Méthode de résolution
                      </Label>
                      <Select
                        value={method}
                        onValueChange={(value: "gauss-seidel" | "jacobi") =>
                          setMethod(value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gauss-seidel">
                            <div className="flex items-center">
                              <Calculator className="w-4 h-4 mr-2" />
                              Gauss-Seidel (Séquentielle)
                            </div>
                          </SelectItem>
                          <SelectItem value="jacobi">
                            <div className="flex items-center">
                              <Table className="w-4 h-4 mr-2" />
                              Jacobi (Tabulaire)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="sourceNode"
                        className="text-sm font-medium text-gray-700"
                      >
                        Sommet de départ
                      </Label>
                      <Input
                        id="sourceNode"
                        type="number"
                        min="1"
                        max={nodeCount}
                        value={sourceNodeId}
                        onChange={(e) => setSourceNodeId(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="targetNode"
                        className="text-sm font-medium text-gray-700"
                      >
                        Sommet d'arrivée
                      </Label>
                      <Input
                        id="targetNode"
                        type="number"
                        min="1"
                        max={nodeCount}
                        value={targetNodeId}
                        onChange={(e) => setTargetNodeId(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={setupPredefinedGraph}
                      variant="outline"
                      className="flex-1 hover:bg-blue-50 border-blue-200"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Charger l'exemple
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Créer et lancer
                    </Button>
                  </div>
                </div>

                {/* Définition des arcs */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex-1">
                      Définition des arcs
                    </h3>
                    <Button
                      onClick={addEdgeInput}
                      variant="outline"
                      size="sm"
                      className="ml-4 hover:bg-green-50 border-green-200"
                    >
                      + Ajouter
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {edgeInputs.map((input, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600">De</Label>
                          <Input
                            type="number"
                            min="1"
                            max={nodeCount}
                            value={input.source}
                            onChange={(e) =>
                              handleEdgeInputChange(
                                index,
                                "source",
                                e.target.value
                              )
                            }
                            className="mt-1 h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600">Vers</Label>
                          <Input
                            type="number"
                            min="1"
                            max={nodeCount}
                            value={input.target}
                            onChange={(e) =>
                              handleEdgeInputChange(
                                index,
                                "target",
                                e.target.value
                              )
                            }
                            className="mt-1 h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600">Poids</Label>
                          <Input
                            type="number"
                            value={input.weight}
                            onChange={(e) =>
                              handleEdgeInputChange(
                                index,
                                "weight",
                                e.target.value
                              )
                            }
                            className="mt-1 h-8"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEdgeInput(index)}
                          className="mt-5 h-8 px-2"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Visualisation avec contrôleurs fixes
          <div className="space-y-4">
            {/* Contrôles d'animation - Position sticky pour rester visible */}
            <div className="sticky top-4 z-10">
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-3">
                  {result && (
                    <AnimationControls
                      steps={result.steps}
                      currentStepIndex={currentStepIndex}
                      setCurrentStepIndex={setCurrentStepIndex}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      speed={speed}
                      setSpeed={setSpeed}
                    />
                  )}
                </CardContent>
              </Card>
            </div>



            {/* Contenu principal - Layout responsive amélioré */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Graphe */}
              <div className={`${method === "jacobi" ? "lg:col-span-8" : "lg:col-span-9"}`}>
                <Card className="shadow-xl border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg py-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Visualisation du graphe
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-white/20 px-2 py-1 rounded">
                          x{sourceNodeId} → x{targetNodeId}
                        </span>
                        <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                          <Move className="w-3 h-3 mr-1" />
                          Drag & Drop
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px] w-full">
                      <Graph
                        initialNodes={nodes}
                        initialEdges={edges}
                        currentStep={result?.steps[currentStepIndex] || null}
                        sourceNodeId={sourceNodeId}
                        targetNodeId={targetNodeId}
                        optimalPath={optimalPath}
                        onNodePositionChange={handleNodePositionChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panneau latéral - Selon la méthode */}
              <div className={`${method === "jacobi" ? "lg:col-span-4" : "lg:col-span-3"} space-y-4`}>

                {/* Contenu conditionnel selon la méthode */}
                {method === "jacobi" ? (
                  // Affichage pour Jacobi - Tableau uniquement
                  result && result.valuesTable && (
                    <Card className="shadow-lg border-0 bg-white">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg py-3">
                        <CardTitle className="text-lg">Tableau des itérations</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 max-h-[600px] overflow-auto">
                        <JacobiTable
                          valuesTable={result.valuesTable}
                          nodes={Object.keys(result.finalValues)}
                          maxIteration={nodeCount}
                          convergenceIteration={result.convergenceIteration}
                          currentIteration={result.steps[currentStepIndex]?.iteration}
                        />
                      </CardContent>
                    </Card>
                  )
                ) : (
                  // Affichage pour Gauss-Seidel - Explications textuelles
                  <>
                    <Card className="shadow-xl border-0 bg-white">
                      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg py-3">
                        <CardTitle className="text-lg">Étape actuelle</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {result && result.steps[currentStepIndex] && (
                            <>
                              {/* Formule */}
                              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                <div className="font-mono text-sm font-semibold text-yellow-800">
                                  {result.steps[currentStepIndex].formulaText}
                                </div>
                              </div>

                              {/* Explications détaillées avec scroll */}
                              <div className="bg-gray-50 p-3 rounded-md border max-h-96 overflow-y-auto">
                                <div className="font-mono text-xs whitespace-pre-line text-gray-700">
                                  {result.steps[currentStepIndex].explanationText}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Résultats et bouton de réinitialisation */}
                {result && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Chemin optimal
                        </h4>
                        <div className="flex flex-wrap gap-1 items-center mb-2">
                          {optimalPath.map((nodeId, index) => (
                            <React.Fragment key={nodeId}>
                              <Badge
                                variant="default"
                                className="bg-blue-500 text-xs"
                              >
                                x{nodeId}
                              </Badge>
                              {index < optimalPath.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-gray-500" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-green-800">
                            Valeur optimale:
                          </span>
                          <span className="font-bold text-green-700 ml-1">
                            {result?.finalValues[sourceNodeId] ===
                            Number.MAX_SAFE_INTEGER
                              ? "∞"
                              : result?.finalValues[sourceNodeId]}
                          </span>
                        </div>
                      </div>
                )}

                {/* Bouton de réinitialisation */}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full hover:bg-red-50 border-red-200 text-red-600"
                >
                  Nouvelle configuration
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
