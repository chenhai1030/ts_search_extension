
'use strict';
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
