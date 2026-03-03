# Neural Solver - Integration Guide

## Overview
This guide explains how to integrate the dual-cube 3D visualization with the Spring Boot backend solver steps.

## Architecture

### Components
1. **CanvasContainer** - Main container managing dual cubes (Mirror + Instructor)
2. **CubeScene** - 3D cube visualization with one-way synchronization
3. **Cubie** - Individual cube piece with sticker materials and emissive glow

### Hooks
1. **useSolverAnimation** - Executes Step sequences with visual feedback
2. **useCameraSync** - Synchronizes camera between dual cubes
3. **useSyncCamera** - Exposed via useImperativeHandle for imperative camera control

## Step Execution Flow

```
Backend (Spring Boot)
    ↓
/api/solve (returns Step[] array)
    ↓
Frontend useSolverAnimation Hook
    ↓
For each Step:
  1. Highlight face (blinkFace)
  2. Rotate cube (rotateCube)
  3. Update UI (onStepChange callback)
    ↓
Instructor Cube displays solution
Mirror Cube stays in sync via handleMirrorRotate
```

## Usage Example

```typescript
import { useSolverAnimation, type SolverStep } from '../hooks/useSolverAnimation'

export const SolverView = () => {
  const instructorRef = useRef<CubeSceneHandle>(null)
  const { playSequence, isPlaying, currentStepIndex } = useSolverAnimation({
    onStepChange: (idx, step) => {
      console.log(`Step ${idx}: ${step?.instruction}`)
      // Update UI to highlight current step
    }
  })

  const handleSolve = async () => {
    try {
      // Fetch solution from backend
      const response = await fetch(`/api/solve?cubeState=${cubeState}`)
      const steps: SolverStep[] = await response.json()
      
      // Execute animation sequence
      await playSequence(steps, instructorRef)
      console.log('Solution complete!')
    } catch (error) {
      console.error('Failed to solve:', error)
    }
  }

  return (
    <div>
      <button onClick={handleSolve} disabled={isPlaying}>
        {isPlaying ? 'Solving...' : 'Solve Cube'}
      </button>
      <p>Current Step: {currentStepIndex}</p>
      <CanvasContainer ref={instructorRef} cubeState={cubeState} />
    </div>
  )
}
```

## Step Object Structure

From `Step.java` backend:
```java
@Data
@AllArgsConstructor
public class Step {
    String instruction;      // Human-readable (e.g., "Rotate Up face")
    String move;             // Notation (e.g., "U", "R'", "F2")
    boolean isClockwise;     // Direction flag
    String faceToBlink;      // Which face to highlight (U, D, L, R, F, B)
}
```

## Move Notation

| Notation | Axis | Angle | Description |
|----------|------|-------|-------------|
| U | Y | 90° | Rotate up face clockwise |
| U' | Y | -90° | Rotate up face counterclockwise |
| U2 | Y | 180° | Rotate up face 180 degrees |
| R | X | 90° | Rotate right face clockwise |
| D | Y | -90° | Rotate down face clockwise |
| L | X | -90° | Rotate left face clockwise |
| F | Z | 90° | Rotate front face clockwise |
| B | Z | -90° | Rotate back face clockwise |

## Async/Await Pattern

All cube methods return Promises for proper sequencing:

```typescript
// Sequential execution (one after another)
await cubeRef.current.blinkFace(0) // Highlight face
await cubeRef.current.rotateCube('y', Math.PI / 2) // Rotate

// Parallel execution (at same time)
Promise.all([
  cubeRef.current.blinkFace(0),
  cubeRef.current.rotateCube('y', Math.PI / 2)
])
```

## Materials & Aesthetic

### Sticker Properties
- **Color**: RGB from FACE_COLORS (W, Y, B, G, R, O)
- **Emissive**: Same as color for neon glow
- **Metalness**: 0.2 (subtle shine)
- **Roughness**: 0.3 (smooth surface)
- **Bloom**: Enabled via EffectComposer (post-processing)

### Cubie Body
- **Color**: #111827 (Dark charcoal)
- **Emissive**: #000000 (no additional glow)
- **Metalness**: 0.5 (pronounced shine)

## Configuration

### Timing
- **Step Delay**: 0.5 seconds between moves
- **Rotation Duration**: 0.6 seconds per move
- **Blink Duration**: 0.4 seconds face highlight
- **Sync Interval**: 100ms camera sync check

### Camera
- **Default Position**: [5, 5, 5]
- **Field of View**: 50 degrees
- **Zoom**: 1x (can be adjusted)

## Troubleshooting

### Issue: Instructor cube not rotating
**Solution**: Check that `onRotate` callback is properly connected in CanvasContainer

### Issue: Stickers not glowing
**Solution**: Verify Bloom effect is enabled and emissiveIntensity > 0

### Issue: Animation timing off
**Solution**: Check step delay timing and ensure rotateCube duration matches visual pacing

### Issue: TypeScript errors on refs
**Solution**: Always type refs as `useRef<CubeSceneHandle>(null)`

## Extended Features

### Custom Step Execution
```typescript
const executeCustomMove = async (move: string) => {
  const axis = MOVE_TO_AXIS[move[0]]
  const angle = getMoveAngle(move)
  
  await instructorRef.current.rotateCube(axis, angle)
}

const handleUndo = async () => {
  // Reverse last move
  const lastMove = steps[currentStepIndex - 1].move
  const reverseMove = lastMove.endsWith("'") 
    ? lastMove.slice(0, -1) 
    : lastMove + "'"
  
  await executeCustomMove(reverseMove)
}
```

### Performance Optimization
```typescript
// Parallel blink + rotation for faster playback
await Promise.all([
  blinkFace(faceIndex),
  rotateCube(axis, angle, 0.3) // Faster rotation
])
```

## Related Files
- Backend: `/src/main/java/com/example/rubikssolver/model/Step.java`
- Frontend: `/frontend/src/hooks/useSolverAnimation.ts`
- UI Integration: See `ProgressTimeline.tsx` for step highlighting
