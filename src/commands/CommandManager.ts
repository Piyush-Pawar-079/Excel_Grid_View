import { ICommand } from './ICommand';

export class CommandManager {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];
    private readonly maxHistory = 100;

    public execute(command: ICommand) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo stack on new action
        
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
    }

    public undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop()!;
            command.undo();
            this.redoStack.push(command);
        }
    }

    public redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop()!;
            command.execute();
            this.undoStack.push(command);
        }
    }
}
