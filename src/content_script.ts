import ajax from './util';


let pageMouseX: number, pageMouseY: number
let frameTop = 0
let frameLeft = 0

function dragStart (mouseX: any, mouseY: any) {
    let myIframe = document.getElementById("FuntvGalleryHelper")
    frameTop = myIframe.offsetTop
    frameLeft = myIframe.offsetLeft
    // 得出鼠标在上层的位置
    pageMouseX = mouseX + frameLeft
    pageMouseY = mouseY + frameTop
  
    document.addEventListener('mouseup', dragEnd)
    document.addEventListener('mousemove', handlePageMousemove)
}
  
function dragEnd () {
    document.removeEventListener('mouseup', dragEnd)
    document.removeEventListener('mousemove', handlePageMousemove)
}
  
function handleFrameMousemove (offsetX: number, offsetY: number) {
    let myIframe = document.getElementById("FuntvGalleryHelper")
    frameTop += offsetY 
    frameLeft += offsetX 
    myIframe.style.top = frameTop + 'px'
    myIframe.style.left = frameLeft + 'px'
    // 更新鼠标在上层的位置，补上偏移
    pageMouseX += offsetX
    pageMouseY += offsetY
}

function handlePageMousemove (evt: { clientX: number; clientY: number; }) {
    let myIframe = document.getElementById("FuntvGalleryHelper")
    frameTop += evt.clientX - pageMouseX
    frameLeft += evt.clientY - pageMouseY
    myIframe.style.top = frameTop + 'px'
    myIframe.style.left = frameLeft + 'px'
  
    // 新位置直接可以更新
    pageMouseX = evt.clientX
    pageMouseY = evt.clientY
}

function reinitIframe(height: string){
    let myIframe = document.getElementById("FuntvGalleryHelper") as HTMLIFrameElement
    myIframe.height = height
}

function removeInjected(){
    let modalDiv = document.getElementById("FuntvModalDiv")
    if (modalDiv){
        document.body.removeChild(modalDiv)
    }
    let myIframe = document.getElementById("FuntvGalleryHelper")
    if(myIframe){
        document.documentElement.removeChild(myIframe)
    }
}

function closeModal(){
    let modalDiv = document.getElementById("FuntvModalDiv")
    modalDiv.style.display = "none";
    modalDiv.style.zIndex = "-1"
}

function checkESC(e:KeyboardEvent){
    if (e.keyCode == 27) {
        closeModal()
    }
}

function addModal(){
    let modalDiv = document.getElementById("FuntvModalDiv")
    if (!modalDiv){
        modalDiv = document.createElement("div")
        modalDiv.id = "FuntvModalDiv"
        modalDiv.classList.add("FuntvModalDiv")
        modalDiv.tabIndex = -1
        modalDiv.addEventListener("keyup", checkESC)
        document.body.appendChild(modalDiv)
    }
    if (modalDiv){
        modalDiv.innerHTML='<div id="detailMeta"> \
                                <div id="img-caption"></div> \
                                <div id="imagemeta"> \
                                    <div id="msz"></div>\
                                </div> \
                            </div>'
        modalDiv.innerHTML += '<span id="FuntvModalClose">×</span><img id="funtv-modal-content">'
        document.getElementById("FuntvModalClose").addEventListener("click", closeModal)

        // modalDiv.innerHTML += '<div id="navl" class="nav noforcus" tabindex="0"><span class="icon"></span></div>'
        // modalDiv.innerHTML += '<div id="navr" class="nav noforcus" tabindex="0"><span class="icon"></span></div>'
        // document.querySelector("#navl > span").style.backgroundImage = chrome.extension.getURL ('./styles/res/navl.svg')
        // document.querySelector("#navr > span").style.backgroundImage = chrome.extension.getURL ('./styles/res/navr.svg')
    }
}

function preview(src: string, msz: string){
    let modal = document.getElementById('FuntvModalDiv');
    (<HTMLIFrameElement>document.getElementById("funtv-modal-content")).src = src
    console.info(src)
    document.getElementById("img-caption").innerHTML = src.substring(src.lastIndexOf('/')+1)
    document.getElementById("msz").innerHTML = msz
    
    if(modal){
        modal.style.display = "block"
        modal.style.zIndex = "999"
        modal.style.outline = "none"
        modal.focus()
    }
}

function getBase64Image(img:HTMLImageElement){
    var canvas = document.createElement("canvas");
    canvas.width = img.width
    canvas.height = img.height
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height); 
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
    // console.log(dataURL)
    return dataURL;
}

function save_still(id: string, stillUrl: any){
    let params = {
        id: id,
        still: stillUrl,
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
}

function exchange(data: string){
    var img = new Image();
    img.crossOrigin = "";
    img.src = data
    img.onload = function(){
        let base64 = getBase64Image(img)
        let iframes = document.getElementsByTagName("iframe")
        for (let i=0; i<iframes.length; i++){
            if (iframes[i].dataset.src == "/admin/refine_task"){
                var contentIframe = document.getElementsByTagName("iframe")[i] 
            }
        }
        let exDiv = contentIframe.contentWindow.document.getElementsByClassName("img-still mod-editpic")
        let mImg = exDiv[0].childNodes[2] as HTMLImageElement
        let id = exDiv[0].attributes[6].nodeValue
        // console.info(mImg)
        // mImg.src = data

        var ext = data.substring(data.lastIndexOf(".")+1);
        let params = {
            filetype: ext,
            image: base64.substring(base64.lastIndexOf(",")+1),
        }
        ajax({
            type: "POST",
            url:"/ajaxa/post/upload_pic",
            data:params,
            // error: function(request) {
            //     alert("上传失败");
            // },
            success: function(data: string) {
                var obj = null;
                try{
                    obj = JSON.parse( data );
                }catch(e){};  
                save_still(id, obj.data.url)
                mImg.src = obj.data.url 
            }
        });
    }
}

+function () {
    addModal()
    let myIframe = document.getElementById("FuntvGalleryHelper") as HTMLIFrameElement
    if (!myIframe){
        myIframe = document.createElement("iframe")
        myIframe.id = "FuntvGalleryHelper"
        myIframe.scrolling = "auto"
        myIframe.src = chrome.extension.getURL ('helper.html')
        myIframe.classList.add("st-inspector")
        document.documentElement.appendChild(myIframe)
    }else{
        removeInjected()
        return
    }

    window.addEventListener("message", function(e){
        const data = e.data
        // console.info("cmd:", data.cmd)
        switch(data.cmd){
            case 'reinitIframe':
                reinitIframe(e.data.data)	
                break
            case 'removeInjected':
                removeInjected() 
                break
            case 'preview':
                preview(data.src, data.msz)
                break
            case 'exchange':
                exchange(e.data.data)	
                break
            case 'SALADICT_DRAG_START':
                dragStart(data.mouseX, data.mouseY)
                break
            case 'SALADICT_DRAG_MOUSEMOVE':
                handleFrameMousemove(data.offsetX, data.offsetY)
                break
            case 'SALADICT_DRAG_END':
                dragEnd()
                break
        }
    }, false);
}();


