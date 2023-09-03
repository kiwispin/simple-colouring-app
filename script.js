document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageUpload = document.getElementById('imageUpload');
    const colorBoxes = document.querySelectorAll('.color-box');

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
        const chosenColor = document.querySelector('.active-color').style.backgroundColor;

        const rgbaChosenColor = hexToRgba(chosenColor);
        const targetColor = getColorAtPixel(ctx, x, y);

        if (colorsMatch(targetColor, rgbaChosenColor)) {
            return;  // Exit if the clicked color is the same as the chosen color.
        }

        floodFill(ctx, x, y, targetColor, rgbaChosenColor);
    });

    colorBoxes.forEach(box => {
        box.addEventListener('click', function() {
            document.querySelector('.active-color').classList.remove('active-color');
            this.classList.add('active-color');
        });

        if (box.classList.contains('custom-color')) {
            box.addEventListener('dblclick', function() {
                const color = prompt('Enter a custom color (Hex format):', '#FFFFFF');
                if (color) {
                    box.style.backgroundColor = color;
                }
            });
        }
    });

    function hexToRgba(hex) {
        let bigint = parseInt(hex.substring(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b, 255];  // Assuming full opacity
    }

    function getColorAtPixel(context, x, y) {
        return context.getImageData(x, y, 1, 1).data;
    }

    function colorsMatch(a, b) {
        for (let i = 0; i < 4; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    function floodFill(context, x, y, targetColor, fillColor) {
        const pixelStack = [[x, y]];
        const w = context.canvas.width;
        const h = context.canvas.height;
        const imageData = context.getImageData(0, 0, w, h);
        const pixels = imageData.data;
        const target = targetColor;
        const fill = fillColor;

        while (pixelStack.length) {
            let newPos, x, y, pixelPos, reachLeft, reachRight;
            newPos = pixelStack.pop();
            x = newPos[0];
            y = newPos[1];

            pixelPos = (y * w + x) * 4;
            while (y-- >= 0 && colorsMatch(getPixel(pixels, pixelPos), target)) {
                pixelPos -= w * 4;
            }

            pixelPos += w * 4;
            ++y;
            reachLeft = false;
            reachRight = false;

            while (y++ < h - 1 && colorsMatch(getPixel(pixels, pixelPos), target)) {
                setColor(pixels, pixelPos, fill);

                if (x > 0) {
                    if (colorsMatch(getPixel(pixels, pixelPos - 4), target)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < w - 1) {
                    if (colorsMatch(getPixel(pixels, pixelPos + 4), target)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                pixelPos += w * 4;
            }
        }

        context.putImageData(imageData, 0, 0);
    }

    function getPixel(pixels, offset) {
        return [
            pixels[offset],
            pixels[offset + 1],
            pixels[offset + 2],
            pixels[offset + 3]
        ];
    }

    function setColor(pixels, offset, color) {
        pixels[offset] = color[0];
        pixels[offset + 1] = color[1];
        pixels[offset + 2] = color[2];
        pixels[offset + 3] = color[3];
    }

});
