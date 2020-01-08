var createInput;
//设置元素最大长度
var maxLength;
//input的类型：普通，密码框
var type;
//当input为密码框时，暂存输入值的变量
var storage = '';
//用于createInputByH5中每次输入的合法值
var lastInput;
/**
 * 
 * @param {*} config 配置项 包含
 * id：目标元素的id，clsName：绑定的样式，placeHolder：提示文字
 * maxLength 限制输入的字数
 */
function convertToInput(config) {
    config.type = config.type || 'text';
    maxLength = config.maxLength;
    if (config.type === 'password') {
        //如果是密码框直接调用旧的生成规则
        createInputByOld(config.id, config.clsName, config.placeHolder, config.type);
        return;
    }
    //window.applicationCache验证是否支持h5
    window.applicationCache ? createInputByOld(config.id, config.clsName, config.placeHolder, config.type) :
        createInputByOld(config.id, config.clsName, config.placeHolder, config.type);
}

//兼容不支持h5的浏览器
function createInputByOld(id, clsName, placeHolder, inputType) {
    type = inputType;
    createInput = document.getElementById(id);
    bindingStyle(createInput, clsName);
    //设置可以聚焦
    createInput.setAttribute('tabIndex', 0);
    createInput.addEventListener('keydown', setValue);
    createInput.setAttribute('placeholder', placeHolder);
}
//兼容老版浏览器：div赋值
function setValue(event) {
    console.log('创建的input的类型----', type);
    var curEle = event.target;
    //按Del则删除
    if (event.key === 'Delete' || event.key === 'Backspace') {
        if (curEle.innerText.length != 0) {
            var tmp = curEle.innerText.split('');
            tmp.pop();
            curEle.innerText = tmp.join('');
            if (type === 'password') {
                tmp = storage.split('');
                tmp.pop();
                storage = tmp.join('');
            }
            curEle.setAttribute('value', storage ? storage : curEle.innerText);
            return;
        }
        return;
    }
    if (event.key.length != 1 || createInput.innerText.length === maxLength) {
        return;
    }
    if (type === 'password') {
        storage += event.key;
        curEle.innerText += '*';
    } else {
        curEle.innerText += event.key;
    }
    curEle.setAttribute('value', storage ? storage : curEle.innerText);
    console.log('获得value',event.target.getAttribute("value"));
}
//新版浏览器：支持contenteditable
function createInputByH5(id, clsName, placeHolder, inputType) {
    type = inputType;
    createInput = document.getElementById(id);
    bindingStyle(createInput, clsName);
    //contenteditable表示目标元素内容可编辑，可以聚焦
    createInput.setAttribute('contenteditable', true);
    createInput.setAttribute('placeholder', placeHolder);
    createInput.addEventListener('input', limitInput);
}

//新版浏览器：限制用户输入
function limitInput(event) {
    //监听input自动屏蔽Enter键，且修复字数达到最大时的删除bug
    // console.log('按键-------',event);
    var innerHtml = event.target.innerHTML;
    //当键入回车时
    if (innerHtml.indexOf("<div><br></div>") != -1 || innerHtml.indexOf("<div>") != -1 || innerHtml.indexOf("</div>") != -1) {
        //  event.preventDefault();//禁用回车默认事件 不起作用
        //将回车时插入的字符串去掉---弃用
        //  event.target.innerHTML=cutString(innerHtml,"<div>");
        event.target.innerHTML = lastInput;
        setFocus(event.target);
        return;
    }
    event.target.setAttribute('value', event.target.innerText);
    if (event.target.innerText.length >= maxLength) {
        event.target.innerText = event.target.innerText.substring(0, maxLength);
        setFocus(event.target);
        console.log('event.target.innerText', event.target.innerText);
        event.target.setAttribute('value', event.target.innerText);
        // return;
    }
    //记录合法输入值
    lastInput = event.target.innerText;
    console.log('获得val值--------', event.target.getAttribute('value'));
    //新input暂时无法支持password
}

//为目标元素绑定样式
function bindingStyle(ele, className) {
    ele.classList.add(className);
    //获取目标页面的第一个style标签，如果没有则创建一个
    var stylEle = document.getElementsByTagName("style")[0];
    if(!stylEle){stylEle=document.createElement("style");document.head.appendChild(stylEle);};
        var linkLength=document.getElementsByTagName("link").length;
        //在第一个style标签中插入伪类样式（这里是占位符）
        if (document.styleSheets[linkLength-1+1].insertRule) {
            //在style标签中插入具体规则
            document.styleSheets[linkLength-1+1].insertRule('.' + className + ':empty::before {content: attr(placeholder);color: #CCC;}', 0); //非IE的伪类创建方式
        } else {
            document.styleSheets[linkLength-1+1].addRule('.' + className + ':empty::before {content: attr(placeholder);color: #CCC;}', 0); //兼容IE
        }
}

//当输入达到限制时将光标置于文字末端：修复contenteditable的光标乱跳bug
function setFocus(ele) {
    var el = ele;
    // var el=document.getElementById(ele);
    el.focus();
    var browserVersion = getBrowserInfo();
    // console.log('浏览器信息-----', browserVersion);
    if (browserVersion === 6 || browserVersion === 7 || browserVersion === 8) {
        //兼容IE6,7,8
        range = document.selection.createRange();
        this.last = range;
        range.moveToElementText(el);
        range.select();
        document.selection.empty(); //取消选中
    } else {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

//获取浏览器信息
function getBrowserInfo() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            return 7;
        } else if (fIEVersion == 8) {
            return 8;
        } else if (fIEVersion == 9) {
            return 9;
        } else if (fIEVersion == 10) {
            return 10;
        } else {
            return 6; //IE版本<=7
        }
    } else if (isEdge) {
        return 'edge'; //edge
    } else if (isIE11) {
        return 11; //IE11  
    } else {
        return -1; //不是ie浏览器
    }
}

//过滤字符串---弃用
function cutString(value, toFilterStr) {
    val = value.replace(toFilterStr, "");
    if (val.indexOf("<div>") != -1) {
        cutString(val, "<div>");
    }
    if (val.indexOf("</div>") != -1) {
        cutString(val, "</div>");
    }
    if (val.indexOf("<br/>") != -1) {
        cutString(val, "<br/>");
    }
    if (val.indexOf("<br>") != -1) {
        cutString(val, "<br>");
    }
    // console.log('过滤字符串val---',val);
    return val;
}