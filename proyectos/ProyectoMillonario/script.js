const main = document.getElementById('main');
const addUserBtn = document.getElementById('add-user');
const doubleBtn = document.getElementById('double');
const showMillionairesBtn = document.getElementById('show-millionaires');
const sortBtn = document.getElementById('sort');
const calculateWealthBtn = document.getElementById('calculate-wealth');
const colectiveMoney = document.querySelector('.colective-money');

// Vector para almacenar los usuarios
let userList = [];
let elementList = [];
let id = 0;

// Función que obtiene de la API un nombre aleatorio,
// genera una cantidad de dinero aleatoria cuyo máximo es 1.000.000
// y añade al usuario con ambos datos
async function getRandomUser() {
  let res = await fetch('https://randomuser.me/api');
  let data = await res.json();
  let user = data.results[0];

  // TODO: Crea un objeto usuario (newUser) que tenga como atributos: name y money

  let objUser = {
    "name": `${user.name.first} ${user.name.last}`,
    "money": Math.trunc(Math.random()*1000000),
    "id": `userid-${id}`
  }; 

  id+=1;

  addData(objUser);
}

// TODO: Función que añade un nuevo usuario (objeto) al listado de usuarios (array)
function addData(obj) {
  userList.push(obj);
  updateDOM(userList)
  setLocalStorage()
}

// TODO: Función que dobla el dinero de todos los usuarios existentes
function doubleMoney() {
  // TIP: Puedes usar map()
  userList = userList.map((e)=>{
    e.money = e.money*2;
    return e
  })
  setLocalStorage()
}

// TODO: Función que ordena a los usuarios por la cantidad de dinero que tienen
function sortByRichest() {
  userList = userList.sort((a, b)=>(a.money < b.money) ? 1 : -1)
  updateDOM(userList)
  // TIP: Puedes usar sort()
}

// TODO: Función que muestra únicamente a los usuarios millonarios (tienen más de 1.000.000)
function showMillionaires() {
  let millionaresList = userList.filter(e=>e.money >= 1000000)
  updateDOM(millionaresList)
  // TIP: Puedes usar filter()
}

// TODO: Función que calcula y muestra el dinero total de todos los usuarios
function calculateWealth() {
  // TIP: Puedes usar reduce ()
  updateDOM(userList);
  colectiveMoney.innerHTML = `<p class=\"description\">Cantidad de Dinero:</p><p class=\"money\">${formatMoney(userList.reduce((a, {money})=>a + money, 0))}</p>`

}

// TODO: Función que actualiza el DOM
function updateDOM(userList) {
  console.log(userList)
  let element;

  if (document.querySelector(`.person`)){
    for (let elementDOM of [...document.querySelectorAll(".person")]){
      elementDOM.remove();
    }
  }

  for (let user of userList){
    element = document.querySelector(`#${user.id}`);
    if (!element) {
      element = document.createElement("div");
      element.classList.add("person");
      element.id = user.id;
      main.appendChild(element);
    }
    element.innerHTML = `<strong>${user["name"]}</strong>${formatMoney(user["money"])}`;
  }
  // TIP: Puedes usar forEach () para actualizar el DOM con cada usuario y su dinero
}

// Función que formatea un número a dinero
function formatMoney(number) {
  return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + '€';
}

function setLocalStorage(){
  localStorage.setItem('name', userList.map(e=>Object.values(e).join("<-->")).join("<==>"))
}

function getLocalStorage(){
  let itemLocalStorage = localStorage.getItem('name');
  let processed1 = (itemLocalStorage.indexOf("<==>") > -1 ? itemLocalStorage.split("<==>") : [itemLocalStorage]).map(e=>e.split("<-->"))
  userList = processed1.map((e)=>{
    let [nombre, money, id] = e;
    return{"name":nombre, "money":Number(money), "id":id}
  })
  id = Number(userList[userList.length-1]["id"].split("-"))[1]
}

addUserBtn.onclick = getRandomUser;
doubleBtn.onclick = () =>{
  doubleMoney();
  updateDOM(userList);
};
showMillionairesBtn.onclick = showMillionaires;
sortBtn.onclick = sortByRichest;
calculateWealthBtn.onclick = calculateWealth;

// Obtenemos un usuario al iniciar la app

if (localStorage.getItem('name')){
  getLocalStorage()
  updateDOM(userList)
}else{
  getRandomUser();
}

// TODO: Event listeners
