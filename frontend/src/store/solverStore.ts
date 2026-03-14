import { create } from 'zustand'

export interface Step {
  move: string
  rotationAxis: 'x' | 'y' | 'z'
  rotationAmount: number
  faceIndex: number
}

interface SolverStore {
  cubeState: string
  steps: Step[]
  currentStepIndex: number
  isPlaying: boolean
  
  setCubeState: (state: string) => void
  setSteps: (steps: Step[]) => void
  setCurrentStepIndex: (index: number) => void
  setIsPlaying: (playing: boolean) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
}

export const useSolverStore = create<SolverStore>((set) => ({
  cubeState: 'WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO',
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,

  setCubeState: (state) => set({ cubeState: state }),
  setSteps: (steps) => set({ steps }),
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  nextStep: () =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1),
    })),
  
  previousStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
    })),
  
  reset: () =>
    set({
      currentStepIndex: 0,
      isPlaying: false,
      cubeState: 'WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO',
    }),
}))

export default useSolverStore
