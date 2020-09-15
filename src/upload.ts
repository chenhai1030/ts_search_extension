import ajax from './util'


+function(){
    let iframes = document.getElementsByTagName("iframe")
    for (let i=0; i<iframes.length; i++){
        if (iframes[i].dataset.src == "/admin/refine_task"){
            var contentIframe = document.getElementsByTagName("iframe")[i] 
        }
    }
    let exDiv = contentIframe.contentWindow.document.getElementsByClassName("img-still mod-editpic")
    let mImg = exDiv[0].childNodes[2] as HTMLImageElement
    let mName = contentIframe.contentWindow.document.getElementById("video_name") as HTMLInputElement
    let params = {
        url: mImg.currentSrc,
        name: mName.value,
    }
    // let serverip = "http://172.17.3.201/"
    let serverip = "http://172.17.5.90/"
    ajax({
        url: serverip + "api/upload",     //request path
        type: "POST",                       //request type
        data: params,                      //request param
        dataType: "json",
        success: function (response, xml) {
            console.info("upload success!!")
        },
        fail: function () {
            console.info("failed!!")
        }
    })
}();