const submitButton = document.querySelector(".button");
const name = document.querySelector("#name");
const password = document.querySelector("#password");
submitButton.addEventListener("click",()=>{
    localStorage.setItem("name",name.value);
    localStorage.setItem("password",password.value);
    window.location.href = "chatroom.html";
    return false;
});
