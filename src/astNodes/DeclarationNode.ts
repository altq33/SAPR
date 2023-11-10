import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";
import VariableNode from "./VariableNode";

export default class DeclarationNode extends ExpressionNode {
  variable: VariableNode;
  initialValue: ExpressionNode | null;

  constructor(variable: VariableNode, initialValue: ExpressionNode | null) {
    super(NodeTypes.DECLARATION);
    this.variable = variable;
    this.initialValue = initialValue;
  }
}
