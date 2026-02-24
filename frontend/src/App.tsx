import React, { useRef, useCallback, useState, useEffect } from 'react'
import useSolverStore from './store/solverStore'
import { cubeAPI } from './utils/api'
import { ProgressTimeline } from './components/ProgressTimeline'
import { CanvasContainer } from './components/CanvasContainer'
import { AlgorithmDetails } from './components/AlgorithmDetails'
import { ControlPanel } from './components/ControlPanel'

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [moves, setMoves] = useState<string[]>([])

  const {
    cubeState,
    steps,
    currentStepIndex,
    isPlaying,
    setCubeState,
    setSteps,
    setCurrentStepIndex,
    setIsPlaying,
    nextStep,
    previousStep,
    reset,
  } = useSolverStore()

  const instructorCubeRef = useRef<any>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handle solving the cube
  const handleSolve = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await cubeAPI.solveCube(cubeState)
      
      // Extract moves from steps
      const extractedMoves = response.steps.map((step: any) => step.move)
      setMoves(extractedMoves)
      
      setSteps(response.steps)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    } catch (error) {
      console.error('Failed to solve cube:', error)
      alert('Error solving cube. Please check the backend.')
    } finally {
      setIsLoading(false)
    }
  }, [cubeState, setSteps, setCurrentStepIndex, setIsPlaying])

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1
          } else {
            setIsPlaying(false)
            return prev
          }
        })
      }, 1500) // 1.5 seconds per move
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [isPlaying, steps.length, setCurrentStepIndex, setIsPlaying])

  // Execute instructor cube animations when current step changes
  useEffect(() => {
    if (currentStepIndex < steps.length && instructorCubeRef.current) {
      const step = steps[currentStepIndex]
      
      // Animate the cube rotation
      instructorCubeRef.current.rotateCube(
        step.rotationAxis,
        step.rotationAmount,
        0.6
      )

      // Blink the face being rotated
      instructorCubeRef.current.blinkFace(step.faceIndex, 0.5)
    }
  }, [currentStepIndex, steps])

  const handleMirrorStickerChange = useCallback(
    (faceIndex: number, newColor: string) => {
      const newState = cubeState.split('')
      newState[faceIndex] = newColor
      setCubeState(newState.join(''))
    },
    [cubeState, setCubeState]
  )

  // Generate progress steps labels
  const progressSteps = moves.map((move, idx) => `${idx + 1}. ${move}`)

  return (
    <div className="w-full h-screen bg-dark-bg overflow-hidden">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-[300px_1fr_300px] gap-4 p-4 h-full">
        {/* Left Panel - Progress Timeline */}
        <div className="overflow-hidden">
          <ProgressTimeline
            steps={progressSteps}
            currentStep={currentStepIndex}
            onStepClick={setCurrentStepIndex}
          />
        </div>

        {/* Center Panel - Dual 3D Canvases + Control */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Canvas Container */}
          <CanvasContainer
            cubeState={cubeState}
            onMirrorStickerChange={handleMirrorStickerChange}
          />

          {/* Control Panel (Bottom) */}
          <div className="h-64 overflow-y-auto">
            <ControlPanel
              isLoading={isLoading}
              isPlaying={isPlaying}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              onSolve={handleSolve}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onReset={reset}
              onNext={nextStep}
              onPrevious={previousStep}
            />
          </div>
        </div>

        {/* Right Panel - Algorithm Details */}
        <div className="overflow-hidden">
          <AlgorithmDetails
            moves={moves}
            currentMoveIndex={currentStepIndex}
            onMoveClick={setCurrentStepIndex}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel p-8 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-lg font-semibold text-neon-cyan">Solving your cube...</p>
            <p className="text-sm text-gray-400">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  )
}
