export type Node = {
  id: string
  label: string
  position: { x: number; y: number }
  type?: "custom" | "start" | "end"
}

export type Edge = {
  id: string
  source: string
  target: string
  weight: number
}

export type Graph = {
  nodes: Node[]
  edges: Edge[]
}

export type BellmanKalabaStep = {
  values: Record<string, number>
  predecessors: Record<string, string | null>
  currentNode: string | null
  processedEdges: string[]
  iteration: number
  completed: boolean
  formulaText: string
  explanationText: string
  valuesTable?: Record<string, number[]>
}

export type BellmanKalabaResult = {
  steps: BellmanKalabaStep[]
  finalValues: Record<string, number>
  finalPredecessors: Record<string, string | null>
  valuesTable?: Record<string, number[]>
  convergenceIteration?: number
}
