import { memo } from "react"
import { type EdgeProps, getBezierPath } from "reactflow"

interface CustomEdgeData {
  weight: number
  isProcessed: boolean
  isOnOptimalPath: boolean
}

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps<CustomEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  })

  // Style amélioré pour les arcs
  const edgeStyle = {
    ...style,
    stroke: data?.isOnOptimalPath ? "#10B981" : data?.isProcessed ? "#EF4444" : "#6B7280",
    strokeWidth: data?.isOnOptimalPath ? 4 : data?.isProcessed ? 3 : 2,
    filter: data?.isOnOptimalPath ? "drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))" : "none",
  }

  // Position du texte améliorée
  const getMidpoint = () => {
    const midX = (sourceX + targetX) / 2
    const midY = (sourceY + targetY) / 2
    return { x: midX, y: midY }
  }

  const midpoint = getMidpoint()

  return (
    <>
      <path id={id} style={edgeStyle} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />

      {/* Arrière-plan amélioré pour le texte */}
      <rect
        x={midpoint.x - 15}
        y={midpoint.y - 12}
        width={30}
        height={24}
        rx={8}
        fill="white"
        stroke={data?.isOnOptimalPath ? "#10B981" : data?.isProcessed ? "#EF4444" : "#D1D5DB"}
        strokeWidth={2}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      />

      {/* Texte du poids avec style amélioré */}
      <text
        x={midpoint.x}
        y={midpoint.y}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          fill: data?.isOnOptimalPath ? "#10B981" : data?.isProcessed ? "#EF4444" : "#374151",
        }}
      >
        {data?.weight}
      </text>
    </>
  )
}

export default memo(CustomEdge)
