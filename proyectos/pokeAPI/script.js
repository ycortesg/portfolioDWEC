// urls para fecth apis
const INICIO_URL = "https://pokeapi.co/api/v2/pokemon/";
const INICIO_URL_ESPECIES = "https://pokeapi.co/api/v2/pokemon-species/";

let onCooldown = true;
let numPokes;
let typesColor;

// partes de la carta
const cardHeader = document.querySelector("#pokemonCard .card-header");
const cardBody = document.querySelector("#pokemonCard .card-body");

// lados de la carta
const cardFront = document.querySelector("#pokemonCard");
const cardBack = document.querySelector(".back-card");

// imagen de la carta
const imageShownPokemon = document.querySelector("#pokemon-image-shown");

// contenedor evoluciones 
let evoChainContainer = document.querySelector("#evo-chain-container");

// botones de la carta
let btnEvoChain = document.querySelector("#evo-chain");
let btnGenre = document.querySelector("#genre");
let btnShiny = document.querySelector("#shiny");

// id y nombre de la carta
const idDOM = document.querySelector("#id");
const nameDOM = document.querySelector("#name");

// boton refresh
const btnRefresh = document.querySelector("#refresh");

// nombre y dom de las estadisticas de la carta
const domStats = {
  "hp": document.querySelector("#hp progress"),
  "attack": document.querySelector("#atk progress"),
  "defense": document.querySelector("#def progress"),
  "speed": document.querySelector("#spe progress"),
  "special-attack": document.querySelector("#sp-at progress"),
  "special-defense": document.querySelector("#sp-df progress"),
};

// id de pokemon aleatorio
function ranPokeId() {
  return Math.round(Math.random() * numPokes);
}

// empieza la pagina
async function startPokedex() {

  // recoje la cantidad de pokemons que existen actualmente disponibles
  let responseCount = await fetch(
    "https://pokeapi.co/api/v2/pokemon-species/?count"
  );
  dataCount = await responseCount.json();
  numPokes = dataCount.count;

  // recoje la informacion de un json con un color relecionado a cada tipo  
  typesColor = await getTypesAndColorJSON();

  // obtiene un pokemon aleatorio
  let objPokemon = await getPokemonFromAPI();

  // da la vuelta a la carta
  cardFront.classList.add("front-to-back");
  cardBack.classList.add("back-to-front");

  // crea la carta
  createPokemonCard(objPokemon);

  onCooldown = false;

  // al hacer clic en el boton de refresh muestra un nuevo pokemon aleatorio si no esta en cooldown
  btnRefresh.onclick = () => {
    if (!onCooldown) setNewPokemoCard()
  };
}

// devuelve un objeto con la informacion del json con los tipos y sus colores
async function getTypesAndColorJSON() {
  let response = await fetch(`./types.json`);
  let data = await response.json();
  return data;
}

// devuelve un objeto con la informacion de un pokemon, si no se introduce id el id es aleatorio
async function getPokemonFromAPI(idPoke = ranPokeId()) {
  let evosInfo = null;

  // recoje la informacion del id introducido
  let response = await fetch(`${INICIO_URL}${idPoke}`);
  let data = await response.json();
  let responseDetails = await fetch(`${INICIO_URL_ESPECIES}${data.id}`);
  let dataDetails = await responseDetails.json();

  // si el pokemon tiene una cadena de evolucion 
  if (dataDetails.evolution_chain) {
    evosInfo = [];

    // recoje las evoluciones del id introducido 
    let responseEvos = await fetch(dataDetails.evolution_chain.url);
    let specieStep = await responseEvos.json();
    specieStep = specieStep.chain;

    // añade la primera evolucion 
    evosInfo.push({
      name: specieStep.species.name,
      url: specieStep.species.url,
    });

    // mientras que el pokemon actual tiene mas 0 evoluciones
    while (specieStep.evolves_to.length > 0) {
      // recoje la primera evolucion de la cadena
      let evo = specieStep.evolves_to[0];
      evosInfo.push({ name: evo.species.name, url: evo.species.url });

      // actualiza la variable 
      specieStep = evo;
    }

    // formatea la lista de las evolucionaes para que los objetos solo tengan el id,
    // el nombre y su imagen 
    evosInfo = await Promise.all(
      evosInfo.map(async (e) => {
        let responseEvo = await fetch(e.url.replace("-species", ""));
        let dataEvo = await responseEvo.json();

        return {
          id: dataEvo.id,
          name: e.name,
          image: dataEvo.sprites.front_default,
        };
      })
    );
  }

  // formatea el objeto que devuelve con la informacion necesaria
  let processedData = {
    id: data.id,
    name: data.name,
    types: data.types,
    image_default: data.sprites.front_default,
    image_shiny: data.sprites.front_shiny,
    image_female: data.sprites.front_female,
    image_shiny_female: data.sprites.front_shiny_female,
    stats: data.stats,
    evos: evosInfo,
  };
  return processedData;
}

