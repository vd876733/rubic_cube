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
  cubeState: 'X'.repeat(54).split('').map((char, index) => {
    if (index === 4) return 'W';
    if (index === 13) return 'R';
    if (index === 22) return 'G';
    if (index === 31) return 'Y';
    if (index === 40) return 'O';
    if (index === 49) return 'B';
    return 'X';
  }).join(''),
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
      cubeState: 'X'.repeat(54).split('').map((char, index) => {
        if (index === 4) return 'W';
        if (index === 13) return 'R';
        if (index === 22) return 'G';
        if (index === 31) return 'Y';
        if (index === 40) return 'O';
        if (index === 49) return 'B';
        return 'X';
      }).join(''),
    }),
}))

export default useSolverStore
