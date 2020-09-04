import ajax from './util';

let imgarrs: string | any[]
let itemsToBeLoaded = 0
let timeoutID = null;
// var serverip = "http://172.17.3.201/"
// let serverip = "http://172.17.7.11:8000/"
let serverip = "http://172.17.5.90/"

let baseMouseX: number, baseMouseY: number

function handleDragStart (evt: { clientX: number; clientY: number; }) {
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
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('mousemove', handleMousemove)
}
  
function handleMousemove (evt: { clientX: number; clientY: number; }) {
    if(arguments[0].buttons == 1){
        arguments[0].preventDefault();
        window.parent.postMessage({
            cmd: 'SALADICT_DRAG_MOUSEMOVE',
            offsetX: evt.clientX - baseMouseX,
            offsetY: evt.clientY - baseMouseY
        }, '*') 
    }
}
  
function handleDragEnd () {
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('mousemove', handleMousemove)
    window.parent.postMessage({
      cmd: 'SALADICT_DRAG_END'
    }, '*')
}

function sendClose(){
    sendMsg("removeInjected", "")
}

function switchShow(){
    let imgDiv = document.getElementById("imgContainer")
    if(imgDiv.style.display == "none"){
        imgDiv.style.display = 'block'
        let imgCheight: string 
        let len = imgDiv.childNodes.length
        // console.info("imgs:", len)
        if (len > 6){
            imgCheight = "450px"
        }else if (len >= 3){
            imgCheight = "320px"
        }else if (len >= 1){
            imgCheight = "190px"
        }else {
            imgCheight = "80px"
        }
        sendMsg("reinitIframe", imgCheight)
    }else{
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
    img.src = src
    img.id = "img" + i
    img.style.width = "150px"
    img.style.height = "112px"
    if (i%2==0){
        img.style.marginLeft="1px"
    }else{
        img.style.marginRight="1px"
    }
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
        for (let i=1; i<=6 && i <= num; i++){
            if(i > 2){
                imgDiv.style.height = '220px'     
            }else if (i >= 1){
                imgDiv.style.height = '120px'
            }
            let imgSrc = serverip + resObj.data[i-1].imgUrl
            createImg(imgSrc, i)
        }
        if (num >= 5){
            imgDiv.style.height = '350px'
            imgDiv.style.overflow = 'scroll'
        }
        if (num >= 7){
            let img = document.createElement("img")
            img.src = serverip + resObj.data[6].imgUrl
            img.id = "img7"
            img.style.marginRight="1px"
            img.style.width = "150px"
            img.style.height = "112px"
            imgDiv.appendChild(img)
        }
    }
    else{
        imgDiv.style.height = '0px'
    }

    let len = imgDiv.childNodes.length
    if (len){
        sendMsg("reinitIframe", "450px")
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
                // console.info(resObj)
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
    if (itemsToBeLoaded == 0){
        return
    }
    if (imgarrs.length > 7){
        for(let i=7; i< imgarrs.length; i++){
            let imgSrc = serverip + imgarrs[i].imgUrl
            createImg(imgSrc, i+1)
        }
        // imgarrs.length = 0
        itemsToBeLoaded = 0
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
