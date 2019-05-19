function trav(o, t, f) {
	var r = "";
	if ("object" === typeof o) {
		var p = o.par;
		var n = o.not;

		if (o.type === "bin") {
			r =  trav(o.left, t) + " " + o.operator + " " + trav(o.right, t);
		} else if (o.type === "log") {
			if(p) { // format logical operators eclosed in brackets
				tt = t + "\t";
				r = "(\n";
				r += tt + trav(o.left, tt, true);
				r += "\n" + tt + o.operator + " " + trav(o.right, tt, true);
				r += "\n" + t + ")";
				p = false;
			} else {
				if(f) {
					r = trav(o.left, t, true);
					r += "\n" + t + o.operator + " " + trav(o.right, t, true);
				} else {
					r = trav(o.left, t) + " " + o.operator + " " + trav(o.right, t);
				}
			}
		} else if (o.type === "func") {
			var f = o.arguments.length > 2; // split params when more then 2
			var s = (f ? "\n" + t : "");
			var st = (f ? s + "\t" : "");
			r = o.name + "(";
			for (var i in o.arguments) {
				r += st + trav(o.arguments[i], t + "\t") + (i < o.arguments.length - 1 ? ", " : "");
			}
			r += s + ")";
		} else if (o.type === "field") {
			r = "[" + o.field + "]";
		} else if (o.type === "param") {
			r =  "[&" + o.param + "]";
		} else if (o.type === "num") {
			r =  o.value;
		} else if (o.type === "str") {
			r = o.quote + o.value +o.quote;
		}

		if (p) {
			r = "(" + r + ")";
		}
		if (n) {
			r = "NOT " + r;
		}

	} else {
		r = o.toString();
	}
    return r;
}

$(document).ready(function(){
	$("#ExpParser").on("click", function() {
		var s = $("#ExpParserInput").val();
		console.log(s);
		if (s) {
			try {
				var o = SiebelQueryLang.parse(s);
				s = trav(o.expression, "");
			} catch(e) {
				s = e.toString();
			}
		} else {
			s = "Please, insert a Siebel expression first";
		}
		$("#ExpParserOutput").val(s);
	}).click();
})
