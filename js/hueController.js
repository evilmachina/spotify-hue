var inited = false;
var lastColor;
var initHue = function(ip){
	var key = '6bf81c89dbaf4927204d2d9752f5e317';
	window.hue.setIpAndApiKey(ip, key);
	window.hue.setNumberOfLamps(4);
	window.hue.setTransitionTime(0);
	console.log("connected");
	if(inited) return;

	$(body).on( "beat", function( event, data) {
		var rgb = data.rgb;
		var hexcolor = decimalToHex(rgb[0]) + decimalToHex(rgb[1]) + decimalToHex(rgb[2]);
		//console.log(hexcolor);
		if(hexcolor === lastColor) return;
		lastColor = hexcolor;
		var pp = window.hue.setColor(2, hexcolor);//, function(response){console.log(response);});
		//var pp = window.hue.setAllColors( hexcolor, function(response){console.log(response);});
	});

	inited = true;

	
}

function decimalToHex(d) {
    var hex = d.toString(16);
    var padding = 2;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

