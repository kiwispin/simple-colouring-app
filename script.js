document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
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
            console.log(`Selected color: <span class="math-inline">\{selectedColor\}\`\);
\}\);
\}\);
<4\>canvas\.addEventListener\(\'click\', function\(event\) \{
const rect \= canvas\.getBoundingClientRect\(\);
const x \= event\.clientX \- rect\.left;
const y \= event\.clientY \- rect\.top;
const</4\> newColor \= selectedColor;
console\.log\(\`Canvas clicked at \(</span>{x}, ${y}) with chosen color: <span class="math-inline">\{newColor\}\`\);
const imageData \= ctx\.getImageData\(0, 0, canvas\.width, canvas\.height\);
const data \= imageData\.data;
const targetColor \= getColorAtPixel\(imageData, x, y\);
console\.log\(\'Target color at\', \`\(</span>{x}, ${y}):`, targetColor);
        console.log('Attempting to fill with:', newColor);

        floodFill(canvas, x, y, newColor);
    });

    colorPicker.addEventListener('dblclick', function() {
        this.click();
    });

    colorPicker.addEventListener('input', function() {
        const customColorBox = document.getElementById('custom-color');
        customColorBox.style.backgroundColor = this.value;
        customColorBox.dataset.color = this.value;
    });

    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', function() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blob = new Blob([imageData.data], { type: 'image/png' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'image.png';
        document.body.appendChild(a);
        a.click();
    });

    function hexToRgba(hex) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        return [r, g, b, 255];
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
    
