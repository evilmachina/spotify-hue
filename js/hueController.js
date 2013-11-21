var inited = false;
var lastColor;
var lastcall = new Date().getTime();


var initHue = function(ip){
	var key = '6bf81c89dbaf4927204d2d9752f5e317';
	window.hue.setIpAndApiKey(ip, key);
	//window.hue.setNumberOfLamps(4);
	//window.hue.setTransitionTime(0);
	console.log("connected");
	var switc = true;
	if(inited) return;

	var lastRgb = [0,0,0];
	var lastPercentage = 0;
	$(body).on( "beat", function( event, data) {
		
		var diff = data.percentage - lastPercentage;

		//if(lastRgb.compare(data.rgb) && diff < -10){  return;}
		lastRgb = data.rgb;
		lastPercentage = data.percentage;
		var transactionTime = diff > 10 ? 0 : 4;
		
		//window.hue.setTransitionTime(transactionTime);
		var rgb = data.rgb;
		var level = data.percentage / 100;
		var rgb = [ Math.round(rgb[0] * level),
					Math.round(rgb[1] * level),
					Math.round(rgb[2] * level)];
		//var hexcolor = decimalToHex(r) + decimalToHex(g) + decimalToHex(b);
		//console.log(hexcolor);
		//if(hexcolor === lastColor) return;
		var curentTime = new Date().getTime();
		//if(curentTime < lastcall + 10) return;
		lastcall = curentTime;
		//console.log(hexcolor);
		//window.hue.setColor(1, hexcolor);//, function(response){console.log(response);});
		//switc ? window.hue.setColor(2, rgb, transactionTime) : window.hue.setColor(4, rgb, transactionTime); //, function(response){window.hue.setColor(4, hexcolor);});
		//window.hue.setColor(3, hexcolor);//, function(response){console.log(response);});
		//window.hue.setColor(4, hexcolor);//, function(response){console.log(response);});
		//window.hue.setAllColors( hexcolor);//, function(response){console.log(response);});
		window.hue.setColor(4, rgb, transactionTime);
		switc = !switc;
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


Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

