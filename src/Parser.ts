import Token from "./Token";
import TokenType, { TokenTypes } from "./TokenType";
import ExpressionNode from "./ast/ExpressionNode";
import NumberNode from "./ast/NumberNode";
import StatementsNode from "./ast/StatementsNode";
import VariableNode from "./ast/VariableNode";

export default class Parser {
  tokens: Token[];
  pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  match(...expected: TokenType[]): Token | null {
    if (this.pos < this.tokens.length) {
      const currentToken = this.tokens[this.pos];
      // чекаем есть ли наш токен в массиве ожидаемых
      if (expected.find((type) => type.name === currentToken.type.name)) {
        this.pos += 1;
        return currentToken;
      }
    }
    return null;
  }

  require(...expected: TokenType[]): Token {
    const token = this.match(...expected);
    if (!token) {
      throw new Error(`На позиции ${this.pos} ожидается ${expected[0].name}`);
    }
    return token;
  }

  parseVariableOrNumber(): ExpressionNode {
    const number = this.match(TokenTypes.NUMBER);
    if (number != null) {
      return new NumberNode(number);
    }
    const variable = this.match(TokenTypes.IDENTIFIER);
    if (variable != null) {
      return new VariableNode(variable);
    }
    throw new Error(`Ожидается переменная или число на ${this.pos} позиции`);
  }

  parseExpression(): ExpressionNode {
    // Чекаем различные варианты начала строк и вызываем нужную функцию для их парсинга
    if (this.match(TokenTypes.IDENTIFIER)) {
      this.pos -= 1;
      let variableNode = this.parseVariableOrNumber();
      const assignOperator = this.match(TokenTypes.ASSIGNMENT);
      if (assignOperator != null) {
      }
    }
  }

  parseCode(): ExpressionNode {
    // Создаем корень дерева
    const root = new StatementsNode();
    while (this.pos < this.tokens.length) {
      // Парсим строчку кода
      const codeStringNode = this.parseExpression();
      // Требуем точку с запятой  после строки
      // FIXME: Возможно это придется менять так как точка с запятой
      // не обязательно должна быть после каждой строки
      this.require(TokenTypes.SEMICOLON);
      root.addNode(codeStringNode);
    }
    return root;
  }
}
