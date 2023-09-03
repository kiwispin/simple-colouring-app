document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colorPicker = document.getElementById('colorPicker');
    const imageUpload = document.getElementById('imageUpload');
    let imageRatio = 1;

    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const aspectRatio = img.width / img.height;
                    let newWidth = canvas.width;
                    let newHeight = newWidth / aspectRatio;

                    if (newHeight > canvas.height) {
                        newHeight = canvas.height;
                        newWidth = newHeight * aspectRatio;
                    }

                    imageRatio = img.width / newWidth;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);
        const chosenColor = colorPicker.value;

        floodFill(canvas, x * imageRatio, y * imageRatio, hexToRgba(chosenColor));
    });
});

function hexToRgba(hex) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b, 255];
}

function floodFill(canvas, x, y, newColor) {
    x = Math.round(x);
    y = Math.round(y);

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAtPixel(imageData, x, y);
    
    console.log(`Target color for filling at (${x}, ${y}):`, targetColor);

    if (colorsMatch(targetColor, newColor)) {
        console.log(`Colors match, no fill needed.`);
        return;
    }

    const visited = new Set();
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

            if (currentX > 0) pixels.push([currentX - 1, currentY]);
            if (currentX < canvas.width - 1) pixels.push([currentX + 1, currentY]);
            if (currentY > 0) pixels.push([currentX, currentY - 1]);
            if (currentY < canvas.height - 1) pixels.push([currentX, currentY + 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getColorAtPixel(imageData, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    const {width, data} = imageData;
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function colorsMatch(a, b) {
    if (!a || !b) return false;  // Ensure that the colors are valid.
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
