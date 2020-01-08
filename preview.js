`use strict`;
(function () {
    //创建放大图片时的遮罩层
    window.onload=function(){
    let shadeString = `<div style="width: 100%;height: 600px;background: black;position: fixed;top: 0;
                        display:none;align-items: center;z-index:99999;" id="shade">
                            <img  src=""  style="width:100%;" id="preview"/>
                        </div>`;
    let body=document.getElementsByTagName('body')[0];
    //将遮罩层插入到body中
    body.innerHTML+=shadeString;
    //加载时定义全局变量
    show = false;
    setEleParameter('shade');
    }
    window.onresize=function() {
        console.log('分辨率改变');
        setEleParameter('shade');
    }
    window.onclick = function (event) {
        //若点击的是按钮则终止预览效果
        console.log('目标类型---',event);
        if(event.target.nodeName==='BUTTON'){
            return;
        }
        sourceImg=getTargetImg(event.target);
        if (!sourceImg) {
            //若图片为空则终止预览效果
            return;
        }
        show ? shade.style.display = "none" : shade.style.display = "flex";
        show = !show;
        let previewEle = my$('preview');
        previewEle.setAttribute('src',sourceImg);
    }
    function getTargetImg(ele){
        let targetSrc=ele.getAttribute('src');
        let targetBgImg=getStyle(ele,'backgroundImage').split('"')[1]; 
        let sourceImg = targetSrc || targetBgImg;
        return sourceImg;
    }
    function getStyle(ele,attr){
        //若内联样式无图片设置则去css中查找
        //getComputedStyle此种方式为只读模式，设置css样式用ele.style.cssText
        /*
        * getComputedStyle：兼容非IE
          currentStyle IE8及其以前   IE11暂时无法兼容
         */
        return ele.style[attr] || window.getComputedStyle(ele)[attr] || ele.currentStyle[attr];
    }
    function setEleParameter(id){
        let shade= my$(id);
        //首次加载时shade为null
        shade && (shade.style.height = document.documentElement.clientHeight + 'px');
    }
    function my$(id){
        return document.getElementById(id);
    }
})();