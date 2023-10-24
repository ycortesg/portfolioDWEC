// Declaración de variables
let data;
let songsList;
let actualIndx;
let interval;
let librery = "Tu libreria";
let songObj;
let paused = true;
let isLooped = false;
let isRandomized = false;
const LOOP_BTN = document.querySelector("button#loop");
const PREVIOUS_BTN = document.querySelector("button#previosSong");
const PAUSE_PLAY_BTN = document.querySelector("button#pause-play");
const NEXT_BTN = document.querySelector("button#nextSong");
const RANDOM_BTN = document.querySelector("button#random");
const PROGRESS_BAR = document.querySelector("#progress-music-bar");
const VOLUME = document.querySelector("#volumen");
const VOLUME_SVG = document.querySelector("#svgabsoluto");
const GRID_BTN = document.querySelector("button#grid");
const LIST_BTN = document.querySelector("button#list");
const CONTAINER_SONGS = document.querySelector(".canciones");

PAUSE_PLAY_BTN.querySelector(".play").style.opacity = 0;

// event listener de input range para cambiar el volumen 

function changeVolumeDOM() {
    let volumeValue = parseInt(VOLUME.value);
    VOLUME.style.background = `linear-gradient(90deg, var(--verde) 0%, var(--verde) ${volumeValue}%, var(--background-range) ${volumeValue}%)`;
    VOLUME_SVG.style.width =
        volumeValue >= 75 ? "100%" : volumeValue >= 25 ? "64%" : "52%";

    if (actualIndx != null)
        songsList[actualIndx].audio.volume = volumeValue / 100;
}

// se añade la accion de cambio de volumen en canmbio y en input a la barra de volumen
VOLUME.addEventListener("change", changeVolumeDOM);
VOLUME.addEventListener("input", changeVolumeDOM);

// al iniciar la pagina se inicia la pagina se cambia el volumen
changeVolumeDOM();

// Estructura de cuadrados o lista
function changeLayout() {
    if (GRID_BTN.classList.contains("active")) {
        GRID_BTN.classList.remove("active");
        LIST_BTN.classList.add("active");
        CONTAINER_SONGS.classList.remove("grid");
        CONTAINER_SONGS.classList.add("list");
    } else {
        LIST_BTN.classList.remove("active");
        GRID_BTN.classList.add("active");
        CONTAINER_SONGS.classList.remove("list");
        CONTAINER_SONGS.classList.add("grid");
    }
}

// si el boton de cuadrados no esta seleccionado se cambia la estructura a la de cuadrados
GRID_BTN.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) changeLayout();
});

// si el boton de lista no esta seleccionado se cambia la estructura a la de lista
LIST_BTN.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) changeLayout();
});

// sacar los datos del archivo json donde estan la informacion de artistas y canciones
async function loadData() {
    const RESPONSE = await fetch("./canciones.json");
    data = await RESPONSE.json();
}

// cuando se termine de sacar la informacion del json se crea la lista de canciones
// y se crean todas las miniaturas
loadData().then(() => {
    songsList = data[librery].map((e) => {
        let { id, artist, song } = e;
        return {
            id: id,
            artist: artist,
            song: song,
            audio: new Audio(`audios/${"Tu libreria"}/${e.id}.mp3`),
        };
    });
    createThumbnails(songsList, "Tu libreria");
});


// crea una miniatura 
function createThumbnail(element, librery) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    let h3 = document.createElement("h3");
    let h5 = document.createElement("h5");
    const THUMBNAIL = `./miniaturas/${librery}/${element.id}.jpg`;

    img.src = THUMBNAIL;
    img.draggable = false;
    img.alt = element.song;
    h3.innerText = element.artist;
    h5.innerText = element.song;
    div.appendChild(img);
    div.appendChild(h3);
    div.appendChild(h5);
    div.appendChild(element.audio);

    // se añade la accion de reproducir cancion a cada miniatura con su respenctivo id al clic
    div.addEventListener("click", () => {
        playSong(element.id);
    });

    return div;
}

// crea todas las miniaturas del container
function createThumbnails(data, librery) {
    data.forEach((e) => {
        CONTAINER_SONGS.appendChild(createThumbnail(e, librery));
    });
}

