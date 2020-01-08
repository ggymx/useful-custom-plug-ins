
var Cookie=new function(){ 
	this.add = function(name, value) {
		var expireDays = 10;
		var expire = new Date();
		expire.setTime(expire.getTime() + expireDays * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires="
				+ expire.toGMTString();
	};

	this.get = function(name) {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

		if (arr = document.cookie.match(reg)) {
			return unescape(arr[2]);
		} else {
			return null;
		}
	};

	this.remove = function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if (cval != null) {
			document.cookie = name + "=" + cval + ";expires="
					+ exp.toGMTString();
		}
	}
} 