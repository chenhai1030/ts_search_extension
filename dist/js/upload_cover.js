!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=6)}({0:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.serverip="http://172.17.5.90/",t.default=function(e){if((e=e||{}).type=(e.type||"GET").toUpperCase(),e.dataType=e.dataType||"json","POST"==e.type)var t=function(e){var t=[];for(var n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return t.join("&")}(e.data);if(window.XMLHttpRequest)var n=new XMLHttpRequest;n.onreadystatechange=function(){if(4==n.readyState){var t=n.status;t>=200&&t<300?e.success&&e.success(n.responseText,n.responseXML):e.fail&&e.fail(t)}},"GET"==e.type?(n.open("GET",e.url+"?q="+e.data,!0),n.send(null)):"POST"==e.type&&(n.open("POST",e.url,!0),n.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),n.send(t))}},6:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const o=n(0);!function(){let e=document.getElementById("FuntvGalleryCliper");if(!e){e=document.createElement("iframe"),e.id="FuntvGalleryCliper",e.src=chrome.extension.getURL("clipper.html");let t="left: auto; right: 0px; top: 0px; bottom: auto; border: none;display: block;margin: 0px; max-height: none; max-width: none; min-height: 0px; min-width: 0px;overflow: hidden; padding: 0px; position: fixed; transition: initial; z-index: 2147483647;width: 100%; height: 100%;";e.style.cssText=t,document.documentElement.appendChild(e)}let t=document.getElementsByTagName("iframe");for(let e=0;e<t.length;e++){if("/admin/refine_task"==t[e].dataset.src)var n=document.getElementsByTagName("iframe")[e];if("FuntvGalleryCliper"==t[e].id)document.getElementsByTagName("iframe")[e]}let r=n.contentWindow.document.getElementsByClassName("img-still mod-editpic"),i=r[0].childNodes[2],a=r[0].attributes[6].nodeValue;n.contentWindow.document.getElementsByClassName("videobox")[0].childNodes[3].pause();var u={x:Number,y:Number,width:Number,height:Number};let l;window.addEventListener("message",(function(t){const n=t.data;switch(n.cmd){case"CLIP":u.x=n.x,u.y=n.y,u.width=n.width,u.height=n.height,chrome.runtime.sendMessage({msg:u},(function(t){document.documentElement.removeChild(e)}));break;case"empty":if(e)return void document.documentElement.removeChild(e)}}),!1),chrome.runtime.onMessage.addListener((function e(t,n,r){if("upload-connect"==t.cmd){let n=t.message;if(n==l)return void console.info("same");l=n;let r={filetype:"jpeg",image:n.substring(n.lastIndexOf(",")+1)};o.default({type:"POST",url:"/ajaxa/post/upload_pic",data:r,success:function(t){l=null;var n=null;try{n=JSON.parse(t)}catch(e){}let r={id:a,still:n.data.url};console.info(r),o.default({type:"POST",url:"/ajaxa/post/save_still",data:r,success:function(t){chrome.runtime.onMessage.removeListener(e)}}),i.src=n.data.url}})}}))}()}});