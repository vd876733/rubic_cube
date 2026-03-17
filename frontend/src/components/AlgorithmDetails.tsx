import { FC, useCallback, useRef, useEffect } from 'react'
import gsap from 'gsap'
 
  moves: string[] 
  currentMoveIndex: number
  steps?: any[]
  cubeRefs?: React.RefObject<{ mirrorCube: any; instructorCube: any }>
  onMoveClick?: (index: number) => void 
}

/**
 * AlgorithmDetails - Displays the solution steps in a detailed format
 * Shows current step highlighting and allows navigation through the solution
 * Animates cube rotations using GSAP for smooth 90-degree turns
 */
export const AlgorithmDetails: FC<AlgorithmDetailsProps> = ({
  moves,
  currentMoveIndex,
  steps = [],
  cubeRefs,
  onMoveClick,
}: AlgorithmDetailsProps) => {
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const moveAnimationRef = useRef<Promise<void> | null>(null)

  /**
   * Animate cube rotations for a specific step
   * Uses GSAP to create smooth 90-degree rotations
   */
  const animateStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex >= steps.length || !cubeRefs?.current?.instructorCube) {
        return
      }

      const step = steps[stepIndex]
      if (!step) return

      const cube = cubeRefs.current.instructorCube
      const duration = 0.6 // 600ms for smooth rotation

      try {
        // Animate the cube rotation with GSAP for smooth motion
        await gsap.to({}, {
          duration,
          onComplete: async () => {
            // Execute the rotation after GSAP animation frame
            await cube.rotateCube(step.rotationAxis, step.rotationAmount, duration)
            // Blink the face being rotated
            cube.blinkFace(step.faceIndex, 0.5)
          },
        })

        moveAnimationRef.current = null
      } catch (error) {
        console.error('Animation error:', error)
        moveAnimationRef.current = null
      }
    },
    [steps, cubeRefs]
  )

  /**
   * Watch for currentMoveIndex changes and trigger animations
   * Automatically animates the cube when a new step becomes current
   */
  useEffect(() => {
    // Don't animate if already animating
    if (moveAnimationRef.current) {
      return
    }

    if (currentMoveIndex < steps.length) {
      const promise = animateStep(currentMoveIndex)
      moveAnimationRef.current = promise
    }
  }, [currentMoveIndex, steps, animateStep])

  /**
   * handleMoveClick - Trigger navigation when a move is clicked
   * Smoothly transitions through intermediate steps with GSAP
   */
  const handleMoveClick = useCallback(
    (index: number) => {
      if (!onMoveClick) return

      // Kill any ongoing step animation
      if (moveAnimationRef.current) {
        moveAnimationRef.current = null
      }

      // Kill timeline animation
      if (animationRef.current) {
        animationRef.current.kill()
      }

      // If moving forward, animate through steps smoothly
      if (index > currentMoveIndex) {
        animationRef.current = gsap.to(
          { step: currentMoveIndex },
          {
            step: index,
            duration: (index - currentMoveIndex) * 0.15, // Fast smooth scrolling
            ease: 'power2.inOut',
            onUpdate: function () {
              const currentStep = Math.round(this.targets()[0].step)
              if (currentStep !== currentMoveIndex && currentStep !== index) {
                onMoveClick(currentStep)
              }
            },
            onComplete: () => {
              onMoveClick(index)
            },
          }
        )
      } else {
        // Moving backward, reverse animation
        animationRef.current = gsap.to(
          { step: currentMoveIndex },
          {
            step: index,
            duration: (currentMoveIndex - index) * 0.15,
            ease: 'power2.inOut',
            onUpdate: function () {
              const currentStep = Math.round(this.targets()[0].step)
              if (currentStep !== currentMoveIndex && currentStep !== index) {
                onMoveClick(currentStep)
              }
            },
            onComplete: () => {
              onMoveClick(index)
            },
          }
        )
      }
    },
    [currentMoveIndex, onMoveClick]
  )
  if (moves.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>No solution algorithm loaded. Solve a cube to begin.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white">Solution Steps</h2>
        <p className="text-sm text-gray-400 mt-1">
          <span className="text-cyan-400">{moves.length}</span> moves total | 
          <span className="text-purple-400 ml-2">Step {currentMoveIndex + 1}</span>
        </p>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-2">
          {moves.map((move: string, index: number) => (
            <div
              key={index}
              onClick={() => handleMoveClick(index)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                index === currentMoveIndex
                  ? 'bg-purple-500/30 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900/30 border border-white/5 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-mono font-bold">
                    {move}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {/* no instruction available for simple move list */}
                  </p>
                  {/* faceToBlink not available for move-only list */}
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-mono text-sm">
                    #{index + 1}
                  </span>
                  {/* direction info not available when using simple move list */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-3 border-t border-white/10 bg-slate-900/50 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>Progress: {currentMoveIndex + 1} / {moves.length}</span>
          <span>
            {moves.length === 0
              ? 'No solution'
              : `${Math.round(((currentMoveIndex + 1) / moves.length) * 100)}%`}
          </span>
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-1 mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-full transition-all duration-300"
            style={{
              width: `${((currentMoveIndex + 1) / moves.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
