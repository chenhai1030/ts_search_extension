import {popButtonMouseUp,  groupBindEvent, groupUnBindEvent} from  './handle';
import {hideCropBox, optionContainPopMouseUp, drawStyle, setDrawParams, getDrawParams} from './menu';
import {isCanvasBlank} from './util'
let panelW = 1920
let panelH = 1280
// let mousedown = null
let x: number,y: number,width: number, height: number
let resizing = false
let imgData: ImageData = undefined
let layer = new Array;
let layerIndex = 0;

let cropBoxBorder = {
    top: 0,
    left: 0,
    width: 0,
    height:0
};
let beginPoint = {
        x,y
    },
    stopPoint = {
        x,y
    },
    polygonVertex = [],
    CONST = {
        edgeLen: 50,
        angle: 25
    };


/**
 * 选取划线的canvasExt
 * @type {}
 */
let canvasExt = {
    devicePixelRatio:window.devicePixelRatio,
    canvasCopy:function(canvasId: string){
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d") 
        imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        canvasExt.addLayer(layerIndex, imgData)
    },
    canvasPaste:function(canvasId: string){
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d") 
        if (typeof(imgData)!=='undefined'){
            ctx.putImageData(imgData,0,0);
        }
    },
    addLayer:function(index: number, data: any){
        layer[index] = data
        layerIndex++
    },
    removeLayer:function(all: boolean){
        let canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
        let ctx = canvas.getContext("2d")
        if (all){
            layerIndex = 0
            imgData = undefined
            ctx.save();
            // Use the identity matrix while clearing the canvas
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Restore the transform
            ctx.restore()
            return false;
        }

        if(layerIndex == 1) {
            imgData = layer[0]
            return false;
        }
        delete layer[layerIndex]
        layerIndex--

        // Store the current transformation matrix
        ctx.save();
        // Use the identity matrix while clearing the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Restore the transform
        ctx.restore()

        for(let i = 0; i < layerIndex; i++){
            ctx.putImageData(layer[i], 0, 0)
        }
        imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
        layer[layerIndex] = imgData
    },
    /*
     * @param canvasId canvasId
     * @param penColor 画笔颜色
     * @param penSize 画笔Size：
    */
    drawCircle:function(canvasId: string, penColor: string, penSize: any){
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d") 
        canvas.onmousedown = function(e){
            let beginx=e.clientX;
            let beginy=e.clientY;
            
            canvas.onmousemove = function(e){
                ctx.save();
                // Use the identity matrix while clearing the canvas
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Restore the transform
                ctx.restore();

                canvasExt.canvasPaste(canvasId)

                drawStyle(ctx)

                let a=(e.clientX -beginx)/2
                let b=(e.clientY-beginy)/2
                let centerX=(beginx+e.clientX)/2
                let centerY=(beginy+e.clientY)/2
                drawEllipse(ctx,centerX,centerY,a,b)
            }
            canvas.onmouseup = function(e){
                e.preventDefault()
                canvas.onmousemove = null
                canvas.onmouseup = null
                canvasExt.canvasCopy(canvasId)

            }
        }

    },
    /*
     * @param canvasId canvasId
     * @param penColor 画笔颜色
     * @param penSize 画笔Size：
    */
    drawArrow:function(canvasId:string, penColor:any, penSize:any){
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d") 
        ctx.fillStyle = penColor
        let Plot = {
            angle:0,
            //
            dynArrowSize: function() {
                let x = stopPoint.x - beginPoint.x,
                    y = stopPoint.y - beginPoint.y,
                    length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                if(length < 250){
                    CONST.edgeLen = CONST.edgeLen/2;
                    CONST.angle = CONST.angle/2;
                }else if(length < 500){
                    CONST.edgeLen=CONST.edgeLen*length/500;
                    CONST.angle=CONST.angle*length/500;     
                }
            },
            getRadian: function(beginPoint: { y: number; x: number; }, stopPoint: { y: number; x: number; }) {
                Plot.angle = Math.atan2(stopPoint.y - beginPoint.y, stopPoint.x - beginPoint.x) / Math.PI * 180;
                CONST.edgeLen = 75;
                CONST.angle = 25;
                Plot.dynArrowSize();
            },
            arrowCoord: function(beginPoint, stopPoint) {
                polygonVertex[0] = beginPoint.x;
                polygonVertex[1] = beginPoint.y;
                polygonVertex[6] = stopPoint.x;
                polygonVertex[7] = stopPoint.y;
                Plot.getRadian(beginPoint, stopPoint);
                polygonVertex[8] = stopPoint.x - CONST.edgeLen * Math.cos(Math.PI / 180 * (Plot.angle + CONST.angle));
                polygonVertex[9] = stopPoint.y - CONST.edgeLen * Math.sin(Math.PI / 180 * (Plot.angle + CONST.angle));
                polygonVertex[4] = stopPoint.x - CONST.edgeLen * Math.cos(Math.PI / 180 * (Plot.angle - CONST.angle));
                polygonVertex[5] = stopPoint.y - CONST.edgeLen * Math.sin(Math.PI / 180 * (Plot.angle - CONST.angle));
            },
            sideCoord: function() {
               let midpoint = {x,y};
                midpoint.x=(polygonVertex[4]+polygonVertex[8])/2;
                midpoint.y=(polygonVertex[5]+polygonVertex[9])/2;
                polygonVertex[2] = (polygonVertex[4] + midpoint.x) / 2;
                polygonVertex[3] = (polygonVertex[5] + midpoint.y) / 2;
                polygonVertex[10] = (polygonVertex[8] + midpoint.x) / 2;
                polygonVertex[11] = (polygonVertex[9] + midpoint.y) / 2;
            },
            draw:function(){
                ctx.beginPath();
                ctx.moveTo(polygonVertex[0], polygonVertex[1]);
                ctx.lineTo(polygonVertex[2], polygonVertex[3]);
                ctx.lineTo(polygonVertex[4], polygonVertex[5]);
                ctx.lineTo(polygonVertex[6], polygonVertex[7]);
                ctx.lineTo(polygonVertex[8], polygonVertex[9]);
                ctx.lineTo(polygonVertex[10], polygonVertex[11]);
                ctx.closePath();
                ctx.fill();
            }
        }

        canvas.onmousedown = function(e){
            e.preventDefault()
            beginPoint.x = e.clientX
            beginPoint.y = e.clientY
            canvas.onmousemove = function(e){
                // Store the current transformation matrix
                ctx.save();
                // Use the identity matrix while clearing the canvas
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Restore the transform
                ctx.restore();

                canvasExt.canvasPaste(canvasId)

                drawStyle(ctx)

                stopPoint.x = e.clientX
                stopPoint.y = e.clientY
                Plot.arrowCoord(beginPoint, stopPoint);
                Plot.sideCoord();
                Plot.draw(); 
            }
            canvas.onmouseup = function(e){
                e.preventDefault()
                canvas.onmousemove = null
                canvas.onmouseup = null
                stopPoint.x = e.clientX
                stopPoint.y = e.clientY
                Plot.arrowCoord(beginPoint, stopPoint);
                Plot.sideCoord();
                Plot.draw(); 
                ctx.restore()
                canvasExt.canvasCopy(canvasId)
            }
        }
        return false
    },
    drawMosaic:function(canvasId:string, penSize:string){
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d") 
        let startX = 0;
        let startY = 0;
        // canvas.onmousedown = function(e){
        //     e.preventDefault()
        //     //画框移动矩形
        //     let W = 0;
        //     let H = 0;
        //     startX = e.clientX - 3*devicePixelRatio
        //     startY = e.clientY - 3*devicePixelRatio  
        //     canvas.onmousemove = function(e){
        //         W = e.clientX - startX - 3*devicePixelRatio
        //         H = e.clientY - startY - 3*devicePixelRatio 
        //         // Store the current transformation matrix
        //         ctx.save();
        //         // Use the identity matrix while clearing the canvas
        //         ctx.setTransform(1, 0, 0, 1, 0, 0);
        //         ctx.clearRect(0, 0, canvas.width, canvas.height);
        //         // Restore the transform
        //         ctx.restore();

        //         drawStyle(ctx)
                
        //         ctx.beginPath()
        //         ctx.strokeRect(startX, startY, W, H)
        //     }
        //     canvas.onmouseup=function(e){
        //         e.preventDefault()
        //         canvas.onmousemove = null
        //         canvas.onmouseup = null
        //         // ctx.beginPath()
        //         // ctx.strokeRect(startX, startY, W, H)
        //         // ctx.restore();
        //         let creatMosaic = ()=>{
        //             let oImg = ctx.getImageData(startX, startY, W, H);
        //             let w = oImg.width;
        //             let h = oImg.height;
        //             //马赛克的程度，数字越大越模糊
        //             let num = 2;
        //             //等分画布
        //             let stepW = w/num;
        //             let stepH = h/num;
        //                      //这里是循环画布的像素点
        //             for(var i=0;i<stepH;i++){
        //                 for(var j=0;j<stepW;j++){
        //                     //获取一个小方格的随机颜色，这是小方格的随机位置获取的
        //                     var color = getXY(oImg,j*num+Math.floor(Math.random()*num),i*num+Math.floor(Math.random()*num));
        //                     //这里是循环小方格的像素点，
        //                     for(var k=0;k<num;k++){
        //                         for(var l=0;l<num;l++){
        //                             //设置小方格的颜色
        //                             setXY(oImg,j*num+l,i*num+k,color);
        //                         }    
        //                     }
                                
        //                 }    
        //             }
        //             ctx.putImageData(oImg,startX,startY);
        //         }
        //         function getXY(obj,x,y){
        //             var w = obj.width;
        //             var h = obj.height;
        //             var d = obj.data;
        //             var color = [];
        //             color[0] =     obj.data[4*(y*w+x)];
        //             color[1] =     obj.data[4*(y*w+x)+1];
        //             color[2] =     obj.data[4*(y*w+x)+2];
        //             color[3] =     obj.data[4*(y*w+x)+3];
        //             return color;
        //         }
        //         function setXY(obj,x,y,color){
        //             var w = obj.width;
        //             var h = obj.height;
        //             var d = obj.data;
        //             obj.data[4*(y*w+x)] = color[0];
        //             obj.data[4*(y*w+x)+1] = color[1];
        //             obj.data[4*(y*w+x)+2] = color[2];
        //             obj.data[4*(y*w+x)+3] = color[3];
        //         }   
        //         creatMosaic()
        //         canvasExt.canvasCopy(canvasId)
        //     }
            
        // }

        canvas.onmousedown = function(e) {
            let ev = e || window.event;
            let dx = e.clientX - canvas.offsetLeft;
            let dy = e.clientY - canvas.ownerDocument.defaultView.pageYOffset;
            let mx = 0
            let my = 0
            canvas.onmousemove = function(e){
                dx = e.clientX - canvas.offsetLeft
                dy = e.clientY - canvas.ownerDocument.defaultView.pageYOffset; 
                if (Math.floor(mx - dx) < 10 && Math.floor(my-dy) < 10 && (mx != 0 || my != 0)){
                    console.info(Math.floor(mx - dx) )
                    return false
                }
                canvasExt.canvasPaste(canvasId)

                function RGB2Color(r,g,b)
                {
                    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
                }

                function byte2Hex(n)
                {
                    var nybHexString = "0123456789ABCDEF";
                    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
                }
  
                for(let i = 0; i < 4; i++){
                    let red = Math.round(Math.random()*255);
                    let green = Math.round(Math.random()*255);
                    let blue = Math.round(Math.random()*255);
                    ctx.fillStyle = RGB2Color(red,green,blue);
                    // if (i%2 == 0){
                    //     ctx.fillStyle = "#FFFFFF"
                    // }else{
                    //     ctx.fillStyle = '#000000'
                    // }
                    drawStyle(ctx)
                    ctx.beginPath()
                    ctx.fillRect(dx+i, dy+i, 3, 3);
                    ctx.restore();
                    dx += 4
                    dy += 4
                }
                canvasExt.canvasCopy(canvasId)
            }
            canvas.onmouseup=function(e){
                e.preventDefault()
                canvas.onmousemove = null
                canvas.onmouseup = null
                canvasExt.canvasCopy(canvasId)
            }
        }
    },
    drawRect:function(canvasId: string, penColor: any, penSize:any){
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d")

        let startX = 0;
        let startY = 0;
        canvas.onmousedown = function(e) {
            e.preventDefault()
            //画框移动矩形
            let W = 0;
            let H = 0
            startX = e.clientX - 3*devicePixelRatio
            startY = e.clientY - 3*devicePixelRatio  
            canvas.onmousemove = function(e){
                e.preventDefault()
                // 要画的矩形的宽高
                W = e.clientX - startX - 3*devicePixelRatio
                H = e.clientY - startY - 3*devicePixelRatio 
                // Store the current transformation matrix
                ctx.save();
                // Use the identity matrix while clearing the canvas
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Restore the transform
                ctx.restore();

                canvasExt.canvasPaste(canvasId)

                drawStyle(ctx)
                
                ctx.beginPath()
                ctx.strokeRect(startX, startY, W, H)
            }
            canvas.onmouseup=function(e){
                e.preventDefault()
                canvas.onmousemove = null
                canvas.onmouseup = null
                ctx.beginPath()
                ctx.strokeRect(startX, startY, W, H)
                ctx.restore();
                canvasExt.canvasCopy(canvasId) 
            }
            return false;
        }
    },
    /**
     *  画截图区域矩形
     * @param canvasId canvasId
     * @param penColor 画笔颜色
     */
    drawCropRect: function (canvasId: string, penColor: any) {
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d")
        ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
        let canvasRect = canvas.getBoundingClientRect();
        //canvas 矩形框的左上角坐标
        let canvasLeft = canvasRect.left;
        let canvasTop = canvasRect.top;

        // 要画的矩形的起点 xy
        x = 0;
        y = 0;
        let startX = 0;
        let startY = 0;
        canvas.onmousedown = function(e) {
            resizing = false
            // key event - use DOM element as object
            canvas.addEventListener('keyup', doKeyUp, true);
            canvas.tabIndex = 1000
            canvas.focus();  

            cropBox.unbuild()
            // let ratio = 16 / 9
            // 确定起点
            // 鼠标起点，兼容diff window.devicePixelRatio
            startX = e.clientX - canvasLeft - 1
            startY = e.clientY - 2//- canvasTop - canvas.ownerDocument.defaultView.pageYOffset
            x = e.clientX*devicePixelRatio + canvasLeft
            y = e.clientY*devicePixelRatio +1
            //画框移动矩形
            let W = 0;
            let H = 0;

            //设置画笔颜色和宽度
            ctx.strokeStyle = penColor;
            // ctx.restore();
            
            canvas.onmousemove = function(e){
                if(resizing){
                    console.info("resizing out..")
                    return false
                }
                // 要画的矩形的宽高
                W = e.clientX - startX - canvasLeft + 3
                H = e.clientY - startY + 5
  
                // Store the current transformation matrix
                ctx.save();
                // Use the identity matrix while clearing the canvas
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Restore the transform
                ctx.restore();

                // canvasExt.canvasPaste(canvasId)

                // ctx.setLineDash([5])
                ctx.lineWidth=2
                canvas.style.cursor="crosshair"
                
                ctx.strokeStyle = penColor;
                ctx.beginPath()
                ctx.strokeRect(startX +canvasLeft, startY +canvas.ownerDocument.defaultView.pageYOffset, W, H)

                width = e.clientX*devicePixelRatio - x  
                height = e.clientY*devicePixelRatio - y 
            }
            canvas.onmouseup=function(e){
                if(resizing){
                    console.info("resizing out..")
                    return false
                }
                canvas.onmousemove = null;
                
                ctx.strokeStyle = penColor;
                ctx.beginPath()
                ctx.strokeRect(startX+canvasLeft , startY+canvas.ownerDocument.defaultView.pageYOffset , W, H)
                ctx.restore();
                canvasExt.canvasCopy(canvasId)

                cropBoxBorder.top = startX+canvasLeft 
                cropBoxBorder.left = startY+canvas.ownerDocument.defaultView.pageYOffset
                cropBoxBorder.width = W
                cropBoxBorder.height = H

                if(W && H){
                    cropBox.build(startX + canvasLeft, startY + canvas.ownerDocument.defaultView.pageYOffset, W, H)
                }
                return false;
            }
            return false
        }
    }
}

