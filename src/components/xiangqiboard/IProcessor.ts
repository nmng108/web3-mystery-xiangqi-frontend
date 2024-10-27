interface IProcessor {
  get2DArrayBoard(): string[][];
  initBoard(): void;
  resetBoard(): void;
  move(oldPosition: string, newPosition: string);
  hasBlackWon(): boolean;
  hasRedWon(): boolean;
  draws(): boolean;
}

export default IProcessor;
export { IProcessor };