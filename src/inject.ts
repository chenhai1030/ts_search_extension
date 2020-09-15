import ajax from './util';
import {serverip} from './util';

let imgarrs: string | any[]
let itemsToBeLoaded = 0
let timeoutID = null;
let bMove = false;
let imgCheight: number
let baseMouseX: number, baseMouseY: number

function handleDragStart (evt: { clientX: number; clientY: number; }) {
    bMove = true
    // console.info(evt.clientX, evt.clientY)
    var obj = document.elementFromPoint(evt.clientX, evt.clientY);
    if (obj.tagName.toLowerCase() === 'input') {
        return
    }
    baseMouseX = evt.clientX  
    baseMouseY = evt.clientY
    window.parent.postMessage({
        cmd: 'SALADICT_DRAG_START',
        mouseX: baseMouseX,
        mouseY: baseMouseY
    }, '*') 
    document.addEventListener('mousemove', handleMousemove)
    document.addEventListener('mouseup', handleDragEnd)
    return false
}
  
function handleMousemove (evt: { clientX: number; clientY: number; }) {
    if(!bMove) return false
    window.parent.postMessage({
        cmd: 'SALADICT_DRAG_MOUSEMOVE',
        offsetX: evt.clientX - baseMouseX,
        offsetY: evt.clientY - baseMouseY
    }, '*') 
}
  
function handleDragEnd () {
    bMove = false
    window.parent.postMessage({
      cmd: 'SALADICT_DRAG_END'
    }, '*')
    document.removeEventListener('mousemove', handleMousemove)
}

function handleResizeIframe(w: number, h: number){
    window.parent.postMessage({
        cmd: 'resizeIframe',
        width: w,
        height: h
    }, '*') 
}

function sendClose(){
    sendMsg("removeInjected", "")
}

function switchShow(){
    let imgDiv = document.getElementById("imgContainer") as HTMLDivElement
    // let len = imgDiv.childNodes.length
    if(imgDiv.style.display == "none"){
        imgDiv.style.display = 'block'
        sendMsg("reinitIframe", imgCheight+100+'px')
    }else{
        imgCheight = imgDiv.clientHeight
        imgDiv.style.display = 'none'
        sendMsg("reinitIframe", "80px")
    }
}

function sendMsg(cmd: string, data: string){
    window.parent.postMessage({cmd: cmd, data: data}, '*');
}

function getItemNum(res: { total: any; count: any; }){
    let num: number 
    if (res.total){
        num = res.total
    }else if(res.count){
        num = res.count
    }
    return num
}

function showPreview(e){
    clearTimeout(this.timeoutID)
    let imgSrc = e.path[0].attributes[0].nodeValue
    let imgName = imgSrc.substring(imgSrc.lastIndexOf('/')+1)
    let msz = ""
    for (let i = 0; i < imgarrs.length; i++){
        if (imgName == imgarrs[i].imgName){
            msz = imgarrs[i].dimensions
        }
    }
    this.timeoutID = window.setTimeout(function(){
        // sendMsg("preview", data)
        window.parent.postMessage({
            cmd: "preview", 
            src: imgSrc, 
            msz: msz}, '*')
    }, 300);
}

function exChangePic(e){
    clearTimeout(this.timeoutID); 
    let data = e.path[0].attributes[0].nodeValue
    sendMsg("exchange", data)
}

function createImg(src:string, i:number){
    let imgDiv = document.getElementById("imgContainer")
    let img = document.createElement("img")
    if (src.includes("http://")){
        img.src = src
    }else{
        img.src = serverip + src
    }
    img.id = "img" + i
    img.style.width = "150px"
    img.style.height = "112px"
    img.style.marginLeft="1px"
    img.style.marginRight="1px"
    imgDiv.appendChild(img)
    document.getElementById(img.id).addEventListener("click", showPreview)
    document.getElementById(img.id).addEventListener("dblclick", exChangePic)
}