/**
 * 选取截屏
 * @param canvasId
 */
function clipScreenshots(canvasId: string){
    canvasExt.drawCropRect(canvasId, "red");
}

function cropBoxResize(){
    document.getElementById("cropper-crop-box").style.display = "block"

    cropBox.resize("line-e", false, false, false, true)
    cropBox.resize("line-n", true, false, true, false)
    cropBox.resize("line-w", false, true, false, true)
    cropBox.resize("line-s", false, false, true, false)

    cropBox.resize("point-e", false, false, false, true)
    cropBox.resize("point-n", true, false, true, false)
    cropBox.resize("point-w", false, true, false, true)
    cropBox.resize("point-s", false, false, true, false) 

    cropBox.resize("point-ne",  true, false, false, false)
    cropBox.resize("point-nw",  true, true, false, false)
    cropBox.resize("point-se",  false, false, false, false)
    cropBox.resize("point-sw",  false, true, false, false) 
}

function doKeyUp(e: { keyCode: number; }){
    let canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
    if (canvas.width == 0 || canvas.height == 0){
        return false
    }

    if(isCanvasBlank(canvas)){
        console.info("empty!")
        window.parent.postMessage({
            cmd: 'empty'
        }, '*')
        canvasExt.removeLayer(true)
        canvas.removeEventListener("keyup", doKeyUp)
    }else{
        console.info("not empty!")
        if(e.keyCode == 27){
            canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
            cropBox.unbuild()
        }
        if(e.keyCode == 13){
            cropBoxBorderClear()
            // canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
            cropBox.unbuild()

            setTimeout(function(){window.parent.postMessage({
                cmd: 'CLIP',
                x: x,
                y: y,
                width: width,
                height: height
            }, '*')}, 500)
            canvas.removeEventListener("keyup", doKeyUp)
        }
    }
    return false
}

