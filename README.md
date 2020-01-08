## 原生Js封装的实用插件
### keyfocus.js（dom元素光标调转插件）
 使用方式：
 **设置光标逻辑：**
 - 设置键盘keyBoard
   - 一级key是dom元素的id
   - 二级key是上下左右（u,d,l,r）方向，value是dom元素的id
 - 将光标逻辑传入插件
   >keyfocus.setKeyboard(keyBoard);
 - 将开始的默认光标（id）传入插件
   >keyfocus.setDefaultFocusObj('元素id');

示例代码：
 ```code
 keyBoard = {
        'hot': {
            'd': 'c3',
            'r': leftMenuId
        },
        'c3': {
            'u': hotId,
            'l': 'c2',
            'r': 'c4',
            'd': firstProductId
        },
        'c2': {
            'u': hotId,
            'r': 'c3',
            'd': firstProductId
        },
        'c4': {
            'u': hotId,
            'l': 'c3',
            'd': firstProductId
        },
        'jt': {
            'u': hotId
        }
    };
    var defaultFocus = hotId;
    //设置光标键盘  
    keyfocus.setKeyboard(keyBoard);
    //设置初始光标
    keyfocus.setDefaultFocusObj(defaultFocus);
 ```
#### keyfocus下相关的API：
setKeyboard(keyboard)：设置光标逻辑
setDefaultFocusObj(defFocus)：设置默认光标
updateKey(key,value)：修改某个元素的跳转关系（某场景下使用）

 >keyfoucs.updateKey('zh',{'u':'th'});

redirectFocus(target,notAllowRedirect)：重定向光标，将光标重定向到某个元素,notAllowRedirect:不允许重定向的元素

 >keyfoucs.redirectFocus（'zh'）

openDebug(bgColor, opacity)：开启debug模式：当前界面会有个浮框显示当前分辨率，盒子型号，当前光标等信息；bgColor：设置浮框背景色，opacity：设置浮框透明度

>keyfoucs.openDebug()

setGoBackConfig(goBackUrl, pageContext, middleware) ：配置按返回键时返回的页面，goBackUrl：返回页面的url，pageContext：当前页面 middleware：跳转前需要执行的函数（如打印日志等）

>keyfocus.setGoBackConfig([[${userRedis.backUrl}]], [logger]);
------------
#### sTBConfig（获取盒子配置）下相关的API：
sTBConfig.getSTBType() 获取盒子型号，没有则返回null
sTBConfig.bindCssFile(cssURL, ele) 根据盒子型号/分辨率加载相应的样式表；
cssURL：css所在的文件夹，<mark>默认1280分辨率加载该文件夹下的app1280.css，1920分辨率加载app1920.css</mark>
ele：引入样式表的link标签的id

>sTBConfig.bindCssFile("/webpay/css/", $("sc"));

### covertToInput.js（div转input插件）