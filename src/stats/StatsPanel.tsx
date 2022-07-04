import { useEffect, useState } from "react";
import { StatsStatus } from "./stats.model";

function StatsPanel({
  puzzleName,
  stats,
}: {
  puzzleName: string;
  stats: StatsStatus;
}) {
  let [pinned, setPinned] = useState(false);

  useEffect(() => {
    console.log("stats!", stats);
  }, [stats]);

  return (
    <div className={`guess-entry stats-box bg-tepid ${pinned ? "sticky" : ""}`}>
      <p>
        <b>{puzzleName} stats</b>
        {/*<input*/}
        {/*  type="button"*/}
        {/*  value={pinned ? "Unpin" : "Pin"}*/}
        {/*  onClick={() => setPinned((old) => !old)}*/}
        {/*/>*/}
      </p>
      <table>
        <thead>
          <tr>
            <th>Guesses</th>
            <th>Solves</th>
            <th>Avg. guesses/solve</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{stats.totalGuesses.toLocaleString()}</td>
            <td>{stats.totalSolves.toLocaleString()}</td>
            <td>
              {stats.totalSolves > 0
                ? (stats.totalSolveGuesses / stats.totalSolves).toFixed(1)
                : "--"}
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <i>(more stats coming soon)</i>
      </p>
    </div>
  );
}

export default StatsPanel;
