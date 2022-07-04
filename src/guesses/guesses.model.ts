export type Word = {
    index: number;
    rank: number;
    word: string;
    similarity: number;
    frequency: number;
    x: number;
    y: number;
    guessIndex?: number;
    isHint?: boolean;
    isBulk?: boolean;
};

export type SubmitGuessesParams = {
    word: string;
    isHint: boolean;
    index?: number;
};