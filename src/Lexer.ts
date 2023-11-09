import Token from "./Token";
import { TokenTypes } from "./TokenType";
import { LexicalAnalysisError } from "./errors";

export default class Lexer {
  code: string;
  pos: number = 0;
  tokenList: Token[] = [];

  constructor(code: string) {
    this.code = code;
  }

  lexAnalysis(): Token[] {
    while (this.nextToken()) {}
    this.tokenList = this.tokenList.filter(
      (value) =>
        value.type.name !== TokenTypes.SPACE.name &&
        value.type.name !== TokenTypes.TAB.name &&
        value.type.name !== TokenTypes.NEWLINE.name &&
        value.type.name !== TokenTypes.CARRIAGE.name &&
        value.type.name !== TokenTypes.INCLUDE.name &&
        value.type.name !== TokenTypes.COMMENT.name
    );
    return this.tokenList;
  }

  nextToken(): boolean {
    if (this.pos >= this.code.length) {
      return false;
    }
    const tokenTypesValues = Object.values(TokenTypes);
    for (let i = 0; i < tokenTypesValues.length; i++) {
      const tokenType = tokenTypesValues[i];
      const result = this.code.substring(this.pos).match(tokenType.regex);

      if (result && result[0]) {
        const token = new Token(tokenType, result[0], this.pos);
        this.pos += result[0].length;
        this.tokenList.push(token);
        return true;
      }
    }
    throw new LexicalAnalysisError(`Ошибка лексического анализа`, this.pos);
  }
}
