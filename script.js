const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let boxes = []; // Stack of drawn boxes for undo/redo
let undoStack = []; // Stack to support redo
let isDrawing = false;
let startX, startY, currentX, currentY;

// Resize the canvas to fill the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw(); // Redraw boxes after resizing
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw a single box
function drawBox(box) {
    ctx.strokeRect(box.x, box.y, box.width, box.height);
}

// Redraw all boxes from the stack
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    boxes.forEach(drawBox);
}

// Start drawing a box
canvas.addEventListener('mousedown', (e) => {
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
    currentX = startX;
    currentY = startY;
});

// While drawing, show a rectangle outline
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    currentX = e.offsetX;
    currentY = e.offsetY;
    redraw(); // Redraw all boxes first
    ctx.setLineDash([5, 5]); // Dashed outline for drawing
    ctx.strokeStyle = '#666';
    ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
    ctx.setLineDash([]); // Remove dashed outline after drawing
});

// Finish drawing a box and add it to the stack
canvas.addEventListener('mouseup', () => {
    if (!isDrawing) return;
    const box = {
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(currentX - startX),
        height: Math.abs(currentY - startY)
    };
    boxes.push(box);
    undoStack = []; // Clear redo stack on new action
    isDrawing = false;
    redraw();
});

// Undo function
function undo() {
    if (boxes.length > 0) {
        undoStack.push(boxes.pop());
        redraw();
    }
}

// Redo function
function redo() {
    if (undoStack.length > 0) {
        boxes.push(undoStack.pop());
        redraw();
    }
}

// Button click events for undo and redo
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// Keyboard shortcuts for undo (Ctrl+Z) and redo (Ctrl+Y)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        undo();
    } else if (e.ctrlKey && e.key === 'y') {
        redo();
    }
});
