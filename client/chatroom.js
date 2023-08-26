const sendButton = document.querySelector(".sendButton");
const msgEdit = document.querySelector("#msgEdit");
const messageBox = document.querySelector(".messageBox");
const h1 = document.querySelector("h1");
const account = localStorage.getItem("account");
const specialEvent = document.querySelector(".specialEvent");
const nicknameEdit = document.querySelector("#nicknameEdit");
const determineButton = document.querySelector(".determineButton");
const cancelButton = document.querySelector(".cancelButton");
const promptWindow = document.querySelector(".promptWindow");
let nickname = '';
//点击发送消息
function  sendMessage() {
    const edit = document.getElementById("msgEdit").value;
    if(!edit){
        alert("你还没有输入任何信息！");
    }
    else{
        wsClient.send(`1,${nickname}:  ` + edit);//1：代表正常消息
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
    wsClient.send(`0,${account}`);//0：代表用户加入消息
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
        if(receiveMessage[0] === '-1') {//-1:获取昵称消息
            nickname = receiveMessage[1];
            h1.append(nickname);
            document.querySelector("#nicknameDisplay").textContent = `昵称：${nickname}`;
        }
        else if(receiveMessage[0] === '0') {//0:加入聊天室消息
            para.textContent = receiveMessage[1];
        }
        else if(receiveMessage[0] === '1') {//1:正常聊天消息，服务器接收到才展示出来
            para.textContent = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}]  `  + receiveMessage[1];
        }
        else if(receiveMessage[0] === '2') {//2:昵称修改消息
            para.textContent = receiveMessage[1];
            specialEvent.style.display = "none";
            nickname = receiveMessage[1].split(":")[1];
            h1.textContent = `欢迎来到聊天室，${nickname}`;
            document.querySelector("#nicknameDisplay").textContent = `昵称：${nickname}`;
        }
        messageBox.appendChild(para);
        console.log(receiveMessage);
    }
}
document.querySelector(".promptButton").onclick = ()=>{
    promptWindow.style.display = "none";
}
function popupMessage(message) {
    promptWindow.style.display = "flex";
    document.querySelector(".promptWindow .explain").textContent = message;
}
//编辑昵称事件
nicknameEdit.addEventListener("click",()=>{
    specialEvent.style.display = "flex";
    const eventText = document.querySelector(".eventText");
    eventText.textContent = "请输入你的昵称：";
    const inputText = document.createElement("input");
    eventText.append(inputText);
    determineButton.onclick = ()=>{
        const newNickname = inputText.value;
        if(newNickname) {
            const message = `4,${account}:${newNickname}`;
            wsClient.send(message);
        }
        else {
            popupMessage("昵称不能为空");
        }
    }
});

//执行一些初始化操作
specialEvent.style.display = "none";