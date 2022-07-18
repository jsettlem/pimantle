import saveAs from "file-saver";
import mergeImages from "merge-images";
// @ts-ignore
import Plotly from "plotly.js-gl2d-dist-min";
import { Dispatch, useState } from "react";
import Countdown from "react-countdown";
import { toast } from "react-toastify";
import { Word } from "../guesses/guesses.model";
import { getPuzzleName } from "../puzzle/puzzle.component";
import { PuzzleType } from "../puzzle/puzzle.model";

function Solved({
  guesses,
  puzzleType,
  currentPuzzle,
  plotData,
  defaultLayout,
  secret,
  setPlotData,
  puzzleSolved,
  nextPuzzleTime,
}: {
  guesses: Word[];
  puzzleType: PuzzleType;
  currentPuzzle: string;
  plotData: Plotly.Data[];
  defaultLayout: any;
  secret: Word | undefined;
  setPlotData: Dispatch<React.SetStateAction<Plotly.Data[]>>;
  puzzleSolved: boolean;
  nextPuzzleTime: Date;
}) {
  let [downloadingImage, setDownloadingImage] = useState<boolean>(false);
  let [socialImage, setSocialImage] = useState<string>("");
  let [exploreMode, setExploreMode] = useState<boolean>(false);
  function getSolvedText() {
    let hintCount = getHintCount();
    let hintText = "";
    if (hintCount == 0) {
      hintText = "no hints";
    } else if (hintCount == 1) {
      hintText = "1 hint";
    } else {
      hintText = `${hintCount} hints`;
    }

    let extraText = puzzleType == "semantle" ? "(on Pimantle) " : "";
    return `solved ${getPuzzleName(
      puzzleType,
      currentPuzzle
    )} ${extraText}with ${guesses.length} ${
      guesses.length > 1 ? "guesses" : "guess"
    } and ${hintText}!`;
  }

  function getHintCount() {
    return guesses.filter((guess) => guess.isHint).length;
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

  function getImageBlob() {
    return generateImage()
      .then((image: string) => fetch(image))
      .then((response: Response) => response.blob());
  }

  function downloadVictory() {
    getImageBlob().then((blob) => {
      saveAs(blob, `${puzzleType}-${currentPuzzle}.png`);
    });
  }

  function shareVictory(withImage: boolean) {
    let shareObject = {
      url: window.location.href,
      text: getShareString(),
    };
    let errorMessage =
      'Sorry, we couldn\'t share. Try using the "Copy" buttons instead, maybe?';

    if (withImage) {
      getImageBlob().then((blob: Blob) => {
        let file = new File([blob], `${puzzleType}-${currentPuzzle}.png`, {
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

  function getShareString() {
    return `I ${getSolvedText()}`;
  }

  function copyVictory(withImage: boolean) {
    if (navigator.clipboard === undefined) {
      toast.error("Sorry, your browser doesn't support copying to clipboard.");
    }
    let shareText = getShareString() + "\n\n" + window.location.href;
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
      (navigator.clipboard.write
        ? navigator.clipboard.write([
            new ClipboardItem({
              [textBlob.type]: textBlob,
            }),
          ])
        : navigator.clipboard.writeText(shareText)
      )
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

  return (
    <div className="solved-container">
      <div className="congrats-text">
        You did it! You {getSolvedText()} The secret word was{" "}
        <b>{secret?.word}</b>. New puzzle in{" "}
        <Countdown date={nextPuzzleTime} daysInHours={true} />.
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
          <input onClick={() => explore()} type="button" value="Explore" />
        )}
      </div>
      {downloadingImage && (
        <div className="downloading">Just a sec, generating image...</div>
      )}
    </div>
  );
}

export default Solved;
