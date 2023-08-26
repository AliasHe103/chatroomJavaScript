const clientName = localStorage.getItem("name")
const sendButton = document.querySelector(".sendButton");
const msgEdit = document.querySelector("#msgEdit");
const messageBox = document.querySelector(".messageBox");
const h1 = document.querySelector("h1");
h1.append(clientName);
//点击发送消息
function  sendMessage() {
    const edit = document.getElementById("msgEdit").value;
    if(!edit){
        alert("你还没有输入任何信息！");
    }
    else{
        wsClient.send(`1,${clientName}:  ` + edit);//1：代表正常消息
        msgEdit.value = "";
    }
}
sendButton.addEventListener("click",sendMessage);
//将回车键与点击发送按钮绑定
msgEdit.addEventListener("keyup",function(event) {
    if(event.keyCode === 13){
        sendMessage();
    }
});
//通过WebSocket与服务端连接
const wsClient = new WebSocket("ws://localhost:3300");
wsClient.onopen = function () {
    console.log("open websocket......");
    wsClient.send("0," + `${clientName}`);//0：代表用户加入消息
}
wsClient.onclose = function () {
    console.log("close websocket......");
}
wsClient.onmessage = function (msg) {
    if(msg) {//如果接受到了信息，就把它展示在聊天窗
        const time = new Date();
        const para = document.createElement("p");
        console.log(msg.data);
        const receiveMessage = msg.data.split(",");
        if(receiveMessage[0] === '0') {
            para.textContent = receiveMessage[1];
        }
        else if(receiveMessage[0] === '1') {
            para.textContent = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}  `  + receiveMessage[1];
        }
        messageBox.appendChild(para);
        console.log(receiveMessage);
    }
}



