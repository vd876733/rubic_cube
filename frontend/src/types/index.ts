// Global type definitions for the application

export interface Cubie {
  position: [number, number, number]
  facelets: string[]
  isCenter: boolean
}

export interface SolverStep {
  move: string
  rotationAxis: 'x' | 'y' | 'z'
  rotationAmount: number
  faceIndex: number
  timestamp?: number
}

export interface SolveRequest {
  cubeState: string
}

export interface SolveResponse {
  steps: SolverStep[]
  solveTime: number
}

export interface ValidationRequest {
  cubeState: string
}

export interface ValidationResponse {
  valid: boolean
  error?: string
}

export type FaceColor = 'W' | 'Y' | 'B' | 'G' | 'R' | 'O'

export const CUBE_FACES = {
  WHITE: 0,
  YELLOW: 1,
  BLUE: 2,
  GREEN: 3,
  RED: 4,
  ORANGE: 5,
} as const

export const FACE_COLORS: Record<FaceColor, string> = {
  W: '#FFFFFF', // White
  Y: '#FFFF00', // Yellow
  B: '#0000FF', // Blue
  G: '#00DD00', // Green
  R: '#FF0000', // Red
  O: '#FFA500', // Orange
}

export const MOVE_NOTATIONS = {
  // Face moves
  R: 'Right face clockwise',
  L: 'Left face clockwise',
  U: 'Up face clockwise',
  D: 'Down face clockwise',
  F: 'Front face clockwise',
  B: 'Back face clockwise',
  // Middle layer moves
  M: 'Middle layer clockwise (from R perspective)',
  E: 'Equatorial layer clockwise (from U perspective)',
  S: 'Standing layer clockwise (from F perspective)',
  // Wide turns
  Rw: 'Right two layers clockwise',
  Lw: 'Left two layers clockwise',
  Uw: 'Up two layers clockwise',
  Dw: 'Down two layers clockwise',
  Fw: 'Front two layers clockwise',
  Bw: 'Back two layers clockwise',
  // Rotations
  x: 'Rotate entire cube clockwise (from R perspective)',
  y: 'Rotate entire cube clockwise (from U perspective)',
  z: 'Rotate entire cube clockwise (from F perspective)',
} as const

export interface AnimationState {
  isRotating: boolean
  isBinking: boolean
  currentMove?: string
  progress: number // 0 to 1
}

export interface CameraSync {
  position: [number, number, number]
  rotation: [number, number, number]
  fov: number
}
