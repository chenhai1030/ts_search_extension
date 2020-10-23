import { contains } from 'jquery';
import ajax from './util';



+function(){
    let clipIframe = document.getElementById("FuntvGalleryCliper") as HTMLIFrameElement
    if(!clipIframe){
        clipIframe = document.createElement("iframe")
        clipIframe.id = "FuntvGalleryCliper"
        clipIframe.src = chrome.extension.getURL('clipper.html')
        let cssText =
        "left: auto; right: 0px; top: 0px; bottom: auto; border: none;display: block;" +
        "margin: 0px; max-height: none; max-width: none; min-height: 0px; min-width: 0px;" +
        "overflow: hidden; padding: 0px; position: fixed; transition: initial; z-index: 2147483647;" +
        "width: 100%; height: 100%;"
        clipIframe.style.cssText = cssText
        document.documentElement.appendChild(clipIframe)
    }else{
        clipIframe.style.display="block"
        clipIframe.contentWindow.postMessage({cmd:"clipInit"}, '*')
        return
    }

    let iframes = document.getElementsByTagName("iframe")
    for (let i=0; i<iframes.length; i++){
        if (iframes[i].dataset.src == "/admin/refine_task"){
            var contentIframe = document.getElementsByTagName("iframe")[i] 
        }
        if(iframes[i].id == "FuntvGalleryCliper"){
            var opIframe = document.getElementsByTagName("iframe")[i] 
        }
    }


    let exDiv = contentIframe.contentWindow.document.getElementsByClassName("img-still mod-editpic")
    let mImg = exDiv[0].childNodes[2] as HTMLImageElement
    let id = exDiv[0].attributes[6].nodeValue
    let shotDiv = contentIframe.contentWindow.document.getElementsByClassName("videobox")
    let _video = shotDiv[0].childNodes[3] as HTMLVideoElement
    _video.pause();
    // let rectObject = _video.getBoundingClientRect();
    var canvasRect = {
        x:Number,
        y:Number,
        width:Number,
        height:Number
    }
    window.addEventListener("message", function(e){
        const data = e.data
        switch(data.cmd){
            case 'CLIP':
                clipIframe.style.display="none"
                // if(clipIframe)
                //     document.documentElement.removeChild(clipIframe)
                canvasRect.x = data.x;
                canvasRect.y = data.y;
                canvasRect.width = data.width;
                canvasRect.height = data.height;
                chrome.runtime.sendMessage({msg:canvasRect}, function(res){

                });
                break
            case 'empty':
                clipIframe.style.display="none"
                // if(clipIframe)
                //     document.documentElement.removeChild(clipIframe)
                break
        }
    }, false);

    let base64_old: any
    chrome.runtime.onMessage.addListener(function(request, sender, response){
        if(request.cmd == 'upload-connect') {
            let base64 = request.message
            if (base64 == base64_old){
                console.info("same")
                return
            }else{
                base64_old = base64
            }
            let params = {
                filetype: "jpeg",
                image: base64.substring(base64.lastIndexOf(",")+1)
            }
            ajax({
                type: "POST",
                url:"/ajaxa/post/upload_pic",
                data:params,
                success: function(data: string) {
                    base64_old = null
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

                        success: function(data) {
                        }
                    });
                    mImg.src = obj.data.url 
                }
            });
        }
    })
  
    // chrome.runtime.onConnect.addListener(function(port) {
    //     if(port.name == 'upload-connect') {
    //         port.onMessage.addListener(function(msg) {
    //             console.log('收到长连接消息：', msg);
    //             var base64 = msg.message
    //             let params = {
    //                 filetype: "jpeg",
    //                 image: base64.substring(base64.lastIndexOf(",")+1)
    //             }
    //             ajax({
    //                 type: "POST",
    //                 url:"/ajaxa/post/upload_pic",
    //                 data:params,
    //                 success: function(data: string) {
    //                     console.info(data)
    //                     var obj = null;
    //                     try{
    //                         obj = JSON.parse( data );
    //                     }catch(e){};  
    //                     let params = {
    //                         id: id,
    //                         still: obj.data.url,
    //                     }
    //                     ajax({
    //                         type: "POST",
    //                         url: "/ajaxa/post/save_still",
    //                         data: params,

    //                         success: function(data) {
    //                         }
    //                     });
    //                     mImg.src = obj.data.url 
    //                 }
    //             });
    //         });
    //     }
    // });

}();