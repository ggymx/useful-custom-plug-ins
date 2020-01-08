    //原生ajax请求
    function HttpRequest() {
        this.ajax = function (config) {
                // let { type = 'GET',url, data,header={authorization:''},success=()=>{},failure=()=>{}} = config;
                var type, url, data, header, success, failure;
                type = config.type || 'GET';
                url = config.url;
                data = config.data;
                header = config.header || {
                    authorization: ''
                };
                //成功时调用的函数
                success = config.success || function () {};
                //失败时调用的函数
                failure = config.failure || function () {};
                console.log(`请求的方式：${type}，成功回调：${success}，失败回调：${failure}`);
                console.log('传入的header', config.header);
                console.log('接收的header', header);
                var xmlhttp;
                //window.XMLHttpRequest：IE7+, Firefox, Chrome, Opera, Safari
                //window.ActiveXObject：IE6, IE5
                var xmlhttp = window.XMLHttpRequest && new XMLHttpRequest() || window.ActiveXObject && new ActiveXObject();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var res;
                        // document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
                        try {
                            res = JSON.parse(xmlhttp.responseText);
                        } catch (err) {
                            res = xmlhttp.responseText;
                        }
                        success(res);
                    } else {
                        //   var err=JSON.parse(xmlhttp.responseText);
                        //打印错误状态码
                        failure(xmlhttp.status);
                    }
                };
                if (data) {
                    console.log('Authorization-------', header.authorization);
                    //GET方式不支持发送json
                    if (type == 'GET') {
                        xmlhttp.open(type, url + '?' + this.formatParams(data), true);
                        //设置header头必须放在open()后面
                        header.authorization && xmlhttp.setRequestHeader('Authorization', header.authorization);
                        xmlhttp.send();
                    } else if (type == 'POST') {
                        xmlhttp.open(type, url, true);
                        //设置header头必须放在open()后面
                        header.authorization && xmlhttp.setRequestHeader('Authorization', header.authorization);
                        //设置POST发送json数据
                        xmlhttp.setRequestHeader("Content-type", "application/json");
                        xmlhttp.send(JSON.stringify(data));
                    }
                } else {
                    throw new Error('data为空');
                }

            };

            //格式化参数
            this.formatParams = function (data) {
                var arr = [];
                for (var name in data) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
                }
                return arr.join('&');
            };
    }

    var httpRequest = new HttpRequest();