<<<<<<< HEAD
import { useState, useImperativeHandle, forwardRef } from 'react'
=======
import { FC, useState, useImperativeHandle, forwardRef } from 'react'
>>>>>>> 193caf26bf187b01d88eec40839f915b991654d8

interface PaletteProps {
  selectedColor: string | null
  onColorSelect: (color: string) => void
}
 
interface PaletteHandle {
  useCharge: (colorChar: string) => void
}
 
const PALETTE_COLORS = [
  { hex: '#ffffff', label: 'White', char: 'W' },
  { hex: '#ffeb3b', label: 'Yellow', char: 'Y' },
  { hex: '#4caf50', label: 'Green', char: 'G' },
  { hex: '#2196f3', label: 'Blue', char: 'B' },
  { hex: '#ff9800', label: 'Orange', char: 'O' },
  { hex: '#f44336', label: 'Red', char: 'R' },
]

const INITIAL_CHARGES = 8
const UNLIMITED_MODE = false // Set to true for unlimited painting

/**
 * Palette - Color selection component with charge system for sticker editing
 * Each color has 8 charges (or unlimited if UNLIMITED_MODE is true)
 * Allows users to select a color and track charges before clicking stickers on the cube
 */
export const Palette = forwardRef<PaletteHandle, PaletteProps>(
  ({ selectedColor, onColorSelect }, ref) => {
    const [charges, setCharges] = useState<{ [key: string]: number }>({
      W: INITIAL_CHARGES,
      Y: INITIAL_CHARGES,
      G: INITIAL_CHARGES,
      B: INITIAL_CHARGES,
      O: INITIAL_CHARGES,
      R: INITIAL_CHARGES,
    })

    const useCharge = (colorChar: string) => {
      if (!UNLIMITED_MODE) {
        setCharges((prev) => ({
          ...prev,
          [colorChar]: Math.max(0, prev[colorChar] - 1),
        }))
      }
    }

    useImperativeHandle(ref, () => ({ useCharge }), [])

    const handleColorClick = (colorChar: string) => {
      // Check if color has charges available
      if (!UNLIMITED_MODE && charges[colorChar] <= 0) {
        return
      }
      onColorSelect(colorChar)
    }

    return (
      <div className="flex flex-col gap-3 p-4 bg-slate-900/50 border border-white/10 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold text-white">Paint Colors</div>
          {UNLIMITED_MODE && <span className="text-xs text-yellow-400">∞ Unlimited</span>}
        </div>

        <div className="flex gap-2 flex-wrap">
          {PALETTE_COLORS.map((color) => {
            const isSelected = selectedColor === color.char
            const chargesLeft = UNLIMITED_MODE ? '∞' : charges[color.char]
            const isAvailable = UNLIMITED_MODE || charges[color.char] > 0

            return (
              <button
                key={color.hex}
                onClick={() => handleColorClick(color.char)}
                disabled={!isAvailable}
                title={`${color.label} (${color.char})`}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-200 ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed border-gray-600'
                    : isSelected
                      ? 'border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110'
                      : 'border-white/20 hover:border-white/50 cursor-pointer'
                }`}
                style={{
                  backgroundColor: color.hex,
                }}
              >
                <span className="text-xs font-bold" style={{ color: color.char === 'W' ? '#000' : '#fff' }}>
                  {color.char}
                </span>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: color.char === 'W' ? '#000' : '#fff' }}
                >
                  {chargesLeft}
                </span>
              </button>
            )
          })}
        </div>

        {selectedColor && (
          <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-gray-300 text-center">
            Selected: <span className="text-white font-semibold">{selectedColor}</span>
            {!UNLIMITED_MODE && (
              <>
                <br />
                <span className="text-gray-400">Charges: {charges[selectedColor]}</span>
              </>
            )}
            <br />
            <span className="text-gray-400">Click a sticker to apply</span>
          </div>
        )}
      </div>
    )
  }
)

Palette.displayName = 'Palette'
