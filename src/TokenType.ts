export default class TokenType {
  name: string;
  regex: RegExp;

  constructor(name: string, regex: RegExp) {
    this.name = name;
    this.regex = regex;
  }
}

export const TokenTypes = {
  NUMBER: new TokenType("NUMBER", /^[0-9]+/), // Число
  DO: new TokenType("DO", /^do/), // Токен для ключевого слова do
  WHILE: new TokenType("WHILE", /^while/), // Токен для ключевого слова while
  INCLUDE: new TokenType("INCLUDE", /^#include\s*<\w+>/), // Директива Include
  MAIN: new TokenType("MAIN", /^int\s*main\s*\(\s*\)/), // функция MAIN
  COMMENT: new TokenType("COMMENT", /^\/\/.+/), // комментарии
  DECLARATION: new TokenType("DECLARATION", /^int/), // Токен для объявления переменных
  ASSIGNMENT: new TokenType("ASSIGNMENT", /^=/), // Токен для оператора присваивания
  INCREMENT: new TokenType("INCREMENT", /^\+\+/), // Токен для оператора инкремента
  LESSTHANOREQUAL: new TokenType("LESSTHANOREQUAL", /^<=/), // Токен для оператора "меньше или равно"
  GREATERTHANOREQUAL: new TokenType("GREATERTHANOREQUAL", /^>=/), // Токен для оператора "больше или равно"
  LESSTHAN: new TokenType("LESSTHAN", /^</), // Токен для оператора "меньше"
  GREATERTHAN: new TokenType("GREATERTHAN", /^>/), // Токен для оператора "больше"
  NOTEQUAL: new TokenType("NOTEQUAL", /^!=/), // Токен для оператора "не равно"
  EQUAL: new TokenType("EQUAL", /^==/), // Токен для оператора "равно"
  SPACE: new TokenType("SPACE", /^ /), // Токен для пробела
  TAB: new TokenType("TAB", /^\t/), // Токен для табуляции
  CARRIAGE: new TokenType("CARRIAGE", /^\r/), // Токен для каретки
  NEWLINE: new TokenType("NEWLINE", /^\n/), // Перенос строки
  SEMICOLON: new TokenType("SEMICOLON", /^;/), // Точка с запятой
  IDENTIFIER: new TokenType("IDENTIFIER", /^[a-zA-Z0-9_]+/), // Название переменных
  OPENPAREN: new TokenType("OPENPAREN", /^\(/), // Токен для открывающей круглой скобки
  CLOSEPAREN: new TokenType("CLOSEPAREN", /^\)/), // Токен для закрывающей круглой скобки
  OPENBRACE: new TokenType("OPENBRACE", /^\{/), // Токен для открывающей фигурной скобки
  CLOSEBRACE: new TokenType("CLOSEBRACE", /^\}/), // Токен для закрывающей фигурной скобки
  PLUS: new TokenType("PLUS", /^\+/), // Токен для плюса
  MINUS: new TokenType("CLOSEBMINUSRACE", /^\-/), // Токен для минуса
  DIV: new TokenType("DIV", /^\//), // Токен для деления
  MULTIPLY: new TokenType("MULTIPLY", /^\*/), // Токен умножения
  REMAINDER: new TokenType("REMAINDER", /^\%/), // Токен для деления с остатком
};
