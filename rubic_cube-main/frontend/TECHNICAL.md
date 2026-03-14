# Technical Documentation

## Dual-Canvas 3D Cube Implementation

### Overview
The dashboard features two synchronized 3D cube canvases rendered side-by-side using React Three Fiber and Three.js. This provides an intuitive interface for visualizing both the input state and the solution steps.

### Architecture

#### Mirror Cube (Left)
- **Purpose**: User input/configuration of cube state
- **Interactivity**: Click on individual stickers to change colors
- **Behavior**: Rotations mirrored in real-time to instructor cube
- **State**: Manages `cubeState` from Zustand store

#### Instructor Cube (Right)
- **Purpose**: Displays solution moves with animations
- **Interactivity**: Read-only (shows solution playback only)
- **Behavior**: Automatically executes rotation/blink animations
- **State**: Synchronized with mirror cube, updated by playback engine

### Synchronized Camera Control

The camera synchronization ensures both cubes appear to rotate together when the user interacts with one:

```tsx
// From useAnimation.ts
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
```

#### How It Works:
1. **OrbitControls** on mirror cube provides user input
2. Camera position/rotation copied to instructor cube each frame via `useFrame`
3. Both cubes maintain identical camera perspective despite independent Canvas elements

### Raycasting for Sticker Selection

The mirror cube implements raycasting to detect clicks on individual stickers:

```tsx
// From Cubie.tsx
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
        // Cycle through colors
        const currentColor = facelets[faceIndex]
        const colors = Object.keys(FACE_COLORS)
        const nextIndex = (colors.indexOf(currentColor) + 1) % colors.length
        onSticker(faceIndex, colors[nextIndex])
      }
    }
  },
  [isInteractive, facelets, onSticker, raycaster, mouse]
)
```

#### Process:
1. Normalize mouse coordinates to NDC (Normalized Device Coordinates)
2. Create raycaster from camera through mouse position
3. Check intersections with mesh faces
4. Trigger color change callback on intersection

### Cube State Representation

The cube is stored as a 54-character string mapping to individual stickers:

```
Position Index:
       W0 W1 W2         (White/Top face)
       W3 W4 W5
       W6 W7 W8
       
Y9  Y10 Y11  (Yellow/Bottom)
Y12 Y13 Y14
Y15 Y16 Y17

B18 B19 B20  (Blue/Front)
B21 B22 B23
B24 B25 B26

G27 G28 G29  (Green/Back)
G30 G31 G32
G33 G34 G35

R36 R37 R38  (Red/Right)
R39 R40 R41
R42 R43 R44

O45 O46 O47  (Orange/Left)
O48 O49 O50
O51 O52 O53
```

### 3D Geometry

Each cubie (small cube in a Rubik's cube) is composed of:

1. **Base Geometry**: `RoundedBoxGeometry(1, 1, 1, 4, 0.05)`
   - Rounded edges for realistic appearance
   - Black matte color (#111827) for edge definition

2. **Facelets**: Six `PlaneGeometry` faces positioned on each side
   - Size: 0.95 × 0.95 units (slightly smaller than base)
   - Material: `MeshStandardMaterial` with emissive properties
   - Colors mapped from cube state string

3. **Material Properties**:
```tsx
new THREE.MeshStandardMaterial({
  color: FACE_COLORS[color],
  emissive: FACE_COLORS[color],
  emissiveIntensity: 1.5,
  metalness: 0.3,
  roughness: 0.4,
})
```

### Animation System

#### Rotation Animation
Uses GSAP for smooth, eased rotations:

```tsx
const rotateCube = async (axis: 'x' | 'y' | 'z', angle: number, duration: number = 0.6) => {
  return new Promise((resolve) => {
    if (!cubeGroupRef.current) {
      resolve()
      return
    }

    const start = Date.now()
    const startRotation = { ...cubeGroupRef.current.rotation }

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      // In-out easing function
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress

      // Apply rotation
      cubeGroupRef.current!.rotation[axis] = startRotation[axis] + angle * easeProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }

    animate()
  })
}
```

#### Face Blink Animation
Pulses the emissive intensity of a specific face:

```tsx
const blinkFace = async (faceIndex: number, duration: number = 0.5) => {
  // Animates intensity from current → 3 → current
  // Total duration split evenly between ramp-up and ramp-down
}
```

### Lighting Setup

The scene uses a multi-light configuration for optimal neon aesthetic:

```tsx
<ambientLight intensity={0.6} color="#ffffff" />      // Base white light
<pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />    // Main light
<pointLight position={[-10, -10, 10]} intensity={0.5} color="#0099ff" /> // Blue accent
```

### Post-Processing: Bloom Effect

The `Bloom` effect creates the neon glow:

```tsx
<EffectComposer>
  <Bloom
    intensity={1.5}           // How strong the glow
    luminanceThreshold={0.2}  // Min brightness to glow
    luminanceSmoothing={0.9}  // Smoothness of glow
    mipmapBlur={true}         // High-quality blurring
    levels={6}                // Number of blur levels
  />
</EffectComposer>
```

### Backend Integration Flow

```
User clicks "Solve" button
    ↓
API sends cubeState to POST /api/solve
    ↓
Backend returns array of Steps
    ↓
Frontend stores steps in Zustand store
    ↓
Playback engine iterates through steps every 1.5s
    ↓
For each step:
  1. Update progress timeline
  2. Highlight algorithm move
  3. Execute rotateCube animation
  4. Execute blinkFace animation
    ↓
User can pause/resume at any point
```

### Performance Optimizations

1. **Memoization**: Cubie positions/facelets computed once with `useMemo`
2. **Ref Management**: Direct DOM access via refs to avoid re-renders
3. **Animation Timing**: RequestAnimationFrame for smooth 60fps animations
4. **Canvas Performance**: High-performance WebGL context settings
5. **Lazy Rendering**: Bloom effect only renders visible faces

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires WebGL enabled)
- Mobile: Limited support (better on iPad/tablet)

### Debugging

Enable debug mode in `.env.local`:
```
VITE_ENABLE_DEBUG=true
```

## State Management Details

### Zustand Store Structure

```tsx
interface SolverStore {
  cubeState: string          // 54-char cube representation
  steps: Step[]              // Array of solver steps
  currentStepIndex: number   // 0-based index of active step
  isPlaying: boolean         // Playback state
  
  // Actions
  setCubeState: (state: string) => void
  setSteps: (steps: Step[]) => void
  setCurrentStepIndex: (index: number) => void
  setIsPlaying: (playing: boolean) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
}
```

### Default State

```tsx
cubeState: 'WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO'
// Solved cube: all white on top, yellow on bottom, etc.
```

## API Response Structure

```tsx
interface SolveResponse {
  steps: [{
    move: string              // e.g., "R", "U'", "M2"
    rotationAxis: 'x' | 'y' | 'z'
    rotationAmount: number    // Radians or degrees
    faceIndex: number         // Which face to blink (0-5)
  }],
  solveTime: number          // Milliseconds
}
```

## File Organization Best Practices

- **src/components/**: Presentational UI components (no 3D)
- **src/scenes/**: React Three Fiber scene components
- **src/hooks/**: Custom React hooks AND animation utilities
- **src/store/**: Zustand store and state types
- **src/utils/**: Pure utility functions and API calls

This separation ensures clear responsibilities and easier testing/maintenance.
