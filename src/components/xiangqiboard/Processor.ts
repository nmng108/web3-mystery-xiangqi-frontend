interface Processor {
  get2DArrayBoard(): string[][];
  initBoard(): void;
  resetBoard(): void;
  move(oldPosition: string, newPosition: string);
  hasBlackWon(): boolean;
  hasRedWon(): boolean;
  draws(): boolean;
}

class DefaultProcessor implements Processor {
  draws(): boolean {
    return false;
  }

  get2DArrayBoard(): string[][] {
    return [];
  }

  hasBlackWon(): boolean {
    return false;
  }

  hasRedWon(): boolean {
    return false;
  }

  initBoard(): void {
  }

  move(oldPosition: string, newPosition: string) {
  }

  resetBoard(): void {
  }
}

export default Processor;
export { Processor, DefaultProcessor };