function optionButtondoMouseUp(e){
    let popDiv = document.getElementById("optionContainerPop")
    let cropBoxDiv = document.getElementById("cropper-crop-box")
    let triangleDiv = document.getElementById("triangle") 
    cropBoxDiv.style.cursor = "auto"
    let str = e.target.className
    // console.info(str)
    if (str.indexOf("mosaicButton") != -1){
        //mosaic donot need 'penColor' DIV
        popDiv.style.display = "none"
        triangleDiv.style.display = 'none'
        groupBindEvent("penSize", optionContainPopMouseUp)

        hideCropBox()
        setDrawParams("mosaic")
        canvasExt.drawMosaic("outerFrame", "min")

    }
    else if(str.indexOf("rectButton")!= -1
    || str.indexOf("circleButton")!= -1
    || str.indexOf("arrowButton")!= -1){
        hideCropBox()
        //triangle
        triangleDiv.style.display = 'block'
        triangleDiv.style.top =  parseInt(popDiv.style.top, 10) + 10 + 'px';
        //need 'penColor' DIV
        document.getElementById("penColor").style.display = "block"
        popDiv.style.width = "220px"
        
        popDiv.style.display = "block"
        groupBindEvent("optionContainerPop", popButtonMouseUp);
        if (str.indexOf("rectButton")!= -1){
            setDrawParams("rect")
            canvasExt.drawRect("outerFrame", "red", "min")
            triangleDiv.style.left = parseInt(popDiv.style.left, 10) + 20 + 'px';
        }else if(str.indexOf("arrowButton")!= -1) {
            setDrawParams("arrow")
            canvasExt.drawArrow("outerFrame", "red", "min")
            triangleDiv.style.left = parseInt(popDiv.style.left, 10) + 100 + 'px';
        }else if(str.indexOf("circleButton")!= -1){                
            setDrawParams("circle")
            canvasExt.drawCircle("outerFrame", "red", "min")
            triangleDiv.style.left = parseInt(popDiv.style.left, 10) + 60 + 'px';
        }
        groupBindEvent("penSize", optionContainPopMouseUp)
        groupBindEvent("penColor", optionContainPopMouseUp)
    }
    else if(str.indexOf("exitButton")!= -1){
        canvasExt.removeLayer(true);
        (<HTMLCanvasElement>document.getElementById("outerFrame")).getContext("2d").clearRect(0, 0, panelW, panelH);
        (<HTMLCanvasElement>document.getElementById("outerFrame")).removeEventListener("keyup", doKeyUp)
        cropBox.unbuild();
        setDrawParams("", "", "")
        init();
    }else if(str.indexOf("checkButton")!= -1){
        cropBoxBorderClear()
        cropBox.unbuild()
        setDrawParams("", "", "")
        setTimeout(function(){window.parent.postMessage({
            cmd: 'CLIP',
            x: x,
            y: y+4,
            width: width-2,
            height: height-4
        }, '*')}, 500)
        // init()
    }else if (str.indexOf("undoButton")!= -1){
        if (getDrawParams().type == "mosaic"){
            let removeNum = layerIndex/4
            for(let i = 0; i < removeNum; i ++){
                canvasExt.removeLayer(false)
            }
        }else{
            canvasExt.removeLayer(false)
        }
    }else{
        console.info("do nothing")
    }
}

