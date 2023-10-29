import Token from "./Token";
import TokenType, { TokenTypes } from "./TokenType";
import BinOperationNode from "./ast/BinOperationNode";
import DeclarationNode from "./ast/DeclarationNode";
import ExpressionNode from "./ast/ExpressionNode";
import NumberNode from "./ast/NumberNode";
import StatementsNode from "./ast/StatementsNode";
import UnarOperationNode from "./ast/UnarOperationNode";
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
      // TODO: Здесь можно чекать на инкремент
      let operator = this.match(TokenTypes.INCREMENT);
      if (operator != null) {
        return new UnarOperationNode(operator, new VariableNode(variable));
      }
      return new VariableNode(variable);
    }
    throw new Error(`Ожидается переменная или число на ${this.pos} позиции`);
  }

  parsePerentheses(): ExpressionNode {
    if (this.match(TokenTypes.OPENPAREN) != null) {
      const node = this.parseFormula();
      this.require(TokenTypes.CLOSEPAREN);
      return node;
    } else {
      return this.parseVariableOrNumber();
    }
  }

  parseFormula(): ExpressionNode {
    let leftNode = this.parsePerentheses();
    let operator = this.match(
      TokenTypes.PLUS,
      TokenTypes.MINUS,
      TokenTypes.MULTIPLY,
      TokenTypes.DIV,
      TokenTypes.REMAINDER
    );
    while (operator != null) {
      const rightNode = this.parsePerentheses();
      leftNode = new BinOperationNode(operator, leftNode, rightNode);
      operator = this.match(
        TokenTypes.PLUS,
        TokenTypes.MINUS,
        TokenTypes.MULTIPLY,
        TokenTypes.DIV,
        TokenTypes.REMAINDER
      );
    }
    return leftNode;
  }

  parseExpression(): ExpressionNode {
    // Чекаем различные варианты начала строк и вызываем нужную функцию для их парсинга
    // Здесь обрабатываем выражение объеявления переменной
    if (this.match(TokenTypes.DECLARATION)) {
      // Парсим число после int
      let variableNode = this.parseVariableOrNumber();
      // Чекаем нашелся ли идентификатор и явялется ли он соло переменной, а не числом
      if (variableNode != null && variableNode instanceof VariableNode) {
        // Если всё ок проверяем есть ли оператор инициализации
        const assignOperator = this.match(TokenTypes.ASSIGNMENT);
        // Если есть оператор инциализации
        if (assignOperator != null) {
          // Делаем все тоже самое разбирая выражение инициализации рекурсивно
          const rightFormulaNode = this.parseFormula();
          const binaryNode = new BinOperationNode(
            assignOperator,
            variableNode,
            rightFormulaNode
          );
          // Возвращаем байнари ноду инициализации
          return binaryNode;
        } else {
          // Иначе если оператора нет возвращаем ноду объявления переменной с нулом вторым параеметром
          return new DeclarationNode(variableNode, null);
        }
      } else {
        // Если у нас после ключевого слова объявления нет переменной или она с инкрементом, то дропаем ошибку
        throw new Error(`Неправильное выражение на ${this.pos}`);
      }
    }
    // Здесь обрабатываем выражение цикла
    if (this.match(TokenTypes.DO)) {
    }
    // Здесь обрабатываем выражение присваивания или инкремента
    if (this.match(TokenTypes.IDENTIFIER)) {
      this.pos -= 1;
      let variableNode = this.parseVariableOrNumber();
      // Проверяем есть ли оператор присвоения после переменной
      const assignOperator = this.match(TokenTypes.ASSIGNMENT);

      if (assignOperator != null) {
        if (variableNode instanceof UnarOperationNode) {
          throw new Error(`Неправильное выражение на ${this.pos}`);
        }
        const rightFormulaNode = this.parseFormula();
        const binaryNode = new BinOperationNode(
          assignOperator,
          variableNode,
          rightFormulaNode
        );
        return binaryNode;
      }
      // Если там нет оператора присваивания значит там либо инкремент либо ничего.
      else {
        if (variableNode instanceof UnarOperationNode) {
          return variableNode;
        }
        throw new Error(`Ожидается оператор на ${this.pos} позиции`);
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
      this.require(TokenTypes.SEMICOLON);
      root.addNode(codeStringNode);
    }
    return root;
  }
}
