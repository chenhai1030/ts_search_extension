
// let startx,//起始x坐标
//     starty,//起始y坐标
//     flag,//是否点击鼠标的标志
//     x,
//     y,
//     leftDistance,
//     topDistance = 0,
//     scale=1
// const elementWidth=1920,elementHeight=1080;
// let layers=[];//图层
// let currentR;//当前点击的矩形框
// const c = document.createElement('canvas');
// const ctx=c.getContext("2d");
// 'use strict';
function sendMessageToContentScript(message, callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		chrome.tabs.sendMessage(tabs[0].id, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}

function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

chrome.contextMenus.create({
    title: "保存到图库",
    contexts: ['image'],
    onclick: function(){
        chrome.tabs.executeScript({
            file: 'js/upload.js'
        });
        // sendMessageToContentScript({
        //     cmd:"upload",
        //     value:"nihao"
        // }, null)
    }
});
chrome.contextMenus.create({
    title: "更新封面",
    contexts: ['video'],
    onclick: function(){
        chrome.tabs.executeScript({
            file: 'js/upload_cover.js'
        });
        getCurrentTabId((tabId) => {
            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse){
                    console.info(request)
                    let rect = request.msg
                    var port = chrome.tabs.connect(tabId, {name: 'upload-connect'});
                    chrome.tabs.captureVisibleTab(null,{},function(dataUrl){
                        var img = new Image();
                        // clipScreenshots();
                        let Width = this.screen.width
                        let Height = this.screen.height
                        img.onload = function() {
                            var canvas = document.createElement('canvas');
                            canvas.width = 1920
                            canvas.height = 1440
                            var context = canvas.getContext('2d');
                            // Assuming px,py as starting coordinates and hx,hy be the width and the height of the image to be extracted
                            context.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width , canvas.height);
                            let croppedUri = canvas.toDataURL('image/jpeg');
                            // You could deal with croppedUri as cropped image src.
                            port.postMessage({message:croppedUri})
                        };
                        img.src = dataUrl
                        // port.onMessage.addListener(function(msg) {
                        //     // alert('收到消息：'+msg.answer);
                        //     if(msg.answer && msg.answer.startsWith('我是'))
                        //     {
                        //         port.postMessage({question: '哦，原来是你啊！'});
                        //     }
                        // });
                    });
                }
            );
            // var port = chrome.tabs.connect(tabId, {name: 'upload-connect'});
            // port.onMessage.addListener(function(msg){
            //     console.info(msg)
            //     if(msg.message == 'canvas-size'){

            //     }
            // })


        });
    }
});
/* global chrome */
chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.executeScript({
        file: 'js/content_script.js'
    });
    chrome.tabs.insertCSS({
        file: 'styles/page.css'
    });
    chrome.tabs.insertCSS({
        file: 'styles/modal.css'
    });
});


// chrome.webRequest.onBeforeRequest.addListener(function (details) {
//         return {redirectUrl: chrome.extension.getURL("js/jquery-2.2.1.js")}
//         // return {redirectUrl: chrome.extension.getURL("js/refine_task.html")}
//     },
//     {
//         urls:["http://fcg.fun.tv/static/admin/common/static/js/jquery.min_6f28219.js"],
//         // urls:["http://fcg.fun.tv/admin/refine_task"],
//         types: ["script"]
//     },
//     ["blocking"]
// );



// function reshow(x,y){
//     let allNotIn=1;
//     layers.forEach(item=>{
//         ctx.beginPath();
//         ctx.rect(item.x1,item.y1,item.width,item.height);
//         ctx.strokeStyle=item.strokeStyle
//         ctx.stroke();
//     })
// }

// function isPointInRetc(x,y){
//     let len=layers.length;
//     for(let i=0;i<len;i++){
//         if(layers[i].x1<x&&x<layers[i].x2&&layers[i].y1<y&&y<layers[i].y2){
//             return layers[i];
//         }
//     }
// }
// function fixPosition(position){
//     if(position.x1>position.x2){
//         let x=position.x1;
//         position.x1=position.x2;
//         position.x2=x;
//     }
//     if(position.y1>position.y2){
//         let y=position.y1;
//         position.y1=position.y2;
//         position.y2=y;
//     }
//     position.width=position.x2-position.x1
//     position.height=position.y2-position.y1
// 	if(position.width<50||position.height<50){
// 		position.width=60;
// 		position.height=60;
// 		position.x2+=position.x1+60;
// 		position.y2+=position.y1+60;
// 	}
//     return position
// }

