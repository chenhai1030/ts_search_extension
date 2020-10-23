
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
                            canvas.width = 960
                            canvas.height = 540
                            var context = canvas.getContext('2d');
                            // Assuming px,py as starting coordinates and hx,hy be the width and the height of the image to be extracted
                            context.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width , canvas.height);
                            let croppedUri = canvas.toDataURL('image/jpeg');
                            // You could deal with croppedUri as cropped image src.
                            port.postMessage({message:croppedUri})
                            port.disconnect()
                        };
                        img.src = dataUrl
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

