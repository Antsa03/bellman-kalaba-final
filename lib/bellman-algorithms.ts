import type { Graph, BellmanKalabaResult, BellmanKalabaStep } from "@/types/graph.type"

export const INFINITY = Number.MAX_SAFE_INTEGER
export const NEG_INFINITY = Number.MIN_SAFE_INTEGER

// Algorithme de Bellman-Kalaba - Méthode Gauss-Seidel (Mise à jour séquentielle)
export function bellmanKalabaGaussSeidel(
  graph: Graph,
  sourceNodeId: string,
  targetNodeId: string,
): BellmanKalabaResult {
  const nodes = graph.nodes
  const edges = graph.edges

  // Initialisation
  const values: Record<string, number> = {}
  const predecessors: Record<string, string | null> = {}
  const steps: BellmanKalabaStep[] = []

  // Initialiser les valeurs
  nodes.forEach((node) => {
    values[node.id] = node.id === targetNodeId ? 0 : INFINITY
    predecessors[node.id] = null
  })

  // Ajouter l'étape initiale
  steps.push({
    values: { ...values },
    predecessors: { ...predecessors },
    currentNode: null,
    processedEdges: [],
    iteration: 1,
    completed: false,
    formulaText: `Méthode Gauss-Seidel - Initialisation: V${targetNodeId}⁽¹⁾ = 0, Vᵢ⁽¹⁾ = +∞ pour i ≠ ${targetNodeId}`,
    explanationText: `Méthode Gauss-Seidel (Mise à jour séquentielle) :\nV${targetNodeId}⁽¹⁾ = 0\nPour tous les autres sommets i ≠ ${targetNodeId}, Vᵢ⁽¹⁾ = +∞\nk = 1`,
  })

  const n = nodes.length

  // Itérer jusqu'à convergence
  for (let k = 2; k <= n; k++) {
    let hasChanged = false
    const processedEdges: string[] = []
    const currentValues = { ...values }
    let detailedExplanation = `Itération k = ${k} (Méthode Gauss-Seidel - Mise à jour séquentielle)\n\n`

    // Pour chaque nœud (sauf le nœud cible)
    for (const node of nodes) {
      if (node.id === targetNodeId) continue

      let bestValue = currentValues[node.id]
      let bestPredecessor = predecessors[node.id]
      let calcDetails = `Calcul pour x${node.id}:\n`

      // Trouver toutes les arêtes sortantes de ce nœud
      const outgoingEdges = edges.filter((edge) => edge.source === node.id)

      if (outgoingEdges.length > 0) {
        calcDetails += `V${node.id}^(${k}) = min { `

        for (const edge of outgoingEdges) {
          const destNode = edge.target
          const edgeWeight = edge.weight
          const destValue = values[destNode] // Utilise les valeurs mises à jour

          if (destValue !== INFINITY) {
            const newValue = edgeWeight + destValue
            calcDetails += `c${node.id},${destNode} + V${destNode}^(${k}) = ${edgeWeight} + ${destValue} = ${newValue}, `

            if (newValue < bestValue) {
              bestValue = newValue
              bestPredecessor = destNode
              if (!processedEdges.includes(edge.id)) {
                processedEdges.push(edge.id)
              }
            }
          } else {
            calcDetails += `c${node.id},${destNode} + V${destNode}^(${k}) = ${edgeWeight} + ∞ = ∞, `
          }
        }

        calcDetails = calcDetails.slice(0, -2) + ` }`
        calcDetails += ` = ${bestValue === INFINITY ? "∞" : bestValue}\n`
      } else {
        calcDetails += `Pas d'arêtes sortantes, V${node.id}^(${k}) reste ${currentValues[node.id] === INFINITY ? "∞" : currentValues[node.id]}\n`
      }

      // Mettre à jour immédiatement (caractéristique de Gauss-Seidel)
      if (bestValue !== currentValues[node.id]) {
        calcDetails += `V${node.id}^(${k}) est mis à jour: ${currentValues[node.id] === INFINITY ? "∞" : currentValues[node.id]} → ${bestValue === INFINITY ? "∞" : bestValue}\n`
        values[node.id] = bestValue
        currentValues[node.id] = bestValue
        predecessors[node.id] = bestPredecessor
        hasChanged = true
      } else {
        calcDetails += `V${node.id}^(${k}) reste inchangé à ${currentValues[node.id] === INFINITY ? "∞" : currentValues[node.id]}\n`
      }

      detailedExplanation += calcDetails + "\n"
    }

    // Résumé des valeurs pour cette itération
    let valuesTable = `Valeurs à la fin de l'itération k = ${k}:\n`
    for (const nodeId in values) {
      valuesTable += `V${nodeId}^(${k}) = ${values[nodeId] === INFINITY ? "∞" : values[nodeId]}\n`
    }
    detailedExplanation += valuesTable

    steps.push({
      values: { ...values },
      predecessors: { ...predecessors },
      currentNode: null,
      processedEdges: [...processedEdges],
      iteration: k,
      completed: false,
      formulaText: `Vᵢ⁽ᵏ⁾ = min{cᵢⱼ + Vⱼ⁽ᵏ⁾ : (i,j) ∈ U} pour tout i ≠ ${targetNodeId}`,
      explanationText: detailedExplanation,
    })

    if (!hasChanged) {
      break
    }
  }

  // Construire l'explication du chemin optimal
  const path = reconstructPath(predecessors, sourceNodeId, targetNodeId)
  let pathExplanation = `Algorithme de Bellman-Kalaba (Méthode Gauss-Seidel) terminé.\n\nChemin optimal de x${sourceNodeId} à x${targetNodeId} : `

  if (path.length > 0) {
    pathExplanation += path.map((id) => `x${id}`).join(" → ")
    pathExplanation += "\n\nDétail des poids sur le chemin optimal :\n"
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find((e) => e.source === path[i] && e.target === path[i + 1])
      if (edge) {
        pathExplanation += `x${path[i]} → x${path[i + 1]} : ${edge.weight}\n`
      }
    }
    const finalValueStr = values[sourceNodeId] === INFINITY ? "∞" : values[sourceNodeId]
    pathExplanation += `\nValeur minimale du chemin : ${finalValueStr}`
  } else {
    pathExplanation += "Aucun chemin n'existe"
  }

  steps.push({
    values: { ...values },
    predecessors: { ...predecessors },
    currentNode: null,
    processedEdges: [],
    iteration: steps[steps.length - 1].iteration + 1,
    completed: true,
    formulaText: `Vᵢ⁽ᵏ⁾ = Vᵢ⁽ᵏ⁻¹⁾ pour tout i ⇒ Convergence atteinte`,
    explanationText: pathExplanation,
  })

  return {
    steps,
    finalValues: values,
    finalPredecessors: predecessors,
  }
}

