import React from "react";

export type WelcomePanelProperties = {
  isArchivePuzzle: boolean;
};

function WelcomePanel({ isArchivePuzzle }: WelcomePanelProperties) {
  return (
    <div className={`guess-entry bg-frigid`}>
      <h3>Welcome to Pimantle!</h3>
      <p>
        Try to guess {isArchivePuzzle ? "the" : "today's"} secret word. The
        closer to the center, the more semantically similar your guess is.{" "}
      </p>
      <p>
        Please be aware that the dataset includes offensive words (including
        slurs!) which may be surfaced by the "hint" and "explore" features.{" "}
      </p>
      <p>
        This site is designed for desktop. It'll work on mobile, but you'll
        likely run into some issues.
      </p>
      <p>
        Based on{" "}
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
        . You can contact me on Twitter{" "}
        <a
          href={"https://twitter.com/pimanrules"}
          target={"_blank"}
          rel={"noreferrer"}
        >
          @pimanrules
        </a>{" "}
        or check out my good and/or bad videos on{" "}
        <a
          href={"https://youtube.com/pimanrules"}
          target={"_blank"}
          rel={"noreferrer"}
        >
          YouTube
        </a>
        .
      </p>
      <p>
        To chat with other Pimantlers, check out the (unofficial){" "}
        <a
          href={"https://discord.gg/rc5pNWAA7P"}
          target={"_blank"}
          rel={"noreferrer"}
        >
          Semantle Discord server
        </a>{" "}
        or{" "}
        <a
          href={"https://reddit.com/r/pimantle"}
          target={"_blank"}
          rel={"noreferrer"}
        >
          Pimantle Subreddit
        </a>
        .
      </p>
    </div>
  );
}

export default WelcomePanel;
