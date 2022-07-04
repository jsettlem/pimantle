import { PuzzleType, SavedPuzzleProgress } from "./puzzle.model";
import localForage from "localforage";
import { toast } from "react-toastify";

export function saveProgress(
  puzzleType: PuzzleType,
  puzzleNumber: string | number,
  progress: SavedPuzzleProgress[]
): Promise<any> {
  return localForage
    .setItem(`${puzzleType}-${puzzleNumber}-forage`, progress)
    .catch(() => {
      toast.error("Error saving progress");
    });
}

export function loadProgress(
  puzzleType: "pimantle" | "semantle",
  puzzleNumber: string | number
): Promise<SavedPuzzleProgress[] | undefined> {
  return localForage
    .getItem(`${puzzleType}-${puzzleNumber}-forage`)
    .then((result) => {
      if (result) {
        return result as SavedPuzzleProgress[];
      } else {
        return undefined;
      }
    });
}

export function migrateLocalStorage(): Promise<any> {
  return localForage.getItem("migrated").then((result) => {
    if (!result) {
      console.log("migrating local storage");
      for (let i = 0; i < 100; i++) {
        for (let puzzleType of ["pimantle", "semantle"]) {
          let puzzleProgress = localStorage.getItem(
            `${puzzleType}-${i}-progress`
          );

          if (puzzleProgress) {
            saveProgress(
              puzzleType as PuzzleType,
              i,
              JSON.parse(puzzleProgress)
            );
          }
        }
      }
      console.log("local storage migrated");
      return localForage.setItem("migrated", true).catch(() => {
        toast.error("Error migrating local storage");
      });
    }
  });
}

export function getPuzzleName(puzzleType: PuzzleType, currentPuzzle: string) {
  let puzzleName = puzzleType == "semantle" ? "Semantle" : "Pimantle";
  return `${puzzleName} #${currentPuzzle}`;
}

function Puzzle() {}

export default Puzzle;
