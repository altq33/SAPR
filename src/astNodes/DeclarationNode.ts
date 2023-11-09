import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class DeclarationNode extends ExpressionNode {
  variable: ExpressionNode;
  initialValue: ExpressionNode | null;

  constructor(variable: ExpressionNode, initialValue: ExpressionNode | null) {
    super(NodeTypes.DECLARATION);
    this.variable = variable;
    this.initialValue = initialValue;
  }
}
