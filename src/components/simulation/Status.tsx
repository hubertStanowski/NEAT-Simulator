import { useEffect, useRef } from "react";
import { GameStatus } from "../../constants";
import { useSimulation } from "../../contexts/SimulationContext";

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
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawNetwork(ctx, networkPlayer.genome, canvas);
      }
    }
  }, [networkPlayer]);

  const drawNetwork = (
    ctx: CanvasRenderingContext2D,
    genome: any,
    canvas: HTMLCanvasElement,
  ) => {
    if (!genome.network) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // group nodes by layer
    const layers: Record<number, any[]> = {};
    genome.network.forEach((node: any) => {
      layers[node.layer] ||= [];
      layers[node.layer].push(node);
    });

    const layerCount = Object.keys(layers).length;
    const nodeRadius = (22 / 668) * canvas.height;
    let xDiff = (150 / 415) * canvas.width * 2;
    if (layerCount > 2) xDiff /= layerCount - 1;
    const yDiff = (50 / 668) * canvas.height;
    const xOffset = (50 / 415) * canvas.height;
    const yOffset = yDiff * 6.5;

    const nodePositions = new Map<any, { x: number; y: number }>();
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
    genome.connections.forEach((c: any) => {
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
      let label = "";
      if (node.id < genome.inputs) {
        ctx.fillStyle = "green";
        label = "Input";
      } else if (node.id < genome.inputs + genome.outputs) {
        ctx.fillStyle = "red";
        label = "Output";
      } else if (node.id === genome.inputs + genome.outputs) {
        ctx.fillStyle = "gray";
        label = "Bias";
      } else {
        ctx.fillStyle = "blue";
      }
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, pos.x, pos.y);
    });
  };

  return (
    <div className="flex h-full flex-col items-center py-[clamp(1rem,2vh,1.5rem)] text-center text-[clamp(0.875rem,2vh,1.25rem)] text-white">
      {humanPlaying ? (
        <div className="space-y-[clamp(0.25rem,1vh,0.75rem)]">
          <div>Score: {score}</div>
        </div>
      ) : (
        <>
          <div className="mb-[clamp(0.75rem,2vh,1.5rem)] space-y-[clamp(0.25rem,1vh,0.75rem)]">
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
            {(gameStatus === GameStatus.Training ||
              gameStatus === GameStatus.Stopped) &&
              trainedGenerations < targetGeneration && (
                <div>
                  Alive: {aliveCount} / {populationSize}
                </div>
              )}
          </div>
          <hr className="mb-[clamp(0.5rem,1.5vh,1rem)] w-4/5 border-t-2 border-white" />
          <div className="mb-[clamp(0.5rem,1vh,0.75rem)]">Neural Network</div>
          <canvas
            ref={canvasRef}
            className="h-[clamp(300px,60vh,600px)] w-full"
          />
        </>
      )}
    </div>
  );
};

export default Status;