// mezcla array
function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // mientras quedan elementos que mezclar
    while (currentIndex > 0) {
        // Escoje un elemento restante
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // E intercambiarlo con el elemento actual
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

// reproduce la cancion que tenga el id introducido
function playSong(idSong, progessBarProgress = "0") {
    paused = false;
    let newIndex;

    // encontramos la cancion selecccionada
    songObj = songsList.filter((e, indx) => {
        if (e.id === idSong) {
            newIndex = indx;
            return e.id === idSong;
        }
    })[0];

    // cambiamos la informacion en la barra inferior a la izquierda por la de la cancion 
    // reproduciendose
    document.querySelector(
        ".cancion img"
    ).src = `./miniaturas/${librery}/${idSong}.jpg`;
    document.querySelector(".texto h2").innerText = songObj.artist;
    document.querySelector(".texto h4").innerText = songObj.song;

    // si se entava reproduciendo una cancion distinta a la que se estaba reproduciendo
    // se pausa la anterior cancion, se cambia su current nime a 0 y se elmina el intervalo
    if (actualIndx != null && actualIndx != newIndex && !isLooped) {
        songsList[actualIndx].audio.currentTime = 0;
        songsList[actualIndx].audio.pause();
        clearInterval(interval);
    }

    let songPlaying = songObj.audio;
    
    // declaramos intervalo
    interval = setInterval(() => {
        // actualizamos el timepo actual de la cancion y la barra de progreso
        document.querySelector(".time-remaining").innerText = getTimeFormat(
            songPlaying.currentTime
        );
        document.querySelector("#progress-music-bar").value =
            songPlaying.currentTime;
        
        // si se acaba la cancion se elimina el intervalo y se reproduce la siguiente
        if (songPlaying.ended) {
            clearInterval(interval);
            if (isLooped) actualIndx--;
            nextSong(isLooped);
        }
    }, 100);

    // cambiamos el dom de la duracion y el progreso de reproduccion
    document.querySelector(".time-song").innerText = getTimeFormat(
        songPlaying.duration
    );
    document.querySelector(".time-remaining").innerText = getTimeFormat(
        songPlaying.currentTime
    );

    // cambiamos el maximo de la barra de reproduccion y su valor 
    document.querySelector("#progress-music-bar").max = songPlaying.duration;
    document.querySelector("#progress-music-bar").value = progessBarProgress;

    // actualizamos el index actual y el volumen
    actualIndx = newIndex;
    changeVolumeDOM();

    pausedNotPaused();
    // empezamos a reproducir la musica
    songPlaying.play();
}

// reproduce la siguiente cancion en la lista de canciones
function nextSong(fromLoop = false) {
    if (actualIndx != null) {
        clearInterval(interval);
        if (!fromLoop && isLooped) loopAction();
        playSong(
            songsList[
                actualIndx < songsList.length - 1 ? actualIndx + 1 : 0
            ].id
        );
    }
}

// reproduce la anterior cancion en la lista de canciones
function previousSong() {
    if (actualIndx != null) {
        if (isLooped) loopAction();
        playSong(
            songsList[
                actualIndx > 0 ? actualIndx - 1 : songsList.length - 1
            ].id
        );
    }
}

// devuelve el tiempo en un formato de MM:ss
function getTimeFormat(time) {
    return `${Math.trunc(time / 60)}:${time % 60 > 10 ? "" : "0"}${Math.trunc(
        time % 60
    )}`;
}

// si la variable paused esta true se cambia el dom del boton pause/play 
// y se para la cancion que se esta reproduciendo, si es false se reanuda 
// la cancion que se esta reproduciendo
function pausedNotPaused(fromPlay = true) {
    if (actualIndx != null) {
        PAUSE_PLAY_BTN.querySelector(".play").style.opacity = paused ? 0 : 1;
        PAUSE_PLAY_BTN.querySelector(".pause").style.opacity = paused ? 1 : 0;

        if (paused) {
            songsList[actualIndx].audio.pause();
            clearInterval(interval);
        } else if (!fromPlay) {
            playSong(
                songsList[actualIndx].id,
                document.querySelector("#progress-music-bar").value
            );
        }
    }
}


// cambia el DOM del boton loop y la variable isLooped
function loopAction() {
    if (actualIndx != null) {
        let color = isLooped ? "white" : "#ADFF00";
        for (let path of LOOP_BTN.querySelectorAll("path")) {
            path.style.stroke = color;
            path.style.fill = color;
        }
        isLooped = !isLooped;
    }
}

// mezcla la lista de reproduccion si isRandomized es false y
// si es true se ordena la lista
function randomAction() {
    if (actualIndx != null) {
        if (isLooped) loopAction();

        songsList[actualIndx].audio.currentTime = 0;
        songsList[actualIndx].audio.pause();
        removeSongs();

        document.querySelector("header h1").innerText = isRandomized ? "Añadidos Recientemente" : "Aleatorio";

        if (isRandomized) {
            songsList = songsList.sort((a, b) => b.id <= a.id);
        } else {
            songsList = shuffle(songsList);
        }

        createThumbnails(songsList, librery);
        actualIndx = songsList.length - 1;
        nextSong();
        let color = isRandomized ? "white" : "#ADFF00";
        for (let path of RANDOM_BTN.querySelectorAll("path")) {
            path.style.stroke = color;
            path.style.fill = color;
        }
        isRandomized = !isRandomized;
    }
}

// elimina los elementos del contenedor de las canciones 
function removeSongs() {
    for (let elemnt of CONTAINER_SONGS.querySelectorAll("div")) {
        elemnt.remove();
    }
}

// añadimos los event listeners para cada cancion

PREVIOUS_BTN.onclick = previousSong;
NEXT_BTN.onclick = () => nextSong(false);
PAUSE_PLAY_BTN.onclick = () => {
    if (actualIndx != null) paused = !paused;
    pausedNotPaused(false);
};
LOOP_BTN.onclick = loopAction;
RANDOM_BTN.onclick = randomAction;

PROGRESS_BAR.addEventListener('click', (e) => {
    if (actualIndx != null){
        let resulVal = songsList[actualIndx].audio.duration / e.target.clientWidth;
        songsList[actualIndx].audio.currentTime = resulVal * e.layerX;
        document.querySelector("#progress-music-bar").value = songsList[actualIndx].audio.currentTime;
        document.querySelector(".time-remaining").innerText = getTimeFormat(
            songsList[actualIndx].audio.currentTime)
    }
})