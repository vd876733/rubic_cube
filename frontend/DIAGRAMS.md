# Component Interaction Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Rubik's Cube Solver Dashboard              │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      App.tsx (Orchestrator)               │  │
│  │  - Main layout grid                                       │  │
│  │  - Handles API calls                                      │  │
│  │  - Manages playback state                                 │  │
│  │  - Coordinates animations                                 │  │
│  └─────────────────────────────────────────────────────────────┘
│           │                      │                      │
│           ├──────────────────────┼──────────────────────┴──────┐
│           │                      │                             │
│  ┌────────▼──────────┐  ┌────────▼──────────┐    ┌────────────▼─────┐
│  │  Left Column     │  │  Center Column   │    │  Right Column    │
│  │  Progressive     │  │  3D Cubes        │    │  Algorithm       │
│  │  Timeline        │  │  + Controls      │    │  Details         │
│  └──────────────────┘  └──────────────────┘    └──────────────────┘
│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Zustand Store    │
                    │ (solverStore)    │
                    └──────────────────┘
                              │
                              ▼
                        ┌───────────┐
                        │ Java API  │
                        │ Backend   │
                        └───────────┘
```

## Data Flow Diagram

```
USER INPUT
    │
    ├─→ Input Cube State (54 chars)
    │        │
    │        ▼
    │    Store → cubeState
    │        │
    │        ├─→ Mirror Cube Render
    │        │
    │        └─→ Input Validation
    │
    ├─→ Click Sticker
    │        │
    │        ▼
    │    Raycasting Detection
    │        │
    │        ▼
    │    Change Color (W→Y→B→G→R→O→W)
    │        │
    │        ▼
    │    Store → cubeState
    │
    └─→ Click "Solve Cube"
             │
             ▼
         API Request → Backend
             │
             ▼
         Solver Algorithm
             │
             ▼
         API Response (Steps)
             │
             ▼
         Store → steps[] + currentStepIndex
             │
             ├─→ Update Timeline
             │
             └─→ [Playback Enabled]
                     │
                     ├─→ Click Play
                     │     │
                     │     ▼
                     │  Interval Loop (1.5s/move)
                     │     │
                     │     ├─→ Update currentStepIndex
                     │     │
                     │     ├─→ ProgressTimeline Re-render
                     │     │
                     │     ├─→ AlgorithmDetails Highlight
                     │     │
                     │     └─→ CubeScene Animations
                     │             │
                     │             ├─→ Rotation (GSAP, 0.6s)
                     │             │
                     │             └─→ Blink (0.5s)
                     │
                     ├─→ Click Next/Previous
                     │     │
                     │     ▼
                     │  Update currentStepIndex
                     │     │
                     │     └─→ [UI Updates]
                     │
                     └─→ Click Reset
                           │
                           ▼
                        Reset all state to defaults
