import React, { useMemo } from 'react'
import classNames from 'classnames'

interface ProgressTimelineProps {
  steps: string[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  const timelineItems = useMemo(() => {
    return steps.map((step, idx) => ({
      index: idx,
      label: step,
      isActive: idx === currentStep,
      isCompleted: idx < currentStep,
    }))
  }, [steps, currentStep])

  return (
    <div className="glass-panel h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="neon-text text-xl font-bold">Progress Timeline</h2>
        <p className="text-sm text-gray-400 mt-1">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          {timelineItems.map((item, idx) => (
            <div
              key={item.index}
              className="relative"
              onClick={() => onStepClick?.(item.index)}
              role="button"
              tabIndex={0}
            >
              {/* Connector Line */}
              {idx < timelineItems.length - 1 && (
                <div className={classNames(
                  'absolute left-3 top-8 w-0.5 h-6 transition-all duration-300',
                  item.isCompleted ? 'bg-gradient-to-b from-neon-cyan to-neon-purple' : 'bg-gray-600'
                )} />
              )}

              {/* Timeline Item */}
              <div className="flex items-center gap-4 cursor-pointer group">
                {/* Dot */}
                <div className={classNames(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10',
                  item.isActive
                    ? 'bg-neon-cyan ring-4 ring-neon-cyan/30 shadow-glow'
                    : item.isCompleted
                      ? 'bg-neon-purple ring-2 ring-neon-purple/30'
                      : 'bg-gray-700 ring-1 ring-gray-600',
                  'group-hover:scale-110'
                )}>
                  {item.isCompleted && item.index !== item.index && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>

                {/* Content */}
                <div className={classNames(
                  'flex-1 py-2 px-3 rounded transition-all duration-300',
                  item.isActive
                    ? 'bg-neon-cyan/10 border border-neon-cyan/30'
                    : item.isCompleted
                      ? 'bg-neon-purple/5 border border-neon-purple/20'
                      : 'border border-transparent hover:border-gray-700'
                )}>
                  <p className={classNames(
                    'text-sm font-mono font-semibold transition-colors duration-300',
                    item.isActive
                      ? 'text-neon-cyan'
                      : item.isCompleted
                        ? 'text-neon-purple'
                        : 'text-gray-400'
                  )}>
                    {item.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-white/10 px-6 py-4 bg-white/5">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>Completed: {currentStep}</div>
          <div>Remaining: {steps.length - currentStep - 1}</div>
        </div>
      </div>
    </div>
  )
}
