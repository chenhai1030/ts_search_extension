import ajax from './util';


// function retrieveWindowVariables(variables: string | any[]) {
//     var ret = {};

//     var scriptContent = "";
//     for (var i = 0; i < variables.length; i++) {
//         var currVariable = variables[i];
//         scriptContent += "if (typeof " + currVariable + " !== 'undefined') document.body.getAttribute('tmp_" + currVariable + "', JSON.stringify(" + currVariable + "));\n"
//     }

//     var script = document.createElement('script');
//     script.id = 'tmpScript';
//     script.appendChild(document.createTextNode(scriptContent));
//     (document.body || document.head || document.documentElement).appendChild(script);

//     for (var i = 0; i < variables.length; i++) {
//         var currVariable = variables[i];
//         ret[currVariable] = JSON.parse(document.body.getAttribute("tmp_" + currVariable));
//         document.body.removeAttribute("tmp_" + currVariable);
//     }

//     console.info(ret)
//     document.documentElement.removeChild(document.getElementById("tmpScript")) 
//     return ret;
// }
function injectCustomJs(jsPath)
{
	jsPath = jsPath || 'js/upload_cover_inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/upload_cover_inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
        // console.info("remove inject")
		document.head.removeChild(temp);
    };
	document.head.appendChild(temp);
}

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
    }

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
    injectCustomJs(null)
    _video.pause();
    
    var canvasRect = {
        x:Number,
        y:Number,
        width:Number,
        height:Number,
    }
    window.addEventListener("message", function handleKey(e){
        const data = e.data
        switch(data.cmd){
            case 'CLIP':
                canvasRect.x = data.x;
                canvasRect.y = data.y;
                canvasRect.width = data.width;
                canvasRect.height = data.height;
                if(clipIframe){
                    document.documentElement.removeChild(clipIframe)
                }
                chrome.runtime.sendMessage({msg:canvasRect}, function(res){});
                break
            case 'empty':
                if(clipIframe){
                    document.documentElement.removeChild(clipIframe)
                    return
                }
                break
        }
        window.removeEventListener("message", handleKey)
    }, false);

    function handleUploadCover(request, sender, response){
        if(request.cmd == 'upload-connect') {
            let base64 = request.message
            let params = {
                filetype: "jpeg",
                image: base64.substring(base64.lastIndexOf(",")+1)
            }
            ajax({
                type: "POST",
                url:"/ajaxa/post/upload_pic",
                data:params,
                success: function(data: string) {
                    var obj = null;
                    try{
                        obj = JSON.parse( data );
                    }catch(e){};  
                    let params = {
                        id: id,
                        still: obj.data.url,
                    }

                    contentIframe.contentWindow.postMessage({
                        cmd: 'VIDEOCHANGE',
                        data: params
                    }, '*') 
                    console.info(params)
                    ajax({
                        type: "POST",
                        url: "/ajaxa/post/save_still",
                        data: params,

                        success: function() {
                            chrome.runtime.onMessage.removeListener(handleUploadCover)
                        }
                    });
                    mImg.src = obj.data.url 
                }
            });
        } 
    }

    chrome.runtime.onMessage.addListener(handleUploadCover)

  
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