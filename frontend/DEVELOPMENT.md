# Development Guide

This guide helps developers extend and customize the Rubik's Cube Solver Dashboard.

## Adding New UI Components

### 1. Create Component File
```tsx
// src/components/MyNewComponent.tsx
import React from 'react'

interface MyNewComponentProps {
  title: string
  onAction?: () => void
}

export const MyNewComponent: React.FC<MyNewComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="glass-panel p-6">
      <h2 className="neon-text text-lg font-bold">{title}</h2>
      <button onClick={onAction} className="mt-4 px-4 py-2 bg-neon-cyan text-black rounded">
        Click Me
      </button>
    </div>
  )
}
```

### 2. Export in Index
```tsx
// src/components/index.ts
export { MyNewComponent } from './MyNewComponent'
```

### 3. Use in App
```tsx
import { MyNewComponent } from './components'

// In JSX:
<MyNewComponent title="My Component" onAction={() => console.log('Clicked')} />
```

## Styling with Tailwind

All components use **Tailwind CSS** utility classes. Key classes:

### Glass Panel Base
```tsx
<div className="glass-panel">
  {/* Applies: backdrop-blur, white/5 background, border, rounded-lg */}
</div>
```

### Text Styles
```tsx
// Neon gradient text (cyan → purple → pink)
<h1 className="neon-text">Title</h1>

// With glow effect
<p className="neon-text glow-effect">Glowing Text</p>

// Pulse animation
<span className="pulse-glow">Pulsing</span>
```

### Colors
- **Primary**: `text-neon-cyan`, `bg-gradient-to-r from-neon-cyan to-neon-purple`
- **Secondary**: `text-neon-purple`, `bg-neon-purple/20`
- **Accent**: `text-neon-pink`, `shadow-glow-pink`

## Customizing 3D Rendering

### Change Cube Colors
```tsx
// src/scenes/Cubie.tsx
const FACE_COLORS: { [key: string]: string } = {
  W: '#00FF00', // Change white to green
  Y: '#FF00FF', // Change yellow to magenta
  // ... etc
}
```

### Adjust Lighting
```tsx
// src/scenes/CubeScene.tsx
<pointLight
  position={[10, 10, 10]}
  intensity={2}  // Increase brightness
  color="#FF0000" // Change color
/>
```

### Modify Bloom Effect
```tsx
<Bloom
  intensity={2.0}  // Stronger glow
  luminanceThreshold={0.1}  // Glow more colors
  levels={8}  // More blur quality
/>
```

## State Management with Zustand

### Reading State
```tsx
import { useSolverStore } from './store'

const MyComponent = () => {
  const cubeState = useSolverStore((state) => state.cubeState)
  const currentStep = useSolverStore((state) => state.currentStepIndex)
  
  return <div>{cubeState}</div>
}
```

### Modifying State
```tsx
const setCubeState = useSolverStore((state) => state.setCubeState)

setCubeState('WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO')
```

### Adding New Store Properties
```tsx
// src/store/solverStore.ts
interface SolverStore {
  // ... existing
  myNewProperty: string
  setMyNewProperty: (value: string) => void
}

export const useSolverStore = create<SolverStore>((set) => ({
  // ... existing
  myNewProperty: 'initial value',
  setMyNewProperty: (value) => set({ myNewProperty: value }),
}))
```

## Custom Hooks

### Creating Animation Hook
```tsx
// src/hooks/useMyAnimation.ts
import { useRef, useCallback } from 'react'
import * as THREE from 'three'

export const useMyAnimation = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  const animateScale = useCallback((targetScale: number, duration: number) => {
    if (!meshRef.current) return

    const start = Date.now()
    const startScale = meshRef.current.scale.x

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / (duration * 1000), 1)

      meshRef.current!.scale.set(
        startScale + (targetScale - startScale) * progress,
        startScale + (targetScale - startScale) * progress,
        startScale + (targetScale - startScale) * progress
      )

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [])

  return { meshRef, animateScale }
}
```

