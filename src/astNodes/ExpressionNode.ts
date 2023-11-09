export enum NodeTypes {
  BIN_OP = "BINARY_OPERATION",
  BOOL = "BOOL",
  DECLARATION = "DECLARATION",
  FUNCTION = "FUNCTION",
  LOOP = "LOOP",
  NUMBER = "NUMBER",
  PARENS = "PARENS",
  PROGRAM = "PROGRAM",
  UN_OP = "UNARY_OPERATION",
  VARIABLE = "VARIABLE",
}

export default class ExpressionNode {
  type: NodeTypes;

  constructor(type: NodeTypes) {
    this.type = type;
  }
}
