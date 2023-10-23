let data;
let listaCanciones;
let indxActual;
let intervalo;
let libreria = "Tu libreria";
let songObj;
let paused = true;
let isLooped = false;
let isRandomized = false;
const loopBtn = document.querySelector("button#loop");
const previousBtn = document.querySelector("button#previosSong");
const pausePlayBtn = document.querySelector("button#pause-play");
const nextBtn = document.querySelector("button#nextSong");
const randomBtn = document.querySelector("button#random");
const progressBar = document.querySelector("#progress-music-bar");

pausePlayBtn.querySelector(".play").style.opacity = 0;

// Volumen
const volume = document.querySelector("#volumen");
const volumeSVG = document.querySelector("#svgabsoluto");

function changeVolumeDOM() {
    let volumeValue = parseInt(volume.value);
    volume.style.background = `linear-gradient(90deg, var(--verde) 0%, var(--verde) ${volumeValue}%, var(--background-range) ${volumeValue}%)`;
    volumeSVG.style.width =
        volumeValue >= 75 ? "100%" : volumeValue >= 25 ? "64%" : "52%";

    if (indxActual != null)
        listaCanciones[indxActual].audio.volume = volumeValue / 100;
}

volume.addEventListener("change", changeVolumeDOM);
volume.addEventListener("input", changeVolumeDOM);

changeVolumeDOM();

// wrap-flex
const gridbtn = document.querySelector("button#grid");
const listbtn = document.querySelector("button#list");
const containerSongs = document.querySelector(".canciones");

function changeLayout() {
    if (gridbtn.classList.contains("active")) {
        gridbtn.classList.remove("active");
        listbtn.classList.add("active");
        containerSongs.classList.remove("grid");
        containerSongs.classList.add("list");
    } else {
        listbtn.classList.remove("active");
        gridbtn.classList.add("active");
        containerSongs.classList.remove("list");
        containerSongs.classList.add("grid");
    }
}

gridbtn.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) changeLayout();
});

listbtn.addEventListener("click", (e) => {
    if (!e.target.classList.contains("active")) changeLayout();
});

// crear canciones-Container
async function loadData() {
    const response = await fetch("./canciones.json");
    data = await response.json();
}

loadData().then(() => {
    listaCanciones = data[libreria].map((e) => {
        let { id, artist, song } = e;
        return {
            id: id,
            artist: artist,
            song: song,
            audio: new Audio(`audios/${"Tu libreria"}/${e.id}.mp3`),
        };
    });
    createThumbnails(listaCanciones, "Tu libreria");
});

function createThumbnail(element, libreria) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    let h3 = document.createElement("h3");
    let h5 = document.createElement("h5");
    const thumbnail = `./miniaturas/${libreria}/${element.id}.jpg`;

    img.src = thumbnail;
    img.draggable = false;
    img.alt = element.song;
    h3.innerText = element.artist;
    h5.innerText = element.song;
    div.appendChild(img);
    div.appendChild(h3);
    div.appendChild(h5);
    div.appendChild(element.audio);

    div.addEventListener("click", () => {
        playSong(element.id);
    });

    return div;
}

