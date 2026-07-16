# Excel Grid View

## Objective

The objective of this project is to build a high-performance, Excel-like spreadsheet application using **TypeScript** and **HTML5 Canvas**.

The application demonstrates advanced software engineering concepts by implementing:

- Virtualized rendering for large datasets
- Spreadsheet-style row and column management
- Formula evaluation and dependency tracking
- Command Pattern based Undo/Redo functionality
- Object-Oriented Programming (OOP)
- SOLID Design Principles
- Canvas-based rendering architecture
- Extensible Action/Handler based event system

The grid is designed to support large datasets efficiently while maintaining smooth scrolling, editing, and selection interactions.

---

# How to Install and Run

## Clone the Repository

```bash
git clone https://github.com/Piyush-Pawar-079/Excel_Grid_View.git
```

## Navigate to the Project

```bash
cd Excel_Grid_View
```

## Install Dependencies

```bash
npm install
```

## Build the Project

```bash
npm run build
```

## Run the Application

Open:

```text
index.html
```

in a browser

OR serve the project using a local development server:

```bash
npx live-server
```

or

```bash
npm start
```

if configured.

---

# Features Implemented

## Grid Features

- Virtualized canvas-based rendering
- Large dataset support
- Sticky row headers
- Sticky column headers
- Smooth scrolling
- Dynamic row heights
- Dynamic column widths

## Selection Features

- Single cell selection
- Multi-cell range selection
- Row selection
- Column selection
- Drag selection
- Keyboard navigation
- Active cell tracking

## Editing Features

- Double-click editing
- Inline editing
- Formula editing
- Formula bar synchronization
- Numeric value detection
- Cell value updates

## Formula Features

Supported functions:

- SUM
- AVG
- COUNT
- MIN
- MAX

Additional functionality:

- Formula dependency tracking
- Automatic recalculation
- Formula error handling
- Cell reference resolution

## Row and Column Features

- Row resizing
- Column resizing
- Live resize preview
- Undoable resizing

## Command Features

- Undo
- Redo
- Command history tracking
- Reversible operations

## Summary Features

For selected ranges:

- Count
- Sum
- Average
- Minimum
- Maximum

---

## Folder and Class Structure
- `main.ts` — application entry point responsible for bootstrapping the application, creating the data store, initializing the grid, and starting the rendering lifecycle.
- `src/`
  - `actions/`
    - `IGridPointerAction.ts` — contract/interface implemented by all pointer-based actions.
    - `CellSelectionAction.ts` — handles single-cell selection, range selection, and drag-based cell selection.
    - `RowSelectionAction.ts` — handles complete row selection and row drag expansion.
    - `ColumnSelectionAction.ts` — handles complete column selection and column drag expansion.
    - `ColumnResizeAction.ts` — handles column resize detection, resizing, and resize completion.
    - `RowResizeAction.ts` — handles row resize detection, resizing, and resize completion.
    - `CursorAction.ts` — manages pointer cursor updates based on the current interaction area.
  - `handlers/`
    - `PointerHandler.ts` — central dispatcher responsible for delegating pointer events to registered actions.
    - `GridContext.ts` — shared context object that provides actions access to grid state and services without tightly coupling them to the Grid implementation.
  - `core/`
    - `Grid.ts` — main application controller responsible for coordinating rendering, selection, editing, scrolling, formulas, commands, and event wiring.
    - `ViewportManager.ts` — manages viewport dimensions, scroll offsets, visible cell calculations, and hit-testing.
    - `SelectionManager.ts` — maintains active cell information, selection ranges, row selections, and column selections.
    - `EditManager.ts` — controls the complete cell-editing lifecycle including editor positioning, activation, and commit/cancel operations.
    - `SummaryCalculator.ts` — calculates Count, Sum, Average, Minimum, and Maximum values for selected ranges.
  - `render/`
    - `GridRenderer.ts` — canvas rendering engine responsible for drawing cells, headers, selections, grid lines, and visual states.
  - `formula/`
    - `FormulaEvaluator.ts` — evaluates formulas and computes final cell values.
    - `FormulaParser.ts` — converts formula text into a valid expression tree structure.
    - `FormulaTokenizer.ts` — breaks formulas into tokens for parsing.
    - `ASTNodes.ts` — contains Abstract Syntax Tree node definitions used during parsing and evaluation.
  - `commands/`
    - `ICommand.ts` — command interface defining execute and undo operations.
    - `CommandManager.ts` — maintains undo and redo stacks and executes commands.
    - `EditCellCommand.ts` — encapsulates cell-edit actions with undo and redo support.
    - `ResizeColumnCommand.ts` — encapsulates column-resize actions with undo and redo support.
    - `ResizeRowCommand.ts` — encapsulates row-resize actions with undo and redo support.
  - `models/`
    - `CellModel.ts` — represents spreadsheet cell data including raw values, computed values, and formula state.
    - `ColumnModel.ts` — represents column metadata such as width and configuration.
    - `RowModel.ts` — represents row metadata such as height and configuration.
  - `store/`
    - `IGridDataStore.ts` — abstraction layer for all grid data operations.
    - `GridDataStore.ts` — central data storage implementation for cells, rows, columns, and formula dependencies.
    - `JsonDataLoader.ts` — loads external JSON datasets and maps them into the grid data store.
  - `utils/`
    - `CellUtils.ts` — utility functions for spreadsheet references, coordinate conversions, and helper operations.