// let mousedown=function(e){
//     startx=(e.pageX-c.offsetLeft+c.parentElement.scrollLeft)/scale;
//     starty=(e.pageY-c.offsetTop+c.parentElement.scrollTop)/scale;
//     currentR=isPointInRetc(startx,starty);
//     if(currentR){
//         leftDistance=startx-currentR.x1;
//         topDistance=starty-currentR.y1;
//     }
//     ctx.strokeRect(x,y,0,0);
//     ctx.strokeStyle="#0000ff";
//     flag=1;
// }
// let mousemove=function(e){
//     x=(e.pageX-c.offsetLeft+c.parentElement.scrollLeft)/scale;
//     y=(e.pageY-c.offsetTop+c.parentElement.scrollTop)/scale;
//     ctx.save();
//     ctx.setLineDash([5])
//     c.style.cursor="default";
//     ctx.clearRect(0,0,elementWidth,elementHeight)
//     if(flag==1){
//         ctx.strokeRect(startx,starty,x-startx,y-starty);
//     }
//     ctx.restore();
//     reshow(x,y);
// }
// let mouseup=function(e){
//     if(flag==1){
//         layers.push(fixPosition({
//             x1:startx,
//             y1:starty,
//             x2:x,
//             y2:y,
// 			strokeStyle:'#0000ff',
//         }))
// 	}
// 	currentR=null;
//     flag=0;
//     reshow(x,y);
// }
// c.onmouseleave=function(){
//     c.onmousedown=null;
//     c.onmousemove=null;
//     c.onmouseup=null;
// }
// c.onmouseenter=function(){
//     c.onmousedown=mousedown;
//     c.onmousemove=mousemove;
//     document.onmouseup=mouseup;
// }

// // var defaultStrokeWidth = 1; //画矩形选取框的线宽

// // /**
// //  * 选取划线的canvasExt
// //  * @type {{drawRect: canvasExt.drawRect}}
// //  */
// // var canvasExt = {
// //     /**
// //      *  画矩形
// //      * @param penColor 画笔颜色
// //      * @param strokeWidth 线宽
// //      */
// //     drawRect: function (penColor, strokeWidth) {
// //         var that = this;

// //         that.penColor = penColor;
// //         that.penWidth = strokeWidth;
// //         var canvas = document.getElementById("canvas");
// //         //canvas 的矩形框
// //         var canvasRect = canvas.getBoundingClientRect();
// //         //canvas 矩形框的左上角坐标
// //         var canvasLeft = canvasRect.left;
// //         var canvasTop = canvasRect.top;

// //         // 要画的矩形的起点 xy
// //         var x = 0;
// //         var y = 0;

// //         //鼠标点击按下事件，画图准备
// //         canvas.onmousedown = function(e) {

// //             //设置画笔颜色和宽度
// //             var color = that.penColor;
// //             var penWidth = that.penWidth;
// //             // 确定起点
// //             x = e.clientX - canvasLeft;
// //             y = e.clientY - canvasTop;
// //             // 添加layer
// //             jCanvas.addLayer({
// //                 type: 'rectangle',
// //                 strokeStyle: color,
// //                 strokeWidth: penWidth,
// //                 name:'areaLayer',
// //                 fromCenter: false,
// //                 x: x, y: y,
// //                 width: 1,
// //                 height: 1
// //             });
// //             // 绘制
// //             jCanvas.drawLayers();
// //             jCanvas.saveCanvas();

// //             //鼠标移动事件，画图
// //             canvas.onmousemove = function(e){

// //                 // 要画的矩形的宽高
// //                 var width = e.clientX-canvasLeft - x;
// //                 var height = e.clientY-canvasTop - y;

// //                 // 清除之前画的
// //                 jCanvas.removeLayer('areaLayer');

// //                 jCanvas.addLayer({
// //                     type: 'rectangle',
// //                     strokeStyle: color,
// //                     strokeWidth: penWidth,
// //                     name:'areaLayer',
// //                     fromCenter: false,
// //                     x: x, y: y,
// //                     width: width,
// //                     height: height
// //                 });

// //                 jCanvas.drawLayers();
// //             }
// //         };
// //         //鼠标抬起
// //         canvas.onmouseup=function(e){

// //             var color = that.penColor;
// //             var penWidth = that.penWidth;

// //             canvas.onmousemove = null;

// //             var width = e.clientX - canvasLeft - x;
// //             var height = e.clientY- canvasTop - y;

// //             jCanvas.removeLayer('areaLayer');

// //             jCanvas.addLayer({
// //                 type: 'rectangle',
// //                 strokeStyle: color,
// //                 strokeWidth: penWidth,
// //                 name:'areaLayer',
// //                 fromCenter: false,
// //                 x: x, y: y,
// //                 width: width,
// //                 height: height
// //             });

// //             jCanvas.drawLayers();
// //             jCanvas.saveCanvas();

// //             // // 把body转成canvas
// //             // html2canvas(document.body, {
// //             //     scale: 1,
// //             //     // allowTaint: true,
// //             //     useCORS: true  //跨域使用
// //             // }).then(canvas => {
// //             //     var capture_x, capture_y
// //             //     if (width > 0) {
// //             //         //从左往右画
// //             //         capture_x = x + that.penWidth
// //             //     }else {
// //             //         //从右往左画
// //             //         capture_x = x + width + that.penWidth
// //             //     }
// //             //     if (height > 0) {
// //             //         //从上往下画
// //             //         capture_y = y + that.penWidth
// //             //     }else {
// //             //         //从下往上画
// //             //         capture_y = y + height + that.penWidth
// //             //     }
// //             //     printClip(canvas, capture_x, capture_y, Math.abs(width), Math.abs(height))
// //             // });
// //             // 移除画的选取框
// //             jCanvas.removeLayer('areaLayer');
// //             // 隐藏用于华画取框的canvas
// //             jCanvas.hide()
// //         }
// //     }
// // };

// // /**
// //  * 选取截屏
// //  */
// // function clipScreenshots(){
// //     canvasExt.drawRect("red", defaultStrokeWidth);
// // }