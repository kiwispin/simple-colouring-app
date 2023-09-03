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
        }
    });

    let selectedColor = [0, 0, 0, 255];

    colorBoxes.forEach(box => {
        box.addEventListener('click', function() {
            selectedColor = hexToRgba(this.dataset.color);
            colorBoxes.forEach(cb => cb.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    canvas.addEventListener('click', function(event) {
        const x = event.offsetX;
        const y = event.offsetY;
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        const clickedColor = [imageData[0], imageData[1], imageData[2], imageData[3]];

        changeColor(clickedColor, selectedColor);
    });

    function changeColor(originalColor, newColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for(let i = 0; i < data.length; i += 4) {
            if(data[i] === originalColor[0] && data[i+1] === originalColor[1] && data[i+2] === originalColor[2]) {
                data[i] = newColor[0];
                data[i + 1] = newColor[1];
                data[i + 2] = newColor[2];
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function hexToRgba(hex) {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return [r, g, b, 255];
    }
});
