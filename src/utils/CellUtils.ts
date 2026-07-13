export class CellUtils {
    public static parseCellReference(ref: string): { row: number, col: number } | null {
        const match = ref.match(/^([A-Z]+)(\d+)$/i);
        if (!match) return null;

        const colStr = match[1].toUpperCase();
        const rowStr = match[2];

        let col = 0;
        for (let i = 0; i < colStr.length; i++) {
            col = col * 26 + (colStr.charCodeAt(i) - 64);
        }
        col -= 1; // 0-indexed

        const row = parseInt(rowStr, 10) - 1; // 0-indexed

        return { row, col };
    }

    public static toColumnName(colIndex: number): string {
        let name = '';
        let col = colIndex;
        while (col >= 0) {
            name = String.fromCharCode((col % 26) + 65) + name;
            col = Math.floor(col / 26) - 1;
        }
        return name;
    }

    public static toCellReference(row: number, col: number): string {
        return `${this.toColumnName(col)}${row + 1}`;
    }
}
