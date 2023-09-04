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
        return match ? match.map(num => parseInt(num)) : [0, 0, 0, 255];
    }

    function getColorAtPixel(imageData, x, y) {
        const { width, data } = imageData;
        const intX = Math.floor(x);
        const intY = Math.floor(y);
        const index = (intY * width + intX) * 4;

        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    }

    function colorsMatch(a, b, tolerance = 10) {
        for (let i = 0; i < a.length; i++) {
            if (Math.abs(a[i] - b[i]) > tolerance) return false;
        }
        return true;
    }

    function floodFill(canvas, x, y, newColor, targetColor, imageData) {
        const ctx = canvas.getContext('2d');
        const data = imageData.data;
        
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

                if (currentX > 0 && !visited.has((currentY * canvas.width + (currentX - 1)) * 4)) pixels.push([currentX - 1, currentY]);
                if (currentX < canvas.width - 1 && !visited.has((currentY * canvas.width + (currentX + 1)) * 4)) pixels.push([currentX + 1, currentY]);
                if (currentY > 0 && !visited.has(((currentY - 1) * canvas.width + currentX) * 4)) pixels.push([currentX, currentY - 1]);
                if (currentY < canvas.height - 1 && !visited.has(((currentY + 1) * canvas.width + currentX) * 4)) pixels.push([currentX, currentY + 1]);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
});