// Algorithme de Bellman-Kalaba - Méthode Jacobi (Mise à jour simultanée/Tabulaire)
export function bellmanKalabaJacobi(graph: Graph, sourceNodeId: string, targetNodeId: string): BellmanKalabaResult {
  const nodes = graph.nodes
  const edges = graph.edges
  const n = nodes.length

  // Initialisation du tableau des valeurs V[i][k]
  const valuesTable: Record<string, number[]> = {}
  const predecessors: Record<string, string | null> = {}
  const steps: BellmanKalabaStep[] = []

  // Initialiser le tableau pour chaque nœud
  nodes.forEach((node) => {
    valuesTable[node.id] = new Array(n + 1)
    valuesTable[node.id][1] = node.id === targetNodeId ? 0 : INFINITY
    predecessors[node.id] = null
  })

  // Ajouter l'étape initiale
  const initialValues: Record<string, number> = {}
  nodes.forEach((node) => {
    initialValues[node.id] = valuesTable[node.id][1]
  })

  steps.push({
    values: { ...initialValues },
    predecessors: { ...predecessors },
    currentNode: null,
    processedEdges: [],
    iteration: 1,
    completed: false,
    formulaText: `Méthode Jacobi - Initialisation: V${targetNodeId}⁽¹⁾ = 0, Vᵢ⁽¹⁾ = +∞ pour i ≠ ${targetNodeId}`,
    explanationText: `Méthode Jacobi (Mise à jour simultanée/Tabulaire) :\nV${targetNodeId}⁽¹⁾ = 0\nPour tous les autres sommets i ≠ ${targetNodeId}, Vᵢ⁽¹⁾ = +∞\nk = 1`,
    valuesTable: JSON.parse(JSON.stringify(valuesTable)), // Deep copy
  })

  let convergenceIteration = n

  // Itérations k = 2 à n pour trouver la convergence
  for (let k = 2; k <= n; k++) {
    let hasChanged = false
    let detailedExplanation = `Itération k = ${k} (Méthode Jacobi - Mise à jour simultanée)\n\n`
    const processedEdges: string[] = []

    // Pour chaque nœud (sauf le nœud cible)
    for (const node of nodes) {
      if (node.id === targetNodeId) {
        valuesTable[node.id][k] = 0
        continue
      }

      let bestValue = INFINITY
      let bestPredecessor: string | null = null
      let calcDetails = `Calcul pour x${node.id}:\n`

      const outgoingEdges = edges.filter((edge) => edge.source === node.id)

      if (outgoingEdges.length > 0) {
        calcDetails += `V${node.id}^(${k}) = min { `
        const candidates: number[] = []

        for (const edge of outgoingEdges) {
          const destNode = edge.target
          const edgeWeight = edge.weight
          const destValue = valuesTable[destNode][k - 1] // Utilise k-1 (Jacobi)

          if (destValue !== INFINITY) {
            const newValue = edgeWeight + destValue
            candidates.push(newValue)
            calcDetails += `c${node.id},${destNode} + V${destNode}^(${k - 1}) = ${edgeWeight} + ${destValue} = ${newValue}, `

            if (newValue < bestValue) {
              bestValue = newValue
              bestPredecessor = destNode
              if (!processedEdges.includes(edge.id)) {
                processedEdges.push(edge.id)
              }
            }
          } else {
            calcDetails += `c${node.id},${destNode} + V${destNode}^(${k - 1}) = ${edgeWeight} + ∞ = ∞, `
          }
        }

        calcDetails = calcDetails.slice(0, -2) + ` }`

        if (candidates.length > 0) {
          calcDetails += ` = ${bestValue}\n`
          valuesTable[node.id][k] = bestValue
          if (bestValue !== valuesTable[node.id][k - 1]) {
            predecessors[node.id] = bestPredecessor
            hasChanged = true
          }
        } else {
          calcDetails += ` = ∞\n`
          valuesTable[node.id][k] = INFINITY
        }
      } else {
        calcDetails += `Pas d'arêtes sortantes, V${node.id}^(${k}) = ∞\n`
        valuesTable[node.id][k] = INFINITY
      }

      // Indiquer si la valeur a changé
      if (valuesTable[node.id][k] !== valuesTable[node.id][k - 1]) {
        const oldValue = valuesTable[node.id][k - 1] === INFINITY ? "∞" : valuesTable[node.id][k - 1]
        const newValue = valuesTable[node.id][k] === INFINITY ? "∞" : valuesTable[node.id][k]
        calcDetails += `V${node.id}^(${k}) mis à jour: ${oldValue} → ${newValue}\n`
      } else {
        const value = valuesTable[node.id][k] === INFINITY ? "∞" : valuesTable[node.id][k]
        calcDetails += `V${node.id}^(${k}) reste inchangé: ${value}\n`
      }

      detailedExplanation += calcDetails + "\n"
    }

    // Créer le tableau des valeurs pour cette itération
    const currentValues: Record<string, number> = {}
    nodes.forEach((node) => {
      currentValues[node.id] = valuesTable[node.id][k]
    })

    steps.push({
      values: { ...currentValues },
      predecessors: { ...predecessors },
      currentNode: null,
      processedEdges: [...processedEdges],
      iteration: k,
      completed: false,
      formulaText: `Vᵢ⁽ᵏ⁾ = min{cᵢⱼ + Vⱼ⁽ᵏ⁻¹⁾ : (i,j) ∈ U} pour tout i ≠ ${targetNodeId}`,
      explanationText: detailedExplanation,
      valuesTable: JSON.parse(JSON.stringify(valuesTable)), // Deep copy
    })

    // Si pas de changement, on a trouvé la convergence
    if (!hasChanged) {
      convergenceIteration = k
      break
    }
  }

  // Compléter le tableau jusqu'à n itérations avec les valeurs convergées
  for (let k = convergenceIteration + 1; k <= n; k++) {
    nodes.forEach((node) => {
      valuesTable[node.id][k] = valuesTable[node.id][convergenceIteration]
    })
  }

  // Construire l'explication du chemin optimal
  const finalValues: Record<string, number> = {}
  nodes.forEach((node) => {
    finalValues[node.id] = valuesTable[node.id][convergenceIteration]
  })

  const path = reconstructPath(predecessors, sourceNodeId, targetNodeId)
  let pathExplanation = `Algorithme de Bellman-Kalaba (Méthode Jacobi) terminé.\n\n`
  pathExplanation += `Convergence atteinte à l'itération k = ${convergenceIteration}\n\n`
  pathExplanation += `Chemin optimal de x${sourceNodeId} à x${targetNodeId} : `

  if (path.length > 0) {
    pathExplanation += path.map((id) => `x${id}`).join(" → ")
    pathExplanation += "\n\nDétail des poids sur le chemin optimal :\n"
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find((e) => e.source === path[i] && e.target === path[i + 1])
      if (edge) {
        pathExplanation += `x${path[i]} → x${path[i + 1]} : ${edge.weight}\n`
      }
    }
    const finalValueStr = finalValues[sourceNodeId] === INFINITY ? "∞" : finalValues[sourceNodeId]
    pathExplanation += `\nValeur minimale du chemin : ${finalValueStr}`
  } else {
    pathExplanation += "Aucun chemin n'existe"
  }

  steps.push({
    values: { ...finalValues },
    predecessors: { ...predecessors },
    currentNode: null,
    processedEdges: [],
    iteration: convergenceIteration + 1,
    completed: true,
    formulaText: `Convergence atteinte à l'itération ${convergenceIteration}`,
    explanationText: pathExplanation,
    valuesTable: JSON.parse(JSON.stringify(valuesTable)), // Deep copy
  })

  return {
    steps,
    finalValues,
    finalPredecessors: predecessors,
    valuesTable, // Ajouter le tableau complet
    convergenceIteration,
  }
}

export function reconstructPath(
  predecessors: Record<string, string | null>,
  sourceNodeId: string,
  targetNodeId: string,
): string[] {
  const path: string[] = [sourceNodeId]
  let currentNodeId: string = sourceNodeId

  while (currentNodeId !== targetNodeId && predecessors[currentNodeId] !== null) {
    currentNodeId = predecessors[currentNodeId]!
    path.push(currentNodeId)
  }

  if (path[path.length - 1] !== targetNodeId) {
    return []
  }

  return path
}
