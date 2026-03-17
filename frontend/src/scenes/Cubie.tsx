import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface CubieFace {
  color: string
  normal: THREE.Vector3
  globalIndex: number
}

interface CubieProps {
  position: [number, number, number]
  faces: CubieFace[]
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
  faces,
  onSticker,
  isInteractive = false,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const size = 0.95

  const faceletsData = useMemo(
    () =>
      faces.map((face) => ({
        hexColor: face.color === 'X' ? '#2d2d2d' : FACE_COLORS[face.color] || '#CCCCCC',
        normal: face.normal,
        globalIndex: face.globalIndex,
        isBlank: face.color === 'X',
      })),
    [faces]
  )

  return (
    <group ref={groupRef} position={position}>
      {/* Black edge/frame */}
      <mesh geometry={new THREE.BoxGeometry(1, 1, 1)}>
        <meshStandardMaterial
          color="#111827"
          metalness={0.5}
          roughness={0.6}
          emissive="#000000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Facelets */}
      {faceletsData.map((face, idx) => (
        <mesh
          key={idx}
          position={[face.normal.x * 0.5, face.normal.y * 0.5, face.normal.z * 0.5]}
          onClick={() => isInteractive && onSticker?.(face.globalIndex)}
          onPointerOver={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onUpdate={(self) => self.lookAt(self.position.clone().add(face.normal))}
        >
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
            color={face.hexColor}
            emissive={face.hexColor}
            emissiveIntensity={face.isBlank ? 0.5 : 1.5}
            metalness={0.3}
            roughness={0.2}
            toneMapped={false}
            side={THREE.FrontSide}
            flatShading
            transparent={face.isBlank}
            opacity={face.isBlank ? 0.7 : 1}
          />
        </mesh>
      ))}
    </group>
  )
}
