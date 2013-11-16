var initJar = function(ip){
	var socket = io.connect(ip + ':1339');

	$( body ).on( "volume", function( event, data) {
  	//	socket.emit('volume', { data: data });
	});

	$( body ).on( "volumes", function( event, data) {
  		socket.emit('volumes', { data: data });
	});

	$( body ).on( "beat", function( event, data) {
  	//	socket.emit('beat', { data: data });
	});
};