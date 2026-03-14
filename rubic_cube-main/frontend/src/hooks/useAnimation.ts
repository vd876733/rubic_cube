import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export const useCubeRotation = () => {
  const cubeRef = useRef<THREE.Group>(null)

  const rotateToPosition = useCallback(
    (axis: 'x' | 'y' | 'z', angle: number, duration = 0.6) => {
      if (!cubeRef.current) return

      const target = { [`rotation${axis.toUpperCase()}`]: angle }
      gsap.to(cubeRef.current.rotation, {
        ...target,
        duration,
        ease: 'power1.inOut',
      })
    },
    []
  )

  const rotateAnimated = useCallback(
    (axis: 'x' | 'y' | 'z', angle: number, duration = 0.6) => {
      if (!cubeRef.current) return Promise.resolve()

      return new Promise((resolve) => {
        const target = { [`rotation${axis.toUpperCase()}`]: angle }
        gsap.to(cubeRef.current!.rotation, {
          ...target,
          duration,
          ease: 'power1.inOut',
          onComplete: resolve,
        })
      })
    },
    []
  )

  return { cubeRef, rotateToPosition, rotateAnimated }
}

export const useBlinkFace = () => {
  const blinkRef = useRef<THREE.Mesh[]>([])

  const blinkFace = useCallback((faceIndex: number, duration = 0.5) => {
    if (!blinkRef.current[faceIndex]) return Promise.resolve()

    const mesh = blinkRef.current[faceIndex]
    const intensity = (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity

    return new Promise((resolve) => {
      gsap.to(
        { intensity: (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity },
        {
          intensity: 3,
          duration: duration / 2,
          onUpdate: function () {
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.emissiveIntensity = this.targets()[0].intensity
            }
          },
        }
      )

      setTimeout(() => {
        gsap.to(
          { intensity: (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity },
          {
            intensity,
            duration: duration / 2,
            onUpdate: function () {
              if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.emissiveIntensity = this.targets()[0].intensity
              }
            },
            onComplete: resolve,
          }
        )
      }, duration / 2 * 1000)
    })
  }, [])

  return { blinkRef, blinkFace }
}

export const useSynchronizedCamera = () => {
  const camera1Ref = useRef<THREE.PerspectiveCamera>(null)
  const camera2Ref = useRef<THREE.PerspectiveCamera>(null)

  useFrame(() => {
    if (camera1Ref.current && camera2Ref.current) {
      camera2Ref.current.position.copy(camera1Ref.current.position)
      camera2Ref.current.rotation.copy(camera1Ref.current.rotation)
      camera2Ref.current.quaternion.copy(camera1Ref.current.quaternion)
    }
  })

  return { camera1Ref, camera2Ref }
}