---

# How OOP Concepts Are Applied

## Encapsulation

The project encapsulates data and behavior inside dedicated classes.

Examples:

- SelectionManager encapsulates selection state.
- ViewportManager encapsulates viewport calculations.
- CommandManager encapsulates command history.
- FormulaEvaluator encapsulates formula processing.

Internal implementation details remain hidden behind public APIs.

---

## Abstraction

Complex functionality is hidden behind simple interfaces.

Examples:

```text
Grid
    ↓
SelectionManager

Grid
    ↓
EditManager

Grid
    ↓
FormulaEvaluator
```

The Grid class delegates specialized behavior instead of implementing every detail directly.

---

## Inheritance

Command implementations follow shared behavior through a common command abstraction.

Examples:

```text
EditCellCommand
ResizeColumnCommand
ResizeRowCommand
```

All commands expose common execute and undo functionality.

---

## Polymorphism

The Action architecture utilizes polymorphism extensively.

All actions implement:

```ts
IGridPointerAction
```

Examples:

```text
CellSelectionAction
ColumnSelectionAction
RowSelectionAction
ColumnResizeAction
RowResizeAction
CursorAction
```

PointerHandler interacts with them uniformly without requiring knowledge of their internal implementations.

---

# How SOLID Principles Are Applied

## Single Responsibility Principle (SRP)

Every class is responsible for one concern.

Examples:

```text
GridRenderer
→ Drawing

SelectionManager
→ Selection

EditManager
→ Editing

FormulaEvaluator
→ Formulas

SummaryCalculator
→ Statistics
```

---

## Open/Closed Principle (OCP)

The system is open for extension but closed for modification.

New functionality can be introduced by adding new action classes.

Example:

```ts
class AutofillAction implements IGridPointerAction
```

No existing code needs modification.

---

## Liskov Substitution Principle (LSP)

Any class implementing:

```ts
IGridPointerAction
```

can be substituted without affecting PointerHandler.

Similarly, command implementations can be substituted without affecting CommandManager.

---

## Interface Segregation Principle (ISP)

Small focused interfaces are used.

Examples:

```ts
IGridPointerAction
IGridDataStore
```

Consumers depend only on methods they actually use.

---

## Dependency Inversion Principle (DIP)

High-level modules depend on abstractions rather than concrete implementations.

Examples:

```text
Grid
  ↓
IGridDataStore
```

```text
PointerHandler
  ↓
IGridPointerAction
```

This improves modularity and testability.

---

# How the Command Pattern Is Applied

The project uses the Command Pattern to support Undo and Redo functionality.

## Command Interface

All commands implement:

```ts
execute()
undo()
```

---

## Command Implementations

### EditCellCommand

Encapsulates:

```text
Old Value
New Value
Cell Position
```

Supports reverting edits through undo.

---

### ResizeColumnCommand

Encapsulates:

```text
Column Index
Old Width
New Width
```

