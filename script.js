const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let boxes = [];
let undoStack = [];
let isDrawing = false;
let startX, startY, currentX, currentY;
let selectedBox = null;

const MIN_BOX_SIZE = 50;  // Minimum box size

// Reposition and style the label input box
const labelInput = document.createElement('input');
labelInput.setAttribute('type', 'text');
labelInput.setAttribute('id', 'labelInput');
document.body.appendChild(labelInput);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawBox(box) {
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';

    let displayText = box.label;
    const textWidth = ctx.measureText(box.label).width;
    if (textWidth > box.width - 10) {
        while (ctx.measureText(displayText + '...').width > box.width - 10) {
            displayText = displayText.slice(0, -1);
        }
        displayText += '...';
    }

    ctx.fillText(displayText, box.x + 5, box.y + 20);
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    boxes.forEach(drawBox);
}

function isPointInBox(x, y, box) {
    return (
        x >= box.x &&
        x <= box.x + box.width &&
        y >= box.y &&
        y <= box.y + box.height
    );
}

function isOverlapping(newBox) {
    return boxes.some(box => {
        return !(
            newBox.x + newBox.width <= box.x ||
            newBox.x >= box.x + box.width ||
            newBox.y + newBox.height <= box.y ||
            newBox.y >= box.y + box.height
        );
    });
}

canvas.addEventListener('mousedown', (e) => {
    const clickedBox = boxes.find(box => isPointInBox(e.offsetX, e.offsetY, box));
    if (clickedBox) {
        selectedBox = clickedBox;
        labelInput.style.display = 'block';
        labelInput.style.left = `${selectedBox.x + canvas.offsetLeft}px`;
        labelInput.style.top = `${selectedBox.y + canvas.offsetTop}px`;
        labelInput.value = selectedBox.label;
        labelInput.focus();

        labelInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                selectedBox.label = labelInput.value;
                labelInput.style.display = 'none';
                redraw();
            }
        };
        return;
    }
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
    currentX = startX;
    currentY = startY;
    selectedBox = null;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    currentX = e.offsetX;
    currentY = e.offsetY;

    const width = currentX - startX;
    const height = currentY - startY;
    const potentialBox = {
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(width),
        height: Math.abs(height)
    };

    if (isOverlapping(potentialBox)) {
        redraw();
        return;
    }

    redraw();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#666';
    ctx.strokeRect(potentialBox.x, potentialBox.y, potentialBox.width, potentialBox.height);
    ctx.setLineDash([]);
});

canvas.addEventListener('mouseup', () => {
    if (!isDrawing) return;
    const width = currentX - startX;
    const height = currentY - startY;

    // Ensure box meets minimum size requirements
    if (Math.abs(width) >= MIN_BOX_SIZE && Math.abs(height) >= MIN_BOX_SIZE) {
        const newBox = {
            x: Math.min(startX, currentX),
            y: Math.min(startY, currentY),
            width: Math.abs(width),
            height: Math.abs(height),
            label: ''
        };

        if (!isOverlapping(newBox)) {
            boxes.push(newBox);
            undoStack = [];
            redraw();

            labelInput.style.display = 'block';
            labelInput.style.left = `${newBox.x + canvas.offsetLeft}px`;
            labelInput.style.top = `${newBox.y + canvas.offsetTop}px`;
            labelInput.value = '';
            labelInput.focus();

            labelInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    newBox.label = labelInput.value;
                    labelInput.style.display = 'none';
                    redraw();
                }
            };
        }
    }
    isDrawing = false;
});

function undo() {
    if (boxes.length > 0) {
        undoStack.push(boxes.pop());
        redraw();
    }
}

function redo() {
    if (undoStack.length > 0) {
        boxes.push(undoStack.pop());
        redraw();
    }
}

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        undo();
    } else if (e.ctrlKey && e.key === 'y') {
        redo();
    }
});
