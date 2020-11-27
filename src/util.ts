export const serverip = "http://172.17.5.90/"

export default function ajax(options: { type?: any; dataType?: any; data?: any; success?: any; fail?: any; url?: any; }) {
    let params = undefined
    let xhr = undefined
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    if (options.type == "POST"){
        params = formatParams(options.data)
    }

    //创建 - 非IE6 - 第一步
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    }

    //接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            let status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.fail && options.fail(status);
            }
        }
    }

    //连接 和 发送 - 第二步
    if (options.type == "GET") {
        xhr.open("GET", options.url + "?q=" + options.data, true);
        xhr.send(null);
    } else if (options.type == "POST") {
        xhr.open("POST", options.url, true);
        //设置表单提交时的内容类型
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
}

function formatParams(data: { [x: string]: string | number | boolean; }) {
    let arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    // arr.push(("v=" + Math.random()).replace("."));
    return arr.join("&");
}

// //格式化参数
// function formatParams(data: string) {
//     var arr:string;
//     arr = "q=" + data
//     return arr;
// }

export function isCanvasBlank(canvas: HTMLCanvasElement){
    const context = canvas.getContext('2d');

    const pixelBuffer = new Uint32Array(
      context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
  
    return !pixelBuffer.some(color => color !== 0);
}

export function canvasClear(canvas, ctx){
    // Store the current transformation matrix
    ctx.save();
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    ctx.restore();
}

export function dataURLToCanvas(dataurl, cb){
	let canvas = document.createElement('CANVAS') as HTMLCanvasElement
	let ctx = canvas.getContext('2d');
	let img = new Image();
	img.onload = function(){
		canvas.width = img.width;
		canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
		cb(canvas);
    };
	img.src = dataurl;
}

