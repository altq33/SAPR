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
import { TokenTypes as TT } from "./TokenType";

export class Synthesizer {
  result: string = "";
  currentScopeLvl: number = 1;

  addRow(row: string) {
    this.result += `${row}\n`;
  }

  synthesize(node: ExpressionNode): string {
    if (node instanceof ProgramNode) {
      this.addRow(
        `# Generate by TypeScript C++ to PYTHON compilator"\n# Repository: https://github.com/altq33/SAPR\n\n`
      );
      node.body.forEach((el) => {
        const row = this.synthesize(el);
        this.addRow(row);
      });
    }

    if (node instanceof FunctionNode) {
      let row = 'if __name__ == "__main__":\n';
      node.body.forEach((el) => {
        row += `   ${this.synthesize(el)}\n`;
      });
      return row;
    }

    if (node instanceof ParenNode) {
      return `(${this.synthesize(node.innerNode)})`;
    }

    if (node instanceof LoopNode) {
      this.currentScopeLvl += 1;
      let row = `while True:\n`;
      node.body.forEach((el) => {
        row += `${"\t".repeat(this.currentScopeLvl)}${this.synthesize(el)}\n`;
      });
      row += `${"\t".repeat(this.currentScopeLvl)}if not (${this.synthesize(
        node.condition!!
      )}):\n${"\t".repeat(this.currentScopeLvl + 1)}break`;
      this.currentScopeLvl -= 1;
      return row;
    }

    if (node instanceof BoolNode) {
      return `${node.token.text[0].toUpperCase() + node.token.text.slice(1)}`;
    }

    if (node instanceof NumberNode) {
      return `${node.number.text}`;
    }

    if (node instanceof VariableNode) {
      return `${node.variable.text}`;
    }
    if (node instanceof UnarOperationNode) {
      switch (node.operator.type.name) {
        case TT.INCREMENT.name:
          return `${this.synthesize(node.operand)} += 1`;
          break;
        case TT.MINUS.name:
          return `-${this.synthesize(node.operand)}`;
          break;
      }
    }

    if (node instanceof BinOperationNode) {
      return `${this.synthesize(node.leftNode)} ${
        node.operator.text
      } ${this.synthesize(node.rightNode)}`;
    }

    if (node instanceof DeclarationNode) {
      return `${node.variable.variable.text} = ${
        node.initialValue ? this.synthesize(node.initialValue) : "None"
      }`;
    }
    return this.result;
  }
}
