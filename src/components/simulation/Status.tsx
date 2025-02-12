import Player from "src/snake/player";
import React, { useEffect, useRef } from "react";
import { GameStatus } from "../../constants";

type StatusProps = {
  currentGeneration: number;
  aliveCount: number;
  populationSize: number;
  networkPlayer: Player;
  score: number;
  bestScore: number;
  gameStatus: GameStatus;
  humanPlaying: boolean;
  trainedGenerations: number;
  targetGeneration: number;
};

const Status: React.FC<StatusProps> = ({
  currentGeneration,
  aliveCount,
  populationSize,
  networkPlayer,
  score,
  bestScore,
  gameStatus,
  humanPlaying,
  trainedGenerations,
  targetGeneration,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && networkPlayer.genome.network) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      // console.log(canvas.width, canvas.height);
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
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const layers: { [key: number]: any[] } = {};
    genome.network.forEach((node: any) => {
      if (!layers[node.layer]) {
        layers[node.layer] = [];
      }
      layers[node.layer].push(node);
    });

    const layerCount = Object.keys(layers).length;

    // 415 668
    const nodeRadius = (22 / 668) * canvas.height;
    let xDiff = (150 / 415) * canvas.width * 2;
    if (layerCount > 2) {
      xDiff /= layerCount - 1;
    }
    const yDiff = (50 / 668) * canvas.height;
    const xOffset = (50 / 415) * canvas.height;
    const yOffset = yDiff * 6.5;

    // Object.keys(layers).forEach((layer: any) => {
    //   console.log(`Layer ${layer}: ${layers[layer].length} nodes`);
    // });

    const nodePositions: Map<any, { x: number; y: number }> = new Map();
    Object.keys(layers).forEach((layer: any) => {
      const layerIndex = parseInt(layer, 10);
      layers[layer].forEach((node: any, nodeIndex: number) => {
        const y = nodeIndex % 2 === 0 ? nodeIndex / 2 : -(nodeIndex + 1) / 2;
        nodePositions.set(node, {
          x: layerIndex * xDiff + xOffset,
          y: y * yDiff + yOffset,
        });
      });
    });

    genome.connections.forEach((connection: any) => {
      const inputPos = nodePositions.get(connection.input);
      const outputPos = nodePositions.get(connection.output);

      if (!inputPos || !outputPos) return;
      ctx.beginPath();
      ctx.moveTo(inputPos.x, inputPos.y);
      ctx.lineTo(outputPos.x, outputPos.y);
      ctx.strokeStyle = `rgba(128, 0, 128, ${Math.abs(connection.weight)})`; // bg-purple-700 color
      ctx.lineWidth = Math.max(5 * Math.abs(connection.weight), 1);
      ctx.stroke();
    });

    nodePositions.forEach((pos, node) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI, false);
      let label = "";
      if (node.id < genome.inputs) {
        ctx.fillStyle = "green"; // Inputs
        label = "Input";
      } else if (
        node.id >= genome.inputs &&
        node.id < genome.inputs + genome.outputs
      ) {
        ctx.fillStyle = "red"; // Outputs
        label = "Output";
      } else if (node.id === genome.inputs + genome.outputs) {
        ctx.fillStyle = "gray"; // Bias
        label = "Bias";
      } else {
        ctx.fillStyle = "blue"; // Extra nodes
      }
      ctx.fill();
      ctx.fillStyle = "white"; // Label color
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
