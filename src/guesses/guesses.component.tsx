import {
  Dispatch,
  FormEvent,
  MutableRefObject,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  getPuzzleName,
  loadProgress,
  saveProgress,
} from "../puzzle/puzzle.component";
import { PuzzleType, SavedPuzzleProgress } from "../puzzle/puzzle.model";
import { SolveStatus } from "../SocketTypes";
import StatsPanel from "../stats/StatsPanel";
import WelcomePanel from "./WelcomePanel";
import { Word, SubmitGuessesParams } from "./guesses.model";
import GuessEntry from "./GuessEntry";
import Solved from "../solved/solved.component";
import { StatsStatus } from "../stats/stats.model";
// @ts-ignore
import Plotly from "plotly.js-gl2d-dist-min";

function Guesses({
  guesses,
  setGuesses,
  parsedWords,
  puzzleType,
  currentPuzzle,
  stats,
  socketState,
  socketGuessHandler,
  scroller,
  hoverEnabled,
  plotData,
  setPlotData,
  isArchivePuzzle,
  defaultLayout,
  secret,
  nextPuzzleTime,
  centerPlot,
}: {
  guesses: Word[];
  setGuesses: Dispatch<React.SetStateAction<Word[]>>;
  parsedWords: Word[];
  puzzleType: PuzzleType;
  currentPuzzle: string;
  stats: StatsStatus;
  socketState: string;
  socketGuessHandler: (
    x: number,
    y: number,
    solvedState: SolveStatus | undefined
  ) => void;
  scroller: RefObject<HTMLDivElement>;
  hoverEnabled: MutableRefObject<boolean>;
  plotData: Plotly.Data[];
  setPlotData: Dispatch<React.SetStateAction<Plotly.Data[]>>;
  isArchivePuzzle: boolean;
  defaultLayout: any;
  secret: Word | undefined;
  nextPuzzleTime: Date;
  centerPlot: (on?: Word | undefined) => void;
}) {
  let [mostRecentGuess, setMostRecentGuess] = useState<Word | undefined>(
    undefined
  );
  let [puzzleSolved, setPuzzleSolved] = useState<boolean>(false);
  const inputBox = useRef<HTMLFormElement>(null);

  function saveGuesses(newGuessList: Word[]) {
    let savedState: SavedPuzzleProgress[] = newGuessList.map((word) => ({
      word: word.word,
      guessIndex: word.guessIndex ?? 0,
      isHint: word.isHint ?? false,
    }));

    savedState.sort((a, b) => (a.guessIndex || 0) - (b.guessIndex || 0));

    saveProgress(puzzleType, currentPuzzle, savedState);
  }

  function submitGuess(guess: FormEvent<HTMLFormElement>) {
    guess.preventDefault();
    let newGuess = guess.currentTarget.guess.value.toLowerCase().trim();
    submitGuesses([{ word: newGuess, isHint: false }], false);
    guess.currentTarget.guess.value = "";
  }

  function getGuessCount() {
    return guesses.length;
  }

  function getHint() {
    let firstHintIndex = guesses.length - 1;
    while (
      firstHintIndex > 0 &&
      guesses[firstHintIndex - 1].rank == guesses[firstHintIndex].rank + 1
    ) {
      firstHintIndex--;
    }
    let lowerHintRange = guesses[firstHintIndex].rank;
    let hintGoal = lowerHintRange;
    if (firstHintIndex != 0) {
      hintGoal = Math.floor(
        (lowerHintRange + guesses[firstHintIndex - 1].rank) / 2
      );
    }

    submitHint(hintGoal);
  }

  function getGoodHint() {
    let bestGuess = guesses[guesses.length - 1];
    if (bestGuess.rank == 1) {
      toast.error("Sorry, you've already got the best hint!");
      return;
    }

    let hintGoal = Math.ceil(bestGuess.rank / 2);
    submitHint(hintGoal);
  }

  function submitHint(hintGoal: number) {
    let hintWord = parsedWords.find((word) => word.rank == hintGoal);
    if (hintWord) {
      submitGuesses(
        [
          {
            word: hintWord.word,
            isHint: true,
          },
        ],
        true
      );
    } else {
      toast.error("Sorry, we couldn't find a hint (somehow...).");
    }
  }

  function checkGuess(guess: string): Word | undefined {
    return parsedWords.find((word) => word.word === guess);
  }

  function submitGuesses(guess: SubmitGuessesParams[], isAutomated: boolean) {
    let isBulk = guess.length > 1;
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
            isHint: guess.isHint,
            isBulk: isBulk,
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

    let guessCount = guesses.length;
    if (newGuessObjects.length > 0) {
      guessCount += newGuessObjects.length;
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
              ...newGuessObjects.map((guess) =>
                guess.isHint ? "lime" : guess.rank
              ),
            ],
          },
        },
      ]);

      let puzzleJustSolved = false;

      if (newGuessObjects.some((guess) => guess.rank === 0)) {
        const savePuzzleSolved = () => {
          localStorage.setItem(
            `${puzzleType}-${currentPuzzle}-solved`,
            JSON.stringify(new Date().toISOString())
          );
        };
        try {
          if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(function () {
              savePuzzleSolved();
            });
          } else {
            savePuzzleSolved();
          }
        } catch (e) {
          toast.error("Error saving puzzle progress");
        }

        setPuzzleSolved(true);
        puzzleJustSolved = true;
      }

      if (!isAutomated && newGuessObjects.length) {
        socketGuessHandler(
          newGuessObjects[0].x,
          newGuessObjects[0].y,
          puzzleJustSolved
            ? {
                guessesUsed: guessCount,
                hintsUsed: 0,
              }
            : undefined
        );
      }
    }
  }

  function enableHover() {
    hoverEnabled.current = true;
  }

  function delayedEnableHover() {
    setTimeout(() => {
      enableHover();
    }, 100);
  }

  function handleResize() {
    centerPlot();
    scroller.current?.scrollTo({
      top: scroller.current?.scrollHeight,
    });
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", enableHover);
    window.addEventListener("wheel", enableHover);
    window.addEventListener("touchstart", delayedEnableHover);
    if (guesses.length == 0) {
      loadProgress(puzzleType, currentPuzzle).then((storedProgressList) => {
        if (storedProgressList) {
          console.log("stored progress", storedProgressList);
          submitGuesses(
            storedProgressList.map((guess: SavedPuzzleProgress) => ({
              word: guess.word,
              index: guess.guessIndex,
              isHint: guess.isHint,
            })),
            true
          );
        }
      });
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", enableHover);
      window.removeEventListener("wheel", enableHover);
      window.removeEventListener("touchstart", delayedEnableHover);
    };
  }, [parsedWords]);

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

  return (
    <div className="guess-container">
      <div className="guess-list" ref={scroller}>
        {mostRecentGuess && (
          <>
            {puzzleSolved || (
              <div>
                <hr />
                <GuessEntry guess={mostRecentGuess} />
              </div>
            )}
            {[...guesses].reverse().map((guess) => (
              <GuessEntry
                guess={guess}
                animated={true}
                key={`first-guess-${guess.word}`}
              />
            ))}
          </>
        )}

        {socketState === "connected" && (
          <StatsPanel
            puzzleName={getPuzzleName(puzzleType, currentPuzzle)}
            stats={stats}
          />
        )}

        <WelcomePanel isArchivePuzzle={isArchivePuzzle} />
      </div>
      {puzzleSolved || (
        <form onSubmit={submitGuess} className="guess-form" ref={inputBox}>
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
          {guesses.length > 10 && (
            <input
              type="button"
              value="Hint"
              className="hint-button"
              onClick={getHint}
            />
          )}
          {guesses.filter((g) => g.isHint).length > 6 &&
            !guesses.some((guess) => guess.rank === 1) && (
              <input
                type="button"
                value="Good hint"
                className="give-up-button"
                onClick={getGoodHint}
              />
            )}
        </form>
      )}
      {puzzleSolved && (
        <Solved
          guesses={guesses}
          puzzleType={puzzleType}
          currentPuzzle={currentPuzzle}
          plotData={plotData}
          defaultLayout={defaultLayout}
          secret={secret}
          setPlotData={setPlotData}
          puzzleSolved={puzzleSolved}
          nextPuzzleTime={nextPuzzleTime}
        />
      )}
    </div>
  );
}

export default Guesses;
