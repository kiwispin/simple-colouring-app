document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageUpload = document.getElementById('imageUpload');
    let chosenColor = "#FFFFFF";

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
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rgbaColor = hexToRgba(chosenColor);
        floodFill(canvas, x, y, rgbaColor);
    });

    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function () {
            document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            chosenColor = this.getAttribute('data-color') || chosenColor;
        });
    });

    document.querySelector('.custom-color').addEventListener('dblclick', function() {
        chosenColor = prompt("Enter a custom color in HEX:", "#FFFFFF");
        if (chosenColor) {
            this.style.backgroundColor = chosenColor;
            this.setAttribute('data-color', chosenColor);
            document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        }
    });
});

function hexToRgba(hex) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b, 255];
}

function getColorAtPixel(imageData, x, y) {
    const { width, data } = imageData;
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
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

        // Check the adjacent pixels, and if they match the target color, add them to the queue.
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

function putColorAtPixel(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color[0];
    imageData.data[index + 1] = color[1];
    imageData.data[index + 2] = color[2];
    imageData.data[index + 3] = color[3];
}
