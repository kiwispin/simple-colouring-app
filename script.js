const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');

let img = new Image();
img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

function floodFill(startX, startY, startColor, fillColor) {
    let pixelStack = [[startX, startY]];
    while(pixelStack.length) {
        let newPos, x, y, pixelPos, reachLeft, reachRight;
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        pixelPos = (y*canvas.width + x) * 4;
        while(y-- >= 0 && matchColor(pixelPos, startColor)) {
            pixelPos -= canvas.width * 4;
        }
        pixelPos += canvas.width * 4;
        y++;
        reachLeft = false;
        reachRight = false;
        while(y++ < canvas.height-1 && matchColor(pixelPos, startColor)) {
            setColor(pixelPos, fillColor);

            if(x > 0) {
                if(matchColor(pixelPos - 4, startColor)) {
                    if(!reachLeft){
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                }
                else if(reachLeft) {
                    reachLeft = false;
                }
            }
            
            if(x < canvas.width-1) {
                if(matchColor(pixelPos + 4, startColor)) {
                    if(!reachRight) {
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                }
                else if(reachRight) {
                    reachRight = false;
                }
            }

            pixelPos += canvas.width * 4;
        }
    }
    ctx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
}

function matchColor(pixelPos, color) {
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return (data[pixelPos]   === color[0] && 
            data[pixelPos+1] === color[1] && 
            data[pixelPos+2] === color[2] && 
            data[pixelPos+3] === color[3]);
}

function setColor(pixelPos, fillColor) {
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    data[pixelPos]   = fillColor[0];
    data[pixelPos+1] = fillColor[1];
    data[pixelPos+2] = fillColor[2];
    data[pixelPos+3] = fillColor[3];
}

canvas.addEventListener('click', function(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const fillColor = Array.from(colorPicker.value.matchAll(/[A-Za-z0-9]{2}/g)).map(v => parseInt(v, 16));
    fillColor.push(255); // Alpha

    floodFill(x, y, Array.from(pixel), fillColor);
});

// Optional: To upload an image
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        img.src = URL.createObjectURL(file);
    }
});
