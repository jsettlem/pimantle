export interface ServerEvent {
  playerCount: (count: number) => void;
  newGuess: (x: number, y: number) => void;
}

export interface ClientEvent {
  guess: (x: number, y: number) => void;
  joinGame: (game: string) => void;
}
