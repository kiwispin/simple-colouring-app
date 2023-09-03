document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageUpload = document.getElementById('imageUpload');
    const colorBoxes = document.querySelectorAll(".color-box");
    let currentColor = [0, 0, 0, 255]; // Default to black

    colorBoxes.forEach(box => {
        box.addEventListener('click', function() {
            currentColor = hexToRgba(this.dataset.color);
            colorBoxes.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });

        box.addEventListener('dblclick', function() {
            const customColor = window.prompt('Enter a custom color in HEX format:', '#ffffff');
            if (customColor) {
                this.dataset.color = customColor;
                this.style.backgroundColor = customColor;
                currentColor = hexToRgba(customColor);
                colorBoxes.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            }
        });
    });

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    canvas.addEventListener('click', function(event) {
        const x = event.clientX - this.getBoundingClientRect().left;
        const y = event.clientY - this.getBoundingClientRect().top;
        floodFill(canvas, x, y, currentColor);
    });
});

function hexToRgba(hex) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b, 255];  // assuming full opacity
}

function floodFill(canvas, x, y, newColor) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getColorAtPixel(imageData, x, y);

    if (colorsMatch(targetColor, newColor)) return;

    const queue = [];
    queue.push([x, y]);

    while (queue.length) {
        const [currentX, currentY] = queue.shift();
        const currentColor = getColorAtPixel(imageData, currentX, currentY);

        if (!colorsMatch(currentColor, targetColor)) continue;

        putColorAtPixel(imageData, currentX, currentY, newColor);

        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const nextX = currentX + dx;
            const nextY = currentY + dy;

            if (nextX >= 0 && nextX < canvas.width && nextY >= 0 && nextY < canvas.height) {
                const adjacentColor = getColorAtPixel(imageData, nextX, nextY);
                if (colorsMatch(adjacentColor, targetColor)) {
                    queue.push([nextX, nextY]);
                }
            }
        });
    }

    ctx.putImageData(imageData, 0, 0);
}

function getColorAtPixel(imageData, x, y) {
    const {width, data} = imageData;
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function putColorAtPixel(imageData, x, y, color) {
    const {width, data} = imageData;
    const index = (y * width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
}

function colorsMatch(a, b, tolerance = 30) {
    for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i] - b[i]) > tolerance) return false;
    }
    return true;
}
