let drawParams = {
    type:"",  //["rect", "circle", "arrow", "mosaic", "text"],
    color:"",   //["red", "blue", "green", "yellow", "gray", "white"],
    size:""  //["min", "mid", "max"]
    };

export function setDrawParams(type=undefined, color=undefined, size=undefined){
    if(type != undefined){
        drawParams.type = type
    }
    if(color != undefined){
        drawParams.color = color
    }
    if(size != undefined){
        drawParams.size = size
    }
}
export function getDrawParams(){
    return drawParams
}

export function hideCropBox(){
    let box = document.getElementById("cropper-crop-box")
    box.style.display = "none"
}

export function optionContainPopMouseUp(e){
    let str = e.target.className
    switch(str.substr(str.lastIndexOf(" ") + 1,3)){
        case "min":
            drawParams.size = "min"
            break
        case "mid":
            drawParams.size = "mid"
            break
        case "max":
            drawParams.size = "max"
            break
        case "red":
            drawParams.color = "rgb(245, 52, 52)"
            break
        case "blu":
            drawParams.color = "rgb(50, 98, 230)"
            break
        case "gre":
            drawParams.color = "rgb(48, 221, 57)"
            break
        case "yel":
            drawParams.color = "rgb(233, 230, 40)"
            break
        case "gra":
            drawParams.color = "rgb(114, 113, 113)"
            break
        case "whi":
            drawParams.color = "white"
            break
    }
}

export function drawStyle(ctx: CanvasRenderingContext2D){
    switch(drawParams.type){
        case "rect":
            ctx.strokeStyle = drawParams.color 
            switch(drawParams.size){
                default:
                case "min":
                    ctx.lineWidth = 1
                    break
                case "mid":
                    ctx.lineWidth = 3
                    break
                case "max":
                    ctx.lineWidth = 5
                    break
            }
            break
        case "arrow":
            ctx.fillStyle = drawParams.color
            switch(drawParams.size){
                default:
                case "min":
                    break
                case "mid":
                    break
                case "max":
                    break
            }
            break
        case "circle":
            ctx.strokeStyle = drawParams.color 
            switch(drawParams.size){
                case 'min':
                    ctx.lineWidth = 1
                    break
                case 'mid':
                    ctx.lineWidth = 3
                    break
                case 'max':
                    ctx.lineWidth = 5
                    break
            }
            break
        case "mosaic":
            break    
    }
}
