"use client"
import type { Node, Edge, BellmanKalabaStep } from "@/types/graph.type"
import CustomGraph from "./custom-graph"

interface GraphProps {
  initialNodes: Node[]
  initialEdges: Edge[]
  currentStep: BellmanKalabaStep | null
  sourceNodeId: string
  targetNodeId: string
  optimalPath: string[]
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void
}

export default function Graph(props: GraphProps) {
  return <CustomGraph {...props} />
}