var cropBox = {
    build: function(x, y, w, h){
        let box = document.getElementById("cropper-crop-box")
        box.style.left = x + "px"
        box.style.top = y + "px"
        box.style.width = w + "px"
        box.style.height = h + "px"
        let opBox = document.getElementById("optionContainer")
        opBox.style.left = x - 320 + w + 3*devicePixelRatio + "px"
        opBox.style.top = y + h + 10 + "px"
        opBox.style.width = "320px"
        opBox.style.height = "40px"
        opBox.style.display = "block"
        let popDiv = document.getElementById("optionContainerPop")
        popDiv.style.left = opBox.style.left
        popDiv.style.top = y + h + 10 + 30 + "px"
        groupBindEvent("optionContainer", optionButtondoMouseUp)
    },
    unbuild: function(){
        let box = document.getElementById("cropper-crop-box")
        box.style.left = '0px'
        box.style.top = '0px'
        box.style.width = '0px'
        box.style.height = '0px'
        let opBox = document.getElementById("optionContainer")
        opBox.style.display = "none"
        let popDiv = document.getElementById("optionContainerPop") 
        popDiv.style.display = "none";
        layerIndex = 0
        groupUnBindEvent("optionContainer");
    },
    resize: function(id:string, isTop:boolean, isLeft:boolean, lockX:boolean, lockY:boolean){
        let box = document.getElementById("cropper-crop-box")
        let obj = document.getElementById(id)

        var canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
        var ctx = canvas.getContext("2d")
        var canvasRect = canvas.getBoundingClientRect();
        //canvas 矩形框的左上角坐标
        var canvasLeft = canvasRect.left;
        var canvasTop = canvasRect.top;

        obj.onmousedown = function(e) {
            e.preventDefault()
            console.info("resize down")
            ctx.clearRect(0, 0, panelW, panelH);
            resizing = true
            
            let disX = e.clientX - obj.offsetLeft
            let disY = e.clientY - obj.offsetTop
            let iParentTop = box.offsetTop
            let iParentLeft = box.offsetLeft;
            let iParentWidth = box.offsetWidth;
            let iParentHeight = box.offsetHeight;
            document.onmousemove = function(e){
                if(!resizing) return false;
                e.preventDefault()

                let iL = e.clientX - disX;
                let iT = e.clientY - disY;
                let iH = isTop ? iParentHeight - iT : obj.offsetHeight + iT;
                var iW = isLeft ? iParentWidth - iL : obj.offsetWidth + iL;
                isLeft && (box.style.left = iParentLeft + iL + 'px');
                isTop && (box.style.top = iParentTop + iT + 'px');

                lockX || (box.style.width = iW + "px");
                lockY || (box.style.height = iH + "px");

                // console.info("org:", x,y,width, height)
                x = parseInt(box.style.left, 10)*devicePixelRatio +2
                y = parseInt(box.style.top, 10)*devicePixelRatio +1
                width = parseInt(box.style.width, 10)*devicePixelRatio 
                height = parseInt(box.style.height, 10)*devicePixelRatio - 5
                // console.info("move:", x,y,width, height)
            }
            document.onmouseup = function(e){
                e.preventDefault()
                resizing = false
                obj.onmousemove = null;
                obj.onmouseup = null;

                // ctx.beginPath()
                // ctx.strokeRect(parseInt(box.style.left, 10) , 
                //                 parseInt(box.style.top, 10) , 
                //                 parseInt(box.style.width, 10) + 3, 
                //                 parseInt(box.style.height, 10) + 4);
                // ctx.save();

            }
            return false;
        }
    }
}

