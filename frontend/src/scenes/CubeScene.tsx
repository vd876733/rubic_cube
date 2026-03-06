import { useRef, forwardRef, useImperativeHandle, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { Cubie } from './Cubie'

interface CubeSceneRef {
  rotateCube: (axis: 'x' | 'y' | 'z', angle: number, duration?: number) => Promise<void>
  blinkFace: (faceIndex: number, duration?: number) => Promise<void>
  syncCamera: (cameraPos: [number, number, number], zoom: number) => void
}

interface CubeSceneProps {
  cubeState: string
  isMirror?: boolean
  onStickerChange?: (faceIndex: number) => void
  onRotate?: (axis: 'x' | 'y' | 'z', angle: number, duration: number) => void
  onCameraSync?: (cameraPos: [number, number, number], zoom: number) => void
}

const CubeContent = forwardRef<CubeSceneRef, CubeSceneProps>(
  ({ cubeState, isMirror = false, onStickerChange, onRotate, onCameraSync }, ref) => {
    const cubeGroupRef = useRef<THREE.Group>(null)
    const faceMeshesRef = useRef<THREE.Mesh[]>([])
    const controlsRef = useRef<any>(null)
    const lastCameraStateRef = useRef<{ pos: [number, number, number]; zoom: number } | null>(null)

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

            // Right face (x = 1) - Red
            if (x === 1) {
              const row = (1 - y)
              const col = (z + 1)
              const idx = row * 3 + col
              facelets.push(faceColors[4][idx] || 'R')
            }
            // Left face (x = -1) - Orange
            else if (x === -1) {
              const row = (1 - y)
              const col = (1 - z)
              const idx = row * 3 + col
              facelets.push(faceColors[5][idx] || 'O')
            }
            // Top face (y = 1) - White
            if (y === 1) {
              const row = (1 - z)
              const col = (x + 1)
              const idx = row * 3 + col
              facelets.push(faceColors[0][idx] || 'W')
            }
            // Bottom face (y = -1) - Yellow
            if (y === -1) {
              const row = z + 1
              const col = (x + 1)
              const idx = row * 3 + col
              facelets.push(faceColors[1][idx] || 'Y')
            }
            // Front face (z = 1) - Blue
            if (z === 1) {
              const row = (1 - y)
              const col = (x + 1)
              const idx = row * 3 + col
              facelets.push(faceColors[2][idx] || 'B')
            }
            // Back face (z = -1) - Green
            if (z === -1) {
              const row = (1 - y)
              const col = (1 - x)
              const idx = row * 3 + col
              facelets.push(faceColors[3][idx] || 'G')
            }

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

        const startRotation = {
          x: cubeGroupRef.current.rotation.x,
          y: cubeGroupRef.current.rotation.y,
          z: cubeGroupRef.current.rotation.z,
        }

        const targetRotation = { ...startRotation }
        targetRotation[axis] += angle

        gsap.to(cubeGroupRef.current.rotation, {
          [axis]: targetRotation[axis],
          duration: duration,
          ease: "power2.inOut",
          onComplete: resolve,
        })
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

        gsap.timeline()
          .to(material, {
            emissiveIntensity: startIntensity + 2,
            duration: duration / 2,
            ease: "power2.in",
          })
          .to(material, {
            emissiveIntensity: startIntensity,
            duration: duration / 2,
            ease: "power2.out",
            onComplete: resolve,
          })
      })
    }

    useImperativeHandle(ref, () => ({ rotateCube, blinkFace, syncCamera }))

    // Setup camera sync listener
    useEffect(() => {
      if (!isMirror || !onCameraSync || !controlsRef.current) {
        return
      }

      const controls = controlsRef.current
      const handleChange = () => {
        const cam = controls.camera
        const cameraPos: [number, number, number] = [cam.position.x, cam.position.y, cam.position.z]
        const zoom = cam.zoom

        // Only trigger callback if camera state actually changed
        if (
          !lastCameraStateRef.current ||
          lastCameraStateRef.current.pos[0] !== cameraPos[0] ||
          lastCameraStateRef.current.pos[1] !== cameraPos[1] ||
          lastCameraStateRef.current.pos[2] !== cameraPos[2] ||
          lastCameraStateRef.current.zoom !== zoom
        ) {
          lastCameraStateRef.current = { pos: cameraPos, zoom }
          onCameraSync(cameraPos, zoom)
        }
      }

      controls.addEventListener('change', handleChange)
      return () => controls.removeEventListener('change', handleChange)
    }, [isMirror, onCameraSync])

    return (
      <>
        <PerspectiveCamera makeDefault position={[3, 3, 3]} fov={50} />
        <OrbitControls ref={controlsRef} enableZoom={true} enablePan={false} />

        {/* Professional lighting setup for color visibility and neon glow */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, 10]} intensity={0.8} color="#0099ff" />
        <pointLight position={[0, 10, 0]} intensity={0.6} color="#ff0099" />

        <group ref={cubeGroupRef}>
          {cubies.map((cubie: CubieData, idx: number) => (
            <Cubie
              key={idx}
              position={cubie.position}
              facelets={cubie.facelets}
              isInteractive={isMirror}
              onSticker={
                isMirror && onStickerChange
                  ? (faceIndex: number) => onStickerChange(faceIndex)
                  : undefined
              }
            />
          ))}
        </group>

        <EffectComposer>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.1}
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
  { cubeState: string; isMirror?: boolean; onStickerChange?: (faceIndex: number) => void; onRotate?: (axis: 'x' | 'y' | 'z', angle: number, duration: number) => void; onCameraSync?: (cameraPos: [number, number, number], zoom: number) => void }
>(({ cubeState, isMirror, onStickerChange, onRotate, onCameraSync }, ref) => {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <CubeContent ref={ref} cubeState={cubeState} isMirror={isMirror} onStickerChange={onStickerChange} onRotate={onRotate} onCameraSync={onCameraSync} />
    </Canvas>
  )
})

CubeScene.displayName = 'CubeScene'
