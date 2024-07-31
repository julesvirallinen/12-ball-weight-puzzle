"use client";

import styled from "styled-components";
import { FC, useState } from "react";

interface Ball {
  index: number;
  weight: number;
}

interface WeighingResult {
  balls: [Ball[], Ball[]];
  result: number;
}

const Balls = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledBall = styled.div<{ index: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 3rem;
  width: 3rem;
  height: 3rem;
  background-color: ${({ index }) => `hsl(${index * 30}, 50%, 50%)`};

  user-select: none; /* Standard syntax */
  cursor: pointer;
`;

const Scale = styled.div`
  display: flex;
  gap: 10px;
`;

const ScaleArea = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-wrap: wrap;
  width: 20rem;
  min-height: 3rem;
  border: 1px solid white;
  background-color: black;
  padding: 0.2rem;
  gap: 0.2rem;
  border-color: ${({ isSelected }) => (isSelected ? "red" : "white")};
`;

const StyledGame = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Ball: FC<{ ball: Ball; onClick?: () => void }> = ({ ball, ...rest }) => {
  return (
    <div>
      <StyledBall index={ball.index} {...rest}>
        {ball.index}
      </StyledBall>
    </div>
  );
};

const initBalls = () => {
  const randomBallIndex = Math.floor(Math.random() * 12) + 1;

  return Array.from({ length: 12 }, (_, i) => ({
    index: i + 1,
    weight: 0,
  })).map((ball) => ({
    ...ball,
    weight:
      ball.index === randomBallIndex ? (Math.random() > 0.5 ? 0.01 : -0.01) : 0,
  }));
};

export default function Home() {
  const [selectedScaleArea, setSelectedScaleArea] = useState<number | null>(
    null
  );
  const [ballsInScale, setBallsInScale] = useState<[Ball[], Ball[]]>([[], []]);
  const [results, setResults] = useState<WeighingResult[]>([]);
  const [balls] = useState(initBalls);
  const [isGuessCorrect, setIsGuessCorrect] = useState<boolean | null>(null);

  const onBallClick = (ball: Ball) => {
    if (selectedScaleArea === null) return;
    setBallsInScale((prev): [Ball[], Ball[]] => {
      const newBallsInScale: [Ball[], Ball[]] = [...prev];
      if (
        newBallsInScale[selectedScaleArea].some((b) => b.index === ball.index)
      ) {
        return newBallsInScale;
      }
      newBallsInScale[selectedScaleArea] = [
        ...newBallsInScale[selectedScaleArea],
        ball,
      ];
      return newBallsInScale;
    });
  };

  const onBallRemove = (ball: Ball) => {
    setBallsInScale((prev): [Ball[], Ball[]] => {
      return [
        prev[0].filter((b) => b.index !== ball.index),
        prev[1].filter((b) => b.index !== ball.index),
      ];
    });
  };

  const ballsNotInScale = balls.filter(
    (ball) =>
      !ballsInScale[0].some((b) => b.index == ball.index) &&
      !ballsInScale[1].some((b) => b.index == ball.index)
  );

  const onWeighClick = () => {
    const aWeight = ballsInScale[0].reduce((acc, ball) => {
      return acc + ball.weight;
    }, 0);
    const bWeight = ballsInScale[1].reduce((acc, ball) => {
      return acc + ball.weight;
    }, 0);

    setResults((prev) => [
      ...prev,
      {
        balls: ballsInScale,
        result: aWeight - bWeight,
      },
    ]);
    setBallsInScale([[], []]);
  };

  // @ts-expect-error
  const onFormSubmit = (e) => {
    e.preventDefault();
    const guessedBall = e.target[0].value;
    const guessedWeight = e.target[1].value;
    const fakeBall = balls.find((ball) => ball.index == guessedBall);
    if (!fakeBall) return;
    const isCorrect =
      (fakeBall.weight > 0 && guessedWeight === "heavier") ||
      (fakeBall.weight < 0 && guessedWeight === "lighter");
    setIsGuessCorrect(isCorrect);
  };

  return (
    <StyledGame>
      <Balls>
        {ballsNotInScale.map((ball) => (
          <Ball
            key={ball.index}
            ball={ball}
            onClick={() => onBallClick(ball)}
          />
        ))}
      </Balls>
      Click on a scale area to add balls, click balls to add to scale
      <Scale>
        <ScaleArea
          onClick={() => setSelectedScaleArea(0)}
          isSelected={selectedScaleArea === 0}
        >
          {ballsInScale[0].map((ball) => (
            <Ball
              key={ball.index}
              ball={ball}
              onClick={() => onBallRemove(ball)}
            />
          ))}
        </ScaleArea>
        <ScaleArea
          onClick={() => setSelectedScaleArea(1)}
          isSelected={selectedScaleArea === 1}
        >
          {ballsInScale[1].map((ball) => (
            <Ball
              key={ball.index}
              ball={ball}
              onClick={() => onBallRemove(ball)}
            />
          ))}
        </ScaleArea>
        <button onClick={() => onWeighClick()}>Weigh</button>
      </Scale>
      {results.length > 0 && (
        <>
          Previous results:
          {results.map((result, i) => (
            <div key={i}>
              <Scale>
                <ScaleArea isSelected={false}>
                  {result.balls[0].map((ball) => (
                    <Ball
                      key={ball.index}
                      ball={ball}
                      onClick={() => onBallClick(ball)}
                    />
                  ))}
                </ScaleArea>
                <>{result.result > 0 ? ">" : result.result < 0 ? "<" : "="}</>
                <ScaleArea isSelected={false}>
                  {result.balls[1].map((ball) => (
                    <Ball
                      key={ball.index}
                      ball={ball}
                      onClick={() => onBallClick(ball)}
                    />
                  ))}
                </ScaleArea>
              </Scale>
            </div>
          ))}
        </>
      )}
      {results.length > 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFormSubmit(e);
          }}
        >
          The fake ball is:
          <input type="number" />
          and it is
          <select>
            <option>heavier</option>
            <option>lighter</option>
          </select>
          <button type="submit">Submit</button>
        </form>
      )}
      {isGuessCorrect !== null && (
        <div>{isGuessCorrect ? "Correct!" : "Incorrect!"}</div>
      )}
    </StyledGame>
  );
}
