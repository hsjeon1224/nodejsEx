/**
 * New node file
 */
/**
 * New node file
 */
var http 		= require("http")
	,fs 		= require("fs")
	,sockeio	= require("socket.io");

//현재 클라이언트의
var    socketRoom    =    {};
//웹서버를 만듭니다.
var server  = http.createServer(function(request, response) {
	//htmlPage.html 파일을 읽습니다.
	fs.readFile("mobile2.html", function(err, data) {
		response.writeHead(200, {"Content-Type":"text/html"});
		response.end(data);
	})
}).listen(52273,function(){
	console.log("Server running at http://127.0.0.1:52273");
});

//소켓 서버를 만듭니다.
var io	= sockeio.listen(server);
io.set("log level", 2);
io.sockets.on("connection",function(socket){
	console.log("사용자가 접근하였습니다.");

	//클라이언트 - > 서버 방목록 조회 요청
	socket.on("requestRandomChat",function(data){
		var    rooms    =    io.sockets.manager.rooms;

		//혼자인 방을 조회후 매치
		for(var key in rooms) {

			console.log("key : " +key);
			if(key == '') {
                continue;
            }

			//this 방에 인원 숫 체크
			if(rooms[key].length  == 1) {
				var    roomKey    =    key.replace('/', '');
				socket.join(roomKey);
				io.sockets.to(roomKey).emit("completeMatch",{});
				socketRoom[socket.id]    =    roomKey;
				return;
			}
        }//for end

		//빈방이 없을 경우
		socket.join(socket.id);
		socketRoom[socket.id]    =    roomKey;

	});
	// end 클라이언트 - > 서버 방목록 조회 요청

	//클라이언트 -> 서버 취소 요청
	socket.on("cancelRequestRandomChat", function() {
		socket.leave(socketRoom[socket.id]);		//방나가기
	});
	//end 클라이언트 -> 서버 취소 요청

	//클라이언트 -> 서버 Message 요청
	socket.on("sendMessage", function(data) {
	    io.sockets.to(socketRoom[socket.id]).emit("receiveMessage",data);
	});
	//end 클라이언트 -> 서버 Message 요청

	//클라이언트 -> 서버 연결해제 요청시
	socket.on("disconnectClienth", function(data) {
	    var roomKey    =    socketRoom[socket.id];
	    socket.leave(roomKey);						   			//방나가기
	    io.sockets.to(roomKey).emit("disconnectClienth")		//서버 -> 클라이언트 disconnect 이벤트 요청
	    var clients    =    io.sockets.clients(roomKey)			//현재 룸에 있는 클라언트들의 목록 조회
	    for (var i = 0; i < clients.length; i++) {				//현재 방에 있는 모든 클라이언트를 방에서 나가게 한다.
	    	clients[i].leave(roomKey);
		}
	});
	//end 클라이언트 -> 서버 연결해제 요청시


});

