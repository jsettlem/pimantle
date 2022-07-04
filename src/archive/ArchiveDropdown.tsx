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
        <div className="archive-column">
          <h1 className="archive-heading">Today's puzzles</h1>
          <a href="/" className="todays-pimantle archive-puzzle">
            <div className="tile-title">Today's Pimantle</div>
          </a>
          <a
            href={"https://semantle.com/"}
            target={"_blank"}
            rel={"noreferrer"}
            className="todays-semantle archive-puzzle"
          >
            <div className="tile-title">Today's Semantle</div>
            <div className="semantle-footnote">(on semantle.com)</div>
          </a>

          <h1 className="archive-heading">Pimantle archive</h1>
          {archivePimantles.map((puzzle, index) => (
            <ArchiveTile link={puzzle} key={`pimantle-tile-${index}`} />
          ))}
        </div>

        <div className="archive-column">
          <h1 className="archive-heading">Other things</h1>
          <h2 className="archive-subheading">Follow me</h2>
          <div className="social-panel">
            <a
              href="https://youtube.com/pimanrules"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="social-button"
                src="/socials/youtube.svg"
                alt="youtube"
              />
            </a>
            <a
              href="https://twitter.com/pimanrules"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="social-button"
                src="/socials/twitter.svg"
                alt="twitter"
              />
            </a>
          </div>
          <h2 className="archive-subheading">Source code</h2>
          <div className="social-panel">
            <a
              href="https://github.com/jsettlem/pimantle"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="social-button"
                src="/socials/github.svg"
                alt="github"
              />
            </a>
          </div>
          <h2 className="archive-subheading">(Unofficial) Communities</h2>
          <div className="social-panel">
            <a
              href="https://discord.gg/rc5pNWAA7P"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="social-button"
                src="/socials/discord.svg"
                alt="discord"
              />
            </a>
            <a
              href="https://reddit.com/r/pimantle"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="social-button"
                src="/socials/reddit.svg"
                alt="reddit"
              />
            </a>
          </div>
          <h2 className="archive-subheading">Other games</h2>
          <div className="social-panel">
            <a
              href="http://words.pimanrul.es"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="social-button"
                src="/socials/friendle.png"
                alt="friendle"
              />
            </a>
          </div>
          <h2 className="archive-subheading">Support me</h2>
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/pimanrules/?hidefeed=true&widget=true&embed=true&preview=true"
            className="kofi-iframe"
            height="712"
            title="pimanrules"
          ></iframe>
          <h1 className="archive-heading">Semantle archive</h1>
          {archiveSemantles.map((puzzle, index) => (
            <ArchiveTile link={puzzle} key={`semantle-tile-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArchiveDropdown;
