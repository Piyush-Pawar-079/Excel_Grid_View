import { Token, TokenType, FormulaTokenizer } from './FormulaTokenizer';
import { ASTNode, ASTNodeType, NumberNode, CellRefNode, CellRangeNode, FunctionNode, BinaryOpNode } from './ASTNodes';
import { CellUtils } from '../utils/CellUtils';

export class FormulaParser {
    private tokens: Token[] = [];
    private pos = 0;

    public parse(input: string): ASTNode {
        const tokenizer = new FormulaTokenizer(input);
        this.tokens = tokenizer.tokenize();
        this.pos = 0;
        
        const node = this.parseExpression();
        
        if (this.pos < this.tokens.length && this.tokens[this.pos].type !== TokenType.EOF) {
            throw new Error('Unexpected token at end of formula');
        }
        
        return node;
    }

    private peek(): Token {
        if (this.pos >= this.tokens.length) {
            return { type: TokenType.EOF, value: '' };
        }
        return this.tokens[this.pos];
    }

    private consume(expectedType?: TokenType): Token {
        const token = this.peek();
        if (expectedType && token.type !== expectedType) {
            throw new Error(`Expected ${expectedType} but got ${token.type}`);
        }
        this.pos++;
        return token;
    }

    private parseExpression(): ASTNode {
        return this.parseTerm();
    }

    private parseTerm(): ASTNode {
        let left = this.parseFactor();

        while (this.peek().type === TokenType.OPERATOR && ['+', '-'].includes(this.peek().value)) {
            const operator = this.consume().value as '+' | '-';
            const right = this.parseFactor();
            left = { type: ASTNodeType.BINARY_OP, operator, left, right } as BinaryOpNode;
        }

        return left;
    }

    private parseFactor(): ASTNode {
        let left = this.parsePrimary();

        while (this.peek().type === TokenType.OPERATOR && ['*', '/'].includes(this.peek().value)) {
            const operator = this.consume().value as '*' | '/';
            const right = this.parsePrimary();
            left = { type: ASTNodeType.BINARY_OP, operator, left, right } as BinaryOpNode;
        }

        return left;
    }

    private parsePrimary(): ASTNode {
        const token = this.peek();

        if (token.type === TokenType.NUMBER) {
            this.consume();
            return { type: ASTNodeType.NUMBER, value: parseFloat(token.value) } as NumberNode;
        }

        if (token.type === TokenType.LPAREN) {
            this.consume();
            const expr = this.parseExpression();
            this.consume(TokenType.RPAREN);
            return expr;
        }

        if (token.type === TokenType.IDENTIFIER) {
            return this.parseIdentifierOrFunction();
        }

        throw new Error(`Unexpected token ${token.value}`);
    }

    private parseIdentifierOrFunction(): ASTNode {
        const idToken = this.consume(TokenType.IDENTIFIER);
        const name = idToken.value;

        // Is it a function? e.g., SUM(
        if (this.peek().type === TokenType.LPAREN) {
            this.consume(TokenType.LPAREN);
            const args: ASTNode[] = [];
            
            if (this.peek().type !== TokenType.RPAREN) {
                args.push(this.parseArgument());
                while (this.peek().type === TokenType.COMMA) {
                    this.consume(TokenType.COMMA);
                    args.push(this.parseArgument());
                }
            }
            this.consume(TokenType.RPAREN);
            return { type: ASTNodeType.FUNCTION, name, args } as FunctionNode;
        }

        // It's a cell reference or range. Let's see if it's followed by a colon
        const startCell = CellUtils.parseCellReference(name);
        if (!startCell) {
            throw new Error(`Invalid cell reference: ${name}`);
        }
        
        let node: ASTNode = { type: ASTNodeType.CELL_REF, row: startCell.row, col: startCell.col } as CellRefNode;

        if (this.peek().type === TokenType.COLON) {
            this.consume(TokenType.COLON);
            const endIdToken = this.consume(TokenType.IDENTIFIER);
            const endCell = CellUtils.parseCellReference(endIdToken.value);
            if (!endCell) {
                throw new Error(`Invalid cell reference: ${endIdToken.value}`);
            }
            node = {
                type: ASTNodeType.CELL_RANGE,
                startRow: Math.min(startCell.row, endCell.row),
                startCol: Math.min(startCell.col, endCell.col),
                endRow: Math.max(startCell.row, endCell.row),
                endCol: Math.max(startCell.col, endCell.col)
            } as CellRangeNode;
        }

        return node;
    }

    private parseArgument(): ASTNode {
        // an argument might be a range directly if it's not handled in primary
        // Actually, our parseExpression handles it because parsePrimary handles identifiers and ranges.
        return this.parseExpression();
    }
}
