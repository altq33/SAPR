import fs from "fs";
import readlineSync from "readline-sync";
import Lexer from "./Lexer";
import Parser from "./Parser";
import { WrongFilenameError } from "./errors";
import { Semantic } from "./Semantic";
import { Synthesizer } from "./Synthesizer";

const fileName =
  "assets/inputs/" + readlineSync.question("Enter filename: ") + ".cpp";

const outputFileName =
  "assets/outputs/" +
  readlineSync.question("Enter filename for ouput: ") +
  ".py";

let fileString;

try {
  fileString = fs.readFileSync(fileName).toString();
} catch {
  throw new WrongFilenameError("Неправильный путь до файла");
}

const lexer = new Lexer(fileString);
const tokenList = lexer.lexAnalysis();
const parser = new Parser(tokenList);
const AST = parser.parseCode();
const semantic = new Semantic(tokenList);
semantic.parseCode();

const pythonCode = new Synthesizer().synthesize(AST);

try {
  fs.writeFileSync(
    "assets/outputs/tokens.json",
    JSON.stringify(tokenList, null, 2)
  );

  fs.writeFileSync("assets/outputs/ast.json", JSON.stringify(AST, null, 2));

  fs.writeFileSync(outputFileName, pythonCode);
} catch {
  throw new WrongFilenameError("Неправильный путь до файла");
}
