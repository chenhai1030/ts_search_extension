
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
            var port = chrome.tabs.connect(tabId, {name: 'upload-connect'});
            // port.onMessage.addListener(function(msg){
            //     console.info(msg)
            //     if(msg.message == 'canvas-size'){

            //     }
            // })

            chrome.tabs.captureVisibleTab(null,{},function(dataUrl){
                var img = new Image();
                let Width = this.parent.screen.width
                let Height = this.parent.screen.height
                console.info(Width, Height)
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = Width 
                    canvas.height = Height;
                    var context = canvas.getContext('2d');
                    // Assuming px,py as starting coordinates and hx,hy be the width and the height of the image to be extracted
                    context.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width , canvas.height);
                    let croppedUri = canvas.toDataURL('image/jpeg');
                    console.info(canvas.width, canvas.height)
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
