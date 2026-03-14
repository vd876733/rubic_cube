<<<<<<< HEAD
import { useState, useImperativeHandle, forwardRef } from 'react'
=======
import { FC, useState, useImperativeHandle, forwardRef } from 'react'
>>>>>>> 193caf26bf187b01d88eec40839f915b991654d8

interface VerticalPaletteProps {
  selectedColor: string | null
  onColorSelect: (color: string) => void
}

interface VerticalPaletteHandle {
  useCharge: (colorChar: string) => void
}

// six neon colors in a universal cube palette
const PALETTE_COLORS = [
  { hex: '#FFFFFF', label: 'White', char: 'W' },
  { hex: '#F44336', label: 'Red', char: 'R' },
  { hex: '#4CAF50', label: 'Green', char: 'G' },
  { hex: '#FFEB3B', label: 'Yellow', char: 'Y' },
  { hex: '#FF9800', label: 'Orange', char: 'O' },
  { hex: '#2196F3', label: 'Blue', char: 'B' },
]

const INITIAL_CHARGES = 8
const UNLIMITED_MODE = false // flip to true for prototyping

/**
 * VerticalPalette - slim vertical dock with circular color buttons
 * Positioned to the left of the Mirror Cube for compact painting
 */
export const VerticalPalette = forwardRef<VerticalPaletteHandle, VerticalPaletteProps>(
  ({ selectedColor, onColorSelect }, ref) => {
    const [charges, setCharges] = useState<{ [key: string]: number }>({
      W: INITIAL_CHARGES,
      R: INITIAL_CHARGES,
      G: INITIAL_CHARGES,
      Y: INITIAL_CHARGES,
      O: INITIAL_CHARGES,
      B: INITIAL_CHARGES,
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
      if (!UNLIMITED_MODE && charges[colorChar] <= 0) return
      onColorSelect(colorChar)
    }

    return (
      <div className="flex flex-col gap-3 p-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg">
        {PALETTE_COLORS.map((color) => {
          const isSelected = selectedColor === color.char
          const chargesLeft = UNLIMITED_MODE ? '∞' : charges[color.char]
          const isAvailable = UNLIMITED_MODE || charges[color.char] > 0

          return (
            <div key={color.hex} className="relative flex flex-col items-center gap-1">
              <button
                onClick={() => handleColorClick(color.char)}
                disabled={!isAvailable}
                title={`${color.label} (${color.char}) - ${chargesLeft} left`}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed border-gray-600'
                    : isSelected
                    ? 'border-white/80 scale-110'
                    : 'border-white/30 hover:border-white/60 cursor-pointer hover:scale-105'
                }`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow: isSelected
                    ? `0 0 15px ${color.hex}80, 0 0 30px ${color.hex}40`
                    : `0 0 8px ${color.hex}40`
                }}
              />
              <span className={`text-xs font-bold ${
                color.char === 'W' ? 'text-gray-800' : 'text-white'
              }`}>
                {chargesLeft}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)

VerticalPalette.displayName = 'VerticalPalette'