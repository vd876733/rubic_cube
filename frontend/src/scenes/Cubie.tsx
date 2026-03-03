import { useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

interface CubieProps {
  position: [number, number, number]
  facelets: string[]
  onSticker?: (faceIndex: number, newColor: string) => void
  isInteractive?: boolean
}

const FACE_COLORS: { [key: string]: string } = {
  W: '#FFFFFF', // White
  Y: '#FFFF00', // Yellow
  B: '#0000FF', // Blue
  G: '#00DD00', // Green
  R: '#FF0000', // Red
  O: '#FFA500', // Orange
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
  onSticker,
  isInteractive = false,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const cubiesRef = useRef<THREE.Mesh[]>([])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(), [])

  const handlePointerMove = useCallback(
    (event: any) => {
      if (!isInteractive || !groupRef.current) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, new THREE.PerspectiveCamera())
    },
    [isInteractive, raycaster, mouse]
  )

  const handlePointerClick = useCallback(
    (event: any) => {
      if (!isInteractive || !groupRef.current) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, new THREE.PerspectiveCamera())
      const intersects = raycaster.intersectObjects(cubiesRef.current)

      if (intersects.length > 0) {
        const intersection = intersects[0]
        const faceIndex = cubiesRef.current.indexOf(intersection.object as THREE.Mesh)
        if (onSticker && faceIndex !== -1) {
          const currentColor = facelets[faceIndex]
          const colors = Object.keys(FACE_COLORS)
          const nextIndex = (colors.indexOf(currentColor) + 1) % colors.length
          onSticker(faceIndex, colors[nextIndex])
        }
      }
    },
    [isInteractive, facelets, onSticker, raycaster, mouse]
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
        emissiveIntensity: 1.2, // Glow intensity for Bloom effect
        metalness: 0.2, // Slight metallic sheen
        roughness: 0.3, // Smooth surface for reflections
        side: THREE.FrontSide,
        flatShading: true, // Crisp sticker appearance
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(FACE_NORMALS[index].multiplyScalar(0.5))
      mesh.lookAt(FACE_NORMALS[index])
      mesh.userData.originalEmissiveIntensity = 1.2 // Store for blinking effects

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
        <primitive key={idx} object={mesh} ref={(el: any) => (cubiesRef.current[idx] = el)} />
      ))}
    </group>
  )
}
