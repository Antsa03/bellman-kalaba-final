import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { INFINITY } from "@/lib/bellman-algorithms"

interface CustomNodeData {
  label: string
  value: number
  isSource: boolean
  isTarget: boolean
  isCurrent: boolean
  isInfinity: boolean
  isOnOptimalPath: boolean
}

const CustomNode = ({ data, id }: NodeProps<CustomNodeData>) => {
  const { label, value, isSource, isTarget, isCurrent, isInfinity, isOnOptimalPath } = data

  // Style amélioré pour les nœuds
  let backgroundColor = "white"
  let textColor = "black"
  let borderColor = "#D1D5DB"
  const borderStyle = "solid"
  const nodeSize = "60px"
  let shadowClass = ""

  if (isSource || isTarget) {
    backgroundColor = "#3B82F6"
    textColor = "white"
    borderColor = "#2563EB"
    shadowClass = "shadow-lg shadow-blue-500/25"
  } else if (isOnOptimalPath) {
    backgroundColor = "#10B981"
    textColor = "white"
    borderColor = "#059669"
    shadowClass = "shadow-lg shadow-green-500/25"
  } else if (isCurrent) {
    backgroundColor = "#F59E0B"
    textColor = "white"
    borderColor = "#D97706"
    shadowClass = "shadow-lg shadow-yellow-500/25"
  }

  return (
    <div
      className={`rounded-full border-2 flex justify-center items-center relative ${shadowClass}`}
      style={{
        backgroundColor,
        color: textColor,
        width: nodeSize,
        height: nodeSize,
        borderColor,
        borderStyle,
        fontSize: "16px",
        fontWeight: "bold",
        transition: "all 0.3s ease",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: borderColor, border: "2px solid white" }} />
      <Handle type="target" position={Position.Left} style={{ background: borderColor, border: "2px solid white" }} />

      <div className="font-bold text-center">{label}</div>

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, border: "2px solid white" }} />
      <Handle type="source" position={Position.Right} style={{ background: borderColor, border: "2px solid white" }} />

      {/* Valeur du nœud avec style amélioré */}
      {!isInfinity && Math.abs(value) !== INFINITY && (
        <div
          className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm px-2 py-1 rounded-full font-bold shadow-sm ${
            isOnOptimalPath
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
          style={{ whiteSpace: "nowrap" }}
        >
          {value}
        </div>
      )}
    </div>
  )
}

export default memo(CustomNode)
