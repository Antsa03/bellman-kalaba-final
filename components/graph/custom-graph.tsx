"use client";
import { useState, useRef, useCallback } from "react";
import type React from "react";

import type { Node, Edge, BellmanKalabaStep } from "@/types/graph.type";
import { INFINITY, NEG_INFINITY } from "@/lib/bellman-algorithms";

interface CustomGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  currentStep: BellmanKalabaStep | null;
  sourceNodeId: string;
  targetNodeId: string;
  optimalPath: string[];
  onNodePositionChange?: (
    nodeId: string,
    position: { x: number; y: number }
  ) => void;
}

export default function CustomGraph({
  initialNodes,
  initialEdges,
  currentStep,
  sourceNodeId,
  targetNodeId,
  optimalPath,
  onNodePositionChange,
}: CustomGraphProps) {
  // Réduire la taille pour la méthode Jacobi
  const svgWidth = 800; // Réduit de 800
  const svgHeight = 400; // Réduit de 500
  const svgRef = useRef<SVGSVGElement>(null);

  // État pour le drag and drop
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    // Positions initiales spécifiques pour ressembler à l'image
    const defaultPositions: Record<string, { x: number; y: number }> = {
      "1": { x: 80, y: 250 },
      "2": { x: 180, y: 200 },
      "3": { x: 220, y: 320 },
      "4": { x: 220, y: 120 },
      "5": { x: 320, y: 80 },
      "6": { x: 320, y: 180 },
      "7": { x: 420, y: 240 },
      "8": { x: 480, y: 180 },
      "9": { x: 380, y: 120 },
      "10": { x: 540, y: 120 },
      "11": { x: 420, y: 360 },
      "12": { x: 600, y: 180 },
      "13": { x: 540, y: 300 },
      "14": { x: 660, y: 240 },
      "15": { x: 720, y: 180 },
      "16": { x: 760, y: 240 },
    };

    // Utiliser les positions des nœuds initiaux ou les positions par défaut
    const positions: Record<string, { x: number; y: number }> = {};
    initialNodes.forEach((node) => {
      positions[node.id] = node.position ||
        defaultPositions[node.id] || { x: 100, y: 100 };
    });
    return positions;
  });

  // Gestionnaires de drag and drop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const nodePos = nodePositions[nodeId];
      setDraggedNode(nodeId);
      setDragOffset({
        x: e.clientX - rect.left - nodePos.x,
        y: e.clientY - rect.top - nodePos.y,
      });
    },
    [nodePositions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNode) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = Math.max(
        25,
        Math.min(svgWidth - 25, e.clientX - rect.left - dragOffset.x)
      );
      const newY = Math.max(
        25,
        Math.min(svgHeight - 25, e.clientY - rect.top - dragOffset.y)
      );

      setNodePositions((prev) => ({
        ...prev,
        [draggedNode]: { x: newX, y: newY },
      }));

      // Notifier le parent du changement de position
      onNodePositionChange?.(draggedNode, { x: newX, y: newY });
    },
    [draggedNode, dragOffset, svgWidth, svgHeight, onNodePositionChange]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Fonction pour dessiner une flèche
  const drawArrow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    isOptimal: boolean,
    isProcessed: boolean
  ) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Ajuster les points pour ne pas chevaucher les cercles
    const nodeRadius = 25;
    const startX = x1 + nodeRadius * Math.cos(angle);
    const startY = y1 + nodeRadius * Math.sin(angle);
    const endX = x2 - nodeRadius * Math.cos(angle);
    const endY = y2 - nodeRadius * Math.sin(angle);

    const arrowHeadLength = 12;
    const arrowHeadAngle = Math.PI / 6;

    const color = isOptimal ? "#10B981" : isProcessed ? "#EF4444" : "#374151";
    const strokeWidth = isOptimal ? 3 : isProcessed ? 2 : 1.5;

    return (
      <g key={`arrow-${x1}-${y1}-${x2}-${y2}`}>
        {/* Ligne principale */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {/* Pointe de flèche */}
        <polygon
          points={`${endX},${endY} ${
            endX - arrowHeadLength * Math.cos(angle - arrowHeadAngle)
          },${endY - arrowHeadLength * Math.sin(angle - arrowHeadAngle)} ${
            endX - arrowHeadLength * Math.cos(angle + arrowHeadAngle)
          },${endY - arrowHeadLength * Math.sin(angle + arrowHeadAngle)}`}
          fill={color}
        />
      </g>
    );
  };

  // Fonction pour formater les valeurs
  const formatValue = (value: number): string => {
    if (value === INFINITY) return "∞";
    if (value === NEG_INFINITY) return "-∞";
    return value.toString();
  };

  // Déterminer les arêtes optimales
  const optimalEdges = new Set<string>();
  for (let i = 0; i < optimalPath.length - 1; i++) {
    optimalEdges.add(`${optimalPath[i]}-${optimalPath[i + 1]}`);
  }

  return (
    <div className="w-full h-full flex justify-center items-center bg-white">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="border border-gray-200 rounded-lg cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Définition des marqueurs pour les flèches */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
          </marker>
        </defs>

        {/* Dessiner les arêtes */}
        {initialEdges.map((edge) => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          const isOptimal = optimalEdges.has(`${edge.source}-${edge.target}`);
          const isProcessed =
            currentStep?.processedEdges.includes(edge.id) || false;

          if (!sourcePos || !targetPos) return null;

          const midX = (sourcePos.x + targetPos.x) / 2;
          const midY = (sourcePos.y + targetPos.y) / 2;

          return (
            <g key={edge.id}>
              {drawArrow(
                sourcePos.x,
                sourcePos.y,
                targetPos.x,
                targetPos.y,
                isOptimal,
                isProcessed
              )}

              {/* Poids de l'arête */}
              <rect
                x={midX - 12}
                y={midY - 10}
                width={24}
                height={20}
                rx={4}
                fill="white"
                stroke={isOptimal ? "#10B981" : "#D1D5DB"}
                strokeWidth={1}
              />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                fill={isOptimal ? "#10B981" : "#374151"}
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Dessiner les nœuds */}
        {initialNodes.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;

          const isSource = node.id === sourceNodeId;
          const isTarget = node.id === targetNodeId;
          const isOnOptimalPath = optimalPath.includes(node.id);
          const isCurrent = node.id === currentStep?.currentNode;
          const isDragging = draggedNode === node.id;

          let fillColor = "white";
          let strokeColor = "#D1D5DB";
          let textColor = "#374151";

          if (isSource || isTarget) {
            fillColor = "#3B82F6";
            strokeColor = "#2563EB";
            textColor = "white";
          } else if (isOnOptimalPath) {
            fillColor = "#10B981";
            strokeColor = "#059669";
            textColor = "white";
          } else if (isCurrent) {
            fillColor = "#F59E0B";
            strokeColor = "#D97706";
            textColor = "white";
          }

          const nodeValue = currentStep?.values[node.id];
          const displayValue =
            nodeValue !== undefined ? formatValue(nodeValue) : "";

          return (
            <g key={node.id}>
              {/* Cercle du nœud */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={25}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={2}
                className={`${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                } transition-all duration-200`}
                style={{
                  filter: isOnOptimalPath
                    ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))"
                    : "none",
                  transform: isDragging ? "scale(1.1)" : "scale(1)",
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              />

              {/* Label du nœud */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill={textColor}
                className="pointer-events-none select-none"
              >
                {node.label}
              </text>

              {/* Valeur du nœud (au-dessus) */}
              {currentStep &&
                nodeValue !== undefined &&
                nodeValue !== INFINITY &&
                nodeValue !== NEG_INFINITY && (
                  <text
                    x={pos.x}
                    y={pos.y - 40}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill="#DC2626"
                    className="pointer-events-none select-none"
                  >
                    {displayValue}
                  </text>
                )}
            </g>
          );
        })}

        {/* Instructions de drag and drop */}
        <text
          x={10}
          y={svgHeight - 10}
          fontSize="12"
          fill="#6B7280"
          className="pointer-events-none select-none"
        >
          💡 Glissez-déposez les nœuds pour réorganiser le graphe
        </text>
      </svg>
    </div>
  );
}
