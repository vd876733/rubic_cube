import axios, { AxiosInstance } from 'axios'

interface SolveRequest {
  cubeState: string
}

export interface StepResponse {
  move: string
  rotationAxis: 'x' | 'y' | 'z'
  rotationAmount: number
  faceIndex: number
}

interface SolveResponse {
  steps: StepResponse[]
  solveTime: number
}

class CubeAPI {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async solveCube(cubeState: string): Promise<SolveResponse> {
    try {
      const response = await this.api.post<SolveResponse>('/solve', {
        cubeState,
      } as SolveRequest)
      return response.data
    } catch (error) {
      console.error('Error solving cube:', error)
      throw error
    }
  }

  async validateCube(cubeState: string): Promise<boolean> {
    try {
      const response = await this.api.post<{ valid: boolean }>(
        '/validate',
        { cubeState }
      )
      return response.data.valid
    } catch (error) {
      console.error('Error validating cube:', error)
      return false
    }
  }
}

export const cubeAPI = new CubeAPI()