function createThumbnails(data, libreria) {
    data.forEach((e) => {
        containerSongs.appendChild(createThumbnail(e, libreria));
    });
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

function playSong(idSong, progessBarProgress = "0") {
    paused = false;
    let newIndex;

    songObj = listaCanciones.filter((e, indx) => {
        if (e.id === idSong) {
            newIndex = indx;
            return e.id === idSong;
        }
    })[0];
    document.querySelector(
        ".cancion img"
    ).src = `./miniaturas/${libreria}/${idSong}.jpg`;
    document.querySelector(".texto h2").innerText = songObj.artist;
    document.querySelector(".texto h4").innerText = songObj.song;

    if (indxActual != null && indxActual != newIndex && !isLooped) {
        listaCanciones[indxActual].audio.currentTime = 0;
        listaCanciones[indxActual].audio.pause();
        clearInterval(intervalo);
    }

    let songPlaying = songObj.audio;
    intervalo = setInterval(() => {
        document.querySelector(".time-remaining").innerText = getTimeFormat(
            songPlaying.currentTime
        );
        document.querySelector("#progress-music-bar").value =
            songPlaying.currentTime;
        if (songPlaying.ended) {
            clearInterval(intervalo);
            if (isLooped) indxActual--;
            nextSong(isLooped);
        }
    }, 100);
    document.querySelector(".time-song").innerText = getTimeFormat(
        songPlaying.duration
    );
    document.querySelector(".time-remaining").innerText = getTimeFormat(
        songPlaying.currentTime
    );
    document.querySelector("#progress-music-bar").max = songPlaying.duration;
    document.querySelector("#progress-music-bar").value = progessBarProgress;
    indxActual = newIndex;
    changeVolumeDOM();

    pausedNotPaused();
    songPlaying.play();
}

function nextSong(fromLoop = false) {
    if (indxActual != null) {
        if (!fromLoop && isLooped) loopAction();
        playSong(
            listaCanciones[
                indxActual < listaCanciones.length - 1 ? indxActual + 1 : 0
            ].id
        );
    }
}

function previousSong() {
    if (indxActual != null) {
        if (isLooped) loopAction();
        playSong(
            listaCanciones[
                indxActual > 0 ? indxActual - 1 : listaCanciones.length - 1
            ].id
        );
    }
}

function getTimeFormat(time) {
    return `${Math.trunc(time / 60)}:${time % 60 > 10 ? "" : "0"}${Math.trunc(
        time % 60
    )}`;
}

function pausedNotPaused(fromPlay = true) {
    if (indxActual != null) {
        pausePlayBtn.querySelector(".play").style.opacity = paused ? 0 : 1;
        pausePlayBtn.querySelector(".pause").style.opacity = paused ? 1 : 0;

        if (paused) {
            listaCanciones[indxActual].audio.pause();
            clearInterval(intervalo);
        } else if (!fromPlay) {
            playSong(
                listaCanciones[indxActual].id,
                document.querySelector("#progress-music-bar").value
            );
        }
    }
}

function loopAction() {
    if (indxActual != null) {
        let color = isLooped ? "white" : "#ADFF00";
        for (let path of loopBtn.querySelectorAll("path")) {
            path.style.stroke = color;
            path.style.fill = color;
        }
        isLooped = !isLooped;
    }
}

function randomAction() {
    if (indxActual != null) {
        if (isLooped) loopAction();

        console.log(listaCanciones[indxActual]);
        listaCanciones[indxActual].audio.currentTime = 0;
        listaCanciones[indxActual].audio.pause();
        removeSongs();

        document.querySelector("header h1").innerText = isRandomized ? "Añadidos Recientemente" : "Aleatorio";

        if (isRandomized) {
            listaCanciones.sort((a, b) => b.id <= a.id);
        } else {
            listaCanciones = shuffle(listaCanciones);
        }

        createThumbnails(listaCanciones, libreria);
        indxActual = listaCanciones.length - 1;
        nextSong();
        let color = isRandomized ? "white" : "#ADFF00";
        for (let path of randomBtn.querySelectorAll("path")) {
            path.style.stroke = color;
            path.style.fill = color;
        }
        isRandomized = !isRandomized;
    }
}

function removeSongs() {
    for (let elemnt of containerSongs.querySelectorAll("div")) {
        elemnt.remove();
    }
}

previousBtn.onclick = previousSong;
nextBtn.onclick = () => nextSong(false);
pausePlayBtn.onclick = () => {
    if (indxActual != null) paused = !paused;
    pausedNotPaused(false);
};
loopBtn.onclick = loopAction;
randomBtn.onclick = randomAction;

progressBar.addEventListener('click', (e) => {
    if (indxActual != null){
        let resulVal = listaCanciones[indxActual].audio.duration / e.target.clientWidth;
        listaCanciones[indxActual].audio.currentTime = resulVal * e.layerX;
        document.querySelector("#progress-music-bar").value = listaCanciones[indxActual].audio.currentTime;
        document.querySelector(".time-remaining").innerText = getTimeFormat(
            listaCanciones[indxActual].audio.currentTime)
    }
})