// crea la carta con la informacion del objeto introducido
function createPokemonCard(objPoke) {
  console.log(objPoke);
  let shinySelected = false;
  let femaleSelected = false;

  // configura el fondo de la cabecera y del cuerpo de la carta
  let backgroundHeaderColor = getHeaderBackground(objPoke.types);
  let backgroundBodyColor = getBodyBackground(objPoke.types);
  cardHeader.style.background = backgroundHeaderColor;
  cardBody.style.background = backgroundBodyColor;

  // configura la imagen de el pokemon en la carta
  imageShownPokemon.src = objPoke.image_default;

  // añade el id y el nombre del pokemon en la carta
  idDOM.innerText = objPoke.id;
  nameDOM.innerText = objPoke.name;

  // recorre la lista de las estadisticas y añade su valor correspondiente  
  for (let statObj of objPoke.stats) {
    domStats[statObj.stat.name].value = statObj.base_stat;
  }

  // si no tiene imagen de shiny se oculta el boton de shiny sino se enseña
  if (objPoke.image_shiny == null) {
    if (!btnShiny.classList.contains("hide-button"))
      btnShiny.classList.add("hide-button");
  } else {
    if (btnShiny.classList.contains("hide-button"))
      btnShiny.classList.remove("hide-button");

    // al hacer click en el boton de shiny se activa el boton si no lo esta y se actualiza
    // la imagen de la carta y si lo esta se actualiza y se actualiza la imagen  
    btnShiny.addEventListener("click", () => {
      if (btnShiny.classList.contains("shiny-active")) {
        btnShiny.classList.remove("shiny-active");
      } else {
        btnShiny.classList.add("shiny-active");
      }
      shinySelected = !shinySelected;
      imageShownPokemon.src =
        objPoke[updateImageCard(shinySelected, femaleSelected)];
    });
  }

   // si no tiene imagen de hembre se oculta el boton de genero sino se enseña
  if (objPoke.image_female == null) {
    if (!btnGenre.classList.contains("hide-button"))
      btnGenre.classList.add("hide-button");
  } else {
    if (btnGenre.classList.contains("hide-button"))
      btnGenre.classList.remove("hide-button");

      // al hacer click en el boton de genero se activa cambia de genero por el otro 
      // y se actualiza la imagen del pokemon  
    btnGenre.addEventListener("click", () => {
      if (btnGenre.classList.contains("male")) {
        btnGenre.classList.remove("male");
        btnGenre.classList.add("female");
        btnGenre.src = "icons/female.png";
      } else {
        btnGenre.classList.add("male");
        btnGenre.classList.remove("female");
        btnGenre.src = "icons/male.png";
      }
      femaleSelected = !femaleSelected;
      imageShownPokemon.src =
        objPoke[updateImageCard(shinySelected, femaleSelected)];
    });
  }

// si no tiene evolucion o tiene una se oculta el boton de evolucion sino se enseña
  if (objPoke.evos == null || objPoke.evos.length == 1) {
    if (!btnEvoChain.classList.contains("hide-button"))
      btnEvoChain.classList.add("hide-button");
  } else {
    if (btnEvoChain.classList.contains("hide-button"))
      btnEvoChain.classList.remove("hide-button");
    
      // llena el contenedor de las evoliciones con las del pokemon de la carta
    for (let evo of objPoke.evos) {
      // elementos del container de evos
      let containerEvo = document.createElement("div");
      let imageEvo = document.createElement("img");
      let nameEvo = document.createElement("h4");

      // añade imagen y nombre
      imageEvo.src = evo.image;
      nameEvo.innerText = evo.name;

      // añade clases a los elementos
      containerEvo.classList.add(
        "h-75",
        "w-28",
        "d-flex",
        "justify-content-center",
        "align-items-center",
        "rounded-3",
        "flex-column"
      );
      imageEvo.classList.add("h-75", "w-100", "object-fit-contain");
      nameEvo.classList.add("h-25", "w-100", "fs-6", "fw-bolder");

      // añade la imagen y el nombre al contenedor
      containerEvo.appendChild(imageEvo);
      containerEvo.appendChild(nameEvo);

      // si la evo actual tiene el mismo id al objeto muetra un fondo distinto 
      containerEvo.style.background =
        evo.id == objPoke.id ? backgroundHeaderColor : backgroundBodyColor;

      evoChainContainer.appendChild(containerEvo);

      // al hacer clic en un contenedor de una evolucion cambia la carta actual por una nueva con 
      // el pokemon con ese id, si el pokemon que se ha clicado es el mismo que el de la carta actual
      // solo se ocultan las evoluciones 
      containerEvo.addEventListener("click", () => {
        if (evo.id == objPoke.id) {
          evoChainContainer.classList.remove("display-evo-chain");
        } else {
          setNewPokemoCard(evo.id);
        }
      });
    }

    // al hacer clic en el boton de la cadena de evolucion muestra el container con sus evoluciones
    btnEvoChain.addEventListener("click", () => {
      evoChainContainer.classList.add("display-evo-chain");
    });
  }
}

