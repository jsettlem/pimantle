export interface ServerEvent {
  playerCount: (count: number) => void;
  newGuess: (x: number, y: number) => void;
  guessWithStats: (
    x: number,
    y: number,
    stats: StatsUpdate | LesserStatsUpdate
  ) => void;
  statsUpdate: (stats: StatsUpdate) => void;
}

export interface ClientEvent {
  guess: (x: number, y: number, solveStatus: SolveStatus | undefined) => void;
  joinGame: (game: string) => void;
}

export type SolveStatus = {
  guessesUsed: number;
  hintsUsed: number;
};

export type LesserStatsUpdate = {
  type: "lesser";
  totalGuesses: number;
};

export type StatsUpdate = {
  type: "greater";
  total_guesses: number;
  total_solves: number;
  total_guesses_for_solves: number;
  solve_bucket_1_20: number;
  solve_bucket_21_40: number;
  solve_bucket_41_60: number;
  solve_bucket_61_80: number;
  solve_bucket_81_100: number;
  solve_bucket_101_120: number;
  solve_bucket_121_140: number;
  solve_bucket_141_160: number;
  solve_bucket_161_180: number;
  solve_bucket_181_200: number;
  solve_bucket_201_220: number;
  solve_bucket_221_240: number;
  solve_bucket_241_260: number;
  solve_bucket_261_280: number;
  solve_bucket_281_300: number;
  solve_bucket_301_320: number;
  solve_bucket_321_340: number;
  solve_bucket_341_360: number;
  solve_bucket_361_380: number;
  solve_bucket_381_400: number;
  solve_bucket_401_420: number;
  solve_bucket_421_440: number;
  solve_bucket_441_460: number;
  solve_bucket_461_480: number;
  solve_bucket_481_500: number;
};
