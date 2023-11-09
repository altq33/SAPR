export class SyntacticAnalysisError extends Error {
  text?: string;
  name: string;
  pos?: number;

  constructor(text: string, pos: number) {
    super(text);
    this.name = "SyntacticAnalysisError";
    this.pos = pos;
  }
}

export class LexicalAnalysisError extends Error {
  text?: string;
  name: string;
  pos?: number;

  constructor(text: string, pos: number) {
    super(text);
    this.name = "LexicalAnalysisError";
    this.pos = pos;
  }
}

export class SemanticAnalysisError extends Error {
  text?: string;
  name: string;
  pos?: number;

  constructor(text: string, pos: number) {
    super(text);
    this.name = "SemanticAnalysisError";
    this.pos = pos;
  }
}

export class WrongFilenameError extends Error {
  text?: string;
  name: string;

  constructor(text: string) {
    super(text);
    this.name = "LexicalAnalysisError";
  }
}
