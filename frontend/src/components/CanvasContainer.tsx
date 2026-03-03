import { useRef, useCallback } from 'react'
import { CubeScene } from '../scenes/CubeScene'

/**
 * CubeSceneHandle - Interface for imperative methods exposed by CubeScene
 * Allows parent components to control cube animations and effects
 */
interface CubeSceneHandle {
  rotateCube: (axis: 'x' | 'y' | 'z', angle: number, duration?: number) => Promise<void>
  blinkFace: (faceIndex: number, duration?: number) => Promise<void>
  syncCamera: (cameraPos: [number, number, number], zoom: number) => void
}

interface CanvasContainerProps {
  cubeState: string
  onMirrorStickerChange?: (faceIndex: number, newColor: string) => void
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  cubeState,
  onMirrorStickerChange,
}: CanvasContainerProps) => {
  const mirrorRef = useRef<CubeSceneHandle>(null)
  const instructorRef = useRef<CubeSceneHandle>(null)

  /**
   * handleMirrorRotate - Syncs instructor cube with mirror cube rotations
   * When user rotates the mirror (input) cube, the instructor (tutorial) cube follows
   */
  const handleMirrorRotate = useCallback(
    (axis: 'x' | 'y' | 'z', angle: number, duration: number) => {
      if (instructorRef.current) {
        // Fire and forget - no need to await
        instructorRef.current.rotateCube(axis, angle, duration).catch(() => {
          // Silently handle errors to prevent UI blocking
        })
      }
    },
    []
  )

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-slate-900/50">
        <h2 className="neon-text text-xl font-bold text-white">3D Cube View</h2>
        <p className="text-sm text-gray-400 mt-1">
          <span className="text-cyan-400">Left:</span> Input Cube{' '}
          <span className="text-purple-400 ml-4">Right:</span> Tutorial Cube
        </p>
      </div>

      {/* Dual Canvas Container */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Mirror Cube (Left) - Interactive Input */}
        <div className="flex-1 rounded-lg overflow-hidden bg-slate-900/30 backdrop-blur-sm border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <div className="w-full h-full">
            <CubeScene
              ref={mirrorRef}
              cubeState={cubeState}
              isMirror={true}
              onStickerChange={onMirrorStickerChange}
              onRotate={handleMirrorRotate}
            />
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-cyan-400 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/30">
            Input Cube - Interactive
          </div>
        </div>

        {/* Divider */}
        <div className="w-1 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" />

        {/* Instructor Cube (Right) - Tutorial Display */}
        <div className="flex-1 rounded-lg overflow-hidden bg-slate-900/30 backdrop-blur-sm border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <div className="w-full h-full">
            <CubeScene
              ref={instructorRef}
              cubeState={cubeState}
              isMirror={false}
            />
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-purple-400 bg-slate-900/80 px-2 py-1 rounded border border-purple-500/30">
            Tutorial Cube - AI Solution
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-6 py-3 border-t border-white/10 bg-slate-900/50 text-xs text-gray-400">
        💡 <span className="text-cyan-400">Input:</span> Click stickers to change colors |{' '}
        <span className="text-purple-400">Tutorial:</span> Watch the AI solve your cube
      </div>
    </div>
  )
}
