+function(){
    let iframes = document.getElementsByTagName("iframe")
    for (let i=0; i<iframes.length; i++){
        if (iframes[i].dataset.src == "/admin/refine_task"){
            var contentIframe = document.getElementsByTagName("iframe")[i] 
        }
    }
    //@ts-ignore
    let isvideoChangeFunc = contentIframe.contentWindow.refine_task_modiy_image
    contentIframe.contentWindow.addEventListener("message", function videoChange(e){
        isvideoChangeFunc({pic_attr:e.data.data.still, attr:e.data.data.id})
        contentIframe.contentWindow.removeEventListener("message", videoChange)
    }, false);
}();
