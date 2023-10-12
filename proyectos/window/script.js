// Genera un numero aleatorio entre el numero minimo introducido y el maximo
function getRanNum(min, max){
    return Math.trunc(Math.random() * (max-min))+(min);
}

// Crea el elemento del copo de nieve le pone como texto interno
// un emoji de copo de nueve se le da la clase snowflake , 
// y se le da una posicion izquierda , un tamaño de letra y un 
// tiempo de animacion aleatorios, adicionalmente se crea un settimeot
// con un numero de segundos aleatorio entre 2 y 5 segundos para 
// que el elmento sea eliminado
function createSnowFlake(){
    let element = document.createElement("div");

    element.innerText = "❄️";
    element.classList.add("snowflake");
    element.style.left = `${getRanNum(0, 100)}vw`;
    element.style.fontSize = `${getRanNum(5, 40)}px`;
    element.style.animationDuration = `${getRanNum(2, 5)}s`
    

    setTimeout(() => {element.remove()}, getRanNum(2000, 5000))
    return element;
}

// intervalo añade un elemento de copo de nueve al body cada segundo
let interval = setInterval(() =>{
    document.body.appendChild(createSnowFlake())
}, 1000)