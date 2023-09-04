document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
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
            imageUpload.value = "";
        }
    });

    let selectedColor = [0, 0, 0, 255];

    colorBoxes.forEach(box => {
        box.addEventListener('click', function() {
            document.querySelector('.color-box.active')?.classList.remove('active');
            this.classList.add('active');
            selectedColor = getRgbArray(this.style.backgroundColor);
            console.log(`Selected color: ${selectedColor}`);
        });
    });

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const newColor = selectedColor;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getColorAtPixel(imageData, x, y);

        floodFill(canvas, x, y, newColor, targetColor, imageData);
    });

    function getRgbArray(color) {
        const match = color.match(/\d+/g);
        return match ? match.map(num => parseInt(num)).concat(255) : [0, 0, 0, 255];
    }

    function getColorAtPixel(imageData, x, y) {
        const { width, data } = imageData;
        const intX = Math.floor(x);
        const intY = Math.floor(y);
        const index = (intY * width + intX) * 4;

        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    }

    function colorsMatch(a, b, tolerance = 0) {
        for (let i = 0; i < a.length; i++) {
            if (Math.abs(a[i] - b[i]) > tolerance) return false;
        }
        return true;
    }

    function floodFill(canvas, x, y, newColor, targetColor, imageData) {
        const stack = [[x, y]];
        const { width, height } = canvas;
        const { data } = imageData;
        const target = targetColor.slice(0, 3);
        const replacement = newColor.slice(0, 3);
        const visited = new Set();

        while (stack.length) {
            const [currX, currY] = stack.pop();
            const index = (Math.floor(currY) * width + Math.floor(currX)) * 4;

            if (visited.has(index)) continue;
            visited.add(index);

            if (colorsMatch(getColorAtPixel(imageData, currX, currY).slice(0, 3), target)) {
                data[index] = replacement[0];
                data[index + 1] = replacement[1];
                data[index + 2] = replacement[2];

                if (currX > 0) stack.push([currX - 1, currY]);
                if (currX < width - 1) stack.push([currX + 1, currY]);
                if (currY > 0) stack.push([currX, currY - 1]);
                if (currY < height - 1) stack.push([currX, currY + 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
});
