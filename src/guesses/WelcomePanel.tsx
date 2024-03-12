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
      <details>
        <summary>Tell me more!</summary>
        <br />
        <h3>Semantic similarity</h3>
        <p>
          Pimantle uses the same scoring system as Semantle. Each word in its
          dataset comes from{" "}
          <a href="https://en.wikipedia.org/wiki/Word2vec">word2vec</a>, a
          machine learning model that maps words to high dimensional vectors
          vectors. As it turns out,{" "}
          <a href="https://en.wikipedia.org/wiki/Cosine_similarity">
            cosine similarity
          </a>{" "}
          between these vectors is a good measure of semantic similarity. That's
          the score ranging from -1 to 1 you see next to each guess.
        </p>
        <br />
        <h3>The plot</h3>
        <p>
          Pimantle's unique contribution to the semantic similarity guessing
          game genre (current population: 2) is the fun plot you see in the
          background. This is a radial plot, with the target word in the center,
          with r corresponding to cosine similarity, and &theta; corresponding
          to a 1-D{" "}
          <a href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
            t-SNE
          </a>{" "}
          of the word list.
        </p>
        <br />
        <p>
          We also apply a slight twist to make the plot look more like a spiral
          galaxy, and we nudge each point towards its nearest neighbors to make
          the data look a little more cluster-y. This is why sometimes you'll
          see points that seem to be out of order.
        </p>
        <br />
        <p>
          The hope is that the plot will show you the paths of logic from your
          guesses towards the target word. Perhaps you've made a series of
          guesses that all fall along one arm, but that arm doesn't actually
          reach the center? In that case, you should try guessing along a
          different path.
        </p>
        <br />
        <h3>Hints</h3>
        <p>
          Make enough guesses and you'll unlock the hint button. This will
          reveal the word that lies halfway in ranking between your two closest
          guesses (so if you've guessed the 1000th and 2000th closest words, the
          hint will be the 1500th closest word).
        </p>
        <br />
        <p>
          Use enough hints and you'll unlock "good hints." These lie halfway
          between your closest guess and the target word.
        </p>
        <br />
        <p>
          Hints are not guaranteed to be useful, but hopefully they'll serve to
          shake up your thinking!
        </p>
        <br />
        <h3>Multiplayer</h3>
        <p>
          If you're connected to the server, you'll see other players guesses
          and radar blips on the plot, and if anyone guesses the secret word
          you'll see a star. This is not useful in any way, but hopefully it
          gives you motivation!
        </p>
        <br />
        <p>
          If you're playing on a lower-end device, disconnecting from the server
          (with the button in the top-left) might improve performance.
        </p>
        <br />
        <h3>Word list</h3>
        <p>
          The list of guessable words comes from a careful union and
          intersection of a few datasets, include word2vec, Wikipedia, Scrabble,
          and others. The daily secret words are all hand-picked. I'm sorry.
        </p>
        <br />
        <hr />
      </details>
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
