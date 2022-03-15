import { MutableRefObject, Ref, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { Subject } from "rxjs";

function MultiplayerBackground({
  xRange,
  yRange,
  guessObservable,
}: {
  xRange: number[];
  yRange: number[];
  guessObservable: MutableRefObject<Subject<{ x: number; y: number }>>;
}) {
  const canvasRef = useRef<fabric.StaticCanvas | undefined>(undefined);
  const starShape = [
    { x: 4, y: -2 },
    { x: 0, y: -2 },
    { x: 3.5, y: 1 },
    { x: 2, y: -4 },
    { x: 0.5, y: 1 },
  ];

  function clearCanvas() {
    canvasRef.current?.clear();
  }

  function resizeCanvas() {
    canvasRef.current?.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  useEffect(() => {
    canvasRef.current = new fabric.StaticCanvas("fabric-canvas");
    resizeCanvas();
  }, []);

  useEffect(() => {
    let subscription = guessObservable.current
      .asObservable()
      .subscribe((guess) => {
        console.log("got a new guess", guess);
        let left = mapToX(guess.x, canvasRef.current);
        let top = mapToY(guess.y, canvasRef.current);

        if (guess.x === 0 && guess.y === 0) {
          canvasRef.current?.add(
            new fabric.Polygon(starShape, {
              left: left,
              top: top,
              fill: "yellow",
              originX: "center",
              originY: "center",
              scaleX: 0,
              scaleY: 0,
              opacity: 0.25,
            })
              .animate("scaleX", 200, {
                duration: 1000,
              })
              .animate("scaleY", 200, {
                duration: 1000,
              })
              .animate("opacity", 0, {
                duration: 1000,
                onChange: canvasRef.current?.renderAll.bind(canvasRef.current),
              })
          );
        } else {
          console.log("time to draw a circle!", left, top, canvasRef.current);
          canvasRef.current?.add(
            new fabric.Circle({
              left: left,
              top: top,
              fill: "darkgreen",
              originX: "center",
              originY: "center",
              radius: 0,
              opacity: 1,
            })
              .animate("radius", 50, {
                duration: 1000,
              })
              .animate("opacity", 0, {
                duration: 1000,
                onChange: canvasRef.current?.renderAll.bind(canvasRef.current),
              })
          );
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [guessObservable, xRange, yRange, canvasRef]);

  useEffect(() => {
    window.addEventListener("mousedown", clearCanvas);
    window.addEventListener("touchstart", clearCanvas);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("mousedown", clearCanvas);
      window.removeEventListener("touchstart", clearCanvas);
    };
  }, [canvasRef]);

  function mapToX(position: number, canvas?: fabric.StaticCanvas) {
    return (
      ((position - xRange[0]) / (xRange[1] - xRange[0])) *
      (canvas?.getWidth() ?? 0)
    );
  }

  function mapToY(position: number, canvas?: fabric.StaticCanvas) {
    return (
      (1 - (position - yRange[0]) / (yRange[1] - yRange[0])) *
      (canvas?.getHeight() ?? 0)
    );
  }

  useEffect(() => {
    clearCanvas();
  }, [xRange, yRange]);

  return <canvas id="fabric-canvas" className="background-canvas" />;
}

export default MultiplayerBackground;
