/**
 * New node file
 */
var http 		= require("http")
	,fs 		= require("fs")
	,sockeio	= require("socket.io");

//웹서버를 만듭니다.
var server  = http.createServer(function(request, response) {
	//htmlPage.html 파일을 읽습니다.
	fs.readFile("mobile.html", function(err, data) {
		response.writeHead(200, {"Content-Type":"text/html"});
		response.end(data);
	})
}).listen(52273,function(){
	console.log("Server running at http://127.0.0.1:52273");
});

//소켓 서버를 만듭니다.
var io	= sockeio.listen(server);
io.sockets.on("connection",function(socket){
	console.log("사용자가 접근하였습니다.");

	//message
	socket.on("message",function(data){								//이벤트를 연결시킵니다.
		io.sockets.emit("message", data);							//클라이언트의 message 이벤트를 발생시킵니다.
	});
});

