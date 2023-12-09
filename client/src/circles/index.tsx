import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '@mui/material';

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

const VELOCITY_BOUND = 10;
const RANDOM_CIRCLES: ICircle[] = [];
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

const CirclesGame: React.FC = () => {
  const canvasRef = useRef(null);
  // const [circles, setCircles] = useState(START_CIRCLES);
  const [circles, setCircles] = useState(RANDOM_CIRCLES);
  const [hasCollided, setHasCollided] = useState(false);

  const frameRate = 120;

  const WINDOW_HEIGHT = window.innerHeight;
  const WINDOW_WIDTH = window.innerWidth;

  const updateCanvas = () => {
    if (canvasRef?.current) {
      console.log('here');
      const canvas: HTMLCanvasElement = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      const update = () => {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        let hasCollision = false;
        if (!hasCollided) {
          // Update and draw circles
          circles.forEach((circle, ind) => {
            // wall boundaries
            // make sure even if the circle is moving fast, it doesnt go through the wall and bounces off
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

            for (let otherInd = 0; otherInd < circles.length; ++otherInd) {
              if (otherInd >= ind) {
                break;
              }

              const otherCircle = circles[otherInd];
              const minDist = circle.radius + otherCircle.radius;
              const dist = Math.pow(
                Math.pow(circle.x - otherCircle.x, 2) + Math.pow(circle.y - otherCircle.y, 2),
                0.5
              );

              if (dist - minDist < 0) {
                hasCollision = true;
                circle.color = 'red';
                otherCircle.color = 'red';

                // rebounding
                [circle.vx, circle.vy, otherCircle.vx, otherCircle.vy] = [
                  otherCircle.vx,
                  otherCircle.vy,
                  circle.vx,
                  circle.vy,
                ];
              }
            }

            // Draw circle
            context.beginPath();
            context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            context.fillStyle = circle.color || '#808080';
            if (circle.color) {
              context.fillStyle = '#808080';
            }
            // if mouse clicks circle, glow red
            // if (hasCollided) {
            //   context.fillStyle = 'red';
            // }
            context.fill();
          });
        }

        // if (hasCollision) {
        //   setHasCollided(true);
        // setCircles(
        //   circles.map((c) => {
        //     return { ...c, vx: 0, vy: 0 };
        //   })
        // );
        // }

        // timer for the next tick
        setTimeout(() => {
          setCircles((prevCircles) => {
            return prevCircles.map((c) => {
              return {
                ...c,
                x: c.x + c.vx / frameRate,
                y: c.y + c.vy / frameRate,
              };
            });
          });
        }, 1000 / frameRate);

        // requestAnimationFrame(update);
      };
      update();
    }
  };

  useEffect(() => {
    // update();
  }, [circles]); // Re-run effect if circles state changes

  useEffect(() => {
    console.log('updating');
    updateCanvas();
  });

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={WINDOW_WIDTH} height={WINDOW_HEIGHT} style={{}} />;
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
