const loginButton = document.querySelector(".login");//”登录“按键
const registerButton = document.querySelector(".register");//“注册”按键
//登录界面的账号和密码
const account = document.querySelector("#account");
const password = document.querySelector("#password");
//注册界面的账号，以及前后两次输入的密码
const accountRegister = document.querySelector("#accountRegister");
const password1 = document.querySelector("#passwordRegister1");
const password2 = document.querySelector("#passwordRegister2");

const mainWindow = document.querySelector("form.mainWindow");//登录界面
const registerWindow = document.querySelector(".registerWindow");//注册界面
const closePopup = document.querySelector("#close-popup");//注册关闭按键
const promptWindow = document.querySelector(".promptWindow");//消息弹窗
const explainText = document.querySelector("#promptText .explain");//弹窗文本
//通过WebSocket与服务端连接，发送注册消息
const wsClient = new WebSocket("ws://localhost:3300");

let receiveMessage = '';
wsClient.onopen = function () {
    console.log("open websocket......");
}
wsClient.onclose = function () {
    console.log("close websocket......");
}
wsClient.onmessage = function (msg) {
    receiveMessage = msg.data;
    console.log(receiveMessage);
    receiveMessage = receiveMessage.split(",");
    if(receiveMessage[0] === "0"){//收到服务端消息，0代表注册类
        setStatusText(receiveMessage[1]);
        if(receiveMessage[1].includes("注册成功")){
            registerWindow.style.display = "none";
            mainWindow.style.display = "flex";
            accountRegister.value = password1.value = password2.value = "";
        }
    }
    else if(receiveMessage[0] === "1"){//收到服务端消息，1代表登录类
        setStatusText(receiveMessage[1]);
        if(receiveMessage[1].includes("登录成功")){
            localStorage.setItem("account",account.value);
            localStorage.setItem("password",password.value);
            window.location.href = "chatroom.html";
        }
    }
}
function setStatusText (receiveMessage) {//控制消息弹窗
    promptWindow.style.display = "flex";
    explainText.textContent = receiveMessage;
    console.log(receiveMessage);
}
registerButton.addEventListener("click",()=>{
    registerWindow.style.display = "block";
    mainWindow.style.display = "none";
    document.body.style.overflow = "hidden";
});
closePopup.addEventListener("click",()=>{
    registerWindow.style.display= "none";
    mainWindow.style.display = "flex";
    document.body.style.overflow = "auto";
});
document.querySelector(".promptButton").onclick = function () {
    promptWindow.style.display = "none";
}
document.querySelector(".registerSubmit").onclick = function () {
    if(password1.value === "") {
        promptWindow.style.display = "flex";
        explainText.textContent = "还没有输入密码！";
        return ;
    }
    if(password1.value === password2.value) {
        const message = `2,${accountRegister.value},${password1.value}`;//2：代表注册请求
        wsClient.send(message);
    }
    else{
        setStatusText("两次输入的密码不相同！");
    }
}
loginButton.addEventListener("click",()=>{
    wsClient.send(`3,${account.value},${password.value}`);//3：代表用户发送登录请求
});



