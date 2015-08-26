/**
 * New node file
 */
var http 		= require("http")
	,fs 		= require("fs")
	,sockeio	= require("socket.io");

/**
 * 서버를 생성합니다.
 */
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
	socket.on("requestRandomMatch",function(data){
		var    rooms    =    io.sockets.manager.rooms;

		//혼자인 방을 조회후 매치
		for(var key in rooms) {

			if(key == '') {
                continue;
            }

			//this 방에 인원 숫 체크
			if(rooms[key].length  == 1) {

				var    roomKey    =    key.replace('/', '');

				socket.join(roomKey);										//클라이언를 roomKey 방에 입장시킨다.
				socket.set("roomKey", roomKey)								//클라이언트의 소켓에 roomKey를 저장한다.

				console.log(socket.id+"|유저를 "+roomKey+"방에 입장시킨다.");

				io.sockets.to(roomKey).emit("responseRandomMatch",{});			//서버 -> 클라언트 채팅상대가 매치작업완료 이벤트

				return;
			}
        }//for end

		//빈방이 없을 경우
		console.log(socket.id+"|유저를 "+socket.id+"방에 입장시킨다.");
		socket.join(socket.id);
		socket.set("roomKey", socket.id);

	});
	// end 클라이언트 - > 서버 방목록 조회 요청

	//클라이언트 -> 서버 취소 요청
	socket.on("requestWaitCancel", function() {
		socket.get("roomKey", function(error, roomKey) {
			socket.leave(roomKey);		//방나가기
		});
	});
	//end 클라이언트 -> 서버 취소 요청

	//클라이언트 -> 서버 Message 요청
	socket.on("requestSendMessage", function(data) {
		socket.get("roomKey", function(error,roomKey) {
			io.sockets.to(roomKey).emit("responseReceiveMessage",data);
		});
	});
	//end 클라이언트 -> 서버 Message 요청

	//클라이언트 -> 서버 연결해제 요청시
	socket.on("requestDisconnectClient", function(data) {
		socket.get("roomKey", function(error, roomKey) {
			var clients    =    io.sockets.clients(roomKey);
			io.sockets.to(roomKey).emit("responseDisconnectClient")		//현재의 클라이언트가 있던 방에 다른 사람들도 방에서 나간다.
	        for (var i = 0; i < clients.length; i++){
	            clients[i].leave(roomKey);
	        }
		});
	});
	//end 클라이언트 -> 서버 연결해제 요청시


	//클라이언트 - > 서버 방목록 조회 요청
	socket.on("requestRandomChatList",function(data) {
		var    rooms    =    io.sockets.manager.rooms;

		//혼자인 방을 조회후 매치
		for(var key in rooms) {

			if (key == '') {
                continue;
            }

			console.log("");
			console.log("-------------Start---------");
			console.log("rooms[key]:"+rooms[key]);
			console.log("key:"+key);
			console.log("rooms[key].length:"+rooms[key].length);
			console.log("-------------END---------");
			console.log("");
        }//for end
	});
});