// actualiza los elementos de la carta para eliminar lso generados de la anterior y los eventlisteners
function defaultCard() {
  // las clases de los botones de la carta
  if (btnShiny.classList.contains("shiny-active"))
    btnShiny.classList.remove("shiny-active");
  if (btnGenre.classList.contains("female")) {
    btnGenre.classList.remove("female");
    btnGenre.classList.add("male");
  }
  if (evoChainContainer.classList.contains("display-evo-chain")) {
    evoChainContainer.classList.remove("display-evo-chain");
  }

  // elimina los div que contiene el contenedor de las evoluciones
  for (let evoContainer of evoChainContainer.querySelectorAll("div")) {
    evoContainer.remove();
  }

  // clonamos los botones de la carta
  let newBtnShiny = btnShiny.cloneNode(true);
  let newBtnGenre = btnGenre.cloneNode(true);
  let newBtnEvoChain = btnEvoChain.cloneNode(true);

  // reemplazamos los elementos antiguos por los clonados 
  btnShiny.parentNode.replaceChild(newBtnShiny, btnShiny);
  btnGenre.parentNode.replaceChild(newBtnGenre, btnGenre);
  btnEvoChain.parentNode.replaceChild(newBtnEvoChain, btnEvoChain);

  // actualizamos los botones de la carta por los nuevos elementos clonados
  btnShiny = newBtnShiny;
  btnGenre = newBtnGenre;
  btnEvoChain = newBtnEvoChain;
}

// devuelve la key de la imagen que se debe mostrar
function updateImageCard(shiny, female) {
  return shiny && female
    ? "image_shiny_female"
    : shiny && !female
    ? "image_shiny"
    : !shiny && female
    ? "image_female"
    : "image_default";
}

// devuelve una roteacion aleatoria
function ranRotation() {
  return `${Math.round(Math.random() * 360)}deg`;
}

// devuelve el color de fondo para la cabecere en function de los tipos que se le introduzcan
function getHeaderBackground(types) {
  if (types.length > 1) {
    return `linear-gradient(${ranRotation()}, rgba(${
      typesColor[types[0].type.name].red
    },${typesColor[types[0].type.name].green},${
      typesColor[types[0].type.name].blue
    }) 0%, rgb(${typesColor[types[1].type.name].red},${
      typesColor[types[1].type.name].green
    },${typesColor[types[1].type.name].blue}) 100%)`;
  } else {
    return `linear-gradient(${ranRotation()}, rgba(${
      typesColor[types[0].type.name].red
    },${typesColor[types[0].type.name].green},${
      typesColor[types[0].type.name].blue
    }) 0%, rgb(${typesColor[types[0].type.name].red - 20},${
      typesColor[types[0].type.name].green - 20
    },${typesColor[types[0].type.name].blue - 20}) 100%)`;
  }
}

// devuelve el color de fondo para del cuerpo en function de los tipos que se le introduzcan
function getBodyBackground(types) {
  let indx;
  let [red, green, blue] = [0, 0, 0];
  for (indx = 0; indx < types.length; indx++) {
    red += typesColor[types[indx].type.name].red;
    green += typesColor[types[indx].type.name].green;
    blue += typesColor[types[indx].type.name].blue;
  }
  return `rgb(${red / indx},${green / indx},${blue / indx})`;
}

// actualiza la carta que esta mostrada por una nueva
async function setNewPokemoCard(idPokemon = null) {
  onCooldown = true;
  let objPokemon;

  // la carta hace la animacion de la carta dandose la vuelta
  cardFront.classList.remove("front-to-back");
  cardBack.classList.remove("back-to-front");

  cardFront.classList.add("back-to-front2");
  cardBack.classList.add("front-to-back2");

  // si se ha introducido un id se crea la carta con ese id si no es aleatorio
  if (idPokemon) {
    objPokemon = await getPokemonFromAPI(idPokemon);
  } else {
    objPokemon = await getPokemonFromAPI();
  }

  defaultCard();

  // introduce la informacion nueva a la carta  
  createPokemonCard(objPokemon);
  
  setTimeout(() => {
    // da la vuelta a la carta
    cardFront.classList.remove("back-to-front2");
    cardBack.classList.remove("front-to-back2");
    cardFront.classList.add("front-to-back");
    cardBack.classList.add("back-to-front");
    onCooldown = false;
  }, 300);
}

// empieza el programa
startPokedex();