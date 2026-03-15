
import { useState, useImperativeHandle, forwardRef } from 'react'

import { FC, useState, useImperativeHandle, forwardRef } from 'react'


interface ColorPaletteProps {
  selectedColor: string | null
  onColorSelect: (color: string) => void
}

interface ColorPaletteHandle {
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
 * ColorPalette - neon-themed color picker for cube stickers
 * mirrors the previous Palette component but is renamed here to
 * make its intent explicit for the "universal cube" requirement.
 */
export const ColorPalette = forwardRef<ColorPaletteHandle, ColorPaletteProps>(
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
      <div className="flex flex-col gap-2 p-3 bg-slate-900/80 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg">
        <div className="text-xs font-semibold text-white text-center mb-1">Colors</div>

        <div className="flex flex-col gap-2">
          {PALETTE_COLORS.map((color) => {
            const isSelected = selectedColor === color.char
            const chargesLeft = UNLIMITED_MODE ? '∞' : charges[color.char]
            const isAvailable = UNLIMITED_MODE || charges[color.char] > 0

            return (
              <button
                key={color.hex}
                onClick={() => handleColorClick(color.char)}
                disabled={!isAvailable}
                title={`${color.label} (${color.char}) - ${chargesLeft}`}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed border-gray-600'
                    : isSelected
                    ? 'border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-110'
                    : 'border-white/30 hover:border-white/60 cursor-pointer hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            )
          })}
        </div>
      </div>
    )
  }
)

ColorPalette.displayName = 'ColorPalette'
