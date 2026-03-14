# Rubik's Cube Solver Dashboard - File Architecture

## Project Structure Overview

```
frontend/
├── 📋 Configuration Files
├── 📁 src/
│   ├── 🎨 components/        # UI Components (React)
│   ├── 🎬 scenes/            # 3D Scenes (React Three Fiber)
│   ├── 🪝 hooks/             # Custom React Hooks
│   ├── 📦 store/             # State Management (Zustand)
│   ├── 🔧 utils/             # Utility Functions
│   ├── 📝 types/             # TypeScript Definitions
│   ├── App.tsx               # Main Application Component
│   ├── main.tsx              # Entry Point
│   └── index.css             # Global Styles
├── 📄 Documentation
└── 📦 Configuration
```

## Quick File Reference

### 🔴 Core Application Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/App.tsx` | Main application layout & orchestration | Dashboard grid layout |
| `src/main.tsx` | React entry point | ReactDOM.createRoot |
| `src/index.css` | Global styles & animations | Tailwind, glass effects, glow |

### 🎨 Components (UI Layer)

| File | Purpose | Props |
|------|---------|-------|
| `src/components/ProgressTimeline.tsx` | Left sidebar timeline | steps, currentStep, onStepClick |
| `src/components/AlgorithmDetails.tsx` | Right sidebar move details | moves, currentMoveIndex, onMoveClick |
| `src/components/CanvasContainer.tsx` | Center dual-canvas wrapper | cubeState, onMirrorStickerChange |
| `src/components/ControlPanel.tsx` | Playback & solve controls | isLoading, isPlaying, onSolve, etc. |

### 🎬 3D Scenes (Three.js/R3F)

| File | Purpose | Exports |
|------|---------|---------|
| `src/scenes/CubeScene.tsx` | Main 3D canvas component | CubeScene (ref), ForwardRef |
| `src/scenes/Cubie.tsx` | Individual cube piece | Cubie component |
| `src/scenes/index.ts` | Export barrel | Re-exports all scene components |

### 🪝 Custom Hooks

| File | Purpose | Exports |
|------|---------|---------|
| `src/hooks/useAnimation.ts` | Animation utilities | useCubeRotation, useBlinkFace, useSynchronizedCamera |
| `src/hooks/index.ts` | Export barrel | Re-exports all hooks |

### 📦 State Management

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/store/solverStore.ts` | Global Zustand store | useSolverStore, Step interface |
| `src/store/index.ts` | Export barrel | Re-exports store |

### 🔧 Utilities & API

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/utils/api.ts` | Backend API client | cubeAPI class, SolveResponse interface |
| `src/utils/index.ts` | Export barrel | Re-exports API utilities |

### 📝 Type Definitions

| File | Purpose | Key Types |
|------|---------|-----------|
| `src/types/index.ts` | Global TypeScript types | Cubie, SolverStep, FaceColor, etc. |

### 🛠️ Configuration Files

| File | Purpose | Type |
|------|---------|------|
| `package.json` | Dependencies & scripts | NPM config |
| `tsconfig.json` | TypeScript compiler config | TS config |
| `tsconfig.node.json` | Node TypeScript config | TS config |
| `vite.config.ts` | Vite bundler config | Vite config |
| `tailwind.config.js` | Tailwind CSS config | Tailwind config |
| `postcss.config.js` | PostCSS config | PostCSS config |
| `.eslintrc.cjs` | ESLint rules | Lint config |
| `.prettierrc` | Code formatter config | Format config |
| `.gitignore` | Git ignore rules | Git config |
| `.env.example` | Environment variables template | Env template |

### 📚 Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Project overview & setup | Users/Developers |
| `QUICKSTART.md` | Fast getting-started guide | New Users |
| `TECHNICAL.md` | Deep architecture & implementation | Core Developers |
| `DEVELOPMENT.md` | How to extend & customize | Feature Developers |
| `ARCHITECTURE.md` (this file) | File structure reference | Everyone |

## File Dependencies

```
App.tsx
├── useSolverStore (store/)
├── cubeAPI (utils/)
├── ProgressTimeline (components/)
├── CanvasContainer (components/)
│   └── CubeScene (scenes/)
│       └── Cubie (scenes/)
├── AlgorithmDetails (components/)
└── ControlPanel (components/)
```

## Import Patterns

