import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Cubie } from './Cubie'

interface CubeSceneRef {
  rotateCube: (axis: 'x' | 'y' | 'z', angle: number, duration?: number) => Promise<void>
  blinkFace: (faceIndex: number, duration?: number) => Promise<void>
  syncCamera: (cameraPos: [number, number, number], zoom: number) => void
}

interface CubeSceneProps {
  cubeState: string
  isMirror?: boolean
  onStickerChange?: (faceIndex: number, newColor: string) => void
  onRotate?: (axis: 'x' | 'y' | 'z', angle: number, duration: number) => void
}

const CubeContent = forwardRef<CubeSceneRef, CubeSceneProps>(
  ({ cubeState, isMirror = false, onStickerChange, onRotate }, ref) => {
    const cubeGroupRef = useRef<THREE.Group>(null)
    const faceMeshesRef = useRef<THREE.Mesh[]>([])
    const controlsRef = useRef<any>(null)

    // Parse cube state into 54-character representation
    const parseCubeState = (state: string) => {
      const faces = [
        state.slice(0, 9), // White (0)
        state.slice(9, 18), // Yellow (1)
        state.slice(18, 27), // Blue (2)
        state.slice(27, 36), // Green (3)
        state.slice(36, 45), // Red (4)
        state.slice(45, 54), // Orange (5)
      ]
      return faces
    }

    // Generate cubies for 3x3x3 cube
    interface CubieData {
      position: [number, number, number]
      facelets: string[]
      isCenter: boolean
    }

    const cubies = useMemo((): CubieData[] => {
      const faceColors = parseCubeState(cubeState)
      const result: CubieData[] = []

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const facelets: string[] = []

            // Right face (x = 1)
            if (x === 1) facelets.push(faceColors[4][y + 1 + '-' as any] || 'R')
            // Left face (x = -1)
            else if (x === -1) facelets.push(faceColors[5][y + 1 + '-' as any] || 'O')
            // Top face (y = 1)
            else if (y === 1) facelets.push(faceColors[0][z + 1 + '-' as any] || 'W')
            // Bottom face (y = -1)
            else if (y === -1) facelets.push(faceColors[1][z + 1 + '-' as any] || 'Y')
            // Front face (z = 1)
            else if (z === 1) facelets.push(faceColors[2][y + 1 + '-' as any] || 'B')
            // Back face (z = -1)
            else if (z === -1) facelets.push(faceColors[3][y + 1 + '-' as any] || 'G')

            result.push({
              position: [x * 1.2, y * 1.2, z * 1.2],
              facelets,
              isCenter: Math.abs(x) + Math.abs(y) + Math.abs(z) === 2,
            })
          }
        }
      }

      return result
    }, [cubeState])

    const rotateCube = async (axis: 'x' | 'y' | 'z', angle: number, duration: number = 0.6): Promise<void> => {
      // Call the onRotate callback if provided (for syncing with other cubes)
      if (onRotate) {
        onRotate(axis, angle, duration)
      }

      return new Promise<void>((resolve) => {
        if (!cubeGroupRef.current) {
          resolve()
          return
        }

        const start = Date.now()
        const startRotation = {
          x: cubeGroupRef.current.rotation.x,
          y: cubeGroupRef.current.rotation.y,
          z: cubeGroupRef.current.rotation.z,
        }

        const animate = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / (duration * 1000), 1)

          // Easing function
          const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

          const rotation = { ...startRotation }
          rotation[axis] += angle * easeProgress

          if (cubeGroupRef.current) {
            cubeGroupRef.current.rotation[axis] = rotation[axis]
          }

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            resolve()
          }
        }

        animate()
      })
    }

    const syncCamera = (cameraPos: [number, number, number], zoom: number): void => {
      if (controlsRef.current) {
        // Sync camera position
        controlsRef.current.camera.position.set(...cameraPos)
        // Sync zoom level
        controlsRef.current.camera.zoom = zoom
        controlsRef.current.camera.updateProjectionMatrix()
        controlsRef.current.update()
      }
    }

    const blinkFace = async (faceIndex: number, duration: number = 0.5): Promise<void> => {
      return new Promise<void>((resolve) => {
        if (!faceMeshesRef.current[faceIndex]) {
          resolve()
          return
        }

        const mesh = faceMeshesRef.current[faceIndex]
        const material = mesh.material as THREE.MeshStandardMaterial

        if (!material) {
          resolve()
          return
        }

        const startIntensity = material.emissiveIntensity
        const start = Date.now()

        const animate = () => {
          const elapsed = Date.now() - start
          const halfDuration = duration / 2

          if (elapsed < halfDuration * 1000) {
            const progress = elapsed / (halfDuration * 1000)
            material.emissiveIntensity = startIntensity + (3 - startIntensity) * progress
            requestAnimationFrame(animate)
          } else if (elapsed < duration * 1000) {
            const progress = (elapsed - halfDuration * 1000) / (halfDuration * 1000)
            material.emissiveIntensity = 3 - (3 - startIntensity) * progress
            requestAnimationFrame(animate)
          } else {
            material.emissiveIntensity = startIntensity
            resolve()
          }
        }

        animate()
      })
    }

    useImperativeHandle(ref, () => ({ rotateCube, blinkFace, syncCamera }))

    return (
      <>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <OrbitControls ref={controlsRef} enableZoom={true} enablePan={false} />

        <ambientLight intensity={0.6} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#0099ff" />

        <group ref={cubeGroupRef}>
          {cubies.map((cubie: CubieData, idx: number) => (
            <Cubie
              key={idx}
              position={cubie.position}
              facelets={cubie.facelets}
              isInteractive={isMirror}
              onSticker={
                isMirror && onStickerChange
                  ? (faceIndex: number, newColor: string) => onStickerChange(faceIndex, newColor)
                  : undefined
              }
            />
          ))}
        </group>

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur={true}
            levels={6}
          />
        </EffectComposer>
      </>
    )
  }
)

CubeContent.displayName = 'CubeContent'

export const CubeScene = forwardRef<
  CubeSceneRef,
  { cubeState: string; isMirror?: boolean; onStickerChange?: (faceIndex: number, newColor: string) => void; onRotate?: (axis: 'x' | 'y' | 'z', angle: number, duration: number) => void }
>(({ cubeState, isMirror, onStickerChange, onRotate }, ref) => {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <CubeContent ref={ref} cubeState={cubeState} isMirror={isMirror} onStickerChange={onStickerChange} onRotate={onRotate} />
    </Canvas>
  )
})

CubeScene.displayName = 'CubeScene'
