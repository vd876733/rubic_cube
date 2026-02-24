import React, { useMemo, useRef, useCallback } from 'react'
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
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isInteractive || !groupRef.current) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, new THREE.PerspectiveCamera())
    },
    [isInteractive, raycaster, mouse]
  )

  const handlePointerClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
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
    const meshes = facelets.map((color, index) => {
      const geometry = new THREE.PlaneGeometry(size, size)
      const material = new THREE.MeshStandardMaterial({
        color: FACE_COLORS[color] || '#CCCCCC',
        emissive: FACE_COLORS[color] || '#CCCCCC',
        emissiveIntensity: 1.5,
        metalness: 0.3,
        roughness: 0.4,
        side: THREE.FrontSide,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(FACE_NORMALS[index].multiplyScalar(0.5))
      mesh.lookAt(FACE_NORMALS[index])

      return mesh
    })

    return meshes
  }, [facelets])

  return (
    <group ref={groupRef} position={position} onPointerMove={handlePointerMove} onPointerClick={handlePointerClick}>
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
      {faceMeshes.map((mesh, idx) => (
        <primitive key={idx} object={mesh} ref={(el) => (cubiesRef.current[idx] = el)} />
      ))}
    </group>
  )
}
