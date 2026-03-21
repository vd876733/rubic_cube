import { FC, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';

// FIX: Added opening brace and proper semicolons
interface AlgorithmDetailsProps {
  moves: string[];
  currentMoveIndex: number;
  steps?: any[];
  cubeRefs?: React.RefObject<{ mirrorCube: any; instructorCube: any }>;
  onMoveClick?: (index: number) => void;
}

/**
 * AlgorithmDetails - Displays the solution steps and handles twin animations
 */
export const AlgorithmDetails: FC<AlgorithmDetailsProps> = ({
  moves,
  currentMoveIndex,
  steps = [],
  cubeRefs,
  onMoveClick,
}) => {
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const moveAnimationRef = useRef<Promise<void> | null>(null);

  /**
   * Animate BOTH cubes for a specific step to maintain the Universal Standard
   */
  const animateStep = useCallback(
    async (stepIndex: number) => {
      // Ensure both twins exist before animating
      if (stepIndex >= steps.length || !cubeRefs?.current) {
        return;
      }

      const { mirrorCube, instructorCube } = cubeRefs.current;
      const step = steps[stepIndex];
      
      if (!step || !mirrorCube || !instructorCube) return;

      const duration = 0.6; // Speed for a smooth 90-degree turn

      try {
        // Sync Logic: Animate both cubes simultaneously using Promise.all
        await Promise.all([
          instructorCube.rotateCube(step.rotationAxis, step.rotationAmount, duration),
          mirrorCube.rotateCube(step.rotationAxis, step.rotationAmount, duration)
        ]);

        // Trigger visual highlight on the face that moved
        instructorCube.blinkFace(step.faceIndex, 0.4);
        mirrorCube.blinkFace(step.faceIndex, 0.4);

        moveAnimationRef.current = null;
      } catch (error) {
        console.error('Animation error:', error);
        moveAnimationRef.current = null;
      }
    },
    [steps, cubeRefs]
  );

  useEffect(() => {
    if (moveAnimationRef.current) return;

    if (currentMoveIndex < steps.length) {
      const promise = animateStep(currentMoveIndex);
      moveAnimationRef.current = promise;
    }
  }, [currentMoveIndex, steps, animateStep]);

  const handleMoveClick = (index: number) => {
    if (onMoveClick) onMoveClick(index);
  };

  if (moves.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 bg-slate-950/50 rounded-lg border border-white/10">
        <p>No solution algorithm loaded. Solve a cube to begin.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-lg">
      <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white">Solution Steps</h2>
        <p className="text-sm text-gray-400 mt-1">
          <span className="text-cyan-400">{moves.length}</span> moves | 
          <span className="text-purple-400 ml-2">Step {currentMoveIndex + 1}</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {moves.map((move, index) => (
          <div
            key={index}
            onClick={() => handleMoveClick(index)}
            className={`p-3 rounded-lg cursor-pointer transition-all border ${
              index === currentMoveIndex
                ? 'bg-purple-500/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900/30 border-white/5 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-mono font-bold text-lg">{move}</span>
              <span className="text-gray-500 font-mono text-xs">#{index + 1}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-white/10 bg-slate-900/50">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentMoveIndex + 1) / moves.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${((currentMoveIndex + 1) / moves.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