## Backend Integration

### Adding New API Endpoint
```tsx
// src/utils/api.ts
class CubeAPI {
  async getSolveStats(): Promise<{ avgTime: number; totalSolves: number }> {
    try {
      const response = await this.api.get<{ avgTime: number; totalSolves: number }>(
        '/stats'
      )
      return response.data
    } catch (error) {
      console.error('Error getting stats:', error)
      throw error
    }
  }
}
```

### Adding Error Handling
```tsx
import axios from 'axios'

try {
  await cubeAPI.solveCube(cubeState)
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      console.error('Invalid cube state')
    } else if (error.response?.status === 500) {
      console.error('Server error')
    }
  }
  setError('Failed to solve cube')
}
```

## Feature: Preset Cube Configurations

```tsx
// src/utils/presets.ts
export const CUBE_PRESETS = {
  SOLVED: 'WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO',
  ONE_MOVE: 'WWYWYWYWYYYYYYWWYYBBWBBBGBGGGGGGERGRRRRRRROOOOOOOOO',
  SCRAMBLED: 'YRGYWOWBWRBBGBOR YGRGYGYOBWWYGYROYBGWBRWYROBRWGOGWBWYO',
}

// Usage:
setCubeState(CUBE_PRESETS.SOLVED)
```

## Feature: Keyboard Shortcuts

```tsx
// src/hooks/useKeyboard.ts
import { useEffect } from 'react'

export const useKeyboard = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          // Toggle play/pause
          break
        case 'ArrowRight':
          // Next step
          break
        case 'ArrowLeft':
          // Previous step
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
}
```

## Performance Optimization

### Memoization
```tsx
import { useMemo } from 'react'

const expensiveData = useMemo(() => {
  return computeExpensiveData(cubeState)
}, [cubeState]) // Only recompute when cubeState changes
```

### Code Splitting
```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HeavyComponent />
  </Suspense>
)
```

### Async Operations
```tsx
import { useCallback, useState, useEffect } from 'react'

const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    try {
      const result = await asyncFunction()
      setValue(result)
      setStatus('success')
      return result
    } catch (err) {
      setError(err as Error)
      setStatus('error')
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, value, error }
}
```

## Testing

### Component Testing
```tsx
// src/components/__tests__/ProgressTimeline.test.tsx
import { render, screen } from '@testing-library/react'
import { ProgressTimeline } from '../ProgressTimeline'

describe('ProgressTimeline', () => {
  it('renders correctly', () => {
    render(<ProgressTimeline steps={['R', "U'", "F2"]} currentStep={0} />)
    expect(screen.getByText('Progress Timeline')).toBeInTheDocument()
  })
})
```

## Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview

# Built files in dist/ folder
ls -la dist/
```

## Environment Variables

Create `.env.local` for local development:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_DEBUG=true
```

All variables accessible via `import.meta.env.VITE_*`

## Debugging Tips

### React DevTools
- Install React DevTools Chrome extension
- Inspect component tree and state
- Edit props/state in real-time

### Vite HMR (Hot Module Replacement)
- Changes auto-reload in browser
- State preserved with Fast Refresh

### Browser DevTools
```javascript
// In console:
// Access Zustand store
import { useSolverStore } from './store/solverStore'
useSolverStore.getState() // View entire state

// Check WebGL capabilities
const canvas = document.querySelector('canvas')
canvas.getContext('webgl2') // Check for WebGL2
```

## Common Issues & Solutions

### Component Not Updating
- Check store subscription
- Ensure state changes are dispatched
- Use React DevTools to inspect

### 3D Canvas Issues
- Clear browser cache
- Check WebGL errors in console
- Verify shader compilation

### Slow Animations
- Reduce bloom effect intensity
- Disable unnecessary post-processing
- Check CPU/GPU usage

## Contributing

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes following code style
3. Test thoroughly
4. Submit pull request with description

## Resources

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Tailwind CSS Reference](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [GSAP Documentation](https://greensock.com/docs/)
