import ArchiveTile, { ArchiveLink } from "./ArchiveLink";
import React from "react";

export type ArchiveDropdownProps = {
  isOpen: boolean;
  close: () => void;
  archivePimantles: ArchiveLink[];
  archiveSemantles: ArchiveLink[];
};

function ArchiveDropdown({
  isOpen,
  close,
  archivePimantles,
  archiveSemantles,
}: ArchiveDropdownProps) {
  return (
    <div className={`archive-overlay ${isOpen ? "archive-open" : ""}`}>
      <div className="archive-background" onClick={() => close()} />
      <div className="archive-container">
        <div className="close-button" onClick={() => close()}>
          ✕
        </div>
        <h1 className="archive-heading">Today's puzzles</h1>
        <a href="/" className="todays-pimantle archive-puzzle">
          <div className="tile-title">Today's Pimantle</div>
        </a>
        <a
          href={"https://semantle.novalis.org/"}
          target={"_blank"}
          rel={"noreferrer"}
          className="todays-semantle archive-puzzle"
        >
          <div className="tile-title">Today's Semantle</div>
          <div className="semantle-footnote">(on semantle.novalis.org)</div>
        </a>

        <h1 className="archive-heading">Puzzle archive</h1>
        <h2 className="archive-subheading">Pimantle archive</h2>
        {archivePimantles.map((puzzle, index) => (
          <ArchiveTile link={puzzle} key={`pimantle-tile-${index}`} />
        ))}

        <h2 className="archive-subheading">Semantle archive</h2>
        {archiveSemantles.map((puzzle, index) => (
          <ArchiveTile link={puzzle} key={`semantle-tile-${index}`} />
        ))}

        <h1 className="archive-heading">Other things</h1>
        <div className="archive-footer">
          <ul>
            <li>
              <a
                href={"https://twitter.com/pimanrules"}
                target={"_blank"}
                rel={"noreferrer"}
              >
                @pimanrules
              </a>{" "}
              on Twitter
            </li>
            <li>
              <a
                href={"http://words.pimanrul.es"}
                target={"_blank"}
                rel={"noreferrer"}
              >
                Friendle!
              </a>{" "}
              Play a game suspiciously similar to Wordle with your friends
            </li>
            <li>
              The Semantle{" "}
              <a
                href={"https://reddit.com/r/semantle"}
                target={"_blank"}
                rel={"noreferrer"}
              >
                subreddit
              </a>{" "}
              and{" "}
              <a
                href={"https://discord.gg/rc5pNWAA7P"}
                target={"_blank"}
                rel={"noreferrer"}
              >
                Discord server
              </a>
            </li>
            <li>
              <a
                href={"https://github.com/jsettlem/pimantle"}
                target={"_blank"}
                rel={"noreferrer"}
              >
                Source code!
              </a>{" "}
              I barely know React; it's bad!
            </li>
            <li>
              <a
                href={"https://www.youtube.com/pimanrules"}
                target={"_blank"}
                rel={"noreferrer"}
              >
                Good videos!
              </a>{" "}
              Also, bad videos!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ArchiveDropdown;
