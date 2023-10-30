import Token from "./Token";
import TokenType, { TokenTypes } from "./TokenType";
import BinOperationNode from "./ast/BinOperationNode";
import BoolNode from "./ast/BoolNode";
import DeclarationNode from "./ast/DeclarationNode";
import ExpressionNode from "./ast/ExpressionNode";
import LoopNode from "./ast/LoopNode";
import NumberNode from "./ast/NumberNode";
import StatementsNode from "./ast/StatementsNode";
import UnarOperationNode from "./ast/UnarOperationNode";
import VariableNode from "./ast/VariableNode";

export default class Parser {
  tokens: Token[];
  pos: number = 1;

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

  parseVariableOrNumberOrBool(): ExpressionNode {
    const bool = this.match(TokenTypes.TRUE, TokenTypes.FALSE);
    if (bool != null) {
      return new BoolNode(bool);
    }
    const number = this.match(TokenTypes.NUMBER);
    if (number != null) {
      return new NumberNode(number);
    }
    const variable = this.match(TokenTypes.IDENTIFIER);
    if (variable != null) {
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
      return this.parseVariableOrNumberOrBool();
    }
  }

  parseFormula(): ExpressionNode {
    let leftNode = this.parsePerentheses();
    let operator = this.match(
      TokenTypes.PLUS,
      TokenTypes.MINUS,
      TokenTypes.MULTIPLY,
      TokenTypes.DIV,
      TokenTypes.REMAINDER,
      TokenTypes.EQUAL,
      TokenTypes.NOTEQUAL,
      TokenTypes.LESSTHANOREQUAL,
      TokenTypes.GREATERTHAN,
      TokenTypes.GREATERTHANOREQUAL,
      TokenTypes.LESSTHAN
    );
    while (operator != null) {
      const rightNode = this.parsePerentheses();
      leftNode = new BinOperationNode(operator, leftNode, rightNode);
      operator = this.match(
        TokenTypes.PLUS,
        TokenTypes.MINUS,
        TokenTypes.MULTIPLY,
        TokenTypes.DIV,
        TokenTypes.REMAINDER,
        TokenTypes.EQUAL,
        TokenTypes.NOTEQUAL,
        TokenTypes.LESSTHANOREQUAL,
        TokenTypes.GREATERTHAN,
        TokenTypes.GREATERTHANOREQUAL,
        TokenTypes.LESSTHAN
      );
    }
    return leftNode;
  }

  parseExpression(): ExpressionNode {
    // Чекаем различные варианты начала строк и вызываем нужную функцию для их парсинга
    // Здесь обрабатываем выражение объеявления переменной
    if (this.match(TokenTypes.DECLARATION)) {
      // Парсим число после int
      let variableNode = this.parseVariableOrNumberOrBool();
      // Чекаем нашелся ли идентификатор и явялется ли он соло переменной, а не числом
      if (variableNode != null && variableNode instanceof VariableNode) {
        // Если всё ок проверяем есть ли оператор инициализации
        const assignOperator = this.match(TokenTypes.ASSIGNMENT);
        // Если есть оператор инциализации
        if (assignOperator != null) {
          // Если у нас случай когда мы инициализируем не выражением, а одной переменной или числомЁ
          if (
            this.tokens[this.pos + 1].type.name == TokenTypes.SEMICOLON.name ||
            (this.tokens[this.pos + 1].type.name == TokenTypes.INCREMENT.name &&
              this.tokens[this.pos + 2].type.name == TokenTypes.SEMICOLON.name)
          ) {
            return new DeclarationNode(
              variableNode,
              this.parseVariableOrNumberOrBool()
            );
          }
          // Делаем все тоже самое разбирая выражение инициализации рекурсивно
          const rightFormulaNode = this.parseFormula();
          const binaryNode = new BinOperationNode(
            assignOperator,
            variableNode,
            rightFormulaNode
          );
          // Возвращаем байнари ноду инициализации
          return new DeclarationNode(variableNode, binaryNode);
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
      // После ключевого слова DO обязательно идет открывающая скобка.
      this.require(TokenTypes.OPENBRACE);
      // Создаем ноду цикла
      const loopNode = new LoopNode();
      // Запускаем цикл для парсинга выражений внутри тела цикла
      while (
        this.tokens[this.pos].type.name != TokenTypes.CLOSEBRACE.name &&
        this.pos < this.tokens.length
      ) {
        // FIXME: здесь можно будет чекать на while путем прохода до ключевого слова while и чек предыдущий токен
        const bodyStringNode = this.parseExpression();
        // Требуем точку с запятой  после строки
        this.require(TokenTypes.SEMICOLON);
        loopNode.addNode(bodyStringNode);
      }
      this.require(TokenTypes.CLOSEBRACE);
      this.require(TokenTypes.WHILE);
      this.require(TokenTypes.OPENPAREN);
      // Парсим условие по схеме с оператором присваивания
      if (
        this.match(
          TokenTypes.IDENTIFIER,
          TokenTypes.NUMBER,
          TokenTypes.TRUE,
          TokenTypes.FALSE
        )
      ) {
        this.pos -= 1;
        let variableNode = this.parseVariableOrNumberOrBool();

        const operator = this.match(
          TokenTypes.EQUAL,
          TokenTypes.NOTEQUAL,
          TokenTypes.LESSTHANOREQUAL,
          TokenTypes.GREATERTHAN,
          TokenTypes.GREATERTHANOREQUAL,
          TokenTypes.LESSTHAN,
          TokenTypes.PLUS,
          TokenTypes.MINUS,
          TokenTypes.MULTIPLY,
          TokenTypes.DIV,
          TokenTypes.REMAINDER
        );
        if (operator != null) {
          const rightFormulaNode = this.parseFormula();
          const binaryNode = new BinOperationNode(
            operator,
            variableNode,
            rightFormulaNode
          );
          loopNode.condition = binaryNode;
        } else {
          loopNode.condition = variableNode;
        }
      } else {
        throw new Error(`Условие не должно быть пустым на ${this.pos}`);
      }

      this.require(TokenTypes.CLOSEPAREN);
      return loopNode;
    }
    // Здесь обрабатываем выражение присваивания или инкремента
    if (this.match(TokenTypes.IDENTIFIER)) {
      this.pos -= 1;
      let variableNode = this.parseVariableOrNumberOrBool();
      // Проверяем есть ли оператор присвоения после переменной или составной оператор
      const assignOperator = this.match(
        TokenTypes.ASSIGNMENT,
        TokenTypes.COMMINUS,
        TokenTypes.COMMULT,
        TokenTypes.COMPLUS,
        TokenTypes.COMDIV,
        TokenTypes.COMREM
      );

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
    console.log(
      this.tokens[this.pos],
      this.tokens[this.pos - 1],
      this.tokens[this.pos - 2]
    );
    throw new Error(`Недопустимое выражение на ${this.pos}`);
  }

  parseCode(): ExpressionNode {
    // Создаем корень дерева
    const root = new StatementsNode();
    while (this.pos < this.tokens.length - 1) {
      // Парсим строчку кода
      const codeStringNode = this.parseExpression();
      // Требуем точку с запятой  после строки
      this.require(TokenTypes.SEMICOLON);
      root.addNode(codeStringNode);
    }
    return root;
  }
}
