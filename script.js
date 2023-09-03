document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const imageUpload = document.getElementById('imageUpload');

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const chosenColor = colorPicker.value;
        
        floodFill(canvas, x, y, hexToRgba(chosenColor));
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
    const data = imageData.data;
    const targetColor = getColorAtPixel(imageData, x, y);
    const visited = new Set();
    
    if (colorsMatch(targetColor, newColor)) {
        return;
    }

    const pixels = [[x, y]];

    while (pixels.length) {
        const [currentX, currentY] = pixels.pop();
        const currentIndex = (currentY * canvas.width + currentX) * 4;

        if (visited.has(currentIndex)) continue;
        visited.add(currentIndex);

        const currentColor = getColorAtPixel(imageData, currentX, currentY);
        if (colorsMatch(currentColor, targetColor)) {
            data[currentIndex] = newColor[0];
            data[currentIndex + 1] = newColor[1];
            data[currentIndex + 2] = newColor[2];
            data[currentIndex + 3] = newColor[3];

            // Check neighboring pixels
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
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
