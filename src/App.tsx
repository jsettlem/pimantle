import React, { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import wordList from "./data/word_list.json";
import { getFloat16 } from "@petamoriken/float16";
import GuessEntry from "./GuessEntry";
// @ts-ignore
import Plotly from "plotly.js-gl2d-dist-min";
import PlotContainer from "./PlotContainer";
import mergeImages from "merge-images";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

type SubmitGuessesParams = {
  word: string;
  isHint: boolean;
  index?: number;
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
  const inputBox = useRef<HTMLFormElement>(null);

  let [parsedWords, setParsedWords] = useState<Word[]>([]);

  let [socialImage, setSocialImage] = useState<string>("");
  let [downloadingImage, setDownloadingImage] = useState<boolean>(false);
  let [exploreMode, setExploreMode] = useState<boolean>(false);

  let [plotData, setPlotData] = useState<Plotly.Data[]>([]);
  let defaultLayout = {
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
      range: [-0.5, 0.5],
    },
    yaxis: {
      autorange: false,
      showgrid: false,
      showticklabels: false,
      // scaleanchor: "x",
      constraintoward: "center",
      zerolinecolor: "rgba(255,255,255,0.1)",
      range: [-0.28125, 0.28125],
    },
    dragmode: "pan",
    showlegend: false,
    uirevision: 1,
  };

  let [plotLayout, setPlotLayout] = useState<Plotly.Layout>(defaultLayout);

  let [dataRevision, setDataRevision] = useState<number>(0);
  let [bizarreEdgeCaseThingIHateIt, setBizarreEdgeCaseThingIHateIt] =
    useState<number>(Math.random() / 10000 + 0.00001);

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
    if (guesses.length == 0) {
      let storedProgress = window.localStorage.getItem(
        `pimantle-${todaysPuzzle}-progress`
      );

      console.log("stored progress", storedProgress);
      if (storedProgress) {
        let storedProgressList = JSON.parse(storedProgress).map(
          (guess: any) => ({
            word: guess.word,
            index: guess.guessIndex,
          })
        );
        submitGuesses(storedProgressList);
      }
    }
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

        setPlotData([
          {
            x: newXValues,
            y: newYValues,
            text: parsedWords.map((word) => word.word),
            customdata: parsedWords.map((word) => [
              word.similarity.toFixed(2),
              word.rank,
            ]),
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
        ]);

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
  }, [plotData]);

  function checkGuess(guess: string): Word | undefined {
    return parsedWords.find((word) => word.word === guess);
  }

  function saveGuesses(newGuessList: Word[]) {
    let savedState = newGuessList.map((word) => ({
      word: word.word,
      guessIndex: word.guessIndex,
    }));

    savedState.sort((a, b) => (a.guessIndex || 0) - (b.guessIndex || 0));

    window.localStorage.setItem(
      `pimantle-${todaysPuzzle}-progress`,
      JSON.stringify(savedState)
    );
  }

  function submitGuess(guess: FormEvent<HTMLFormElement>) {
    guess.preventDefault();
    let newGuess = guess.currentTarget.guess.value.toLowerCase().trim();
    submitGuesses([{ word: newGuess, isHint: false }]);
    guess.currentTarget.guess.value = "";
  }

  function submitGuesses(guess: SubmitGuessesParams[]) {
    let newGuessObjects: Word[] = guess
      .map((guess) => {
        let result = checkGuess(guess.word);
        if (result === undefined) {
          toast.error(`I don't know the word "${guess.word}".`);
          inputBox.current?.animate(
            [
              { transform: "translateX(0px)" },
              { transform: "translateX(10px)" },
              { transform: "translateX(-10px)" },
              { transform: "translateX(10px)" },
              { transform: "translateX(-10px)" },
              { transform: "translateX(10px)" },
              { transform: "translateX(0px)" },
            ],
            {
              duration: 500,
            }
          );
        }
        return (
          result &&
          ({
            ...(result as Word),
            guessIndex: guess.index,
          } as Word)
        );
      })
      .filter(
        (result: Word | undefined): result is Word => result !== undefined
      )
      .map((guess: Word, index: number) => {
        let previousGuess = guesses.find(
          (oldGuess) => oldGuess.word === guess.word
        );
        if (previousGuess) {
          setMostRecentGuess(previousGuess);
          centerPlot(previousGuess);
          return undefined;
        } else {
          return {
            ...(guess as Word),
            guessIndex: guess.guessIndex || guesses.length + index + 1,
          } as Word;
        }
      })
      .filter(
        (result: Word | undefined): result is Word => result !== undefined
      );

    if (newGuessObjects.length > 0) {
      setGuesses((old) => {
        let newGuessList = [...old, ...newGuessObjects].sort(
          (a, b) => b.rank - a.rank
        );
        saveGuesses(newGuessList);
        return newGuessList;
      });

      let bestGuess = newGuessObjects[newGuessObjects.length - 1];
      setMostRecentGuess(bestGuess);
      centerPlot(bestGuess);

      setPlotData((prevState) => [
        prevState[0],
        prevState[1],
        {
          ...prevState[2],
          x: [...prevState[2].x, ...newGuessObjects.map((guess) => guess.x)],
          y: [...prevState[2].y, ...newGuessObjects.map((guess) => guess.y)],
          customdata: [
            ...prevState[2].customdata,
            ...newGuessObjects.map((guess) => [
              guess.similarity.toFixed(2),
              guess.rank,
              guess.guessIndex,
            ]),
          ],
          text: [
            ...prevState[2].text,
            ...newGuessObjects.map((guess) => guess.word),
          ],
          marker: {
            ...prevState[2].marker,
            color: [
              ...prevState[2].marker.color,
              ...newGuessObjects.map((guess) => guess.rank),
            ],
          },
        },
      ]);

      if (newGuessObjects.some((guess) => guess.rank === 0)) {
        setPuzzleSolved(true);
      }
    }
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
    setBizarreEdgeCaseThingIHateIt((old) => old * -1);
    if (parsedWords) {
      let [xRange, yRange] = getAxisRange(
        on ? on : parsedWords[Math.floor(parsedWords.length / 2)]
      );

      xRange[0] += bizarreEdgeCaseThingIHateIt;
      xRange[1] += bizarreEdgeCaseThingIHateIt;
      yRange[0] += bizarreEdgeCaseThingIHateIt;
      yRange[1] += bizarreEdgeCaseThingIHateIt;

      setPlotLayout((prevState: Plotly.Layout) => ({
        ...prevState,
        xaxis: {
          ...prevState.xaxis,
          range: xRange,
        },
        yaxis: {
          ...prevState.yaxis,
          range: yRange,
        },
        uirevision: prevState.uirevision + 1,
      }));
    }
  }

  function generateImage(): Promise<string> {
    if (socialImage !== "") {
      return Promise.resolve(socialImage);
    } else {
      setDownloadingImage(true);
      toast(
        "Generating image, give me a sec... (this might not work great on some browsers)."
      );
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            Plotly.newPlot("hidden-plot", [plotData[0]], {
              ...defaultLayout,
              plot_bgcolor: "rgba(0,0,0,255)",
            })
              .then((figure: any) =>
                Plotly.toImage(figure, {
                  format: "png",
                  width: 1920,
                  height: 1080,
                })
              )
              .then((bgLayer: string) =>
                Plotly.react(
                  "hidden-plot",
                  [plotData[1], plotData[2]],
                  defaultLayout
                ).then((newPlot: any) =>
                  Plotly.toImage(newPlot, {
                    format: "png",
                    width: 1920,
                    height: 1080,
                  }).then((foregroundLayer: string) => {
                    Plotly.purge("hidden-plot");
                    return mergeImages([bgLayer, foregroundLayer]).then(
                      (merged) => {
                        setSocialImage(merged);
                        setDownloadingImage(false);
                        return merged;
                      }
                    );
                  })
                )
              )
          );
        }, 100);
      });
    }
  }

  function getShareString() {
    return `I found Pimantle #${todaysPuzzle} in ${guesses.length} guesses!`;
  }

  function getImageBlob() {
    return generateImage()
      .then((image: string) => fetch(image))
      .then((response: Response) => response.blob());
  }

  function shareVictory(withImage: boolean) {
    let shareObject = {
      url: "https://semantle.pimanrul.es",
      text: getShareString(),
    };
    let errorMessage =
      'Sorry, we couldn\'t share. Try using the "Copy" buttons instead, maybe?';

    if (withImage) {
      getImageBlob().then((blob: Blob) => {
        let file = new File([blob], `pimantle-${todaysPuzzle}.png`, {
          type: blob.type,
        });
        if (navigator.canShare({ files: [file] })) {
          console.log("it supports image");
          navigator.share({
            ...shareObject,
            files: [file],
          });
        } else {
          navigator.share(shareObject).catch((err) => {
            toast.error(errorMessage);
          });
        }
      });
    } else {
      navigator.share(shareObject).catch((err) => {
        toast.error(errorMessage);
      });
    }
  }

  function copyVictory(withImage: boolean) {
    if (navigator.clipboard === undefined) {
      toast.error("Sorry, your browser doesn't support copying to clipboard.");
    }
    let shareText = getShareString() + "\n\nhttps://semantle.pimanrul.es";
    let textBlob = new Blob([shareText], { type: "text/plain" });
    if (withImage) {
      getImageBlob().then((iamgeBlob) => {
        navigator.clipboard
          .write([
            new ClipboardItem({
              [iamgeBlob.type]: iamgeBlob,
              [textBlob.type]: textBlob,
            }),
          ])
          .then(() => {
            toast.success("Copied to clipboard!");
          })
          .catch(() => {
            toast.error(
              'Sorry, we weren\'t able to copy to clipboard. Try using "Copy (text)" instead?'
            );
          });
      });
    } else {
      navigator.clipboard
        .write([
          new ClipboardItem({
            [textBlob.type]: textBlob,
          }),
        ])
        .then(() => {
          toast.success("Copied to clipboard!");
        })
        .catch(() => {
          toast.error("Sorry, we weren't able to copy to clipboard.");
        });
    }
  }

  function explore() {
    setExploreMode(true);
    setPlotData((oldData) => [
      {
        ...oldData[0],
        hovertemplate:
          "<b>%{text}</b><br><br>Similarity: %{customdata[0]}<br>Rank: %{customdata[1]}<extra></extra>",
      },
      oldData[1],
      oldData[2],
    ]);
    toast.warn(
      "Explore mode enabled. You can now hover/tap on all nodes to see their similarity.\n\nWARNING: There are offensive words in the dataset, including slurs.",
      {
        autoClose: false,
        position: "top-center",
      }
    );
  }

  function downloadVictory() {
    getImageBlob().then((blob) => {
      saveAs(blob, `pimantle-${todaysPuzzle}.png`);
    });
  }

  return (
    <div className="App">
      <ToastContainer
        position="top-left"
        hideProgressBar
        toastClassName="toast-blur"
        autoClose={5000}
        theme="dark"
      />
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
                <form
                  onSubmit={submitGuess}
                  className="guess-form"
                  ref={inputBox}
                >
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
                    {typeof navigator.canShare !== "undefined" &&
                      navigator.canShare({ text: "test" }) && (
                        <div>
                          <input
                            onClick={() => shareVictory(false)}
                            type="button"
                            value="Share (text)"
                          />
                          <input
                            onClick={() => shareVictory(true)}
                            disabled={downloadingImage}
                            type="button"
                            value="Share (text+image)"
                          />
                        </div>
                      )}

                    <input
                      onClick={() => copyVictory(false)}
                      type="button"
                      value="Copy (text)"
                    />
                    <input
                      onClick={() => copyVictory(true)}
                      type="button"
                      value="Copy (image)"
                    />
                    <input
                      onClick={() => downloadVictory()}
                      disabled={downloadingImage}
                      type="button"
                      value="Download"
                    />
                    {exploreMode || (
                      <input
                        onClick={() => explore()}
                        type="button"
                        value="Explore"
                      />
                    )}
                  </div>
                  {downloadingImage && (
                    <div className="downloading">
                      Just a sec, generating image...
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="safe-container" />
          </div>

          <PlotContainer
            data={plotData}
            layout={plotLayout}
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
        <a
          href={"https://semantle.novalis.org/"}
          target={"_blank"}
          rel={"noreferrer"}
        >
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
      <div id={"hidden-plot"} />
    </div>
  );
}

export default App;
