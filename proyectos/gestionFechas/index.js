
// La variable fecha actual puede ser cambiada para hacer todos los tests necesarios

// let fechaActual = new Date(2023, 11, 16, 4, 59, 48);
let fechaActual = new Date();

// declarar año de la fecha actual y fecha de cumpleaños
let anioActual = fechaActual.getFullYear();
const fechaCumpleaños = new Date(anioActual, 11, 16, 5);

// en caso de que la fecha actual sea mayor a la del cumpleaños
// el año de la fecha de cumpleaños es aumentado por uno
// para prevenir fallos
fechaCumpleaños.setFullYear(fechaActual<fechaCumpleaños ? anioActual: anioActual+1)

// seleccionar los containers del día, hora, minuto y segundo.
const containerDias = document.querySelector("#dias");
const containerHoras = document.querySelector("#horas");
const containerMinutos = document.querySelector("#minutos");
const containerSegundos = document.querySelector("#segundos");

// crear el mensaje final de felicidades
const mensajeFelizitacion = document.createElement("div");
mensajeFelizitacion.classList.add("mensaje-felizidades");    
mensajeFelizitacion.innerText = "Feliz Cumpleaños";

const ESTACIONES_NOM = ["invierno", "primavera", "verano", "otoño"]; 

// declaramos una variable para cada estación del año con los meses, días,
// horas y minutos del inicio de cada una de las estaciones 
let primaveraFecha = new Date(anioActual, 2, 20, 5, 14);
let veranoFecha = new Date(anioActual, 5, 20, 23, 9);
let otonioFecha = new Date(anioActual, 8, 21, 11, 12);
let navidadFecha = new Date(anioActual, 11, 21, 11, 12);

let cambioEstacionPronto ;
let estacionActual = getEstacion();

let diasRestantes, horasRestantes, minutosRestantes, segundosRestantes ;
let segundosHastaFecha = Math.trunc((fechaCumpleaños-fechaActual)/1000);

// esta función devuelve si un cambio de estación se va a producir en 
// menos de un día, como true o false
function comprobarEstacioPronto() {
    return [primaveraFecha, veranoFecha, otonioFecha, navidadFecha]
        .map(e => e-fechaActual)
        .map(e => e/1000/86400)
        .some(e => Math.trunc(e)===0 && e>0)
}

// le suma un año a las variables de las estaciones
function actualizarEstaciones(){
    primaveraFecha.setFullYear(primaveraFecha.getFullYear()+1);
    veranoFecha.setFullYear(veranoFecha.getFullYear()+1);
    otonioFecha.setFullYear(otonioFecha.getFullYear()+1);
    navidadFecha.setFullYear(navidadFecha.getFullYear()+1);
    }

// devuelve la estación en la cual se encuentra la fecha actual
function getEstacion () {
    if (fechaActual <= primaveraFecha || fechaActual > navidadFecha){
            return "invierno";
        }
    if (fechaActual <= veranoFecha){
            return "primavera";
        }
    
    if (fechaActual <= otonioFecha){
            return "verano";
        }

    if (fechaActual <= navidadFecha){
            return "otoño";
        }
}

// actualiza contador de segundos restantes
function actualizarSegundo(){
    segundosRestantes = segundosHastaFecha%86400%3600%60;
    containerSegundos.innerText = segundosRestantes
};

// actualiza contador de minutos restantes
function actualizarMinuto(){
    minutosRestantes = Math.trunc(segundosHastaFecha%86400%3600/60);
    containerMinutos.innerText = minutosRestantes
};

// actualiza contador de horas restantes
function actualizarHora(){
    horasRestantes = Math.trunc(segundosHastaFecha%86400/3600);
    containerHoras.innerText = horasRestantes
};

// actualiza contador de días restantes
function actualizarDia(){
    diasRestantes = Math.trunc(segundosHastaFecha/86400);
    containerDias.innerText = diasRestantes
};

// pide el nombre de la estación a la cual se va a actualizar el fondo.
// Se seleccionan los dos divs que componen el fondo de la página,
// seguidamente se elimina la clase de la estación anterior
// y se añade la clase de la estación nueva 
function actualizarFondoPorEstacion(estacion){
    cambioEstacionPronto = false;

    let fondoVisible = document.querySelector(".active");
    let fondoInvisible = document.querySelector(".hiden");
    let index;

    if (ESTACIONES_NOM.some((e, indx) => {
        index = indx;
        return fondoVisible.classList.contains(e);
    })) setTimeout(() => {
        fondoVisible.classList.remove(ESTACIONES_NOM[index])}
    , 1000)

    fondoVisible.classList.replace("active", "hiden");
    fondoInvisible.classList.add(estacion);
    fondoInvisible.classList.replace("hiden", "active");        
    estacionActual = estacion
};

// función ejecutada en el intervalo, primero combrueba si los segundos
// restantes son iguales a uno, de ser así el intervalo se elimina, 
// el fondo es actualizado al fondo de cumpleaños y se añade el mensaje
// de feliz cumpleaños, fuera de esta condición se le resta uno a los segundos restantes
// luego se actualiza el contador de los segundos y si los segundos restantes son iguales a 59
// se actualizan los minutos y si la estación actual es distinta a la estación de getestacion
// se actualiza el fondo de la pagina
// si los minutos restantes son 59 se actualiza la hora y si las horas restantes es igual a 
// 23 se actualiza el día y se comprueba si el año declarado inicialmente es distinto al actual,
// de ser asi se actualiza la fecha de las variables de las estaciones
// después de todas estas comprobaciones se suma un segundo a la fecha actual.
function manejoInterVal() {    
    if (segundosHastaFecha == 1){
        clearInterval(intervalID)
        actualizarFondoPorEstacion("imagen-cumple")
        document.body.appendChild(mensajeFelizitacion);
    }

    segundosHastaFecha -= 1;

    actualizarSegundo()
    if (segundosRestantes === 59 || minutosRestantes === undefined){
        actualizarMinuto();
        if (cambioEstacionPronto && estacionActual != getEstacion()) actualizarFondoPorEstacion(getEstacion());
        
        if (minutosRestantes === 59 || horasRestantes === undefined){
            actualizarHora()
            if (!cambioEstacionPronto){
                cambioEstacionPronto = comprobarEstacioPronto()
            }
            if( horasRestantes === 23 || diasRestantes === undefined){
                actualizarDia()
                if(anioActual < fechaActual.getFullYear()){
                    actualizarEstaciones()
                }
            }
        }
    }
    fechaActual.setSeconds(fechaActual.getSeconds()+1)
}

// se le añade el fondo de la estación actual al div que enseña el fondo
// de la página
document.querySelector("#frente").classList.add(estacionActual);

// la función de manejoInerVal se ejecuta cada segundo
const intervalID = setInterval(
    manejoInterVal, 1000);

// manejoInterVal se ejecuta de primeras
manejoInterVal()
