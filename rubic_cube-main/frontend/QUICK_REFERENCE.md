# Quick Reference - Neural Solver Frontend

## Installation

```bash
# Clean install (if needed)
cd frontend
rm -rf node_modules package-lock.json

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

## Using the Dual Cube System

### 1. Display the Cube View
```tsx
import { CanvasContainer } from './components/CanvasContainer'

export const Dashboard = () => {
  const [cubeState, setCubeState] = useState('WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOO')
  const [selectedFace, setSelectedFace] = useState<number | null>(null)

  return (
    <CanvasContainer
      cubeState={cubeState}
      onMirrorStickerChange={(faceIndex, newColor) => {
        console.log(`Face ${faceIndex} changed to ${newColor}`)
        // Update your cube state
      }}
    />
  )
}
```

### 2. Execute Solver Steps
```tsx
import { useSolverAnimation, type SolverStep } from '../hooks/useSolverAnimation'

export const SolverView = () => {
  const instructorRef = useRef<CubeSceneHandle>(null)
  
  const { playSequence, isPlaying, currentStepIndex } = useSolverAnimation({
    onStepChange: (stepIndex, step) => {
      if (step) {
        console.log(`Step ${stepIndex}: ${step.instruction}`)
        // Highlight in UI
      }
    }
  })

  const handleSolve = async () => {
    try {
      // Fetch from backend
      const response = await fetch(`/api/solve?cubeState=${cubeState}`)
      const steps: SolverStep[] = await response.json()
      
      // Wait for animations to complete
      await playSequence(steps, instructorRef)
      alert('Cube solved!')
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleSolve} disabled={isPlaying}>
        {isPlaying ? `Solving (Step ${currentStepIndex})...` : 'Solve'}
      </button>
      <p>Current: {currentStepIndex} / {totalSteps}</p>
    </div>
  )
}
```

### 3. Synchronize Cameras
```tsx
import { useCameraSync } from '../hooks/useCameraSync'

export const CubeDashboard = () => {
  const mirrorRef = useRef<CubeSceneHandle>(null)
  const instructorRef = useRef<CubeSceneHandle>(null)

  // Automatically syncs every 100ms
  useCameraSync(mirrorRef, instructorRef)

  // Or manually sync specific position
  const handleSyncTo = (x: number, y: number, z: number) => {
    instructorRef.current?.syncCamera([x, y, z], 1.0)
  }

  return (
    <div>
      <button onClick={() => handleSyncTo(5, 5, 5)}>Front View</button>
      <button onClick={() => handleSyncTo(10, 10, 10)}>Perspective</button>
    </div>
  )
}
```

## Common Patterns

### Highlight a Move's Affected Face
```typescript
const highlightMove = async (move: string) => {
  const faceMap: { [key: string]: number } = {
    'U': 0, 'D': 1, 'F': 2, 'B': 3, 'R': 4, 'L': 5
  }
  
  const faceIndex = faceMap[move[0]]
  await instructorRef.current.blinkFace(faceIndex, 0.6)
}
```

### Execute Multiple Moves in Sequence
```typescript
const executeMoves = async (moves: string[]) => {
  for (const move of moves) {
    const axis = MOVE_TO_AXIS[move[0]] // 'x' | 'y' | 'z'
    const angle = getMoveAngle(move)     // radians
    await instructorRef.current.rotateCube(axis, angle, 0.6)
    await new Promise(r => setTimeout(r, 300)) // Delay between moves
  }
}
```

### Execute Moves in Parallel
```typescript
const executeMovesParallel = async (moves: string[]) => {
  const promises = moves.map(move => {
    const axis = MOVE_TO_AXIS[move[0]]
    const angle = getMoveAngle(move)
    return instructorRef.current.rotateCube(axis, angle, 0.6)
  })
  
  await Promise.all(promises) // Execute all simultaneously
}
```

### Custom Move Mapping
```typescript
const MOVE_TO_AXIS: { [key: string]: 'x' | 'y' | 'z' } = {
  U: 'y', // Up face
  D: 'y', // Down face
  L: 'x', // Left face
  R: 'x', // Right face
  F: 'z', // Front face
  B: 'z', // Back face
}

const getMoveAngle = (move: string): number => {
  if (move.endsWith("2")) return Math.PI        // 180°
  if (move.endsWith("'")) return -Math.PI / 2   // -90°
  return Math.PI / 2                             // 90°
}
```

## Styling & Theming

### Cube Colors
```typescript
const FACE_COLORS = {
  W: '#FFFFFF',  // White
  Y: '#FFFF00',  // Yellow
  B: '#0000FF',  // Blue
  G: '#00DD00',  // Green
  R: '#FF0000',  // Red
  O: '#FFA500',  // Orange
}
```

### Material Properties
- **Emissive Intensity**: Controls neon glow (1.2 = bright, 3.0 = max)
- **Metalness**: Surface reflectivity (0.2 = matte, 1.0 = mirror)
- **Roughness**: Surface smoothness (0.3 = smooth, 1.0 = rough)

## Debugging

### Log Current Step
```typescript
const onStepChange = (idx: number, step: SolverStep | null) => {
  if (step) {
    console.log(`
      Index: ${idx}
      Instruction: ${step.instruction}
      Move: ${step.move}
      Clockwise: ${step.isClockwise}
      Blink Face: ${step.faceToBlink}
    `)
  }
}
```

### Monitor Animation State
```typescript
const { isPlaying, currentStepIndex, pauseAnimation, resumeAnimation } = useSolverAnimation()

useEffect(() => {
  if (isPlaying) {
    console.log('Animation in progress:', currentStepIndex)
  }
}, [isPlaying, currentStepIndex])
```

### Test Individual Methods
```typescript
// Test rotation
instructorRef.current.rotateCube('y', Math.PI / 2, 0.6)

// Test blink
instructorRef.current.blinkFace(0, 0.5)

// Test camera sync
instructorRef.current.syncCamera([5, 5, 5], 1.0)
```

## Performance Tips

1. **Memoize callbacks**: Use `useCallback` to prevent unnecessary re-renders
2. **Batch animations**: Use `Promise.all` for parallel moves
3. **Lazy load**: Code-split the 3D components
4. **Optimize meshes**: Check WebGL stats with Three.js inspector
5. **Debounce sync**: Camera sync already uses 100ms interval

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Canvas not rendering | Check that parent has `height: 100%` |
| Stickers not glowing | Verify emissiveIntensity > 0 and Bloom is enabled |
| Moves too fast | Increase duration parameter (default 0.6s) |
| Type errors on refs | Always type as `useRef<CubeSceneHandle>(null)` |
| Sync not working | Ensure both cubes are in Canvas contexts |
| Performance lag | Reduce bloom intensity or levels |

## API Reference

### `useSolverAnimation()`
Returns: `{ playSequence, isPlaying, currentStepIndex, pauseAnimation, resumeAnimation, cancelAnimation }`

### `useCameraSync()`
Returns: `{ syncToPosition, startSync, stopSync }`

### `CubeSceneHandle` Methods
- `rotateCube(axis, angle, duration?)` → Promise<void>
- `blinkFace(faceIndex, duration?)` → Promise<void>
- `syncCamera(cameraPos, zoom)` → void

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Tailwind CSS](https://tailwindcss.com/docs/)
- [Spring Boot Backend API](../src/main/java/com/example/rubikssolver/)
