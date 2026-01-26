const authsection=document.getElementById("authsection");
const appsection=document.getElementById("appsection");
const loginbtn=document.getElementById("loginbtn");
const registerbtn=document.getElementById("registerbtn");
const logoutbtn=document.getElementById("logoutbtn");
const searchmovies=document.getElementById("searchmovies")
const moviestatus=document.getElementById("moviestatus");
const searchbtn=document.getElementById("searchbtn");
const watchedlist=document.getElementById("watchedlist");
const watchinglist=document.getElementById("watchinglist");
const wishlistlist=document.getElementById("wishlistlist");


loginbtn.addEventListener("click",function(){
    authsection.style.display = "none";
    appsection.style.display = "block";
    console.log("login clicked");

})
registerbtn.addEventListener("click",function(){
    authsection.style.display = "none";
        appsection.style.display = "block";
        console.log("register clicked");

})
logoutbtn.addEventListener("click",function(){
     appsection.style.display = "none";
       authsection.style.display = "block";
})
searchbtn.addEventListener("click",function(){
    const moviename = searchmovies.value;

    console.log(moviename);
console.log(moviestatus.value);


    console.log("search");
})