import { useMemo, useRef, useCallback } from 'react'
import type { PointerEvent } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

interface CubieProps {
  position: [number, number, number]
  facelets: string[]
  globalIndices: number[]
  onSticker?: (globalIndex: number) => void
  isInteractive?: boolean
}

// Standard Rubik's Cube colors with increased saturation for neon effect
const FACE_COLORS: { [key: string]: string } = {
  W: '#F8F8FF', // White
  Y: '#FFD700', // Golden Yellow (more saturated)
  B: '#0052CC', // Bright Blue
  G: '#00AA00', // Vibrant Green
  R: '#DD0000', // Deep Red
  O: '#FF6600', // Vibrant Orange
}

const FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0), // right
  new THREE.Vector3(-1, 0, 0), // left
  new THREE.Vector3(0, 1, 0), // top
  new THREE.Vector3(0, -1, 0), // bottom
  new THREE.Vector3(0, 0, 1), // front
  new THREE.Vector3(0, 0, -1), // back
]

export const Cubie: React.FC<CubieProps> = ({
  position,
  facelets,
  globalIndices,
  onSticker,
  isInteractive = false,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const cubiesRef = useRef<THREE.Mesh[]>([])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(), [])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isInteractive || !groupRef.current) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, new THREE.PerspectiveCamera())
    },
    [isInteractive, raycaster, mouse]
  )

  const handlePointerClick = useCallback(
    (event: PointerEvent) => {
      if (!isInteractive || !groupRef.current) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, new THREE.PerspectiveCamera())
      const intersects = raycaster.intersectObjects(cubiesRef.current)

      if (intersects.length > 0) {
        const intersection = intersects[0]
        const localFaceIndex = cubiesRef.current.indexOf(intersection.object as THREE.Mesh)
        if (onSticker && localFaceIndex !== -1 && globalIndices[localFaceIndex] !== undefined) {
          const globalIndex = globalIndices[localFaceIndex]
          onSticker(globalIndex)
        }
      }
    },
    [isInteractive, onSticker, raycaster, mouse, globalIndices]
  )

  const faceMeshes = useMemo(() => {
    const size = 0.95
    const meshes = facelets.map((color: string, index: number) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const hexColor = FACE_COLORS[color] || '#CCCCCC'
      
      // Create material with enhanced emissive properties for neon glow effect
      const material = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 1.5, // Enhanced glow intensity for Bloom effect
        metalness: 0.3, // Slight metallic sheen
        roughness: 0.2, // Smooth surface for reflections
        toneMapped: false, // Ensure emissive colors aren't tone-mapped
        side: THREE.FrontSide,
        flatShading: true, // Crisp sticker appearance
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(FACE_NORMALS[index].multiplyScalar(0.5))
      mesh.lookAt(FACE_NORMALS[index])
      mesh.userData.originalEmissiveIntensity = 1.5 // Store for blinking effects

      return mesh
    })

    return meshes
  }, [facelets])

  return (
    <group ref={groupRef} position={position} onPointerMove={handlePointerMove} onClick={handlePointerClick}>
      {/* Black edge/frame */}
      <mesh geometry={new RoundedBoxGeometry(1, 1, 1, 4, 0.05)}>
        <meshStandardMaterial
          color="#111827"
          metalness={0.5}
          roughness={0.6}
          emissive="#000000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Facelets */}
      {faceMeshes.map((mesh: THREE.Mesh, idx: number) => (
        <primitive
          key={idx}
          object={mesh}
          ref={(el: THREE.Mesh | null) => {
            if (el) cubiesRef.current[idx] = el
          }}
        />
      ))}
    </group>
  )
}