function drawEllipse(context: CanvasRenderingContext2D,x: number,y: number,a: number,b: number){
    context.save()
    a=a>0?a:-a
    b=b>0?b:-b
    var r=(a>b)?a:b
    // context.scale(ratioX,ratioY)
    context.beginPath()
    // context.moveTo((x+a)/ratioX,y/ratioY)
    context.arc(x,y,r,0,2*Math.PI)
    context.closePath()
    context.stroke()
}

function cropBoxBorderClear(){
    let canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d")
    let lineWidth = 3
    ctx.clearRect(cropBoxBorder.top, cropBoxBorder.left-lineWidth, cropBoxBorder.width + lineWidth, lineWidth*2)
    ctx.clearRect(cropBoxBorder.top-lineWidth, cropBoxBorder.left-lineWidth, lineWidth*2, cropBoxBorder.height)

    ctx.clearRect(cropBoxBorder.top+cropBoxBorder.width-lineWidth, cropBoxBorder.left, lineWidth*2, cropBoxBorder.height)
    ctx.clearRect(cropBoxBorder.top-lineWidth, cropBoxBorder.left + cropBoxBorder.height-lineWidth, cropBoxBorder.width+lineWidth*2, lineWidth*2)
    ctx.save()
}

function init(){
    clipScreenshots("outerFrame")
    cropBoxResize()
}

document.addEventListener('DOMContentLoaded', function(){
    init()
});
