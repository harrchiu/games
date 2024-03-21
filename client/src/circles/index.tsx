import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, IconButtonClassKey } from '@mui/material';
import { Stage, Layer, Circle } from 'react-konva';

type ICircle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color?: string;
};
const START_CIRCLES: ICircle[] = [
  {
    x: 100,
    y: 550,
    radius: 10,
    vx: 1000,
    vy: 0,
  },
  {
    x: 500,
    y: 550,
    radius: 20,
    vx: 0,
    vy: 0,
  },
  {
    x: 800,
    y: 550,
    radius: 20,
    vx: 0,
    vy: 0,
  },
];

const VELOCITY_BOUND = 1000;
const RANDOM_CIRCLES: ICircle[] = [];
const FRAME_RATE = 60;
for (let i = 0; i < 10; ++i) {
  // make sure it doesnt overlap an existing circle
  let newCircle: ICircle;
  do {
    const radius = 10 + Math.random() * 50;
    newCircle = {
      // make sure it doesnt fall out of bounds
      x: radius + Math.random() * (window.innerWidth - 2 * radius),
      y: radius + Math.random() * (window.innerHeight - 2 * radius),
      radius: radius,
      vx: -VELOCITY_BOUND + Math.random() * VELOCITY_BOUND * 2,
      vy: -VELOCITY_BOUND + Math.random() * VELOCITY_BOUND * 2,
    };
  } while (
    RANDOM_CIRCLES.some((c) => {
      const dist = Math.pow(Math.pow(c.x - newCircle.x, 2) + Math.pow(c.y - newCircle.y, 2), 0.5);
      return dist < c.radius + newCircle.radius;
    })
  );
  RANDOM_CIRCLES.push(newCircle);
}

const CanvasComponent: React.FC<{
  circles: ICircle[];
  setCircles: React.Dispatch<React.SetStateAction<ICircle[]>>;
}> = ({ circles, setCircles }) => {
  const WINDOW_HEIGHT = window.innerHeight;
  const WINDOW_WIDTH = window.innerWidth;

  useEffect(() => {
    let animationFrameId: any;

    const update = () => {
      console.log('new update');

      const newCircles = circles.map((c) => ({ ...c }));
      newCircles.forEach((circle, ind) => {
        // wall boundaries
        if (circle.x - circle.radius < 0) {
          circle.x = circle.radius;
          circle.vx = -circle.vx;
        }
        if (circle.x + circle.radius > WINDOW_WIDTH) {
          circle.x = WINDOW_WIDTH - circle.radius;
          circle.vx = -circle.vx;
        }
        if (circle.y - circle.radius < 0) {
          circle.y = circle.radius;
          circle.vy = -circle.vy;
        }
        if (circle.y + circle.radius > WINDOW_HEIGHT) {
          circle.y = WINDOW_HEIGHT - circle.radius;
          circle.vy = -circle.vy;
        }

        // collisions
        // for (let otherInd = 0; otherInd < circles.length; ++otherInd) {
        //   if (otherInd >= ind) {
        //     break;
        //   }

        //   const otherCircle = newCircles[otherInd];
        //   const minDist = circle.radius + otherCircle.radius;
        //   const dist = Math.pow(
        //     Math.pow(circle.x - otherCircle.x, 2) + Math.pow(circle.y - otherCircle.y, 2),
        //     0.5
        //   );

        //   if (dist - minDist < 0) {
        //     circle.color = 'red';
        //     otherCircle.color = 'red';

        //     // rebounding
        //     [circle.vx, circle.vy, otherCircle.vx, otherCircle.vy] = [
        //       otherCircle.vx,
        //       otherCircle.vy,
        //       circle.vx,
        //       circle.vy,
        //     ];
        //   }
        // }
      });

      setCircles(newCircles);

      // set timeout for next frame
      animationFrameId = requestAnimationFrame(update);
      setTimeout(() => {
        setCircles((prevCircles) => {
          return prevCircles.map((c) => {
            return {
              ...c,
              x: c.x + c.vx / FRAME_RATE,
              y: c.y + c.vy / FRAME_RATE,
            };
          });
        });
      }, 1000 / FRAME_RATE);
    };

    update();

    // Clean up function
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {circles.map((circle, index) => (
          <Circle
            key={index}
            x={circle.x}
            y={circle.y}
            radius={circle.radius}
            fill={circle.color || '#808080'}
          />
        ))}
      </Layer>
    </Stage>
  );
};

const CirclesGame: React.FC = () => {
  // const [circles, setCircles] = useState(START_CIRCLES);
  const [circles, setCircles] = useState(RANDOM_CIRCLES);
  const canvasRef = useRef(null);
  const [hasCollided, setHasCollided] = useState(false);

  const frameRate = 120;

  const WINDOW_HEIGHT = window.innerHeight;
  const WINDOW_WIDTH = window.innerWidth;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <CanvasComponent circles={circles} setCircles={setCircles} />
      {/* <canvas ref={canvasRef} width={WINDOW_WIDTH} height={WINDOW_HEIGHT} style={{}} />; */}
    </div>
  );
};

const Page = styled.div<{ rgb: string }>`
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.rgb};
  height: 100%;
`;

const SliderSection = styled.div`
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ColorSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  font-size: 40px;
`;

const SubmitButton = styled(Button)`
  margin-top: 30px;
  font-size: 18px;
  border-radius: 10px;
  padding: 5px 20px;
`;

export default CirclesGame;
