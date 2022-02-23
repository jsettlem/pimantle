import React, { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import wordList from "./data/word_list.json";
import { getFloat16 } from "@petamoriken/float16";
import Plot, { Figure } from "react-plotly.js";
import GuessEntry from "./GuessEntry";
// @ts-ignore
import Plotly from "plotly.js-gl2d-dist-min";
import PlotContainer from "./PlotContainer";

export type Word = {
  index: number;
  rank: number;
  word: string;
  similarity: number;
  frequency: number;
  x: number;
  y: number;
  guessIndex?: number;
};

function App() {
  let [todaysPuzzle, setTodaysPuzzle] = useState<string>("?");
  let [secret, setSecret] = useState<Word>();
  let [xValues, setXValues] = useState<number[]>([]);
  let [yValues, setYValues] = useState<number[]>([]);
  let [guesses, setGuesses] = useState<Word[]>([]);
  let [puzzleSolved, setPuzzleSolved] = useState<boolean>(false);
  let [plotCenter, setPlotCenter] = useState<number[]>([0, 0]);
  let [mostRecentGuess, setMostRecentGuess] = useState<Word | undefined>(
    undefined
  );
  let hoverEnabled = useRef<boolean>(true);

  const scroller = useRef<HTMLDivElement>(null);

  let [parsedWords, setParsedWords] = useState<Word[]>([]);

  let [plotState, setPlotState] = useState<Figure>({
    data: [],
    layout: {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
        pad: 500,
      },
      xaxis: {
        autorange: false,
        showgrid: false,
        showticklabels: false,
        zerolinecolor: "rgba(255,255,255,0.1)",
        range: [-1, 1],
      },
      yaxis: {
        autorange: false,
        showgrid: false,
        showticklabels: false,
        // scaleanchor: "x",
        constraintoward: "center",
        zerolinecolor: "rgba(255,255,255,0.1)",
        range: [-1, 1],
      },
      dragmode: "pan",
      showlegend: false,
      uirevision: 1,
      transition: {
        duration: 0,
        easing: "linear",
      },
    },
    frames: [],
  });

  let [dataRevision, setDataRevision] = useState<number>(0);

  function handleResize() {
    centerPlot();
  }

  function enableHover() {
    console.log("enable hover");
    hoverEnabled.current = true;
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", enableHover);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", enableHover);
    };
  }, [parsedWords]);

  useEffect(() => {
    let newPuzzleNumber = "1";
    setTodaysPuzzle("1");
    window
      .fetch(`/secret_words/secret_word_${newPuzzleNumber}.bin`, {
        cache: "force-cache",
      })
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        let dataView = new DataView(buffer);
        let offset = 4;
        let parsedWords: Word[] = [];
        let rank = 0;
        while (offset < buffer.byteLength) {
          let index = dataView.getUint32(offset, true);
          offset += 4;
          let x = dataView.getFloat32(offset, true);
          offset += 4;
          let y = dataView.getFloat32(offset, true);
          offset += 4;
          let similarity = getFloat16(dataView, offset, true) * 100;
          offset += 2;
          parsedWords.push({
            index: index,
            word: wordList[index][0] as string,
            frequency: wordList[index][1] as number,
            similarity: similarity,
            x: x,
            y: y,
            rank: rank,
          });
          rank++;
        }
        setSecret(parsedWords[0]);
        let newXValues = parsedWords.map((word) => word.x);
        setXValues(newXValues);
        let newYValues = parsedWords.map((word) => word.y);
        setYValues(newYValues);
        setPlotState((prevState: Figure) => ({
          ...prevState,
          data: [
            {
              x: newXValues,
              y: newYValues,
              mode: "markers",
              type: "scattergl",
              marker: {
                color: "darkblue",
                opacity: 0.8,
                // color: parsedWords.map((w) => Math.floor(w.rank / 100)),
                // color: parsedWords.map(
                //   (word) => word.rank / parsedWords.length
                // ),
              },
              hoverinfo: "skip",
            },
            {
              x: [parsedWords[0].x],
              y: [parsedWords[0].y],
              mode: "markers",
              type: "scatter",
              marker: {
                color: "yellow",
                size: 15,
                symbol: "star",
              },
              hovertemplate: "<b>Secret word</b><extra></extra>",
              hoverlabel: {
                font: {
                  family: "var(--body-font)",
                },
              },
            },
            {
              x: [],
              y: [],
              customdata: [],
              text: [],
              mode: "markers",
              type: "scatter",
              marker: {
                color: [],
                cmin: 0,
                cmid: 1000,
                cmax: parsedWords.length,
                size: 10,
                colorscale: "Portland",
                reversescale: true,
              },
              hoverlabel: {
                font: {
                  family: "var(--body-font)",
                },
              },
              hovertemplate:
                "<b>%{text}</b><br><br>Similarity: %{customdata[0]}<br>Rank: %{customdata[1]}<br>Your guess: %{customdata[2]}<extra></extra>",
            },
          ],
        }));
        setParsedWords(parsedWords);
      });
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current?.scrollHeight,
    });
    hoverEnabled.current = false;
    setTimeout(() => {
      if (mostRecentGuess) {
        // @ts-ignore
        Plotly.Fx.hover("plot-div", [
          {
            curveNumber: 2,
            pointNumber: Math.max((mostRecentGuess?.guessIndex || 0) - 1, 0),
          },
        ]);
      }
    }, 100); //stupid race condition?
  }, [mostRecentGuess]);

  useEffect(() => {
    setDataRevision((old) => old + 1);
    console.log(plotState);
  }, [plotState]);

  function checkGuess(guess: string): Word | undefined {
    return parsedWords.find((word) => word.word === guess);
  }

  function submitGuess(guess: FormEvent<HTMLFormElement>) {
    guess.preventDefault();
    let newGuess = guess.currentTarget.guess.value.toLowerCase();
    let result = checkGuess(newGuess);
    if (result !== undefined) {
      let previousGuess = guesses.find(
        (oldGuess) => oldGuess.word === newGuess
      );

      if (!previousGuess) {
        let newGuessObject = {
          ...(result as Word),
          guessIndex: guesses.length + 1,
        };
        setMostRecentGuess(newGuessObject);
        setGuesses((old) => {
          return [...old, newGuessObject].sort((a, b) => b.rank - a.rank);
        });

        let [xRange, yRange] = getAxisRange(newGuessObject);

        setPlotState((prevState: any) => ({
          ...prevState,
          layout: {
            ...prevState.layout,
            xaxis: {
              ...prevState.layout.xaxis,
              range: xRange,
            },
            yaxis: {
              ...prevState.layout.yaxis,
              range: yRange,
            },
            uirevision: prevState.layout.uirevision + 1,
          },
          data: [
            prevState.data[0],
            prevState.data[1],
            {
              ...prevState.data[2],
              x: [...prevState.data[2].x, result!.x],
              y: [...prevState.data[2].y, result!.y],
              customdata: [
                ...prevState.data[2].customdata,
                [
                  result!.similarity.toFixed(2),
                  result!.rank,
                  guesses.length + 1,
                ],
              ],
              text: [...prevState.data[2].text, result!.word],
              marker: {
                ...prevState.data[2].marker,
                color: [...prevState.data[2].marker.color, result!.rank],
              },
            },
          ],
        }));
        if (newGuessObject.rank === 0) {
          setPuzzleSolved(true);
        }
      } else {
        setMostRecentGuess(previousGuess);
        centerPlot(previousGuess);
      }
    }
    guess.currentTarget.guess.value = "";
  }

  function getAxisRange(target: Word): number[][] {
    console.log("target", target);
    let plotBounds = document
      .getElementById("plot-div")
      ?.getBoundingClientRect();
    let safeBounds = document
      .getElementsByClassName("safe-container")?.[0]
      ?.getBoundingClientRect();

    let bufferSize = 1.5;

    console.log(plotBounds, safeBounds);

    if (plotBounds === undefined || safeBounds === undefined) {
      return [
        [-1, 1],
        [-1, 1],
      ];
    }

    let plotWidth = Math.max(plotBounds.width, 1);
    let plotHeight = Math.max(plotBounds.height, 1);

    let safeLeftMargin = (safeBounds.left - plotBounds.left) / plotWidth;
    let safeRightMargin = (plotBounds.right - safeBounds.right) / plotWidth;
    let safeTopMargin = (safeBounds.top - plotBounds.top) / plotHeight;
    let safeBottomMargin = (plotBounds.bottom - safeBounds.bottom) / plotHeight;

    let safeWidth = Math.max(1 - safeLeftMargin - safeRightMargin, 0.001);
    let safeHeight = Math.max(1 - safeTopMargin - safeBottomMargin, 0.001);

    let plotCenterX = (safeLeftMargin + (1 - safeRightMargin)) / 2;
    let plotCenterY = (safeTopMargin + (1 - safeBottomMargin)) / 2;

    setPlotCenter([plotCenterX, plotCenterY]);

    let rangeNeeded = Math.max(
      Math.sqrt(target.x * target.x + target.y * target.y) * bufferSize,
      0.05
    );

    let yAxisRange: number;
    let xAxisRange: number;

    if (plotHeight * safeHeight < plotWidth * safeWidth) {
      yAxisRange = rangeNeeded * 2 + rangeNeeded * 2 * (1 - safeHeight);
      xAxisRange = yAxisRange * (plotWidth / plotHeight);
    } else {
      xAxisRange = rangeNeeded * 2 + rangeNeeded * 2 * (1 - safeWidth);
      yAxisRange = xAxisRange * (plotHeight / plotWidth);
    }

    return [
      [-xAxisRange * plotCenterX, xAxisRange * (1 - plotCenterX)],
      [-yAxisRange * (1 - plotCenterY), yAxisRange * plotCenterY],
    ];
  }

  function centerPlot(on?: Word) {
    if (parsedWords) {
      let [xRange, yRange] = getAxisRange(
        on ? on : parsedWords[Math.floor(parsedWords.length / 2)]
      );

      setPlotState((prevState: any) => ({
        ...prevState,
        layout: {
          ...prevState.layout,
          xaxis: {
            ...prevState.layout.xaxis,
            range: xRange,
          },
          yaxis: {
            ...prevState.layout.yaxis,
            range: yRange,
          },
          uirevision: prevState.layout.uirevision + 1,
        },
      }));
    }
  }

  return (
    <div className="App">
      <div className="header">Pimantle #{todaysPuzzle}</div>
      {parsedWords.length > 0 && (
        <div className="game-container">
          <div className="layout-container">
            <div className="guess-container">
              {mostRecentGuess && (
                <div className="guess-list" ref={scroller}>
                  {guesses.map((guess) => (
                    <GuessEntry
                      guess={guess}
                      key={`first-guess-${guess.word}`}
                    />
                  ))}
                  {puzzleSolved || (
                    <div>
                      <hr />
                      <GuessEntry guess={mostRecentGuess} />
                    </div>
                  )}
                </div>
              )}

              {puzzleSolved || (
                <form onSubmit={submitGuess} className="guess-form">
                  <input
                    type="text"
                    placeholder="Enter a guess"
                    id="guess"
                    className="guess-input"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoFocus={true}
                  />
                  <input type="submit" value="Guess" className="guess-submit" />
                </form>
              )}

              {puzzleSolved && (
                <div className="solved-container">
                  <div className="congrats-text">
                    You did it! You solved Pimantle #{todaysPuzzle} in{" "}
                    {guesses.length} guess{guesses.length > 1 && "es"}. The
                    secret word was <b>{secret?.word}</b>.
                  </div>
                  <div className="reward-buttons">
                    <input type="button" value="Share (text)" />
                    <input type="button" value="Share (text+image)" />
                    <input type="button" value="Share (copy)" />
                    <input type="button" value="Download" />
                    <input type="button" value="Explore" />
                  </div>
                </div>
              )}
            </div>
            <div className="safe-container" />
          </div>

          <PlotContainer
            data={plotState.data}
            layout={plotState.layout}
            onInit={() => centerPlot()}
            hoverEnabled={hoverEnabled}
            revision={dataRevision}
          />
        </div>
      )}
      {parsedWords.length === 0 && (
        <div className="loading-container">
          <div className="loading-text">Loading the Pimantle...</div>
        </div>
      )}
      <div className="footer">
        Try to guess today's secret word. The closer to the center, the more
        semantically similar your guess is. Based on{" "}
        <a href={""} target={"_blank"} rel={"noreferrer"}>
          Semantle
        </a>
        . Created by{" "}
        <a href={"https://pimanrul.es"} target={"_blank"} rel={"noreferrer"}>
          pimanrules
        </a>
        .{" "}
        <a
          href={"https://twitter.com/pimanrules"}
          target={"_blank"}
          rel={"noreferrer"}
        >
          Contact me!
        </a>
      </div>
    </div>
  );
}

export default App;
