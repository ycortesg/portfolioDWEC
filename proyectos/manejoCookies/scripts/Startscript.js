let expireDateCookie = new Date()
const submitButton = document.querySelector('#submit')
const nameInput = document.querySelector('#nombre')
const passwordInput = document.querySelector('#contrasena')

// añadimos un mes a la variable de la fecha actual
expireDateCookie.setMonth(expireDateCookie.getMonth() + 1)

// comprueba si los inputs estan vacios
const inputsNotEmpty = () => {
    return [nameInput, passwordInput].every(e=>e.value.replace(" ", "").length!=0);
}

// genera un codigo de 64 digitos aleatorios
const generarCodigoAleatorio = () => {
    const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let codigo = '';
    for (let i = 0; i < 64; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

submitButton.onclick=()=>{
    if (inputsNotEmpty()){

        // creamos la cookie persistente de cesta de la compra y se le pone una fecha de bencimiento
        // para dentro de un mes desde el dia actual
        document.cookie = `cesta_de_la_copra=1234; expires=${expireDateCookie.toDateString()}`;

        // cookie de sesion con el nombre introducido en el input como nombre y su valor 64 digitos aleatorios
        document.cookie = `${nameInput.value}=${generarCodigoAleatorio()}`;

        // cookie de sesion isloggedIn a true
        document.cookie = `isLoggedIn=true`;

        // cambiamos la pagina a la de sesion inicada
        window.location.href='./sesionIn.html';
    }
}
