# Excel Grid View

## Project Name and Objective

**Excel Grid View** is a browser-based spreadsheet-style grid application built with TypeScript and HTML5 Canvas. The objective is to provide a fast, virtualized grid viewer and editor with row/column headers, selection, in-cell editing, formula support, clipboard operations, undo/redo, and efficient rendering for large data sets.

## How to Install and Run

1. Clone the repository.
   ```bash
   git clone https://github.com/Piyush-Pawar-079/Excel_Grid_View
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Open `index.html` in a browser or serve the project using a local dev server.

## Features Implemented

- Virtual canvas-based grid rendering
- Sticky row and column headers
- Cell selection and highlighting
- In-place editing with text input overlay
- Formula insertion and evaluation (SUM, AVG, COUNT, MIN, MAX)
- Copy/paste support for selected cells
- Undo/redo using command pattern
- Large dataset loading with virtualized drawing
- Summary bar showing count, sum, min, max, average

## Folder and Class Structure

- `src/`
  - `main.ts` - application entry point and grid initialization
  - `core/`
      - `Grid.ts` - main grid controller, state, rendering lifecycle, and event wiring
      - `EditManager.ts` - 
  - `helpers/`
      - `GridRenderer.ts` - canvas render logic for cells, headers, lines, selection, and summary updates
      - `GridLayout.ts` - layout math for offsets, visible range calculation, and spacer sizing
      - `GridEditor.ts` - in-cell editing, formula menu, and edit input positioning
      - `GridClipboard.ts` - copy/paste selection handling
      - `GridEvents.ts` - mouse event delegation and interaction handling
      - `GridKeyboard.ts` - keyboard event processing
      - `GridDoubleClick.ts` - double-click editor activation
  - `commands/` - undo/redo command classes
  - `models/` - core model classes like `Cell`, `DataStore`, `Dimension`, `Range`, `Selection`
  - `data/sampleData.ts` - sample record generation


### Component Responsibilities

- `main.ts`: bootstraps the grid, wires the canvas, and starts initialization.
- `Grid`: coordinates state, event wiring, rendering, and public actions such as undo/redo.
- `DataStore`: stores cell values in a sparse map keyed by row and column.
- `Selection`: tracks the active cell, row, column, or range selection mode.
- `CommandManager`: maintains undo/redo stacks for reversible actions.
- `GridRenderer`: draws the canvas viewport, headers, selection outline, and summary content.
- `GridLayout`: computes offsets, visible ranges, and resize geometry.
- `GridEditor`: handles edit input state, formula insertion, and edit application.
- `GridKeyboard`: responds to keyboard navigation, copy/paste, and undo/redo shortcuts.
- `GridMouse`: handles pointer selection and resize interactions.
- `GridClipboard`: copies and pastes cell values between selections.
- `GridDoubleClick`: opens editing mode or selects full rows/columns on double click.

## How OOP Concepts Are Applied

- Encapsulation: `Grid`, `DataStore`, `Selection`, and command classes hide implementation details behind methods.
- Abstraction: The main `Grid` class doesn't implement complex logic, actions like behaviour triggered by certain mouseEvents are abstracted in their respective implementation
- Polymorphism: command classes implement a shared `Command` interface to provide interchangeable undo/redo operations.

## How SOLID Principles Are Applied

- Single Responsibility: each module handles one concern, e.g. `GridRenderer` for drawing, `GridLayout` for geometry, `GridEditor` for editing.
- Open/Closed: behavior can be extended by adding new command types or render features without changing existing class logic.
- Liskov Substitution: commands implementing `Command` can be used interchangeably by `CommandManager`.
- Interface Segregation: small interfaces like `Command` keep behavior narrow and specific.
- Dependency Inversion: high-level grid logic depends on abstractions such as command interfaces and data store APIs rather than concrete implementations.

## How Command Pattern Is Applied

- `Command` interface defines `execute()` and `undo()`.
- `EditCellCommand`, `ResizeColumnCommand`, `ResizeRowCommand`, and `BatchEditCommand` encapsulate individual changes.
- `CommandManager` maintains undo and redo stacks, executes commands, and reverses actions reliably.

## How Virtual Rendering Works

- The canvas is sized to the wrapper element and uses `window.devicePixelRatio` for crisp rendering.
- `GridLayout` computes visible row and column ranges based on scroll position.
- Only visible cells and grid lines are drawn, reducing rendering work for large tables.
- Sticky headers are rendered separately so row/column labels remain visible while scrolling.

## How Data Is Generated and Loaded

- `data/sampleData.ts` generates sample records with id, first name, last name, age, and salary.
- `Grid.loadData()` formats these records and loads them into `DataStore`.
- `DataStore` stores values in a `Map` keyed by `row:col`.

## How Undo/Redo Works

- User actions are wrapped in command objects and passed to `CommandManager.execute()`.
- `CommandManager` pushes executed commands onto the undo stack and clears the redo stack.
- `undo()` pops a command from undo stack, calls `undo()`, then pushes it onto redo stack.
- `redo()` pops from redo stack, calls `execute()`, and pushes back onto undo stack.

## Test Cases Covered

- Build and compile validation using TypeScript  
- Header stacking and line drawing for sticky row/column headers
- Cell editing input positioning and visibility
- Formula evaluation for supported aggregate functions
- Undo/redo for edit and resize commands
- Copy/paste selection handling and clipboard transfer

## Performance Observations

- Virtual rendering keeps canvas work proportional to visible rows/columns, not total data size.
- Large grids with thousands of rows are supported because offscreen cells are not drawn.
- The current implementation still draws each visible cell individually, so extremely large viewport sizes may increase render time.
- Data store access is fast using a `Map`.

## Accessibility Considerations

- The canvas includes keyboard event handling for navigation and editing.
- The text input editor uses native focus, allowing keyboard users to type normally.
- The summary bar is marked with `aria-live="polite"` for screen reader updates.

## Known Limitations and Next Improvements

- No built-in support for custom cell formatting, selection via keyboard, or merged cells.
- Formulas are limited to a small set of functions and do not support arbitrary expressions.
- Scrolling is based on browser scroll position rather than a dedicated virtual viewport.
- Improvements could include cell virtualization optimizations, better formula parsing, and richer accessibility support.
- Lacks persistant data storage
- Doesn't support collaboration