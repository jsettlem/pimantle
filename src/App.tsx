import React, { FormEvent, useEffect, useState } from "react";
import "./App.css";
import wordList from "./data/word_list.json";
import { getFloat16 } from "@petamoriken/float16";
import Plot, { Figure } from "react-plotly.js";
import GuessEntry from "./GuessEntry";

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
  let [mostRecentGuess, setMostRecentGuess] = useState<Word | undefined>(
    undefined
  );

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
      },
      xaxis: {
        showgrid: false,
        showticklabels: false,
      },
      yaxis: {
        showgrid: false,
        showticklabels: false,
        scaleanchor: "x",
      },
      dragmode: "pan",
      showlegend: false,
    },
    frames: [],
  });

  let [dataRevision, setDataRevision] = useState<number>(0);

  useEffect(() => {
    let newPuzzleNumer = "1";
    setTodaysPuzzle("1");
    window
      .fetch(`/secret_words/secret_word_${newPuzzleNumer}.bin`, {
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
          let similarity = getFloat16(dataView, offset, true);
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
                color: parsedWords.map(
                  (word) => word.rank / parsedWords.length
                ),
                opacity: Array(newXValues.length).fill(1),
              },
              hoverinfo: "skip",
            },
            {
              x: [parsedWords[0].x],
              y: [parsedWords[0].y],
              mode: "markers",
              type: "scattergl",
              marker: {
                color: "white",
                size: 15,
              },
              hovertemplate: "<b>Secret word</b><extra></extra>",
            },
            {
              x: [],
              y: [],
              customdata: [],
              text: [],
              mode: "markers",
              type: "scattergl",
              marker: {
                color: "blue",
                size: 10,
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
      let alreadyGuessed =
        guesses.find((oldGuess) => oldGuess.word === newGuess) !== undefined;
      if (!alreadyGuessed) {
        setPlotState((prevState: any) => ({
          ...prevState,
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
                  result!.similarity.toFixed(3),
                  result!.rank,
                  guesses.length + 1,
                ],
              ],
              text: [...prevState.data[2].text, result!.word],
            },
          ],
        }));
        let newGuessObject = {
          ...(result as Word),
          guessIndex: guesses.length + 1,
        };
        setMostRecentGuess(newGuessObject);
        setGuesses((old) => {
          return [...old, newGuessObject].sort((a, b) => b.rank - a.rank);
        });
      }
    }
    guess.currentTarget.guess.value = "";
  }

  function getFlavorText(rank: number): string {
    if (rank === 0) {
      return "FLAMEO HOTMAN!";
    } else if (rank < 10) {
      return "🔥🔥🔥";
    } else if (rank < 50) {
      return "🔥🔥!";
    } else if (rank < 100) {
      return "🔥!!";
    } else if (rank < 200) {
      return "HOT";
    } else if (rank < 500) {
      return "Toasty";
    } else if (rank < 1_000) {
      return "Warm";
    } else if (rank < 3_000) {
      return "Tepid";
    } else if (rank < 10_000) {
      return "Cool";
    } else if (rank < 20_000) {
      return "Chilly";
    } else if (rank < 50_000) {
      return "Cold";
    } else if (rank < 75_000) {
      return "Frigid";
    } else {
      return "Freezing";
    }
  }

  function getColorClass(rank: number) {
    if (rank === 0) {
      return "bg-correct";
    } else if (rank < 10) {
      return "bg-very-hot";
    } else if (rank < 50) {
      return "bg-quite-hot";
    } else if (rank < 100) {
      return "bg-hot";
    } else if (rank < 500) {
      return "bg-toasty";
    } else if (rank < 1_000) {
      return "bg-warm";
    } else if (rank < 3_000) {
      return "bg-tepid";
    } else if (rank < 50_000) {
      return "bg-cold";
    } else {
      return "bg-frigid";
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
                <div className="guess-list">
                  {guesses.map((guess) => (
                    <GuessEntry
                      guess={guess}
                      key={`first-guess-${guess.word}`}
                    />
                  ))}
                  <hr />
                  <GuessEntry guess={mostRecentGuess} />
                </div>
              )}
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
            </div>
            <div className="safe-container" />
          </div>
          <div className="bg-plot-container">
            <Plot
              className="plot"
              data={plotState.data}
              layout={plotState.layout}
              frames={[]}
              config={{
                scrollZoom: true,
              }}
              // onInitialized={(figure) => setPlotState(figure)}
              // onUpdate={(figure) => setPlotState(figure)}
              revision={dataRevision}
              useResizeHandler={true}
            />
          </div>
        </div>
      )}
      <div className="footer">Foot!</div>
    </div>
  );
}

export default App;
