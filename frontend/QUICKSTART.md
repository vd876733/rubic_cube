# Quick Start Guide

## Installation (5 minutes)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Backend
Ensure the Java Spring Boot backend is running on `http://localhost:8080`

```bash
# From the root directory
mvn spring-boot:run
```

### Step 3: Start Frontend Dev Server
```bash
npm run dev
```

The dashboard will open at `http://localhost:5173`

---

## Using the Dashboard

### 1. Upload Cube State
```
Click on "Input Cube State" in the Control Panel
Paste a 54-character cube configuration
Example: WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO
```

### 2. Modify Cube Interactively
```
Click on stickers in the LEFT (Input) cube to change colors
Colors cycle: W → Y → B → G → R → O → W
```

### 3. Solve the Cube
```
Click "🎯 Solve Cube" button
Wait for backend to calculate solution
```

### 4. Watch Solution Playback
```
Click "▶ Play" to auto-play all moves
Use "⏮ Previous" / "⏭ Next" for manual stepping
Click any move in the timeline to jump to that step
```

### 5. Understand the Move Notation
```
R   = Rotate right face clockwise
R'  = Rotate right face counter-clockwise  
R2  = Rotate right face 180 degrees
M   = Rotate middle slice
u   = Wide turn (two layers)
```

---

## UI Layout Explained

```
┌─────────────────────────────────────────────────────────────┐
│                  RUBIK'S CUBE SOLVER DASHBOARD              │
├──────────────┬────────────────────────────┬─────────────────┤
│              │                            │                 │
│  PROGRESS    │  3D CUBE VIEW              │  ALGORITHM      │
│  TIMELINE   │                            │  DETAILS        │
│              │  ┌──────────┬──────────┐   │                 │
│  ├─ 1. R     │  │ Input    │Tutorial  │   │  ► current      │
│  ├─ 2. U'    │  │ Cube     │Cube      │   │    move: R      │
│  ├─ 3. F2 *  │  │ (left)   │(right)   │   │                 │
│  │           │  │          │          │   │  Next moves:    │
│  ├─ 4. M     │  │          │          │   │  - U            │
│  └─ 5. D     │  └──────────┴──────────┘   │  - F'           │
│              │                            │  - L2           │
│              │  ┌─ Control Panel ────┐    │                 │
│              │  │ ▶ Play ⏸ Pause    │    │                 │
│              │  │ Solve  Reset      │    │  5 moves left   │
│              │  └───────────────────┘    │                 │
└──────────────┴────────────────────────────┴─────────────────┘
```

### Left Column: Progress Timeline
- Visual timeline of all moves
- Current position marked with cyan glow
- Completed moves show purple check mark
- Click any move to jump to it
- Shows statistics (completed/remaining)

### Center: Dual 3D Canvases
- **LEFT CUBE (Cyan border)**: Your input cube
  - Click stickers to change colors
  - Rotate with mouse drag
  - Zoom with scroll wheel
  
- **RIGHT CUBE (Purple border)**: Tutorial/solution cube
  - Shows moves being executed
  - Face pulses during rotations
  - Synchronized view with left cube

### Right Column: Algorithm Details
- Large display of current move
- Move type, direction, layer count
- Preview of next moves
- Total move count and remaining moves

---

## Keyboard Shortcuts (Future)

Currently not implemented, but planned:
- `SPACE` - Play/Pause
- `→` - Next step
- `←` - Previous step  
- `R` - Reset
- `S` - Solve

---

## Troubleshooting

### Issue: "Cannot reach backend"
**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/health`
2. Look at browser console for errors (F12)
3. Verify port 8080 is not in use: `lsof -i :8080`

### Issue: Cube rendering is black
**Solution:**
1. Check WebGL support: Open Chrome DevTools, type `WebGLRenderingContext` in console
2. Try disabling bloom effect in code temporarily
3. Update graphics drivers

### Issue: Animations are stuttering
**Solution:**
1. Close other browser tabs
2. Reduce bloom intensity in CubeScene.tsx
3. Check CPU usage: might be too many processes running

### Issue: Stickers not clickable
**Solution:**
1. Make sure you're using the LEFT cube (Input cube)
2. Right cube is read-only for tutorial display
3. Check camera controls aren't interfering (try clicking center of sticker)

---

## Example Cube States

### Solved Cube
```
WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO
```

### Scrambled
```
YRGYWOWBWRBBGBOR YGRGYGYOBWWYGYROYBGWBRWYROBRWGOGWBWYO
```

### One Move Away from Solved
```
WWYWYWYWYYYYYYWWYYBBWBBBGBGGGGGGERGRRRRRRROOOOOOOOO
```

---

## Performance Tips

1. **For Slow Machines:**
   - Disable bloom effect
   - Close other applications
   - Use lower resolution (zoom out browser)

2. **For Faster Playback:**
   - Reduce animation duration (edit `CubeScene.tsx`)
   - Remove all post-processing effects

3. **For Best Visual:**
   - Use high DPI display
   - Increase bloom intensity
   - Use dark room/display

---

## File Upload Format

### Valid Formats
- String: `WWWWWWWWWYYYYYYYYYBBBBBBBBBGGGGGGGGGRRRRRRRRROOOOOOOOO`
- No spaces, exactly 54 characters
- Colors: W, Y, B, G, R, O only

### Invalid Examples (Won't Work)
- `WWW WWW WWW ...` (spaces)
- `WWWWWWWWWYYYYYYYYYB...` (59 chars)
- `wwwwwwwww...` (lowercase)
- `123456789...` (wrong characters)

---

## Next Steps

1. **Customize colors**: Edit `FACE_COLORS` in `src/scenes/Cubie.tsx`
2. **Change animation speed**: Modify `duration` parameter in `rotateCube()` calls
3. **Adjust lighting**: Update light intensity values in `CubeScene.tsx`
4. **Add features**: Implement keyboard shortcuts, preset configurations, etc.

---

## Getting Help

- Check [TECHNICAL.md](./TECHNICAL.md) for in-depth architecture
- Read component comments for usage examples  
- Inspect React DevTools for state debugging
- Check browser console for error messages

---

## Have Fun! 🎲
