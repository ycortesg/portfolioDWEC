const btnCloseSession = document.querySelector('#close-sesion');

// ponemos el valor de la cookie de sesion isloggedIn a false y nos movemos al index.html
btnCloseSession.onclick = () => {
    document.cookie = `isLoggedIn=false`;
    window.location.href='./index.html';
}