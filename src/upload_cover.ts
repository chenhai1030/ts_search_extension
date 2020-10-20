import { contains } from 'jquery';
import ajax from './util';
// import html2canvas from "html2canvas";
// var html2canvas = require("html2canvas")


+function(){
    let iframes = document.getElementsByTagName("iframe")
    for (let i=0; i<iframes.length; i++){
        if (iframes[i].dataset.src == "/admin/refine_task"){
            var contentIframe = document.getElementsByTagName("iframe")[i] 
        }
    }
    let exDiv = contentIframe.contentWindow.document.getElementsByClassName("img-still mod-editpic")
    let mImg = exDiv[0].childNodes[2] as HTMLImageElement
    let id = exDiv[0].attributes[6].nodeValue
    let shotDiv = contentIframe.contentWindow.document.getElementsByClassName("videobox")
    let _video = shotDiv[0].childNodes[3] as HTMLVideoElement
    let canvas = document.createElement("canvas")
    let ctx = canvas.getContext("2d");
    canvas.width = _video.videoWidth
    canvas.height = _video.videoHeight
   
    // _video.useCORS=true;
    // _video.crossOrigin ="anonymous";
    // _video.pause();
    // ctx.drawImage(_video, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    // let base64 = canvas.toDataURL("image/png");
  
    chrome.runtime.onConnect.addListener(function(port) {
        if(port.name == 'upload-connect') {
            // port.postMessage({message:"canvas-size",W:canvas.width, H:canvas.height})
            port.onMessage.addListener(function(msg) {
                console.log('收到长连接消息：', msg);
                var base64 = msg.message
                let params = {
                    filetype: "jpeg",
                    image: base64.substring(base64.lastIndexOf(",")+1)
                }
                ajax({
                    type: "POST",
                    url:"/ajaxa/post/upload_pic",
                    data:params,
                    success: function(data: string) {
                        console.info(data)
                        var obj = null;
                        try{
                            obj = JSON.parse( data );
                        }catch(e){};  
                        let params = {
                            id: id,
                            still: obj.data.url,
                        }
                        ajax({
                            type: "POST",
                            url: "/ajaxa/post/save_still",
                            data: params,
                            // error: function(request) {
                            //     alert("上传失败");
                            // },
                            success: function(data) {
                            }
                        });
                        mImg.src = obj.data.url 
                    }
                });
            });
        }
    });
    // html2canvas(_video, {
    //     useCORS : true,
    //     allowTaint : true,
    //     width: _video.width,
    //     height:_video.height
    // }).then(canvas => {
    //     let base64 = canvas.toDataURL("image/png"); 
    //     let params = {
    //         filetype: "png",
    //         image: base64.substring(base64.lastIndexOf(",")+1),
    //     }
    //     ajax({
    //         type: "POST",
    //         url:"/ajaxa/post/upload_pic",
    //         data:params,
    //         // error: function(request) {
    //         //     alert("上传失败");
    //         // },
    //         success: function(data: string) {
    //             console.info(data)
    //             var obj = null;
    //             try{
    //                 obj = JSON.parse( data );
    //             }catch(e){};  
    //             let params = {
    //                 id: id,
    //                 still: obj.data.url,
    //             }
    //             ajax({
    //                 type: "POST",
    //                 url: "/ajaxa/post/save_still",
    //                 data: params,
    //                 // error: function(request) {
    //                 //     alert("上传失败");
    //                 // },
    //                 success: function(data) {
    //                 }
    //             });
    //             mImg.src = obj.data.url 
    //         }
    //     });
    // });

}();