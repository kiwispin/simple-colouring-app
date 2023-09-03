const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let chosenColor = [0, 0, 0, 255];  // Default color: Black
let selectedColorElement = null;  // To keep track of the currently selected color's element

canvas.addEventListener("click", function(event) {
    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;

    floodFill(x, y, chosenColor);
});

function setColor(color) {
    chosenColor = hexToRgba(color);

    if (selectedColorElement) {
        selectedColorElement.classList.remove('selected-color');
    }

    // Find the color element
    const colorElement = document.querySelector(`.color-box[data-color="${color}"]`);
    if (colorElement) {
        colorElement.classList.add('selected-color');
        selectedColorElement = colorElement;
    }
}

function hexToRgba(hex) {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b, 255];
}

function getColorAtPixel(imageData, x, y) {
    const { width } = imageData;
    const offset = (y * width + x) * 4;

    return [
        imageData.data[offset],
        imageData.data[offset + 1],
        imageData.data[offset + 2],
        imageData.data[offset + 3],
    ];
}

function floodFill(x, y, newColor) {
    const targetColor = getColorAtPixel(ctx.getImageData(0, 0, canvas.width, canvas.height), x, y);
    
    if (colorsMatch(targetColor, newColor)) return;

    const pixelsToCheck = [x, y];
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    while (pixelsToCheck.length) {
        const currentY = pixelsToCheck.pop();
        const currentX = pixelsToCheck.pop();

        const currentColor = getColorAtPixel(imageData, currentX, currentY);
        if (colorsMatch(currentColor, targetColor)) {
            setPixelColor(imageData, currentX, currentY, newColor);
            
            pixelsToCheck.push(currentX + 1, currentY);
            pixelsToCheck.push(currentX - 1, currentY);
            pixelsToCheck.push(currentX, currentY + 1);
            pixelsToCheck.push(currentX, currentY - 1);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function setPixelColor(imageData, x, y, color) {
    const offset = (y * imageData.width + x) * 4;
    imageData.data[offset] = color[0];
    imageData.data[offset + 1] = color[1];
    imageData.data[offset + 2] = color[2];
    imageData.data[offset + 3] = color[3];
}

function colorsMatch(a, b) {
    for (let i = 0; i < 4; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
        }
        image.src = event.target.result;
    }

    reader.readAsDataURL(file);
});
