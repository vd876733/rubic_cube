import React, { useState } from 'react'
import classNames from 'classnames'

interface ControlPanelProps {
  isLoading: boolean
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  onSolve: () => void
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onNext: () => void
  onPrevious: () => void
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isLoading,
  isPlaying,
  currentStep,
  totalSteps,
  onSolve,
  onPlay,
  onPause,
  onReset,
  onNext,
  onPrevious,
}) => {
  const [isCubeInputOpen, setIsCubeInputOpen] = useState(false)

  const Button = ({
    onClick,
    disabled = false,
    variant = 'primary',
    children,
    className = '',
  }: {
    onClick: () => void
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'danger'
    children: React.ReactNode
    className?: string
  }) => {
    const variants = {
      primary: 'bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-glow',
      secondary: 'bg-gray-700 hover:bg-gray-600',
      danger: 'bg-gradient-to-r from-pink-600 to-red-600 hover:shadow-pink',
    }

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={classNames(
          'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          'text-white',
          className
        )}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Solve Section */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="neon-text text-lg font-bold">Solver Control</h3>

        <div className="space-y-2">
          <button
            onClick={() => setIsCubeInputOpen(!isCubeInputOpen)}
            className="w-full px-4 py-2 text-left text-sm font-semibold bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isCubeInputOpen ? '▼' : '▶'} Input Cube State
          </button>

          {isCubeInputOpen && (
            <div className="p-3 bg-black/30 rounded-lg space-y-2 border border-white/10">
              <textarea
                placeholder="Paste 54-character cube state..."
                className="w-full h-24 p-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-100 focus:border-neon-cyan focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                Format: 9 chars each for W, Y, B, G, R, O faces
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={onSolve}
          disabled={isLoading}
          className="w-full"
          variant="primary"
        >
          {isLoading ? '🔄 Solving...' : '🎯 Solve Cube'}
        </Button>
      </div>

      {/* Playback Control */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="neon-text text-lg font-bold">Playback Control</h3>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Step {currentStep + 1}</span>
            <span>{totalSteps} total</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
              style={{
                width: totalSteps > 0 ? `${((currentStep + 1) / totalSteps) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Control buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onPrevious}
            disabled={currentStep === 0}
            variant="secondary"
          >
            ⏮ Previous
          </Button>
          <Button
            onClick={isPlaying ? onPause : onPlay}
            disabled={totalSteps === 0}
            variant="primary"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Button>
        </div>

        <Button
          onClick={onReset}
          disabled={totalSteps === 0}
          variant="secondary"
          className="w-full"
        >
          🔁 Reset
        </Button>
      </div>

      {/* Stats */}
      <div className="glass-panel p-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neon-cyan">
              {totalSteps}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total Moves</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neon-purple">
              {Math.max(0, totalSteps - currentStep - 1)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  )
}
