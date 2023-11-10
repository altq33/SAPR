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

  isValidInitialization(token: Token, theSameId: boolean): boolean {
    let cursor = this.pos + 1;
    while (this.tokens[cursor].type.name != TT.SEMICOLON.name) {
      if (
        this.tokens[cursor].text == token.text &&
        this.tokens[cursor].type.name == TT.IDENTIFIER.name &&
        !theSameId
      ) {
        throw new SemanticAnalysisError(
          `Использование неинициализированной переменной ${token.text}`,
          token.pos
        );
      }
      cursor++;
    }
    return true;
  }

  checkVarInit(token: Token): [boolean, boolean] {
    let initialized = false;
    let finded = false;

    for (let i = 0; i <= this.currentScopeLvl; i++) {
      if (!this.declarations[i]) {
        this.declarations[i] = [];
      }
      if (this.declarations[i].map((el) => el.name).includes(token.text)) {
        const element = this.declarations[i].find(
          (el) => el.name == token.text
        );
        initialized = element?.withInitial!!;
        finded = true;
      }
    }

    return [initialized, finded];
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
        withInitial:
          this.tokens[this.pos].type.name == TT.ASSIGNMENT.name &&
          this.isValidInitialization(token, false),
      });
      return;
    }

    throw new SemanticAnalysisError(
      `Повторное объявление переменной ${token.text}`,
      token.pos
    );
  }

  handleIdentifier(token: Token) {
    let [initialized, finded] = this.checkVarInit(token);

    if (this.tokens[this.pos].type.name == TT.ASSIGNMENT.name) {
      if (this.isValidInitialization(token, initialized)) {
        const decScopeIndex = this.declarations.findLastIndex((el, i) => {
          const namesDeclartions = el.map((dec) => dec.name);
          return (
            namesDeclartions.includes(token.text) && i <= this.currentScopeLvl
          );
        });
        if (decScopeIndex == -1) {
          throw new SemanticAnalysisError(
            `Использование необъявленной переменной ${token.text}`,
            token.pos
          );
        }
        const index = this.declarations[decScopeIndex].findIndex(
          (el) => el.name == token.text
        );
        this.declarations[decScopeIndex][index] = {
          name: token.text,
          withInitial: true,
        };
      }
    }

    [initialized, finded] = this.checkVarInit(token);

    if (!finded) {
      throw new SemanticAnalysisError(
        `Использование необъявленной переменной ${token.text}`,
        token.pos
      );
    }

    if (!initialized) {
      throw new SemanticAnalysisError(
        `Использование неинициализированной переменной ${token.text}`,
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
