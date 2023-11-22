// variables de DOM
const main = document.querySelector("main");
const buttonAddNote = document.querySelector("#addNote");
const buttonRemoveNotes = document.querySelector("#removeAll");

// variables de IndexDB
const INDEXDB_NAME = "notesDB";
const INDEXDB_VERSION = 1;
const STORE_NAME = "notesStore";

let noteObjects = null;
let db = null;

// ultimo index en localstorage
let lastIndex = localStorage.getItem("lastIndexNotes") == null 
  ? 0 : localStorage.getItem("lastIndexNotes");


// Crea una nota con event listeners
function createNote(info = "", key = getLastId(), newNote = true) {

  // configurado el elemento de note
  const note = document.createElement("div");
  note.classList.add("note");
  const textArea = document.createElement("textarea");
  textArea.value = info;
  const noteHeader = createNoteHeader(note, textArea, key);

  // añadido header y textarea a nota
  note.appendChild(noteHeader);
  note.appendChild(textArea);

  // Actualiza el IndexDB al modificar el textarea
  textArea.addEventListener("keyup", (e) => {
    updateDB(key, e.target.value);
  });
  textArea.addEventListener("keydown", (e) => {
    updateDB(key, e.target.value);
  });

  // Si es una nota nueva se añade a IndexDB
  if (newNote) {
    addNoteDB({ note: info });
    localStorage.setItem("lastIndexNotes", key)
    openDB().then(() => {
    getNoteDB(key).then((obj)=>{
      noteObjects.push(obj)
    })})
  }

  return note;
}

function createNoteHeader(note, textArea, key) {

  // configurado los elementos del header
  let header = document.createElement("header");
  let deleteNoteBtn = document.createElement("button");
  deleteNoteBtn.classList.add("delete");
  let enableNoteBtn = document.createElement("button");
  enableNoteBtn.classList.add("enable");
  enableNoteBtn.classList.add("active");

  // boton para activar y desactivar el textArea 
  enableNoteBtn.addEventListener("click", () => {
    if (enableNoteBtn.classList.contains("active")) {
      enableNoteBtn.classList.remove("active");
      textArea.disabled = true;
      console.log(key);
    } else {
      enableNoteBtn.classList.add("active");
      textArea.disabled = false;
    }
  });

  // boton para eliminar nota
  deleteNoteBtn.addEventListener("click", () => {
    removeInDB(key);
    note.remove();
  });

  // añadir elementos a header
  header.appendChild(deleteNoteBtn);
  header.appendChild(enableNoteBtn);

  return header;
}

function openDB() {
  // Promesa para manejar operaciones asíncronas
  return new Promise((resolve, reject) => {
    // Solicitud para abrir la base de datos
    let request = indexedDB.open(INDEXDB_NAME, INDEXDB_VERSION);

    // Evento que indica que la base de datos está lista.
    request.onsuccess = (event) => {
      // Referencia a la BD
      db = event.target.result;
      // Indica que la promesa se completó con éxito
      resolve();
    };

    // Evento que indica que apertura ha fallado.
    request.onerror = (event) => {
      // Indica que la promesa falló
      reject(event.target.error);
    };

    // Evento que se activa cuando la versión cambia o se crea por primera vez
    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Crea un almacen de objetos (tabla), campo id como clave primaria y autoincremental
        let objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("note", "note", { unique: false });
      }
    };
  });
}

function getNoteDB(key) {
    return new Promise((resolve, reject) => {
      // variables de indexDB
      let transaction = db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);

      // accionar get
      let request = objectStore.get(key);

      // retorna el retultado de get
      request.onsuccess = (event) => {
        resolve(request.result);
      };
      
      // retorna el error
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
}

function addNoteDB(data) {
  openDB().then(() => {
    return new Promise((resolve, reject) => {
      // variables de indexDB
      let transaction = db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);

      // accionar get
      let request = objectStore.add(data);

      // resuelve add
      request.onsuccess = (event) => {
        resolve();
      };

      // devuelve error
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

function updateDB(key, noteContent) {
  openDB().then(() => {
    return new Promise((resolve, reject) => {
      // variables de indexDB
      let transaction = db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);

      // get para conseguir objeto por key
      let request = objectStore.get(key);

      // si request funciona
      request.onsuccess = () => {
        const noteObj = request.result;

        // cambiamos el valor de la nota a actualizar
        noteObj.note = noteContent;

        // actualizamos el objeto
        const updateRequest = objectStore.put(noteObj);

        // si no hay fallo se muestra mensaje en consola indicandolo
        updateRequest.onsuccess = () => {
          console.log(`Note updated : ${updateRequest.result}`);
        };
      };

      // si hay algun error
      request.onerror = (event) => {
        reject(event.target.error);
      };
      db.close();
    });
  });
}

function removeInDB(key) {
  openDB().then(() => {
    return new Promise((resolve, reject) => {
      // variables de indexDB
      let transaction = db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);

      // accionar delete
      let request = objectStore.delete(key);

      // si request funciona muestra en consola
      request.onsuccess = () => {
        console.log(`deleted : ${request.result}`);
      };

      // si request no funciona muestra en consola
      request.onerror = (err) => {
        console.error(`Error to delete : ${err}`);
      };
      db.close();
    });
  });
}

function getAllDB() {
  return new Promise((resolve, reject) => {
    // variables de indexDB
    let transaction = db.transaction([STORE_NAME], "readwrite");
    let objectStore = transaction.objectStore(STORE_NAME);

    // accionar getAll
    let request = objectStore.getAll();

    // si request funciona devuelve lista con todos los objetos
    request.onsuccess = (event) => {
      console.log(request.result);
      resolve(request.result);
    };

    // si request falla manda error
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// devuelve ultimo id compatible, si no hay nada en indexDB lo recoje de localstorage
function getLastId() {
  return noteObjects.length > 0
    ? noteObjects[noteObjects.length - 1].id + 1
    : Number.parseInt(lastIndex) + 1;
}

// abrimos indexDB
openDB().then(() => {

  // recogemos los objeto de indexDB
  getAllDB().then((result) => {
    if (noteObjects == null) {
      noteObjects = result;

      // introducimos los objetos de la vase de datos en el dom
      for (let noteObject of noteObjects) {
        main.appendChild(createNote(noteObject.note, noteObject.id, false));
      }

      // al hacer click en añadir nota se crea una nueva nota
      buttonAddNote.addEventListener("click", () => {
        main.appendChild(createNote());
      });

      // al hacer click en eliminar notas se eliminan todas las notas
      buttonRemoveNotes.addEventListener("click", () => {

        // elimina las notas de indexDB
        for (let noteObject of noteObjects) {
          removeInDB(noteObject.id)
        }

        // elimina las notas del DOM
        for (let element of main.querySelectorAll(".note")){
          element.remove()
        }
      });
    }
  });
});