function prepareImg(num: number, resObj: { data: { imgUrl: string; }[]; }){
    let imgDiv = document.getElementById("imgContainer")
    let childs = imgDiv.childNodes
    for (let i=childs.length -1; i>=0; i--){
        imgDiv.removeChild(childs[i])
    }
    if (num >0){
        let shouldLoadNum = imgDiv.clientHeight*imgDiv.clientWidth/16000
        if (num >= 5){
            imgDiv.style.overflowY = 'scroll'
        }
        // console.info("nu:", num)
        // console.info("should",shouldLoadNum )
        //atleast load 2 imgs
        for (let i=1; i<=shouldLoadNum+2 && i <= num; i++){
            if(i > 2){
                imgDiv.style.minHeight = '220px'     
            }else if (i >= 1){
                imgDiv.style.minHeight = '120px'
            }
            let imgSrc = resObj.data[i-1].imgUrl
            createImg(imgSrc, i)
        }
        itemsToBeLoaded = num - ~~shouldLoadNum -2
    }
    else{
        imgDiv.style.minHeight = '0px'
    }
    (<HTMLDivElement>document.getElementsByClassName('helperContainer')[0]).style.height = imgDiv.clientHeight + 60 + 'px'
    imgDiv.style.height = imgDiv.clientHeight - 10 + 'px' 

    let len = imgDiv.childNodes.length
    if (len){
        sendMsg("reinitIframe", imgDiv.clientHeight + 80 + 'px')
    }
}

function checkInfo(event:KeyboardEvent){
    //enter pressed
    if (event.keyCode == 13) {
        let keyword = (<HTMLInputElement>document.querySelector('[name="searchInput"]')).value
        ajax({
            url: serverip + "api/search",     //request path
            type: "GET",                       //request type
            data: keyword,                      //request param
            dataType: "json",
            success: function (response, xml) {
                // console.info("success!!")
                let resObj =  JSON.parse(response)
                imgarrs = resObj.data
                let imgNums = itemsToBeLoaded = getItemNum(resObj)
                prepareImg(imgNums, resObj)
            },
            fail: function () {
                console.info("failed!!")
            }
        })
    }
}

function waterfall(imgarrs: string | any[]){
    if (itemsToBeLoaded > 0){
        if (imgarrs.length > itemsToBeLoaded){
            for(let i=imgarrs.length - itemsToBeLoaded ; i< itemsToBeLoaded; i++){
                let imgSrc = imgarrs[i].imgUrl
                createImg(imgSrc, i+1)
            }
            itemsToBeLoaded = 0
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("switchShow").addEventListener("click", switchShow);
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("close").addEventListener("click", sendClose);
});

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('TitleField').addEventListener("keyup", checkInfo);
});

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('imgContainer').onscroll = function(){
        waterfall(imgarrs)
    }
});

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('funtv-dragarea').addEventListener("mousedown", handleDragStart);
});

document.addEventListener('DOMContentLoaded', function(){
    let imgDiv = document.getElementById("imgContainer") as HTMLDivElement 
    let resizeDiv = document.getElementsByClassName('helperContainer')[0] as HTMLDivElement
    let opDiv = document.getElementById('resizeOp') as HTMLDivElement
    let disX = 0
    let disY = 0
    let iframeW = 0
    let iframeH = 0
    let bDrag = false;

    opDiv.onmousedown = function(ev){
        bDrag = true
        disX = ev.clientX - resizeDiv.offsetWidth;
        disY = ev.clientY - resizeDiv.offsetHeight; 
        if (ev.preventDefault) {
            ev.preventDefault();
        } else{
            ev.returnValue=false;
        }
        handleResizeIframe(1920, 1080)
        
        document.onmousemove = function(ev){
            if(!bDrag) return false;
            var l = ev.clientX - disX;
            var t = ev.clientY - disY; 
            if ((l < 290) || (t < 65)) return false

            resizeDiv.style.width = l + 'px'
            resizeDiv.style.height = t + 'px'
            imgDiv.style.height = t - 70 + 'px'
            iframeW = l
            iframeH = t
            // handleResizeIframe(l, t)
            waterfall(imgarrs)
        }
        return false
    }
    opDiv.onmouseup = document.onmouseup = function(ev){
        bDrag = false;
        if (iframeW > 0 && iframeH > 0){
            handleResizeIframe(iframeW, iframeH)
        }else{
            handleResizeIframe(308, 60)
        }
        document.onmousedown = document.onmousemove = null
    }  
});

