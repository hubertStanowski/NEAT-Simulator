import { useEffect, useRef } from 'react';
import { GameStatus } from '@/types';
import { useSimulation } from '@/contexts';
import type { Genome, NodeGene, ConnectionGene } from '@/neat';

const Status = () => {
  const {
    humanPlaying,
    score,
    bestScore,
    gameStatus,
    trainedGenerations,
    targetGeneration,
    currentGeneration,
    aliveCount,
    populationSize,
    networkPlayer,
  } = useSimulation();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && networkPlayer.genome.network) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawNetwork(ctx, networkPlayer.genome, canvas);
      }
    }
  }, [networkPlayer]);

  const drawNetwork = (
    ctx: CanvasRenderingContext2D,
    genome: Genome,
    canvas: HTMLCanvasElement
  ) => {
    if (!genome.network) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // group nodes by layer
    const layers: Record<number, NodeGene[]> = {};
    genome.network.forEach((node: NodeGene) => {
      layers[node.layer] ||= [];
      layers[node.layer].push(node);
    });

    const layerCount = Object.keys(layers).length;
    const nodeRadius = (22 / 800) * canvas.height;
    let xDiff = (150 / 415) * canvas.width * 2;
    if (layerCount > 2) xDiff /= layerCount - 1;
    const yDiff = (50 / 800) * canvas.height;
    const xOffset = (50 / 415) * canvas.height;
    const yOffset = yDiff * 8;

    const nodePositions = new Map<NodeGene, { x: number; y: number }>();
    Object.entries(layers).forEach(([layer, nodes]) => {
      const layerIndex = +layer;
      nodes.forEach((node, i) => {
        const y = i % 2 === 0 ? i / 2 : -(i + 1) / 2;
        nodePositions.set(node, {
          x: layerIndex * xDiff + xOffset,
          y: y * yDiff + yOffset,
        });
      });
    });

    // draw connections
    genome.connections.forEach((c: ConnectionGene) => {
      const inPos = nodePositions.get(c.input);
      const outPos = nodePositions.get(c.output);
      if (!inPos || !outPos) return;
      ctx.beginPath();
      ctx.moveTo(inPos.x, inPos.y);
      ctx.lineTo(outPos.x, outPos.y);
      ctx.strokeStyle = `rgba(128,0,128,${Math.abs(c.weight)})`;
      ctx.lineWidth = Math.max(5 * Math.abs(c.weight), 1);
      ctx.stroke();
    });

    // draw nodes
    nodePositions.forEach((pos, node) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      let label = '';
      if (node.id < genome.inputs) {
        ctx.fillStyle = 'green';
        label = 'Input';
      } else if (node.id < genome.inputs + genome.outputs) {
        ctx.fillStyle = 'red';
        label = 'Output';
      } else if (node.id === genome.inputs + genome.outputs) {
        ctx.fillStyle = 'gray';
        label = 'Bias';
      } else {
        ctx.fillStyle = 'blue';
      }
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pos.x, pos.y);
    });
  };

  return (
    <div
      className={`flex h-full flex-col items-center text-center text-[clamp(0.875rem,2vh,1.25rem)] text-white ${
        humanPlaying
          ? 'justify-start'
          : 'justify-center py-[clamp(1rem,2vh,1.5rem)]'
      }`}
    >
      {humanPlaying ? (
        <>
          <div className="flex-[1]"></div>
          <div className="flex flex-[2] flex-col justify-start space-y-[clamp(0.25rem,1vh,0.75rem)]">
            <div className="text-3xl">Score: {score}</div>
            <div className="text-3xl text-purple-700">
              AI Generations: {currentGeneration}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-[clamp(0.75rem,2vh,1.5rem)] space-y-[clamp(0.25rem,1vh,0.75rem)] text-xl">
            {(gameStatus === GameStatus.Training ||
              gameStatus === GameStatus.Stopped) &&
            trainedGenerations < targetGeneration ? (
              <div>
                Score: {score} / {bestScore}
              </div>
            ) : (
              <div>Score: {score}</div>
            )}
            <div>Generation: {currentGeneration}</div>

            {/* Always allocate space for alive count, but hide when not needed */}
            <div
              className={`${
                !humanPlaying &&
                (gameStatus === GameStatus.Training ||
                  gameStatus === GameStatus.Stopped) &&
                trainedGenerations < targetGeneration
                  ? 'visible'
                  : 'invisible'
              }`}
            >
              Alive: {aliveCount} / {populationSize}
            </div>
          </div>

          {/* Always render the HR and neural network section, but hide when humanPlaying */}
          <div
            className={`${!humanPlaying ? 'visible' : 'invisible'} flex w-full flex-col items-center`}
          >
            <hr className="mb-[clamp(0.5rem,1.5vh,1rem)] w-4/5 border-t-2 border-white" />
            <div className="mb-[clamp(0.5rem,1vh,0.75rem)]">Neural Network</div>
            <canvas
              ref={canvasRef}
              className="h-[clamp(350px,65vh,650px)] w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Status;
