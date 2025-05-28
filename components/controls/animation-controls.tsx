"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { BellmanKalabaStep } from "@/types/graph.type"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react"

interface AnimationControlsProps {
  steps: BellmanKalabaStep[]
  currentStepIndex: number
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
}

export default function AnimationControls({
  steps,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
}: AnimationControlsProps) {
  const maxSteps = steps.length - 1

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (currentStepIndex < maxSteps) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleFirst = () => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleLast = () => {
    setCurrentStepIndex(maxSteps)
    setIsPlaying(false)
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0])
  }

  // Effet pour l'animation automatique
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        if (currentStepIndex < maxSteps) {
          setCurrentStepIndex((prev) => prev + 1)
        } else {
          setIsPlaying(false)
        }
      }, 1000 / speed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentStepIndex, maxSteps, speed, setCurrentStepIndex, setIsPlaying])

  return (
    <div className="flex items-center gap-4">
      {/* Contrôles principaux - plus compacts */}
      <div className="flex gap-1">
        <Button
          onClick={handleFirst}
          disabled={currentStepIndex === 0}
          size="sm"
          variant="outline"
          className="px-2 h-8"
        >
          <SkipBack className="h-3 w-3" />
        </Button>
        <Button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          size="sm"
          variant="outline"
          className="px-2 h-8"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          onClick={handlePlayPause}
          size="sm"
          className="px-3 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          {isPlaying ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStepIndex === maxSteps}
          size="sm"
          variant="outline"
          className="px-2 h-8"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
        <Button
          onClick={handleLast}
          disabled={currentStepIndex === maxSteps}
          size="sm"
          variant="outline"
          className="px-2 h-8"
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>

      {/* Progression compacte */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Étape:</span>
        <span className="font-medium">
          {currentStepIndex + 1} / {maxSteps + 1}
        </span>
      </div>

      {/* Contrôle de vitesse compact */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-sm text-gray-600">Vitesse:</span>
        <Slider value={[speed]} min={0.5} max={5} step={0.5} onValueChange={handleSpeedChange} className="flex-1" />
        <span className="text-sm font-medium w-8">{speed}x</span>
      </div>

      {/* Barre de progression compacte */}
      <div className="flex-1 max-w-[200px]">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / (maxSteps + 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Bouton de réinitialisation compact */}
      <Button
        onClick={handleReset}
        variant="outline"
        size="sm"
        className="px-2 h-8 hover:bg-red-50 border-red-200 text-red-600"
      >
        <RotateCcw className="h-3 w-3" />
      </Button>
    </div>
  )
}
