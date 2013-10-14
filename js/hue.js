var hue = function($){
	var baseUrl,
		bridgeIP,
		baseApiUrl,
		apiKey,

	buildState = function(rgb){
		var hsv = rgb2hsv(rgb);

		return {hue:hsv.h, sat:hsv.s, bri:hsv.v };

	},

	_updateURLs = function() {
            baseUrl = 'http://' + bridgeIP + '/api';
            baseApiUrl = baseUrl + '/' + apiKey;
   	},

    _setIpAndApiKey = function(ip, key) {
        apiKey = key;
        bridgeIP = ip;
        _updateURLs();
    },
    _sendStatus = function(data, url){
    	var test = function(responce){console.log(responce)};
    	var options = {
                type: 'PUT',
                url: url,
                //success: test,
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data)
        };
        $.ajax(options);
    },
    _setColor =  function(id, rgb, transactionTime) {
    	var state = buildState(rgb);
    		state.transitiontime = transactionTime;
    		//console.log(state);
    	var url = baseApiUrl + '/lights/' + id + '/state';
    	_sendStatus(state, url);
    };



    return 	{setIpAndApiKey: _setIpAndApiKey,
    		 setColor:_setColor
    		};

};


window.hue = hue(window.jQuery);