let panelW = 1920
let panelH = 1280
// let mousedown = null
let x,y,width, height

// function Point(x, y) {
//     this.x = x
//     this.y = y
// }
// // 坐标转化为canvas坐标
// function windowToCanvas(x, y, canvas) {
//     //返回元素的大小以及位置
//     var bbox = canvas.getBoundingClientRect();
//     // bbox 的宽度会加上 canvas 的 border 会影响精度
//     return new Point(x - bbox.left * (canvas.width / bbox.width),
//         y - bbox.top * (canvas.height / bbox.height))
// }
// function updateRect(context, point) {
//     let w = Math.abs(point.x - mousedown.x)
//     let h = Math.abs(point.y - mousedown.y)

//     let left = point.x > mousedown.x ? mousedown.x : point.x
//     let top = point.y > mousedown.y ? mousedown.y : point.y

//     context.save();
//     context.beginPath();
//     context.rect(left, top, w, h);
//     context.stroke();
//     context.restore();
// }

/**
 * 选取划线的canvasExt
 * @type {{drawRect: canvasExt.drawRect}}
 */
var canvasExt = {
    /**
     *  画矩形
     * @param canvasId canvasId
     * @param penColor 画笔颜色
     */
    drawRect: function (canvasId, penColor) {
        var that = this;
        var devicePixelRatio = window.devicePixelRatio;
        that.penColor = penColor;

        var canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        var ctx = canvas.getContext("2d")
        var canvasRect = canvas.getBoundingClientRect();
        //canvas 矩形框的左上角坐标
        var canvasLeft = canvasRect.left;
        var canvasTop = canvasRect.top;


        // key event - use DOM element as object
        canvas.addEventListener('keydown', doKeyDown, true);
        canvas.tabIndex = 1000
        canvas.focus();  
        // // key event - use window as object
        // window.addEventListener('keydown', doKeyDown, true);

        // 要画的矩形的起点 xy
        x = 0;
        y = 0;
        canvas.onmousedown = function(e) {
            e.preventDefault()
            //设置画笔颜色和宽度
            var color = that.penColor;
            // 确定起点
            x = (e.pageX*devicePixelRatio - canvasLeft)
            y = (e.pageY*devicePixelRatio - canvasTop)
            console.info(devicePixelRatio)
            console.info(x, y)
            ctx.strokeRect(x,y,0,0);
            ctx.strokeStyle = color;
            ctx.restore();
            
            canvas.onmousemove = function(e){
                // 要画的矩形的宽高
                var width = e.pageX*devicePixelRatio - x
                var height = e.pageY*devicePixelRatio - y
                // 清除之前画的
                ctx.clearRect(0, 0, panelW, panelH);

                ctx.setLineDash([5])
                canvas.style.cursor="crosshair"
                
                ctx.strokeStyle = color;
                ctx.beginPath()
                ctx.strokeRect(x, y, width, height)
                ctx.restore();
            }
            canvas.onmouseup=function(e){
                var color = that.penColor;
    
                canvas.onmousemove = null;
                width = (e.pageX)*devicePixelRatio - x;
                height = (e.pageY)*devicePixelRatio - y;

                console.info(width, height)
                ctx.clearRect(0, 0, panelW, panelH); 
                ctx.strokeStyle = color;
                ctx.beginPath()
                ctx.strokeRect(x, y, width, height)
                ctx.restore();
            }
        }
    }
}

/**
 * 选取截屏
 * @param canvasId
 */
function clipScreenshots(canvasId){
    canvasExt.drawRect(canvasId, "blue");
}

function isCanvasBlank(canvas){
    const context = canvas.getContext('2d');

    const pixelBuffer = new Uint32Array(
      context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
  
    return !pixelBuffer.some(color => color !== 0);
}

function doKeyDown(e){
    console.info(e.keyCode)
    var canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
    // document.getElementById('regionSelectorContainer').addEventListener("keydown", function(e){
    if(isCanvasBlank(canvas)){
        console.info("empty!")
    }else{
        console.info("not empty!")
        if(e.keyCode == 27){
            canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
        }
        if(e.keyCode == 13){
            window.parent.postMessage({
                cmd: 'CLIP',
                x: x,
                y: y,
                width: width,
                height: height
            }, '*')
        }
    }
}

document.addEventListener('DOMContentLoaded', function(){
    clipScreenshots("outerFrame");

    // let c = document.getElementById("outerFrame") as HTMLCanvasElement
    // const ctx = c.getContext("2d")

    // let mousedown=function(e: { pageX: number; pageY: number; }){
    //     x = startx = (e.pageX-c.offsetLeft+c.parentElement.scrollLeft)/scale;
    //     y = starty = (e.pageY-c.offsetTop+c.parentElement.scrollTop)/scale;
    //     console.info(startx, starty)
    //     // if(currentR){
    //     //     leftDistance=startx-currentR.x1;
    //     //     topDistance=starty-currentR.y1;
    //     // }
    //     leftDistance = startx
    //     topDistance = starty
    //     ctx.strokeRect(x,y,0,0);
    //     ctx.strokeStyle="#0000ff";
    //     flag=1;
    // }
    // let mousemove=function(e){
    //     x=(e.pageX-c.offsetLeft+c.parentElement.scrollLeft)/scale;
    //     y=(e.pageY-c.offsetTop+c.parentElement.scrollTop)/scale;
    //     ctx.save();
    //     ctx.setLineDash([5])
    //     c.style.cursor="crosshair";
    //     ctx.clearRect(0,0,1920,1280)
    //     if(flag==1){
    //         ctx.strokeRect(startx,starty,x-startx,y-starty);
    //     }
    //     ctx.restore();
    //     reshow(ctx);
    // }
    // let mouseup=function(e){
    //     if(flag==1){
    //         layers.push(fixPosition({
    //             x1:startx,
    //             y1:starty,
    //             x2:x,
    //             y2:y,
    //             strokeStyle:'#0000ff',
    //         }))
    //     }
    //     currentR=null;
    //     flag=0;
    //     reshow(ctx);
    // }
    // c.onmouseleave=function(){
    //     c.onmousedown=null;
    //     c.onmousemove=null;
    //     c.onmouseup=null;
    // };
    // c.onmouseenter=function(){
    //     c.onmousedown=mousedown;
    //     c.onmousemove=mousemove;
    //     document.onmouseup=mouseup;
    // };
});