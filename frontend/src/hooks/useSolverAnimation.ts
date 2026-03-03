import { useRef, useCallback, useState } from 'react'

/**
 * Step object matching the Spring Boot backend Step.java
 * Represents a single move in the Rubik's Cube solution
 */
export interface SolverStep {
  instruction: string
  move: string
  isClockwise: boolean
  faceToBlink: string
}

/**
 * Axis mapping for cube rotations
 * Maps cube notation (U, D, L, R, F, B) to Three.js axes
 */
const MOVE_TO_AXIS: { [key: string]: 'x' | 'y' | 'z' } = {
  U: 'y', // Up
  D: 'y', // Down
  L: 'x', // Left
  R: 'x', // Right
  F: 'z', // Front
  B: 'z', // Back
}

/**
 * Determines rotation angle based on move notation
 * - U, D, L, R, F, B = 90 degrees
 * - U', D', L', R', F', B' = -90 degrees (counterclockwise)
 * - U2, D2, L2, R2, F2, B2 = 180 degrees
 */
const getMoveAngle = (move: string): number => {
  if (move.endsWith("2")) {
    return Math.PI // 180 degrees
  }
  if (move.endsWith("'")) {
    return -Math.PI / 2 // -90 degrees
  }
  return Math.PI / 2 // 90 degrees
}

/**
 * Map face names to indices for blinking
 */
const FACE_TO_INDEX: { [key: string]: number } = {
  U: 0, // Up - White
  D: 1, // Down - Yellow
  F: 2, // Front - Blue
  B: 3, // Back - Green
  R: 4, // Right - Red
  L: 5, // Left - Orange
}

interface UseSolverAnimationProps {
  onStepChange?: (stepIndex: number, step: SolverStep | null) => void
}

interface UseSolverAnimationReturn {
  playSequence: (steps: SolverStep[], cubeRef: any, onStepComplete?: () => void) => Promise<void>
  isPlaying: boolean
  currentStepIndex: number
  pauseAnimation: () => void
  resumeAnimation: () => void
  cancelAnimation: () => void
}

/**
 * useSolverAnimation - Hook for animating a sequence of Rubik's Cube solver steps
 * Synchronizes cube rotations with face blinking to highlight solution moves
 * 
 * @param onStepChange - Callback when current step changes
 * @returns Object with playback control methods
 * 
 * @example
 * const { playSequence, isPlaying } = useSolverAnimation({
 *   onStepChange: (idx, step) => console.log(`Step ${idx}: ${step?.instruction}`)
 * })
 * 
 * // Execute steps from backend
 * const steps = await fetchSolution(cubeState)
 * await playSequence(steps, instructorCubeRef)
 */
export const useSolverAnimation = ({
  onStepChange,
}: UseSolverAnimationProps = {}): UseSolverAnimationReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const isPausedRef = useRef(false)
  const cancelRef = useRef(false)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Execute a single step with rotation and blink effects
   */
  const executeStep = useCallback(
    async (step: SolverStep, cubeRef: any, stepDelay: number = 1.0) => {
      if (cancelRef.current) return

      const moveKey = step.move.replace(/[2']/g, '') // Extract base move (U, D, L, R, F, B)
      const axis = MOVE_TO_AXIS[moveKey]
      const angle = getMoveAngle(step.move)

      if (!axis || !cubeRef.current) {
        throw new Error(`Invalid move: ${step.move}`)
      }

      // Highlight the face being rotated
      if (step.faceToBlink && FACE_TO_INDEX[step.faceToBlink] !== undefined) {
        const faceIndex = FACE_TO_INDEX[step.faceToBlink]
        try {
          await cubeRef.current.blinkFace(faceIndex, 0.4)
        } catch (err) {
          console.warn(`Failed to blink face ${step.faceToBlink}:`, err)
        }
      }

      // Execute the rotation
      try {
        await cubeRef.current.rotateCube(axis, angle, 0.6)
      } catch (err) {
        console.warn(`Failed to rotate cube with move ${step.move}:`, err)
      }

      // Wait before next step for visual clarity
      return new Promise<void>((resolve) => {
        animationTimeoutRef.current = setTimeout(() => {
          resolve()
        }, stepDelay * 1000)
      })
    },
    []
  )

  /**
   * Play through an entire sequence of solver steps
   */
  const playSequence = useCallback(
    async (steps: SolverStep[], cubeRef: any, onStepComplete?: () => void) => {
      if (!cubeRef.current) {
        throw new Error('Cube reference not available')
      }

      setIsPlaying(true)
      cancelRef.current = false
      isPausedRef.current = false
      setCurrentStepIndex(0)

      try {
        for (let i = 0; i < steps.length; i++) {
          if (cancelRef.current) break

          // Handle pause
          while (isPausedRef.current && !cancelRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }

          if (cancelRef.current) break

          const step = steps[i]
          setCurrentStepIndex(i)

          // Notify parent component of step change
          onStepChange?.(i, step)

          // Execute step with blink and rotation
          try {
            await executeStep(step, cubeRef, 0.5)
          } catch (err) {
            console.error(`Error executing step ${i}:`, err)
            // Continue with next step
          }
        }

        // Animation complete
        setCurrentStepIndex(steps.length)
        onStepChange?.(steps.length, null)
        onStepComplete?.()
      } finally {
        setIsPlaying(false)
      }
    },
    [executeStep, onStepChange]
  )

  /**
   * Pause the animation sequence
   */
  const pauseAnimation = useCallback(() => {
    isPausedRef.current = true
  }, [])

  /**
   * Resume the animation sequence
   */
  const resumeAnimation = useCallback(() => {
    isPausedRef.current = false
  }, [])

  /**
   * Cancel the animation sequence entirely
   */
  const cancelAnimation = useCallback(() => {
    cancelRef.current = true
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    setIsPlaying(false)
  }, [])

  return {
    playSequence,
    isPlaying,
    currentStepIndex,
    pauseAnimation,
    resumeAnimation,
    cancelAnimation,
  }
}
