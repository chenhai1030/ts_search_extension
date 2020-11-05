let panelW = 1920
let panelH = 1280
// let mousedown = null
let x: number,y: number,width: number, height: number
let resizing:boolean = false

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
            resizing = false
            e.preventDefault()
            cropBox.unbuild()
            //设置画笔颜色和宽度
            var color = that.penColor;
            let ratio = 16 / 9
            // 确定起点
            // 鼠标起点，兼容diff window.devicePixelRatio
            startX = e.clientX - canvasLeft
            startY = e.clientY  
            x = e.clientX*devicePixelRatio //- canvasLeft
            y = e.clientY*devicePixelRatio 
            //画框移动矩形
            let W = 0;
            let H = 0;

            ctx.strokeStyle = color;
            ctx.strokeRect(startX,startY,0,0);
            ctx.restore();
            
            canvas.onmousemove = function(e){
                if(resizing){
                    console.info("resizing out..")
                    return false
                }
                // 要画的矩形的宽高
                W = e.clientX - startX - canvasLeft 
                H = e.clientY- startY- canvasTop 
                if (W/H >= ratio){
                    H = W/ratio
                }else{
                    W = H*ratio
                }
                //实际截图区域
                // width = e.clientX*devicePixelRatio - x - canvasLeft
                // height = e.clientY*devicePixelRatio - y -canvasTop
                // 清除之前画的
                ctx.clearRect(0, 0, panelW, panelH);

                // ctx.setLineDash([5])

                ctx.lineWidth=3
                canvas.style.cursor="crosshair"
                
                ctx.strokeStyle = color;
                ctx.beginPath()
                ctx.strokeRect(startX, startY, W, H)
                ctx.restore();
            }
            canvas.onmouseup=function(e){
                if(resizing){
                    console.info("resizing out..")
                    return false
                }
                var color = that.penColor;
    
                canvas.onmousemove = null;
                W = e.clientX - startX - canvasLeft
                H = e.clientY- startY - canvasTop
                if (W/H >= ratio){
                    H = W/ratio
                }else{
                    W = H*ratio
                }
                
                width = e.clientX*devicePixelRatio - x 
                height = e.clientY*devicePixelRatio - y 

                // console.info(width, height, W, H)
                ctx.clearRect(0, 0, panelW, panelH); 
                ctx.strokeStyle = color;
                ctx.beginPath()
                ctx.strokeRect(startX, startY, W, H)
                ctx.restore();

                cropBox.build(startX + canvasLeft, startY + canvasTop, W, H)
            }
        }
    }
}

/**
 * 选取截屏
 * @param canvasId
 */
function clipScreenshots(canvasId: string){
    canvasExt.drawRect(canvasId, "red");
}

function isCanvasBlank(canvas: HTMLCanvasElement){
    const context = canvas.getContext('2d');

    const pixelBuffer = new Uint32Array(
      context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
  
    return !pixelBuffer.some(color => color !== 0);
}

function doKeyUp(e: { keyCode: number; }){
    var canvas = document.getElementById("outerFrame") as HTMLCanvasElement;
    if(isCanvasBlank(canvas)){
        console.info("empty!")
        window.parent.postMessage({
            cmd: 'empty'
        }, '*')
        canvas.removeEventListener("keyup", doKeyUp)
    }else{
        console.info("not empty!")
        if(e.keyCode == 27){
            canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
        }
        if(e.keyCode == 13){
            canvas.getContext("2d").clearRect(0, 0, panelW, panelH)
            console.info("cover:", x, y, width, height)
            window.parent.postMessage({
                cmd: 'CLIP',
                x: x,
                y: y,
                width: width,
                height: height
            }, '*')
            canvas.removeEventListener("keyup", doKeyUp)
        }
    }
}

var cropBox = {
    build: function(x, y, w, h){
        let box = document.getElementById("cropper-crop-box")
        // box.style.transform = 'translateX('+ x + 'px)' + 'translateY('+ y + 'px)'
        box.style.left = x + "px"
        box.style.top = y + "px"
        box.style.width = w + "px"
        box.style.height = h + "px"
    },
    unbuild: function(){
        let box = document.getElementById("cropper-crop-box")
        box.style.left = '0px'
        box.style.top = '0px'
        box.style.width = '0px'
        box.style.height = '0px'
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
            console.info("down")
            e.preventDefault()
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
                var maxW = document.documentElement.clientWidth - box.offsetLeft - 2;
                var maxH = document.documentElement.clientHeight - box.offsetTop - 2;
                let iH = isTop ? iParentHeight - iT : obj.offsetHeight + iT;
                var iW = isLeft ? iParentWidth - iL : obj.offsetWidth + iL;
                isLeft && (box.style.left = iParentLeft + iL + 'px');
                isTop && (box.style.top = iParentTop + iT + 'px');

                iW > maxW && (iW = maxW);
                lockX || (box.style.width = iW + "px");
                iH > maxH && (iH = maxH);
                lockY || (box.style.height = iH + "px");
            }
            document.onmouseup = function(e){
                console.info("up")
                e.preventDefault()
                resizing = false
                obj.onmousemove = null;
                obj.onmouseup = null;

                console.info("org:", x,y,width, height)
                x = parseInt(box.style.left, 10)*devicePixelRatio
                y = parseInt(box.style.top, 10)*devicePixelRatio
                width = parseInt(box.style.width, 10)*devicePixelRatio
                height = parseInt(box.style.height, 10)*devicePixelRatio
                console.info("move:", x,y,width, height)
                ctx.beginPath()
                ctx.strokeRect(parseInt(box.style.left, 10) - canvasLeft, 
                                parseInt(box.style.top, 10) - 7, 
                                parseInt(box.style.width, 10), 
                                parseInt(box.style.height, 10));
                ctx.restore();
            }
            return false;
        }
    }
}

document.addEventListener('DOMContentLoaded', function(){
    clipScreenshots("outerFrame");
});

document.addEventListener('DOMContentLoaded', function(){
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
})