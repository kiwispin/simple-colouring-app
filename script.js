document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageUpload = document.getElementById('imageUpload');
    let chosenColor = "#FF0000";  // default color

    imageUpload.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rgbaColor = hexToRgba(chosenColor);

        floodFill(canvas, x, y, rgbaColor);
    });

    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function () {
            chosenColor = this.getAttribute('data-color');
        });
        if (box.classList.contains('custom-color')) {
            box.addEventListener('dblclick', function () {
                chosenColor = prompt("Enter a custom color in HEX format (e.g. #ff0000 for red):", "#ffffff");
                if (chosenColor) {
                    box.style.backgroundColor = chosenColor;
                    box.setAttribute('data-color', chosenColor);
                }
            });
        }
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

        const pixelsToCheck = [x, y];
        while (pixelsToCheck.length > 0) {
            const currentY = pixelsToCheck.pop();
            const currentX = pixelsToCheck.pop();

            const currentPos = (currentY * canvas.width + currentX) * 4;
            if (colorsMatch(imageData.data.slice(currentPos, currentPos + 4), targetColor)) {
                imageData.data[currentPos] = newColor[0];
                imageData.data[currentPos + 1] = newColor[1];
                imageData.data[currentPos + 2] = newColor[2];
                imageData.data[currentPos + 3] = newColor[3];

                pixelsToCheck.push(currentX - 1, currentY);
                pixelsToCheck.push(currentX + 1, currentY);
                pixelsToCheck.push(currentX, currentY - 1);
                pixelsToCheck.push(currentX, currentY + 1);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function getColorAtPixel(imageData, x, y) {
        const { data, width } = imageData;
        const position = (y * width + x) * 4;
        return data.slice(position, position + 4);
    }

    function colorsMatch(a, b, tolerance = 10) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (Math.abs(a[i] - b[i]) > tolerance) return false;
        }
        return true;
    }
});
