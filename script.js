document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.createElement('input');
    colorPicker.setAttribute('type', 'color');
    colorPicker.style.display = 'none';
    document.body.appendChild(colorPicker);
    const imageUpload = document.getElementById('imageUpload');

    const colorBoxes = document.querySelectorAll('.color-box');

    colorBoxes.forEach(box => {
        box.addEventListener('click', function() {
            // Check if this is the custom color box
            if (this.classList.contains('custom-color')) {
                colorPicker.click();
            } else {
                const color = window.getComputedStyle(this).backgroundColor;
                colorBoxes.forEach(b => b.classList.remove('active-color'));
                this.classList.add('active-color');
            }
        });
    });

    colorPicker.addEventListener('change', function() {
        const customBox = document.querySelector('.custom-color');
        customBox.style.backgroundColor = this.value;
        colorBoxes.forEach(b => b.classList.remove('active-color'));
        customBox.classList.add('active-color');
    });

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvasContainer = document.querySelector('.container');
                    const ratio = img.width / img.height;
                    let newWidth = canvasContainer.clientWidth;
                    let newHeight = newWidth / ratio;

                    if (newHeight > window.innerHeight * 0.8) {
                        newHeight = window.innerHeight * 0.8;
                        newWidth = newHeight * ratio;
                    }

                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
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
        const activeBox = document.querySelector('.active-color');
        const chosenColor = window.getComputedStyle(activeBox).backgroundColor;

        const rgba = getRGBAFromStyle(chosenColor);
        floodFill(canvas, x, y, rgba);
    });
});

function getRGBAFromStyle(style) {
    const rgba = style.slice(5, -1).split(',');
    return [parseInt(rgba[0]), parseInt(rgba[1]), parseInt(rgba[2]), 255];
}

function hexToRgba(hex) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b, 255];
}

function floodFill(canvas, x, y, newColor) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAtPixel(imageData, x, y);

    if (colorsMatch(targetColor, newColor)) {
        return;
    }

    const pixels = [[x, y]];
    const visited = new Set();

    while (pixels.length) {
        const [currentX, currentY] = pixels.pop();
        const currentIndex = (Math.floor(currentY) * canvas.width + Math.floor(currentX)) * 4;

        if (visited.has(currentIndex)) continue;
        visited.add(currentIndex);

        const currentColor = getColorAtPixel(imageData, currentX, currentY);
        if (colorsMatch(currentColor, targetColor)) {
            data[currentIndex] = newColor[0];
            data[currentIndex + 1] = newColor[1];
            data[currentIndex + 2] = newColor[2];
            data[currentIndex + 3] = newColor[3];

            if (currentX > 0) pixels.push([currentX - 1, currentY]);
            if (currentX < canvas.width - 1) pixels.push([currentX + 1, currentY]);
            if (currentY > 0) pixels.push([currentX, currentY - 1]);
            if (currentY < canvas.height - 1) pixels.push([currentX, currentY + 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getColorAtPixel(imageData, x, y) {
    const {width, data} = imageData;
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    const index = (intY * width + intX) * 4;

    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function colorsMatch(a, b, tolerance = 10) {
    for (let i = 0; i < 3; i++) { // Only iterate over RGB (ignore alpha)
        if (Math.abs(a[i] - b[i]) > tolerance) return false;
    }
    return true;
}