```

## Component Tree

```
App.tsx (Root)
│
├─ useSolverStore (Zustand)
│  ├─ cubeState: string
│  ├─ steps: Step[]
│  ├─ currentStepIndex: number
│  ├─ isPlaying: boolean
│  └─ actions: {...}
│
├─ useState (isLoading, moves[])
│
├─ useEffect (playback logic)
│
├─ useRef (instructorCubeRef)
│
├─ <ProgressTimeline />
│  ├─ Props: steps, currentStep, onStepClick
│  ├─ State: (controlled by parent)
│  └─ Render: Timeline steps with visual indicators
│
├─ <CanvasContainer />
│  │
│  ├─ <CubeScene> (Mirror - Left)
│  │  ├─ useRef: cubeGroupRef, faceMeshesRef
│  │  ├─ Handles: Raycasting, sticker clicks
│  │  ├─ Methods:
│  │  │  ├─ rotateCube(axis, angle, duration)
│  │  │  ├─ blinkFace(faceIndex, duration)
│  │  │  └─ (exposed via useImperativeHandle)
│  │  │
│  │  └─ <CubeContent>
│  │     ├─ <PerspectiveCamera />
│  │     ├─ <OrbitControls />
│  │     ├─ <Lights />: ambient + point lights
│  │     ├─ <group> (rotations)
│  │     │  └─ [Cubie] × 27
│  │     │     ├─ RoundedBoxGeometry (edge)
│  │     │     └─ [PlaneGeometry] × 6 (facelets)
│  │     │        └─ MeshStandardMaterial (emissive)
│  │     │
│  │     └─ <EffectComposer>
│  │        └─ <Bloom /> (neon glow)
│  │
│  ├─ <CubeScene> (Tutorial - Right)
│  │  └─ (Same as mirror, with instructor ref)
│  │
│  └─ Divider (visual)
│
├─ <ControlPanel />
│  ├─ Props: isLoading, isPlaying, onSolve, etc.
│  ├─ State: isCubeInputOpen
│  └─ Features:
│     ├─ Solve button
│     ├─ Cube state input
│     ├─ Playback controls (Play/Pause/Reset)
│     ├─ Progress indicator
│     └─ Statistics display
│
└─ <AlgorithmDetails />
   ├─ Props: moves[], currentMoveIndex, onMoveClick
   ├─ Renders: Current move (large), upcoming moves
   ├─ Behavior: Highlights active move
   └─ Shows: Move statistics
```

## State Flow

```
┌─────────────────────────────────────┐
│      Zustand Store (solverStore)    │
│                                     │
│  cubeState: string                  │
│  steps: Step[]                      │
│  currentStepIndex: number           │
│  isPlaying: boolean                 │
│                                     │
│  Subscribe ─┬─► ProgressTimeline    │
│             ├─► AlgorithmDetails    │
│             ├─► ControlPanel        │
│             └─► CubeScene           │
│                                     │
│  Update ←─┬── User input            │
│           ├── API response          │
│           └── Playback timer        │
└─────────────────────────────────────┘
```

## Event Flow for Solving

```
1. User Input
   └─ "WWWWWWWWWYYY..." + Click Solve
       │
2. App.tsx → handleSolve()
   └─ Call cubeAPI.solveCube(cubeState)
       │
3. Backend Processing
   └─ Java Solver Algorithm
       │
4. API Response
   └─ { steps: [{move, axis, angle, face}], solveTime }
       │
5. Store Update
   └─ setSteps(steps)
   └─ setCurrentStepIndex(0)
   └─ setIsPlaying(false)
       │
6. UI Re-render
   └─ ProgressTimeline updates
   └─ AlgorithmDetails updates
   └─ ControlPanel enables playback
       │
7. User clicks Play
   └─ setIsPlaying(true)
       │
8. Playback Loop
   └─ Every 1.5 seconds:
       ├─ Update currentStepIndex
       ├─ Trigger instructor cube animations
       │  ├─ rotateCube(axis, angle, 0.6s)
       │  └─ blinkFace(faceIndex, 0.5s)
       ├─ Re-render timeline
       └─ Re-render algorithm details
```

## Animation Pipeline

```
Step: Move 'R'
│
└─ currentStepIndex → Step Object
   ├─ move: "R"
   ├─ rotationAxis: 'X'
   ├─ rotationAmount: π/2
   └─ faceIndex: 2
      │
      ├─→ CubeScene.rotateCube('x', π/2, 0.6)
      │   │
      │   └─ RequestAnimationFrame Loop (0.6s)
      │      ├─ Easing function (in-out)
      │      ├─ Update group.rotation.x
      │      └─ Resolve promise on complete
      │
      └─→ CubeScene.blinkFace(2, 0.5)
          │
          └─ Pulse emissiveIntensity
             ├─ Ramp up (0.25s): 1.5 → 3
             └─ Ramp down (0.25s): 3 → 1.5