Supports undoing and reapplying resize operations.

---

### ResizeRowCommand

Encapsulates:

```text
Row Index
Old Height
New Height
```

Supports undoing and reapplying resize operations.

---

## CommandManager Workflow

```text
User Action
     ↓
Create Command
     ↓
Execute Command
     ↓
Push To Undo Stack
     ↓
Clear Redo Stack
```

### Undo

```text
Undo Stack
     ↓
undo()
     ↓
Redo Stack
```

### Redo

```text
Redo Stack
     ↓
execute()
     ↓
Undo Stack
```

---

# How Virtual Rendering Works

Rendering every cell in a large spreadsheet would create significant performance problems.

To solve this, the application uses viewport virtualization.

## Workflow

```text
Scroll Position
       ↓
ViewportManager
       ↓
Visible Range Calculation
       ↓
GridRenderer
       ↓
Render Only Visible Cells
```

---

# How Data Is Generated and Loaded

The application stores cell data using a sparse storage approach.

## Data Flow

```text
User Input
      ↓
CellModel
      ↓
GridDataStore
      ↓
Formula Evaluation
      ↓
Grid Rendering
```

## Storage Strategy

Only populated cells are stored.

Benefits:

- Reduced memory usage
- Fast retrieval
- Improved scalability

---

# How Undo/Redo Works

## Undo

```text
User Action
      ↓
Command Created
      ↓
Undo Stack
```

When Undo is requested:

```text
Undo Stack
      ↓
undo()
      ↓
Redo Stack
```

---

## Redo

```text
Redo Stack
      ↓
execute()
      ↓
Undo Stack
```

This guarantees consistent state restoration.

---

# Test Cases Covered

| ID | Test Scenario | Expected Result | Actual Result |
|----|-------------|----------------|--------------|
| TC-01 | Application initialization | Grid loads successfully | Passed |
| TC-02 | Canvas rendering | Visible cells render correctly | Passed |
| TC-03 | Horizontal scrolling | Columns scroll smoothly | Passed |
| TC-04 | Vertical scrolling | Rows scroll smoothly | Passed |
| TC-05 | Single cell selection | Active cell updates | Passed |
| TC-06 | Multi-cell selection | Selection range expands correctly | Passed |
| TC-07 | Row selection | Entire row highlighted | Passed |
| TC-08 | Column selection | Entire column highlighted | Passed |
| TC-09 | Double-click edit | Editor opens correctly | Passed |
| TC-10 | Text value entry | Value stored successfully | Passed |
| TC-11 | Numeric value entry | Stored as numeric type | Passed |
| TC-12 | SUM formula | Correct result calculated | Passed |
| TC-13 | AVG formula | Correct result calculated | Passed |
| TC-14 | MIN formula | Correct result calculated | Passed |
| TC-15 | MAX formula | Correct result calculated | Passed |
| TC-16 | Formula dependency update | Dependent cells recalculate | Passed |
| TC-17 | Column resize | Width updates correctly | Passed |
| TC-18 | Row resize | Height updates correctly | Passed |
| TC-19 | Undo functionality | Previous state restored | Passed |
| TC-20 | Redo functionality | State reapplied successfully | Passed |

---

# Performance Observations

## Virtual Rendering

Only visible cells are rendered.

Benefits:

- O(Visible Cells) rendering cost
- Constant rendering performance
- Reduced unnecessary drawing operations

---

## Dataset Handling

The application supports very large datasets due to:

- Sparse data storage
- Virtual rendering
- Canvas-based drawing

---

# Accessibility Considerations

The application includes several accessibility improvements.

## Keyboard Accessibility

Supported navigation:

- Arrow Keys
- Enter
- Escape
- Ctrl + Z
- Ctrl + Y

---

## Selection Accessibility

Selections use:

- Color differences
- Border outlines
- Active cell indicators

to improve visibility for colorblind users.

---

## Status Updates

Summary information is displayed using standard HTML elements and can be enhanced with:

```html
aria-live="polite"
```

for screen reader announcements.

---

# Known Limitations

Current limitations include:

- No persistent storage
- No real-time collaboration
- No merged cells
- No CSV import/export
- No Excel import/export
- No chart support
