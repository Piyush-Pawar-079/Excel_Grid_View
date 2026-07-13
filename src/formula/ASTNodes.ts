export enum ASTNodeType {
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    CELL_REF = 'CELL_REF',
    CELL_RANGE = 'CELL_RANGE',
    FUNCTION = 'FUNCTION',
    BINARY_OP = 'BINARY_OP'
}

export interface ASTNode {
    type: ASTNodeType;
}

export interface NumberNode extends ASTNode {
    type: ASTNodeType.NUMBER;
    value: number;
}

export interface CellRefNode extends ASTNode {
    type: ASTNodeType.CELL_REF;
    row: number;
    col: number;
}

export interface CellRangeNode extends ASTNode {
    type: ASTNodeType.CELL_RANGE;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

export interface BinaryOpNode extends ASTNode {
    type: ASTNodeType.BINARY_OP;
    operator: '+' | '-' | '*' | '/';
    left: ASTNode;
    right: ASTNode;
}

export interface FunctionNode extends ASTNode {
    type: ASTNodeType.FUNCTION;
    name: string;
    args: ASTNode[];
}
