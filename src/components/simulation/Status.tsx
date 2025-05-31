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
    <div className="mt-10 flex h-full flex-col items-center text-center text-3xl text-white">
      {humanPlaying ? (
        <div className="mt-10 space-y-2">
          <div>Score: {score}</div>
        </div>
      ) : (
        <>
          <div className="mb-5 space-y-2">
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
          <hr className="mb-3 w-4/5 border-t-2 border-white" />
          <div>Neural Network</div>
          <canvas ref={canvasRef} className="mt-3 h-3/4 w-full" />
        </>
      )}
    </div>
  );
};

export default Status;