```

## Interaction Points

```
USER INTERACTS                    COMPONENT              UPDATES
──────────────────────────────────────────────────────────────────
Click sticker                  Cubie.tsx              cubeState
                               (Raycasting)            ↓ Store
                                                       
Drag to rotate                 CubeScene.tsx           camera position
                               (OrbitControls)         ↓ Sync to both
                               
Scroll to zoom                 CubeScene.tsx           camera position
                               (OrbitControls)         ↓ Sync to both
                               
Click timeline item            ProgressTimeline.tsx    currentStepIndex
                                                       ↓ Store
                               
Click next/prev                ControlPanel.tsx        currentStepIndex
                                                       ↓ Store
                               
Click play/pause               ControlPanel.tsx        isPlaying
                                                       ↓ Store
                               
Click solve                    ControlPanel.tsx        API call
                                                       ↓ Backend
                               
Backend response               App.tsx                 steps[]
                                                       ↓ Store
```

## File Dependencies

```
App.tsx
 ├─→ useSolverStore
 │    └─→ src/store/solverStore.ts
 │
 ├─→ cubeAPI
 │    └─→ src/utils/api.ts
 │
 ├─→ ProgressTimeline
 │    └─→ src/components/ProgressTimeline.tsx
 │
 ├─→ CanvasContainer
 │    └─→ src/components/CanvasContainer.tsx
 │         └─→ CubeScene
 │              └─→ src/scenes/CubeScene.tsx
 │                   ├─→ Cubie
 │                   │    └─→ src/scenes/Cubie.tsx
 │                   │
 │                   └─→ Three.js + React Three Fiber
 │
 ├─→ AlgorithmDetails
 │    └─→ src/components/AlgorithmDetails.tsx
 │
 └─→ ControlPanel
      └─→ src/components/ControlPanel.tsx
```

## Store Update Pathways

```
                        solverStore.ts
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         cubeState      currentStepIndex     steps[]
              │               │               │
         ┌─────┴───────┐  ┌────┴───────┐ ┌──┴────┐
         │             │  │            │ │       │
         ▼             ▼  ▼            ▼ ▼       ▼
      Mirror    Validation CubeScene Timeline Details
      Cubie     Logic     Animation  Render  Render
      Render
```

## Memory & Resource Management

```
CubeScene.tsx
├─ useRef: cubeGroupRef
│  └─ THREE.Group {27 Cubies}
│     └─ [Cubie] × 27
│        └─ [Mesh] × 6 (facelets)
│           └─ Geometry: PlaneGeometry
│           └─ Material: MeshStandardMaterial
│
├─ useRef: faceMeshesRef[]
│  └─ Materials for face effects
│
└─ useRef: controlsRef
   └─ OrbitControls instance
      └─ Mouse interaction handler
```

## Error Handling Flow

```
Try to Solve
    │
    ├─ cubeAPI.solveCube()
    │
    └─ Catch Error
       │
       ├─ Axios Error?
       │  ├─ 400 Bad Request
       │  │  └─ Invalid cube state
       │  ├─ 500 Server Error
       │  │  └─ Backend issue
       │  └─ Network Error
       │     └─ Backend not running
       │
       └─ Show Alert to User
          └─ Log to console
```

## Performance Optimization Points

```
Rendering Optimization
├─ Memoized cubie creation (useMemo)
├─ Ref-based animations (avoid re-renders)
├─ RequestAnimationFrame (60fps)
└─ WebGL high-performance context

Animation Optimization
├─ GSAP for smooth transforms
├─ Easing functions built-in
├─ Batched DOM updates
└─ No unnecessary re-renders

Bundle Optimization
├─ Tree-shaking enabled
├─ Lazy loading ready
├─ Tailwind CSS purging
└─ Vite code splitting

Network Optimization
├─ API response caching ready
├─ Gzipped assets
├─ Image optimization capable
└─ CDN-ready build
```

---

**This diagram helps visualize how all components interact and communicate.**

*For detailed implementation, see TECHNICAL.md*
