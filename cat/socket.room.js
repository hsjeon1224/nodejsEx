/**
 * New node file
 *
 */

//    a
//서버를 생성합니다.
var    server    =    require("http").createServer();
var	   io		 =	  require("socket.io").listen(server);
var    fs    	 =    require("fs")

//서버를 실행합니다.
server.listen(52273, function(){
	console.log("Server Running at http://127.0.0.1:52273");
});

//웹 서버 이벤트를 연결합니다.
server.on("request", function(request, response) {
	//sockethtml 페이지를 읽습니다.
	fs.readFile("sockethtml.html", function(err, data) {
	    response.writeHead(200, {"Content-Type":"text/html"});
	    response.end(data);
	});
});

//소켓 서버 이벤트를 연결합니다.
io.sockets.on("connection", function(socket) {

	//join이벤트
	socket.on("join", function(data) {
	    socket.join(data);								//클라이언트를 방에 접속하게 한다.
	    console.log("1")
	    socket.set('room', data);						//클라이언트에 방번호를 부여한다.
	});

	//message 이벤트
	socket.on("message", function(data) {
	    socket.get("room", function(error, room) {
	    	io.sockets.in(room).emit("message", data);
	    });
	});
});