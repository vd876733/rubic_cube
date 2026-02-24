import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Cubie } from './Cubie'

interface CubeSceneRef {
  rotateCube: (axis: 'x' | 'y' | 'z', angle: number, duration?: number) => Promise<void>
  blinkFace: (faceIndex: number, duration?: number) => Promise<void>
}

interface CubeSceneProps {
  cubeState: string
  isMirror?: boolean
  onStickerChange?: (faceIndex: number, newColor: string) => void
}

const CubeContent = forwardRef<CubeSceneRef, CubeSceneProps>(
  ({ cubeState, isMirror = false, onStickerChange }, ref) => {
    const cubeGroupRef = useRef<THREE.Group>(null)
    const faceMeshesRef = useRef<THREE.Mesh[]>([])
    const { camera, gl } = useThree()
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
    const cubies = React.useMemo(() => {
      const faceColors = parseCubeState(cubeState)
      const result = []

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
              position: [x * 1.2, y * 1.2, z * 1.2] as [number, number, number],
              facelets,
              isCenter: Math.abs(x) + Math.abs(y) + Math.abs(z) === 2,
            })
          }
        }
      }

      return result
    }, [cubeState])

    const rotateCube = async (axis: 'x' | 'y' | 'z', angle: number, duration: number = 0.6) => {
      return new Promise((resolve) => {
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

    const blinkFace = async (faceIndex: number, duration: number = 0.5) => {
      return new Promise((resolve) => {
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

    useImperativeHandle(ref, () => ({ rotateCube, blinkFace }))

    return (
      <>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <OrbitControls ref={controlsRef} enableZoom={true} enablePan={false} />

        <ambientLight intensity={0.6} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#0099ff" />

        <group ref={cubeGroupRef}>
          {cubies.map((cubie, idx) => (
            <Cubie
              key={idx}
              position={cubie.position}
              facelets={cubie.facelets}
              isInteractive={isMirror}
              onStickerChange={
                isMirror && onStickerChange
                  ? (faceIndex, newColor) => onStickerChange(faceIndex, newColor)
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
  { cubeState: string; isMirror?: boolean; onStickerChange?: (faceIndex: number, newColor: string) => void }
>(({ cubeState, isMirror, onStickerChange }, ref) => {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <CubeContent ref={ref} cubeState={cubeState} isMirror={isMirror} onStickerChange={onStickerChange} />
    </Canvas>
  )
})

CubeScene.displayName = 'CubeScene'
