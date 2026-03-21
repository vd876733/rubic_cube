import { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { CubeScene } from '../scenes/CubeScene'
import { VerticalPalette } from './VerticalPalette'  // slim vertical color dock
  
/**
 * CubeSceneHandle - Interface for imperative methods exposed by CubeScene
 * Allows parent components to control cube animations and effect 
 */
interface CubeSceneHandle {
  rotateCube: (axis: 'x' | 'y' | 'z', angle: number, duration?: number) => Promise<void>
  blinkFace: (faceIndex: number, duration?: number) => Promise<void>
  syncCamera: (cameraPos: [number, number, number], zoom: number) => void
}

interface CanvasContainerHandle {
  mirrorCube: CubeSceneHandle | null
  instructorCube: CubeSceneHandle | null
}

interface CanvasContainerProps {
  cubeState: string
  onMirrorStickerChange?: (faceIndex: number, newColor: string) => void
}

// Center sticker indices that should not be editable
const CENTER_STICKER_INDICES = new Set([4, 13, 22, 31, 40, 49])

export const CanvasContainer = forwardRef<CanvasContainerHandle, CanvasContainerProps>(
  ({ cubeState, onMirrorStickerChange }, ref) => {
    const mirrorRef = useRef<CubeSceneHandle>(null)
    const instructorRef = useRef<CubeSceneHandle>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const cameraStateRef = useRef<{ pos: [number, number, number]; zoom: number } | null>(null)
    const paletteRef = useRef<{ useCharge: (colorChar: string) => void } | null>(null)

    // Expose refs to parent components
    useImperativeHandle(ref, () => ({
      mirrorCube: mirrorRef.current,
      instructorCube: instructorRef.current,
    }), [])

    /**
     * handleMirrorRotate - Syncs instructor cube with mirror cube rotations
     * When user rotates the mirror (input) cube, the instructor (tutorial) cube follows
     */
    const handleMirrorRotate = useCallback(
      (axis: 'x' | 'y' | 'z', angle: number, duration: number) => {
        if (instructorRef.current) {
          instructorRef.current.rotateCube(axis, angle, duration).catch(() => {
            // Silently handle errors to prevent UI blocking
          })
        }
      },
      []
    )

    /**
     * handleStickerClick - Handle sticker color changes with validation
     * - Prevents editing center stickers
     * - Requires a color to be selected from the palette
     * - Updates both cubes instantly
     * - Deducts a charge from the selected color
     */
    const handleStickerClick = useCallback(
      (faceIndex: number) => {
        // Prevent editing center stickers
        if (CENTER_STICKER_INDICES.has(faceIndex)) {
          return
        }

        // Only apply change if a color is selected from palette
        if (selectedColor && onMirrorStickerChange) {
          onMirrorStickerChange(faceIndex, selectedColor)

          // Deduct charge from palette
          if (paletteRef.current?.useCharge) {
            paletteRef.current.useCharge(selectedColor)
          }
        }
      },
      [selectedColor, onMirrorStickerChange]
    )

    /**
     * handleCameraSync - Syncs the instructor cube camera with the mirror cube
     * Uses useRef for efficient camera state tracking
     * Only updates if camera position or zoom has actually changed
     */
    const handleCameraSync = useCallback(
      (cameraPos: [number, number, number], zoom: number) => {
        if (!instructorRef.current) return

        // Check if camera state has changed
        const hasChanged =
          !cameraStateRef.current ||
          cameraStateRef.current.pos[0] !== cameraPos[0] ||
          cameraStateRef.current.pos[1] !== cameraPos[1] ||
          cameraStateRef.current.pos[2] !== cameraPos[2] ||
          cameraStateRef.current.zoom !== zoom

        if (hasChanged) {
          cameraStateRef.current = { pos: cameraPos, zoom }
          instructorRef.current.syncCamera(cameraPos, zoom)
        }
      },
      []
    )

    return (
      <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#020617' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-slate-900/50">
          <h2 className="neon-text text-xl font-bold text-white">3D Cube View</h2>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-cyan-400">Left:</span> Mirror Cube{' '}
            <span className="text-purple-400 ml-4">Right:</span> Instructor Cube
          </p>
        </div>

        {/* Dual Canvas Container */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Vertical Palette - Left of Mirror Cube */}
          <div className="flex flex-col justify-center">
            <VerticalPalette ref={paletteRef} selectedColor={selectedColor} onColorSelect={setSelectedColor} />
          </div>

          {/* Mirror Cube (Left) - Interactive Input */}
          <div className="flex-1 rounded-lg overflow-hidden bg-slate-900/30 backdrop-blur-sm border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] relative">
            <div className="w-full h-full">
              <CubeScene
                ref={mirrorRef}
                cubeState={cubeState}
                isMirror={true}
                onStickerChange={handleStickerClick}
                onRotate={handleMirrorRotate}
                onCameraSync={handleCameraSync}
              />
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-cyan-400 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/30">
              Mirror Cube - Interactive
            </div>
          </div>

          {/* Divider */}
          <div className="w-1 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" />

          {/* Instructor Cube (Right) - Tutorial Display */}
          <div className="flex-1 rounded-lg overflow-hidden bg-slate-900/30 backdrop-blur-sm border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative">
            <div className="w-full h-full">
              <CubeScene
                ref={instructorRef}
                cubeState={cubeState}
                isMirror={false}
              />
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-purple-400 bg-slate-900/80 px-2 py-1 rounded border border-purple-500/30">
              Instructor Cube - AI Solution
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/50 text-xs text-gray-400">
          💡 <span className="text-cyan-400">Input:</span> Select color then click stickers |{' '}
          <span className="text-purple-400">Tutorial:</span> Watch the AI solve your cube | 
          <span className="text-yellow-400 ml-2">Center stickers locked</span>
        </div>
      </div>
    )
  }
)

CanvasContainer.displayName = 'CanvasContainer'
