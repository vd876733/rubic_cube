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
      <div className="flex flex-col gap-3 p-4 bg-slate-900/50 border border-white/10 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold text-white">Paint Colors</div>
          {UNLIMITED_MODE && (<span className="text-xs text-yellow-400">∞ Unlimited</span>)}
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
                style={{ backgroundColor: color.hex }}
              >
                <span className="text-xs font-bold" style={{ color: color.char === 'W' ? '#000' : '#fff' }}>
                  {color.char}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: color.char === 'W' ? '#000' : '#fff' }}>
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

ColorPalette.displayName = 'ColorPalette'
