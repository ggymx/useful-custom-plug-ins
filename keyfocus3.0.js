console.log('启用光标键盘----');
/**
 * KeyFocus 光标跳转系统类
 */
var KeyFocus = function () {
    //上一个光标
    this.lastFoucusObject = null;
    //当前光标
    this.focusObject = null;
    //传入的光标调转关系：Object
    this.monitorKeyboard = null;
    //指定按返回键需要跳转的页面（默认跳转上一级）
    this.goBackUrl = null;
    //需要特殊返回键的页面
    this.goBackPageContext = null;
    //跳转页面时需要执行的方法
    this.middleware = [];
    //设置当某元素在keyboard中不存在或者没配置方向时，自动探测存在元素的方式，默认纵向
    this.guessDirection = 'vertical';
    /**
     *@method 设置默认光标元素
     *@for KeyFocus
     *@param{*} focusObj 默认光标元素的ID
     */
    this.setDefaultFocusObj = function (focusObj) {
        this.focusObject = focusObj;
        console.log('默认光标元素--------', this.focusObject);
        focusObjMapEle = document.getElementById(focusObj);
        if (focusObjMapEle && focusObjMapEle.style.display != 'none' && focusObjMapEle.style.visibility != 'hidden') {
            focusObjMapEle.focus();
        } else {
            var moKeyboardOfKey = Object.keys(this.monitorKeyboard);
            //若默认光标元素不存在或被隐藏时，则自动设置默认光标为光标配置的后一个元素
            var keyboardLength = moKeyboardOfKey.indexOf(focusObj) + 1;
            if (keyboardLength === moKeyboardOfKey.length) {
                return;
            }
            this.setDefaultFocusObj(moKeyboardOfKey[keyboardLength]);
        }
    };
    /**
     *@method 设置光标跳转逻辑
     *@for KeyFocus
     *@param{*} Keyboard 光标跳转逻辑的对象，isHideOutline可聚焦元素是否去除outLine（默认去除）
     */
    this.setKeyboard = function (keyboard, isHideOutline, addTabIndex) {
        //isHideOutline：是否隐藏聚焦元素的outline
        this.monitorKeyboard = keyboard;
        // console.log('传入的键盘-------------', this.monitorKeyboard);
        //未传入该参数或者该参数为true
        if ((isHideOutline === undefined || isHideOutline) || (addTabIndex === undefined || addTabIndex)) {
            for (var foucusItem in this.monitorKeyboard) {
                var focusEle = document.getElementById(foucusItem);
                if (focusEle) {
                    //非IE的解决方式
                    if (isHideOutline === undefined || isHideOutline) {
                        focusEle.style.outline = 'none';
                        //IE的解决方式
                        focusEle.setAttribute("hidefocus", "true");
                        //中兴盒子的解决方式
                        focusEle.style.setProperty('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
                    }
                    (addTabIndex === undefined || addTabIndex) && focusEle.setAttribute('tabindex', 0);
                }
            }
        }
    };
    /**
     *@method 修改某个元素的跳转关系
     *@for KeyFocus
     *@param{*} keyboardOfKey 重定义某元素的跳转逻辑 如('zh',{'u': 'th'})
     */
    this.updateKey = function (key, value) {
        console.log('upddateKey-------------');
        this.monitorKeyboard[key] = value;

    };

    /**
     *@method 重定向当前的光标元素
     *@for KeyFocus
     *@param{*} target 光标重定向到的元素id    notAllowRedirect:不执行重定向操作的元素
     */
    this.redirectFocus = function (target, notAllowRedirect) {
        console.log('重定向光标元素-----', target);
        //修复focusObject指向
        notAllowRedirect = notAllowRedirect || []; //设置默认值
        if (notAllowRedirect.length) {
            for (var i = 0; i < notAllowRedirect.length; i++) {
                if (this.lastFoucusObject === notAllowRedirect[i]) {
                    return;
                }
            }
        }
        this.focusObject = target;
        document.getElementById(target).focus();
    };
    /**
     *@method 按指定方向执行光标跳转
     *@for KeyFocus
     *@param{*} direct 光标跳转的方向 u/d/l/r/-1
     */
    var count = 0; //记录递归次数（检验光标调转是否进行了递归）
    var guessCount = 0; //记录预测可用id的次数
    var sourceEle = null;
    var realCanUseEle = null; //若预测三次还没有找到相应的元素，则回到最初的能用的id
    this.getItemByCode = function (direct) {
        //返回到上一页面
        if (direct === '-1') {
            if (this.goBackUrl) {
                //配置按返回键跳转到指定页面（默认返回上一级）
                goBack(this.goBackUrl, this.middleware);
                return;
            } else {
                goBack();
                return;
            }

        }
        //首先记录第一次跳转时的出发元素，当递归结束仍然没找到下一个要跳转的元素，则默认跳转到出发元素
        if (count === 0) {
            sourceEle = this.focusObject;
        }
        if (this.monitorKeyboard.hasOwnProperty(this.focusObject)) {
            // console.log('预设的光标--------------', this.focusObject);
            if (this.monitorKeyboard[this.focusObject].hasOwnProperty(direct)) {
                this.lastFoucusObject = this.focusObject;
                this.focusObject = this.monitorKeyboard[this.focusObject][direct];
                //本次应获得光标的元素
                var focusObjEle = K(this.focusObject);
                //如果本次应获得光标的元素不存在或者被隐藏
                if (!focusObjEle || focusObjEle.style.display === 'none' || focusObjEle.style.visibility === 'hidden') {
                    count++;
                    //若光标元素不存在，则进行递归
                    this.getItemByCode(direct);
                    //  return;
                }
                if (focusObjEle) {
                    realCanUseEle = this.focusObject;
                    focusObjEle.focus();
                    //找到光标后清空递归计数和出发元素
                    count = 0;
                    sourceEle = null;
                }
            } else {
                /*count等于0说明该元素该方向没有对应的跳转元素，则默认跳转到自己，若不等于0，
                则说明进行了递归且没有找到下一个要跳转的元素，则默认跳转到出发元素*/
                /*
            若某个光标元素某个方向键无明显配置，则默认跳到自己
            （解决盒子h5环境上无某光标元素无默认配置时光标乱跳）
            */
                if (count === 0) {
                    console.log('重定向自己1-------');
                    if (K(this.focusObject)) {
                        realCanUseEle = this.focusObject;
                        this.redirectOwn(this.focusObject);
                    } else {
                        this.redirectOwn(this.lastFoucusObject);
                        this.lastFoucusObject = this.focusObject;
                        realCanUseEle = this.focusObject;
                    }

                } else {
                    console.log('重定向自己2-------', sourceEle);
                    this.redirectOwn(sourceEle);
                    this.focusObject = sourceEle;
                }
            }
        } else {
            //如果光标系统中压根没有配置此元素，或者无任何方向配置,通常出现在根据后端返回数据批量动态设置id的情况
            console.log('测试---------------', this.focusObject.split(''));
            //将a14转变为['a','1','4'];
            var guessCanUserIdStrArr = this.focusObject.split('');
            if (direct == 'd') {
                if (this.guessDirection === 'vertical') {
                    //若根据id类似a04 a14 a24,且a14键盘系统中不存在或无方向，则找a24,否则找a34...
                    guessCanUserIdStrArr[1] = parseInt(guessCanUserIdStrArr[1]) + 1;
                } else {
                    //若根据id类似a04 a14 a24,且a14键盘系统中不存在或无方向，则找a13,否则找a12...
                    guessCanUserIdStrArr[2] = parseInt(guessCanUserIdStrArr[2]) - 1;
                }

            }
            if (direct == 'u') {
                if (this.guessDirection === 'vertical') {
                    guessCanUserIdStrArr[1] = parseInt(guessCanUserIdStrArr[1]) - 1;
                } else {
                    guessCanUserIdStrArr[2] = parseInt(guessCanUserIdStrArr[2]) - 1;
                }

            }
            var guessCanUserId = guessCanUserIdStrArr.join('');
            console.log('猜测可用的id--------------', guessCanUserId);
            this.focusObject = guessCanUserId;
            if (K(guessCanUserId)) {
                //如果预测的id存在的话，则聚焦到此
                realCanUseEle = guessCanUserId;
                //重置相应的计时次数
                count = 0;
                guessCount = 0;
                K(guessCanUserId).focus();

            } else {
                console.log('再一次没找到');
                //最多找三次
                if (guessCount > 5) {
                    console.log('可以使用的id----------', realCanUseEle);
                    K(realCanUseEle).focus();
                    this.focusObject = realCanUseEle;
                    count = 0;
                    return;
                }
                guessCount++;
                this.getItemByCode(direct);
            }
        }
        //若开启调试模式，则实时更新debugString
        if (document.getElementById("debug")) {
            var debugString = getDebugString(this.lastFoucusObject, this.focusObject);
            document.getElementById("debug").innerHTML = debugString;
        }
    };

    /**
     *@method 根据环境添加相应keydown监听
     *@for KeyFocus
     *@param{*} type 执行环境（安卓或h5） key：键盘码：仅对安卓有效
     */
    this.bindKeyAction = function (type, key) {
        if (type === "android") {
            getAndroidDownKey(key);
        } else {
            //添加键盘监听
            window.document.addEventListener("keydown", getH5DownKey);
        }

    };
    /**
     *@method keyFocus的调试模式
     *@for KeyFocus
     *@param{*} bgColor 调试面板的背景色    opacity:调试面板的透明度
     */
    this.openDebug = function (bgColor, opacity) {
        bgColor = bgColor || 'black';
        opacity = opacity || 0.6;
        var body = document.getElementsByTagName("body")[0];
        // body.innerHTML += '<div id="debug" style="background: ' + bgColor + ';opacity: ' + opacity + ';position: fixed;top: 0;' +
        //     'color: #FFF;border-radius: 10px;padding-left:10px;font-size: 20px;">' + getDebugString(this.lastFoucusObject, this.focusObject) +
        //     '</div>';
        body.innerHTML += '<div id="debug" style="background: black;opacity: 0.6;height: 200px;width: 600px;position: fixed;top: 0;' +
            'color: #FFF;border-radius: 10px;padding-left:10px;font-size: 20px;">' + getDebugString(this.lastFoucusObject, this.focusObject) +
            '</div>';
        document.getElementById(this.focusObject).focus();
    };

    //重定向自己
    this.redirectOwn = function (own) {
        document.getElementById(own).blur();
        setTimeout(function () {
            document.getElementById(own).focus();
        }, 1);
    };
    /**
     *@method 返回键配置
     *@for KeyFocus
     *@param{*} goBackUrl：按返回键跳转的页面 pageContext：需要特殊返回键的当前页面,middleware：需要调用的函数
     */
    this.setGoBackConfig = function (goBackUrl, pageContext, middleware) {
        console.log(goBackUrl)
        this.goBackUrl = goBackUrl;
        if (pageContext && !middleware) {
            var tmp = middleware;
            middleware = pageContext;
            pageContext = tmp;
        }
        this.goBackPageContext = pageContext;
        if (Array.isArray(middleware)) {
            this.middleware = middleware;
        } else {
            console.error('err:middleware应该是一个函数数组！');
        }
        console.log('pageContext----------', pageContext);
        console.log('中间件-------', middleware[0]);

    };
    // /**
    //  *@method 设置探测方向
    //  *@for KeyFocus
    //  *@param{*} direction输入方向   仅支持vertical(纵向) horizontal水平
    //  */
    // this.setGuessDir = function (direction) {
    //     if (direction === 'horizontal' || direction === 'vertical') {
    //         this.guessDirection = direction;
    //     }
    // };
};
var keyfocus = new KeyFocus();

/**
 *@method H5环境下keydown触发时的执行逻辑
 *@param{*} evt event对象
 */
function getH5DownKey(evt) {
    var StbType = sTBConfig.getSTBType();
    var evt = evt ? evt : window.event;
    var keyNum = evt.which ? evt.which : evt.keyCode;
    //不屏蔽q21等问题盒子的返回键
    if (keyNum != 8 && (StbType === "Q21_hnylt" || StbType === "TCL_A360")) {
        return;
    }
    var direct = setDirect(keyNum);
    direct && keyfocus.getItemByCode(direct);
}

/**
 *@method 安卓环境下keydown触发时的执行逻辑
 *@param{*} key 键盘码
 */
function getAndroidDownKey(key) {
    var direct = setDirect(key);
    direct && keyfocus.getItemByCode(direct);
}

/**
 *@method 根据键盘码返回相应跳转方向
 *@param{*} keyCode 键盘码
 *@return direct 光标将要跳转的方向
 */
function setDirect(keyCode) {
    var direct;
    switch (keyCode) {
        case 37:
            //left
            direct = "l";
            break;
        case 39:
            //right
            direct = "r";
            break;
        case 38:
            //up
            direct = "u";
            break;
        case 40:
            //down
            direct = "d";
            break;
        case 8:
            //back
            direct = "-1";
            break;
        default:
            return null;
    }
    return direct;
}

/**
 *@method 重定向页面
 *@param{*} url 相应页面的URL
 */
function goBack(url, middleware) {
    console.log("goback:" + url);
    if (url) {
        //先执行插入函数
        for (var i = 0; i < middleware.length; i++) {
            var func = middleware[i];
            console.log('执行中间件方法：', func);
            typeof func === 'function' ? func() : '';
        }
        window.location.href = url;
    } else {
        window.history.back(-1);
    }
}

//重写object的toString()
Object.prototype.toString = function () {
    var objString = "";
    //Object.keys方法返回一个由对象的key组成的数组
    var thisLength = Object.keys(this).length;
    //count：计数
    var objCount = 0;
    for (var key in this) {
        objCount++;
        //对象输出的末尾不加逗号
        objString += (objCount === thisLength) ? (key + ": " + this[key]) : (key + ": " + this[key] + ", ");
    }
    return "{" + objString + "}";
}

/**
 *@method 返回调试模式下调试面板实时更新的串
 *@for KeyFocus
 *@param{*} lastFoucusObject：上一个光标元素 focusObject：预期的当前光标元素
 @return 实时更新的串
 */
function getDebugString(lastFoucusObject, focusObject) {
    var screenWidth = window.screen.width || document.body.scrollWidth;
    //获得本次实际得到光标的元素
    var realGetFocusEle = document.querySelectorAll(":focus")[0];
    return '<h2 style="margin:0">调试模式</h2>' +
        '<p style="margin:0">当前分辨率：' + screenWidth + '</p>' +
        '<p style="margin:0">盒子型号：' + sTBConfig.getSTBType() + '</p>' +
        '<p style="margin:0">上一个光标：' + lastFoucusObject + '</p>' +
        '<p style="margin:0">预期当前光标：' + focusObject + '</p>' +
        '<p style="margin:0">实际当前光标：' + (realGetFocusEle ? realGetFocusEle.getAttribute("id") : focusObject) + '</p>' +
        '<p style="margin:0">当前光标的对应关系：' + (keyfocus.monitorKeyboard[focusObject] ? keyfocus.monitorKeyboard[focusObject].toString() : null) + '</p>';
}

function getStyle(node, styleType) {
    //浏览器中有node.currentStyle方法就用，没有就用另一个
    // return node.currentStyle? node.currentStyle[styleType]: getComputedStyle(node)[styleType]
    return node && (node.currentStyle ? node.currentStyle : getComputedStyle(node));
}

function K(id) {
    return document.getElementById(id);
}

//型号对象
var STBConfig = function () {
    this.StbType = null;
    if (typeof (Authentication) != 'undefined' && Authentication != null) {
        if ('CTCSetConfig' in Authentication) {
            this.StbType = Authentication.CTCGetConfig("STBType");
        } else {
            this.StbType = Authentication.CUGetConfig("STBType");
        }
    }
    //根据分辨率加载相应样式
    this.bindCssFile = function (cssURL, ele) {
        STBType = this.StbType;
        var screenWidth = window.screen.width || document.body.scrollWidth;
        if (STBType === "EC6108V9E_pub_jljlt" || STBType === "EC6108V9I_pub_jljlt" || STBType === "EC6109_pub_jljlt" ||
            STBType === "EC6108V9U_pub_jljlt" || STBType === "EC6108V9A_pub_jljlt" || STBType === "B860A" ||
            STBType === "B860AV2.2" || STBType === "B760EV3" || STBType === "B860AV1.1" || STBType === "B860AV2.2U" ||
            STBType === "GF-WM18A" || STBType === "S65" || STBType === "EC6108V8" || STBType === "Q21A_sdllt" ||
            STBType === "B860AV1.2" || STBType === "B760H" || STBType === "B860AV2.1U") {
            screenWidth = 1280;
        }
        // var sc = $("sc");
        if (screenWidth > 1280) { //获取屏幕的的宽度
            ele.setAttribute("href", cssURL + "app1920.css"); //设置css引入样式表的路径
        } else {
            ele.setAttribute("href", cssURL + "app1280.css");
        }
    };
    //获取盒子型号
    this.getSTBType = function () {
        return this.StbType || null;
    };
};
var sTBConfig = new STBConfig();

//根据后台数据动态创建数据的keyboard
var BatchCreateKey = function () {
    //动态创建数据的keyboard
    this.secondObj = {};
    // console.log('keysArr-------------',secondMap[Object.keys(secondMap)[0]]);
    //得到根据后台数据动态创建的keyboard,upTarget(首列的上方向配置),downTarget（末列的下方向配置）
    this.getDynamicKdByMap = function (backEndData, upTarget, downTarget) {
        var secondMap = backEndData;
        // //定义传入的数据的外层循环的数组
        // var oneLoop=null;
        if (typeof secondMap === 'object') {
            //object的格式类似于:{'a':[],'b':[],...}
            console.log('传入的二维数组的类型---对象');
            for (var i1 = 0; i1 < Object.keys(secondMap).length; i1++) {
                var curItem = secondMap[Object.keys(secondMap)[i1]];
                for (var i2 = 0; i2 < curItem.length; i2++) {
                    curItemKey = ('a' + i1) + i2;
                    //初始化二级菜单的key
                    this.secondObj[curItemKey] = {};
                    //如果为首元素且不止一个元素
                    if (i2 == 0) {
                        //最左边的元素只有右方向有元素
                        if (i2 < curItem.length - 1) {
                            this.secondObj[curItemKey]['r'] = ('a' + i1) + (i2 + 1);
                        }
                    } else if (i2 == curItem.length - 1) {
                        //最右边的元素只有左方向有元素
                        if (curItem.length > 1) {
                            this.secondObj[curItemKey]['l'] = ('a' + i1) + (i2 - 1);
                        };
                    } else {
                        //中间元素
                        this.secondObj[curItemKey]['l'] = ('a' + i1) + (i2 - 1);
                        this.secondObj[curItemKey]['r'] = ('a' + i1) + (i2 + 1);
                    }

                    if (i1 == 0) {
                        //第一行
                        if (upTarget) {
                            console.log('传入了上方向配置---------');
                            this.secondObj[curItemKey]['u'] = upTarget;
                        }
                        this.secondObj[curItemKey]['d'] = 'a' + (i1 + 1) + i2;
                    } else if (i1 == Object.keys(secondMap).length - 1) {
                        //最后一行
                        if (downTarget) {
                            this.secondObj[curItemKey]['d'] = downTarget;
                        }
                        this.secondObj[curItemKey]['u'] = 'a' + (i1 - 1) + i2;
                    } else {
                        //中间行
                        this.secondObj[curItemKey]['u'] = 'a' + (i1 - 1) + i2;
                        this.secondObj[curItemKey]['d'] = 'a' + (i1 + 1) + i2;
                    }
                }
            }
        } else if (Array.isArray(secondMap)) {
            //object的格式类似于:[[],[],...]
            for (var i1 = 0; i1 < secondMap.length; i1++) {
                var curItem = secondMap[i1];
                for (var i2 = 0; i2 < curItem.length; i2++) {
                    curItemKey = ('a' + i1) + i2;
                    //初始化二级菜单的key
                    this.secondObj[curItemKey] = {};
                    //如果为首元素且不止一个元素
                    if (i2 == 0) {
                        //最左边的元素只有右方向有元素
                        if (i2 < curItem.length - 1) {
                            this.secondObj[curItemKey]['r'] = ('a' + i1) + (i2 + 1);
                        }
                    } else if (i2 == curItem.length - 1) {
                        //最右边的元素只有左方向有元素
                        if (curItem.length > 1) {
                            this.secondObj[curItemKey]['l'] = ('a' + i1) + (i2 - 1);
                        };
                    } else {
                        //中间元素
                        this.secondObj[curItemKey]['l'] = ('a' + i1) + (i2 - 1);
                        this.secondObj[curItemKey]['r'] = ('a' + i1) + (i2 + 1);
                    }

                    if (i1 == 0) {
                        //第一行
                        if (upTarget) {
                            console.log('传入了上方向配置---------');
                            this.secondObj[curItemKey]['u'] = upTarget;
                        }
                        this.secondObj[curItemKey]['d'] = 'a' + (i1 + 1) + i2;
                    } else if (i1 == secondMap.length - 1) {
                        //最后一行
                        if (downTarget) {
                            this.secondObj[curItemKey]['d'] = downTarget;
                        }
                        this.secondObj[curItemKey]['u'] = 'a' + (i1 - 1) + i2;
                    } else {
                        //中间行
                        this.secondObj[curItemKey]['u'] = 'a' + (i1 - 1) + i2;
                        this.secondObj[curItemKey]['d'] = 'a' + (i1 + 1) + i2;
                    }
                }
            }
        }
        return this.secondObj;
    }
    //一维数组动态数据绑定
    /**
     *@method 根据后台数据动态创建数据的keyboard
     *@for BatchCreateKey
     *@param{*} backEndData传入的后端一维数组 separation：每行的数据个数（number）
     @return 实时更新的串
     */
    this.getDynamicKdByList = function (backEndData, uptarget, separation) {
        for (var i = 0; i < backEndData.length; i++) {
            var curItemKey = 'a' + i;
            this.secondObj[curItemKey] = {
                'u': 'a' + (i - separation),
                'd': 'a' + (i + separation),
                'l': 'a' + (i - 1),
                'r': 'a' + (i + 1)
            }
            if (separation && typeof separation == 'number') {
                //判断是否是第一行
                if (i < separation && uptarget) {
                    this.secondObj[curItemKey]['u'] = uptarget;
                }
            }
        }
        return this.secondObj;
    }

}
var batchCreateKey = new BatchCreateKey();

//h5环境下调用h5键盘监听
window ? keyfocus.bindKeyAction("H5", "") : keyfocus.bindKeyAction("android", "key");