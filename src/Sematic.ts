import Token from "./Token";
import { TokenTypes as TT } from "./TokenType";
import { SemanticAnalysisError } from "./errors";

interface DeclarationVariable {
  name: string;
  withInitial: boolean;
}

export class Semantic {
  tokens: Token[];
  pos: number = 0;
  declarations: DeclarationVariable[][] = [];
  currentScopeLvl: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  handleDeclaration(token: Token) {
    if (!this.declarations[this.currentScopeLvl]) {
      this.declarations[this.currentScopeLvl] = [];
    }

    if (
      !this.declarations[this.currentScopeLvl]
        .map((el) => el.name)
        .includes(token.text)
    ) {
      this.declarations[this.currentScopeLvl].push({
        name: token.text,
        withInitial: this.tokens[this.pos].type.name == TT.ASSIGNMENT.name,
      });
      return;
    }

    throw new SemanticAnalysisError(
      `Повторное объявление переменной ${token.text}`,
      token.pos
    );
  }

  handleIdentifier(token: Token) {
    let finded = false;

    for (let i = 0; i <= this.currentScopeLvl; i++) {
      if (!this.declarations[i]) {
        this.declarations[i] = [];
      }
      if (this.declarations[i].map((el) => el.name).includes(token.text)) {
        const element = this.declarations[i].find(
          (el) => el.name == token.text
        );
        if (!element?.withInitial) {
          throw new SemanticAnalysisError(
            `Использование неинициализированной переменной ${token.text}`,
            token.pos
          );
        }
        finded = true;
      }
    }

    if (!finded) {
      throw new SemanticAnalysisError(
        `Использование необъявленной переменной ${token.text}`,
        token.pos
      );
    }
  }

  parseCode() {
    while (this.pos < this.tokens.length) {
      const currentToken = this.tokens[this.pos++];

      switch (currentToken.type.name) {
        case TT.OPENBRACE.name:
          this.currentScopeLvl += 1;
          break;
        case TT.CLOSEBRACE.name:
          this.currentScopeLvl -= 1;
          break;
        case TT.DECLARATION.name:
          let variable = this.tokens[this.pos++];
          this.handleDeclaration(variable);
          break;
        case TT.IDENTIFIER.name:
          this.handleIdentifier(currentToken);
          break;
      }
    }
  }
}
