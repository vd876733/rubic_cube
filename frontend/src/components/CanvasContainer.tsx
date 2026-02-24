import React, { useRef, useEffect } from 'react'
import { CubeScene } from '../scenes/CubeScene'

interface CanvasContainerProps {
  cubeState: string
  onMirrorStickerChange?: (faceIndex: number, newColor: string) => void
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  cubeState,
  onMirrorStickerChange,
}) => {
  const mirrorRef = useRef<any>(null)
  const instructorRef = useRef<any>(null)

  // Sync instructor cube with mirror cube rotations
  const syncCubes = async (axis: any, angle: any, duration: any) => {
    if (instructorRef.current) {
      await instructorRef.current.rotateCube(axis, angle, duration)
    }
  }

  return (
    <div className="glass-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
        <h2 className="neon-text text-xl font-bold">3D Cube View</h2>
        <p className="text-sm text-gray-400 mt-1">
          <span className="text-neon-cyan">Left:</span> Input Cube{' '}
          <span className="text-neon-purple ml-4">Right:</span> Tutorial Cube
        </p>
      </div>

      {/* Dual Canvas Container */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Mirror Cube (Left) */}
        <div className="flex-1 border border-neon-cyan/30 rounded-lg overflow-hidden bg-black/30">
          <div className="w-full h-full">
            <CubeScene
              ref={mirrorRef}
              cubeState={cubeState}
              isMirror={true}
              onStickerChange={onMirrorStickerChange}
            />
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-neon-cyan bg-black/50 px-2 py-1 rounded">
            Input Cube
          </div>
        </div>

        {/* Divider */}
        <div className="w-1 bg-gradient-to-b from-transparent via-neon-purple to-transparent rounded-full" />

        {/* Instructor Cube (Right) */}
        <div className="flex-1 border border-neon-purple/30 rounded-lg overflow-hidden bg-black/30">
          <div className="w-full h-full">
            <CubeScene
              ref={instructorRef}
              cubeState={cubeState}
              isMirror={false}
            />
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-neon-purple bg-black/50 px-2 py-1 rounded">
            Tutorial Cube
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-6 py-3 border-t border-white/10 bg-black/50 text-xs text-gray-400">
        💡 <span className="text-neon-cyan">Input Cube:</span> Click stickers to change colors |{' '}
        <span className="text-neon-purple">Tutorial Cube:</span> Showcases solution moves
      </div>
    </div>
  )
}
