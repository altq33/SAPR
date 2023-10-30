import fs from "fs";
import readlineSync from "readline-sync";
import Lexer from "./Lexer";
import Parser from "./Parser";
import util from "util";

// const fileName =
//   "assets/inputs/" + readlineSync.question("Enter filename: ") + ".cpp";
const fileName = "assets/inputs/test.cpp";

const fileString = fs.readFileSync(fileName).toString();

const lexer = new Lexer(fileString);

const parser = new Parser(lexer.lexAnalysis());

console.log(
  util.inspect(parser.parseCode(), {
    showHidden: false,
    depth: null,
    colors: true,
  })
);
