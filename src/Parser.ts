import Token from "./Token";
import TokenType, { TokenTypes as TT } from "./TokenType";
import BinOperationNode from "./astNodes/BinOperationNode";
import BoolNode from "./astNodes/BoolNode";
import DeclarationNode from "./astNodes/DeclarationNode";
import ExpressionNode from "./astNodes/ExpressionNode";
import FunctionNode from "./astNodes/FunctionNode";
import LoopNode from "./astNodes/LoopNode";
import NumberNode from "./astNodes/NumberNode";
import ParenNode from "./astNodes/ParenNode";
import ProgramNode from "./astNodes/ProgramNode";
import UnarOperationNode from "./astNodes/UnarOperationNode";
import VariableNode from "./astNodes/VariableNode";
import { SyntacticAnalysisError } from "./errors";

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
      throw new SyntacticAnalysisError(
        `Ожидалось ${expected[0].name}`,
        this.pos
      );
    }
    return token;
  }

  parseVariableOrNumberOrBool(): ExpressionNode {
    const bool = this.match(TT.TRUE, TT.FALSE);
    if (bool != null) {
      return new BoolNode(bool);
    }
    const unaryMinus = this.match(TT.MINUS);

    const number = this.match(TT.NUMBER);

    if (number != null) {
      const numberNode = new NumberNode(number);
      if (unaryMinus != null) {
        return new UnarOperationNode(unaryMinus, numberNode);
      }
      return numberNode;
    }

    const variable = this.match(TT.IDENTIFIER);

    if (variable != null) {
      let variableNode: VariableNode | UnarOperationNode = new VariableNode(
        variable
      );

      let incOperator = this.match(TT.INCREMENT);

      if (incOperator != null) {
        variableNode = new UnarOperationNode(incOperator, variableNode);
      }

      if (unaryMinus != null) {
        return new UnarOperationNode(unaryMinus, variableNode);
      }

      return variableNode;
    }
    throw new SyntacticAnalysisError(
      `Ожидалась переменная или число`,
      this.pos
    );
  }

  expr(): ExpressionNode {
    return this.secondPriorityOpParse();
  }

  secondPriorityOpParse() {
    let factor = this.firstPriorityOpParse();
    while (true) {
      const operator = this.match(
        TT.PLUS,
        TT.MINUS,
        TT.EQUAL,
        TT.NOTEQUAL,
        TT.LESSTHANOREQUAL,
        TT.GREATERTHAN,
        TT.GREATERTHANOREQUAL,
        TT.LESSTHAN
      );

      if (operator) {
        factor = new BinOperationNode(
          operator,
          factor,
          this.firstPriorityOpParse()
        );
      } else {
        return factor;
      }
    }
  }

  firstPriorityOpParse() {
    let factor = this.parseFactor();
    while (true) {
      const operator = this.match(TT.MULTIPLY, TT.DIV, TT.REMAINDER);

      if (operator) {
        factor = new BinOperationNode(operator, factor, this.parseFactor());
      } else {
        return factor;
      }
    }
  }

  parseFactor(): ExpressionNode {
    if (this.match(TT.OPENPAREN)) {
      const node = this.expr();
      this.require(TT.CLOSEPAREN);
      return new ParenNode(node);
    }
    const factor = this.parseVariableOrNumberOrBool();
    return factor;
  }

  parseExpression(): ExpressionNode {
    // Чекаем различные варианты начала строк и вызываем нужную функцию для их парсинга
    // Здесь обрабатываем выражение объеявления переменной

    if (this.match(TT.DECLARATION)) {
      // Парсим число после int
      let variableNode = this.parseVariableOrNumberOrBool();
      // Чекаем нашелся ли идентификатор и явялется ли он соло переменной, а не числом
      if (variableNode != null && variableNode instanceof VariableNode) {
        // Если всё ок проверяем есть ли оператор инициализации
        const assignOperator = this.match(TT.ASSIGNMENT);
        // Если есть оператор инциализации
        if (assignOperator != null) {
          return new DeclarationNode(variableNode, this.expr());
        } else {
          // Иначе если оператора нет возвращаем ноду объявления переменной с нулом вторым параеметром
          return new DeclarationNode(variableNode, null);
        }
      } else {
        // Если у нас после ключевого слова объявления нет переменной или она с инкрементом, то дропаем ошибку
        throw new SyntacticAnalysisError(`Неправильное выражение`, this.pos);
      }
    }
    // Здесь обрабатываем выражение цикла
    if (this.match(TT.DO)) {
      // После ключевого слова DO обязательно идет открывающая скобка.
      this.require(TT.OPENBRACE);
      // Создаем ноду цикла
      const loopNode = new LoopNode();
      // Запускаем цикл для парсинга выражений внутри тела цикла
      while (
        this.tokens[this.pos].type.name != TT.CLOSEBRACE.name &&
        this.pos < this.tokens.length
      ) {
        const bodyStringNode = this.parseExpression();
        // Требуем точку с запятой  после строки
        this.require(TT.SEMICOLON);
        loopNode.addNode(bodyStringNode);
      }
      this.require(TT.CLOSEBRACE);
      this.require(TT.WHILE);
      this.require(TT.OPENPAREN);
      // Парсим условие по схеме с оператором присваивания
      if (this.match(TT.IDENTIFIER, TT.NUMBER, TT.TRUE, TT.FALSE)) {
        this.pos -= 1;
        let variableNode = this.parseVariableOrNumberOrBool();

        const operator = this.match(
          TT.EQUAL,
          TT.NOTEQUAL,
          TT.LESSTHANOREQUAL,
          TT.GREATERTHAN,
          TT.GREATERTHANOREQUAL,
          TT.LESSTHAN,
          TT.PLUS,
          TT.MINUS,
          TT.MULTIPLY,
          TT.DIV,
          TT.REMAINDER
        );
        if (operator != null) {
          const rightFormulaNode = this.expr();
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
        throw new SyntacticAnalysisError(
          `Условие не должно быть пустым`,
          this.pos
        );
      }

      this.require(TT.CLOSEPAREN);
      return loopNode;
    }
    // Здесь обрабатываем выражение присваивания или инкремента
    if (this.match(TT.IDENTIFIER)) {
      this.pos -= 1;
      let variableNode = this.parseVariableOrNumberOrBool();
      // Проверяем есть ли оператор присвоения после переменной или составной оператор
      const assignOperator = this.match(
        TT.ASSIGNMENT,
        TT.COMMINUS,
        TT.COMMULT,
        TT.COMPLUS,
        TT.COMDIV,
        TT.COMREM
      );

      if (assignOperator != null) {
        if (variableNode instanceof UnarOperationNode) {
          throw new SyntacticAnalysisError(`Неправильное выражение`, this.pos);
        }
        const rightFormulaNode = this.expr();
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
        throw new SyntacticAnalysisError(`Ожидался оператор`, this.pos);
      }
    }
    throw new SyntacticAnalysisError(`Недопустимое выражение`, this.pos);
  }

  parseCode(): ExpressionNode {
    // Создаем корень дерева
    const root = new ProgramNode();
    this.require(TT.MAIN);
    this.require(TT.OPENBRACE);
    const main = new FunctionNode(TT.MAIN.name);

    while (this.pos < this.tokens.length - 1) {
      // Парсим строчку кода
      const codeStringNode = this.parseExpression();
      // Требуем точку с запятой  после строки
      this.require(TT.SEMICOLON);
      main.addNode(codeStringNode);
    }
    this.require(TT.CLOSEBRACE);
    root.addNode(main);
    return root;
  }
}
