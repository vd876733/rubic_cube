# Rubik's Cube Solver Dashboard

A high-end React dashboard for visualizing and controlling Rubik's Cube solving algorithms with real-time 3D cube visualization.

## Features

✨ **Advanced UI/UX**
- Dark-mode glassmorphism design with Tailwind CSS
- Neon aesthetic with bloom post-processing effects
- Three-column grid layout with synchronized dual 3D canvases

🎮 **3D Visualization**
- Real-time cube rendering using React Three Fiber
- Dual-canvas setup: Interactive Input Cube + Tutorial Instructor Cube
- Synchronized camera controls across both cubes
- Smooth rotation animations with GSAP
- Post-processing bloom effects for neon glow

📊 **Interactive Features**
- Click-to-modify sticker colors on the input cube
- Playback controls for step-by-step solving visualization
- Real-time algorithm highlighting as moves are executed
- Progress timeline with visual indicators

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Java 11+ and Spring Boot backend running on `http://localhost:8080`

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local if needed
```

3. **Start development server:**
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProgressTimeline.tsx   # Left panel timeline
│   ├── AlgorithmDetails.tsx   # Right panel move details
│   ├── CanvasContainer.tsx    # Center dual-canvas container
│   └── ControlPanel.tsx       # Playback controls
├── scenes/             # 3D scene components
│   ├── CubeScene.tsx   # Main 3D canvas wrapper
│   └── Cubie.tsx       # Individual cube piece component
├── hooks/              # Custom React hooks
│   └── useAnimation.ts # Animation utilities (GSAP, rotation)
├── store/              # State management (Zustand)
│   └── solverStore.ts  # Global solver state
├── utils/              # Utility functions
│   └── api.ts          # Backend API integration
├── App.tsx             # Main application component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Architecture

### State Management
Uses **Zustand** for lightweight global state:
- `cubeState`: 54-character string representing cube configuration
- `steps`: Array of solver steps from backend
- `currentStepIndex`: Current playback position
- `isPlaying`: Playback state

### 3D Rendering
- **React Three Fiber**: Canvas abstraction for Three.js
- **@react-three/drei**: Helper components (OrbitControls, PerspectiveCamera)
- **@react-three/postprocessing**: Bloom effect for neon aesthetic
- **GSAP**: Smooth rotation animations

### API Integration
Communicates with Java backend via:
- `POST /api/solve` - Submit cube state and receive solution steps
- `POST /api/validate` - Validate cube state

### Styling
- **Tailwind CSS**: Utility-first styling framework
- **Custom CSS**: Glassmorphism, glow effects, animations

## Backend Integration

The dashboard expects the backend to provide:

### Solve Endpoint
```
POST /api/solve
Request: { cubeState: string }
Response: { 
  steps: [{
    move: string,
    rotationAxis: 'x' | 'y' | 'z',
    rotationAmount: number,
    faceIndex: number
  }],
  solveTime: number
}
```

## Key Components

### ProgressTimeline
- Vertical timeline showing all moves
- Visual indicators (completed, current, pending)
- Click to jump to any move

### AlgorithmDetails
- Large display of current move notation
- Upcoming moves preview
- Move statistics and analysis
- Color-coded by face type

### CanvasContainer
- Dual 3D cube rendering
- Left: Interactive mirror cube (input)
- Right: Tutorial instructor cube (output)
- Synchronized camera rotation

### ControlPanel
- Solve button with loading state
- Play/Pause playback controls
- Step navigation
- Progress indicator

## Cube State Format

The cube state is represented as a 54-character string:
- Characters 0-8: White face (top)
- Characters 9-17: Yellow face (bottom)
- Characters 18-26: Blue face (front)
- Characters 27-35: Green face (back)
- Characters 36-44: Red face (right)
- Characters 45-53: Orange face (left)

Example: `WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO`

## Troubleshooting

### Backend connection issues
- Ensure backend is running on `http://localhost:8080`
- Check CORS settings in backend configuration
- Verify network connectivity

### 3D rendering issues
- Update WebGL drivers
- Try disabling bloom effect if performance issues arise
- Check console for Three.js warnings

### Animation stuttering
- Reduce bloom quality or disable post-processing
- Close other browser tabs consuming resources
- Check GPU temperature and load

## Performance Tips

1. Limit simultaneous animations
2. Use `performancePreference: 'high-performance'` in Canvas settings
3. Disable bloom effect for slower devices
4. Reduce animation duration for faster feedback

## Contributing

Feel free to fork, modify, and create pull requests!

## License

MIT License - Feel free to use in your own projects
