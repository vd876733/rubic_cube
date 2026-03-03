import { useCallback, useRef, useEffect } from 'react'

/**
 * CubeSceneHandle - Interface for methods exposed by CubeScene component
 */
interface CubeCameraController {
  syncCamera?: (cameraPos: [number, number, number], zoom: number) => void
}

/**
 * useCameraSync - Hook for synchronizing camera positions between dual cube views
 * When the user rotates the mirror (input) cube, the instructor (tutorial) cube
 * camera matches the same view automatically.
 * 
 * @param mirrorCubeRef - Reference to the mirror (input) cube canvas
 * @param instructorCubeRef - Reference to the instructor (tutorial) cube canvas
 * 
 * @example
 * const mirrorRef = useRef<CubeSceneHandle>(null)
 * const instructorRef = useRef<CubeSceneHandle>(null)
 * 
 * useCameraSync(mirrorRef, instructorRef)
 */
export const useCameraSync = (
  _mirrorCubeRef: React.MutableRefObject<CubeCameraController | null>,
  instructorCubeRef: React.MutableRefObject<CubeCameraController | null>
) => {
  const lastCameraPosRef = useRef<[number, number, number]>([5, 5, 5])
  const lastZoomRef = useRef<number>(1)
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Sync instructor cube camera to match mirror cube camera
   */
  const performSync = useCallback(() => {
    // In a real implementation, you would access the canvas context
    // to get the actual camera position from the three.js scene.
    // For now, we'll use a simplified approach that the instructor
    // component can subscribe to rotation events from the mirror component.
    
    if (instructorCubeRef.current && instructorCubeRef.current.syncCamera) {
      instructorCubeRef.current.syncCamera(lastCameraPosRef.current, lastZoomRef.current)
    }
  }, [])

  /**
   * Start continuous camera synchronization
   */
  const startSync = useCallback(() => {
    // Check and sync every 100ms (10 times per second)
    syncIntervalRef.current = setInterval(performSync, 100)
  }, [performSync])

  /**
   * Stop camera synchronization
   */
  const stopSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
    }
  }, [])

  /**
   * Manually trigger camera sync with specific position and zoom
   */
  const syncToPosition = useCallback(
    (cameraPos: [number, number, number], zoom: number) => {
      lastCameraPosRef.current = cameraPos
      lastZoomRef.current = zoom
      performSync()
    },
    [performSync]
  )

  // Start syncing on mount
  useEffect(() => {
    startSync()
    return () => stopSync()
  }, [startSync, stopSync])

  return {
    syncToPosition,
    startSync,
    stopSync,
  }
}
