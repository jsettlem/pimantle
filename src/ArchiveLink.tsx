import React from "react";

export type ArchiveLink = {
  puzzleType: "pimantle" | "semantle";
  puzzleIndex: number;
  started: boolean;
  solved: boolean;
  guesses: number;
};

function ArchiveTile({ link }: { link: ArchiveLink }) {
  return (
    <a
      href={`/?type=${link.puzzleType}&puzzle=${link.puzzleIndex}`}
      className="archive-puzzle"
    >
      <div
        className={`tile-star ${link.solved ? "solved-star" : "unsolved-star"}`}
      >
        {link.solved ? "★" : "☆"}
      </div>
      <div className="tile-title">
        {link.puzzleType === "pimantle" ? "Pimantle" : "Semantle"} #
        {link.puzzleIndex}
      </div>
      {link.started ? (
        <div className="tile-guesses tile-started">
          {link.guesses}
          <br />
          {link.guesses === 1 ? "guess" : "guesses"}
        </div>
      ) : (
        <div className="tile-guesses tile-unstarted">Not started</div>
      )}
    </a>
  );
}

export default ArchiveTile;