### Type-safe imports
```tsx
// ✅ Good
import { useSolverStore } from '@/store'
import type { SolverStep } from '@/types'
import { cubeAPI } from '@/utils'

// ❌ Avoid
import solverStore from '@/store/solverStore'
import SolverStore from '@/store/solverStore'
```

### Component imports
```tsx
// ✅ Good
import { ProgressTimeline } from '@/components'

// ❌ Avoid
import ProgressTimeline from '@/components/ProgressTimeline'
```

### Hook imports
```tsx
// ✅ Good
import { useCubeRotation } from '@/hooks'

// ❌ Avoid
import useAnimation from '@/hooks/useAnimation'
```

## File Size Reference

Typical bundle sizes (before optimization):
- `App.tsx`: ~3KB
- `CubeScene.tsx`: ~4KB
- Components: ~1-2KB each
- Store: ~2KB
- API utils: ~2KB

## Adding New Files

### Create New Component
1. File: `src/components/MyComponent.tsx`
2. Export: Add to `src/components/index.ts`
3. Type: Define interface in `src/types/index.ts` if complex

### Create New Hook
1. File: `src/hooks/useMyHook.ts`
2. Export: Add to `src/hooks/index.ts`

### Create New Scene
1. File: `src/scenes/MyScene.tsx`
2. Export: Add to `src/scenes/index.ts`
3. Import: Use in CubeScene or App as needed

### Add New API Endpoint
1. Update: `src/utils/api.ts` - add method to CubeAPI class
2. Export: Update `src/utils/index.ts` if needed
3. Type: Define response type in same file

### Add New State
1. Update: `src/store/solverStore.ts` - add to interface
2. Export: Update `src/store/index.ts`
3. Type: Add types to `src/types/index.ts` if needed

## Key File Relationships

### App.tsx (Hub)
Central orchestrator that:
- Manages global state
- Handles API calls
- Coordinates playback
- Renders main layout grid

### CubeScene.tsx (3D Core)
Manages:
- Three.js canvas
- Cube rendering
- Animations
- Camera synchronization

### useSolverStore (State)
Holds:
- Cube configuration (54-char string)
- Solution steps
- Playback position
- Play/pause state

### ControlPanel.tsx (UI Hub)
Provides:
- Solve functionality
- Playback controls
- State management UI
- Statistics display

## Development Workflow

1. **Feature design** → Create story in DEVELOPMENT.md
2. **Type definition** → Add to `src/types/index.ts`
3. **Implementation** → Create component/hook/utility
4. **Integration** → Connect in App.tsx or parent component
5. **Styling** → Add Tailwind classes, update index.css if needed
6. **Export** → Update barrel files (index.ts)
7. **Documentation** → Update relevant .md files
8. **Testing** → Create test file if needed

## Performance Considerations

### Large Files
- `CubeScene.tsx` (4KB) - Main 3D rendering, could be split if needed
- `App.tsx` (3KB) - Orchestration, manageable size

### Bundle Optimization
```json
{
  "sideEffects": false,
  "module": "dist/index.esm.js",
  "main": "dist/index.cjs.js"
}
```

### Code Splitting
Consider lazy loading:
- Heavy components via `React.lazy()`
- 3D scenes on demand
- Large utilities as async modules

## Monitoring & Debugging

### Console utilities available
- React DevTools - inspect components
- Zustand DevTools - inspect state
- Three.js Inspector - inspect 3D objects
- Chrome DevTools - check performance

### Key debug points
- `useSolverStore.getState()` - access store in console
- `window.__THREE_DEVTOOLS__` - Three.js DevTools
- `import.meta.env.VITE_ENABLE_DEBUG` - feature flag

## Migration & Refactoring Guide

### If moving component
1. Update import statements in barrel files
2. Update import paths in files that import it
3. Run ESLint to catch remaining issues

### If renaming hook
1. Update `src/hooks/index.ts`
2. Find all usages: `grep -r "oldHookName" src/`
3. Update all imports

### If changing store structure
1. Update interface in `solverStore.ts`
2. Update actions/reducers
3. Update type definitions in `types/index.ts`
4. Update consumers in `App.tsx` and components

## Version Control

### Ignore patterns configured in `.gitignore`
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.env` - Sensitive vars
- `*.log` - Logs
- `.DS_Store` - OS files

### Recommended git workflow
```bash
git checkout -b feat/feature-name
git commit -m "feat: add feature"
git push origin feat/feature-name
# Create pull request
```

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Framework**: React 18.2 + React Three Fiber 8.14 + Zustand 4.4
