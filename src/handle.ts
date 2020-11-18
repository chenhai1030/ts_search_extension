export function popButtonMouseUp(e){
    let str = e.target.className
    if (str.indexOf("minPen")!= -1){
        this.children[0].style.backgroundColor = "white";
        this.children[1].style.backgroundColor = "";
        this.children[2].style.backgroundColor = "";
    }else if (str.indexOf("midPen")!= -1){
        this.children[0].style.backgroundColor = "";
        this.children[1].style.backgroundColor = "white";
        this.children[2].style.backgroundColor = "";
    }else if (str.indexOf("maxPen")!= -1){
        this.children[0].style.backgroundColor = "";
        this.children[1].style.backgroundColor = "";
        this.children[2].style.backgroundColor = "white";
    }
    // color
    else if (str.indexOf("redPen")!= -1){
        this.children[0].style.border="1px solid white";   
        this.children[1].style.border="";   
        this.children[2].style.border="";   
        this.children[3].style.border="";   
        this.children[4].style.border="";   
        this.children[5].style.border="";   
    }else if (str.indexOf("bluePen")!= -1){
        this.children[0].style.border="";   
        this.children[1].style.border="1px solid white";   
        this.children[2].style.border="";   
        this.children[3].style.border="";   
        this.children[4].style.border="";   
        this.children[5].style.border="";   
    }else if (str.indexOf("greenPen")!= -1){
        this.children[0].style.border="";   
        this.children[1].style.border="";   
        this.children[2].style.border="1px solid white";   
        this.children[3].style.border="";   
        this.children[4].style.border="";   
        this.children[5].style.border="";   
    }else if (str.indexOf("yellowPen")!= -1){
        this.children[0].style.border="";   
        this.children[1].style.border="";   
        this.children[2].style.border="";   
        this.children[3].style.border="1px solid white";   
        this.children[4].style.border="";   
        this.children[5].style.border="";   
    }else if (str.indexOf("grayPen")!= -1){
        this.children[0].style.border="";   
        this.children[1].style.border="";   
        this.children[2].style.border="";   
        this.children[3].style.border="";   
        this.children[4].style.border="1px solid white";   
        this.children[5].style.border="";   
    }else if (str.indexOf("whitePen")!= -1){
        this.children[0].style.border="";   
        this.children[1].style.border="";   
        this.children[2].style.border="";   
        this.children[3].style.border="";   
        this.children[4].style.border="";   
        this.children[5].style.border="1px solid white";   
    }
}

export  function groupBindEvent(id, listener){
    let list = document.getElementById(id);
    for (let i=0;i< list.children.length; i++){
        (<HTMLDivElement>list.children.item(i)).onmouseup = listener;
    }
}

export  function groupUnBindEvent(id: string){
    let list = document.getElementById(id);
    for (let i=0;i< list.children.length; i++){
        (<HTMLDivElement>list.children.item(i)).onmouseup = undefined;
    }
}
