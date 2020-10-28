let panelW = 1920
let panelH = 1280
// let mousedown = null
let x: number,y: number,width: number, height: number


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
    drawRect: function (canvasId: string, penColor: any) {
        var that = this;
        var devicePixelRatio = window.devicePixelRatio;
        that.penColor = penColor;

        var canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        var ctx = canvas.getContext("2d")
        ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;
        var canvasRect = canvas.getBoundingClientRect();
        //canvas 矩形框的左上角坐标
        var canvasLeft = canvasRect.left;
        var canvasTop = canvasRect.top;

        // function Point(x, y) {
        //     this.x = x
        //     this.y = y
        // }
        // // 坐标转化为canvas坐标
        // function windowToCanvas(x, y, type) {
        //     //返回元素的大小以及位置
        //     var bbox = canvas.getBoundingClientRect();
        //     // bbox 的宽度会加上 canvas 的 border 会影响精度
        //     return new Point(x - bbox.left * (canvas.width / bbox.width),
        //         y - bbox.top * (canvas.height / bbox.height))
        // }

        // key event - use DOM element as object
        canvas.addEventListener('keyup', doKeyUp, true);
        canvas.tabIndex = 1000
        canvas.focus();  
        // // key event - use window as object
        // window.addEventListener('keydown', doKeyDown, true);

        // 要画的矩形的起点 xy
        x = 0;
        y = 0;
        let startX = 0;
        let startY = 0;
        canvas.onmousedown = function(e) {
            e.preventDefault()
            //设置画笔颜色和宽度
            var color = that.penColor;
            // 确定起点
            // 鼠标起点，兼容diff window.devicePixelRatio
            startX = e.clientX  
            startY = e.clientY  
            x = e.clientX*devicePixelRatio - 1
            y = e.clientY*devicePixelRatio - 1
            //画框移动矩形
            let W = 0;
            let H = 0;

            ctx.strokeStyle = color;
            ctx.strokeRect(startX,startY,0,0);
            ctx.restore();
            
            canvas.onmousemove = function(e){
                // 要画的矩形的宽高
                W = e.clientX - startX - canvasLeft
                H = e.clientY- startY -canvasTop
                //实际截图区域
                // width = e.clientX*devicePixelRatio - x - canvasLeft
                // height = e.clientY*devicePixelRatio - y -canvasTop
                // 清除之前画的
                ctx.clearRect(0, 0, panelW, panelH);

                ctx.setLineDash([5])
                canvas.style.cursor="crosshair"
                
                ctx.strokeStyle = color;
                ctx.beginPath()
                ctx.strokeRect(startX, startY, W, H)
                ctx.restore();
            }
            canvas.onmouseup=function(e){
                var color = that.penColor;
    
                canvas.onmousemove = null;
                W = e.clientX - startX - canvasLeft
                H = e.clientY- startY -canvasTop
                
                width = e.clientX*devicePixelRatio - x - canvasLeft
                height = e.clientY*devicePixelRatio - y - canvasTop

                console.info(width, height)
                ctx.clearRect(0, 0, panelW, panelH); 
                ctx.strokeStyle = color;
                ctx.beginPath()
                ctx.strokeRect(startX, startY, W, H)
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

function doKeyUp(e){
    var canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
    if(isCanvasBlank(canvas)){
        console.info("empty!")
        window.parent.postMessage({
            cmd: 'empty'
        }, '*')
        
    }else{
        console.info("not empty!")
        if(e.keyCode == 27){
            canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
        }
        if(e.keyCode == 13){
            canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
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
});