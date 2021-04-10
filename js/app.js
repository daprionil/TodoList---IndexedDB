//variables
let db;

const formulario = document.querySelector('#formulario');
const tareaName = document.querySelector('#nameList');

const tasksBox = document.querySelector('#tasks');

const messages = document.querySelector('.messages');

class Tareas{
    agregarTarea(data){
        const transaction = db.transaction(['tasks'],'readwrite');
        const objectStore = transaction.objectStore('tasks');

        objectStore.add(data);
    };
    deleteTask(id){
        const transaction = db.transaction(['tasks'],'readwrite');
        const objectStore = transaction.objectStore('tasks');
        objectStore.delete(id);
        transaction.oncomplete = () => {console.log('eliminada')};
    }
};
class UI{
    mostrarTasks(){
        this.cleanHtmlTask();
        const objectStore = db.transaction('tasks').objectStore('tasks');

        objectStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if(cursor !== null){
                const {id,task} = cursor.value;

                const taskhtml = document.createElement('div');
                taskhtml.classList.add('item-task');
                taskhtml.innerHTML = `<p>${task}</p>`;

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn','delete');
                deleteBtn.textContent = 'X';
                deleteBtn.setAttribute('title','Eliminar Nota');
                deleteBtn.onclick = () => {
                    deleteTask(id);
                };

                taskhtml.appendChild(deleteBtn);
                tasksBox.appendChild(taskhtml);
                cursor.continue();
            };
        };
    };
    cleanHtmlTask(){
        while(tasksBox.firstChild){
            tasksBox.removeChild(tasksBox.firstChild);
        };
    };
    message(text,type){
        this.clearMessage();
        const msg = document.createElement('div');
        msg.classList.add('message');
        msg.textContent = text;

        if(type === 'correcto'){
            msg.classList.add('correcto');
        }else{
            msg.classList.add('incorrecto');
        };
        messages.appendChild(msg);
        setTimeout( () => {
            this.clearMessage();
        },3000);
    };
    clearMessage(){
        while(messages.firstChild){
            messages.removeChild(messages.firstChild)
        };
    };
};
const tarea = new Tareas();
const ui = new UI();
//eventos
window.onload = () => {
    formulario.addEventListener('submit',agregarTarea);
    crearDB();
};
//funciones
function deleteTask(id){
    tarea.deleteTask(id);
    ui.mostrarTasks();
    ui.message('Tarea Eliminada','');
};
function agregarTarea(e){
    e.preventDefault();
    if(tareaName.value !== ''){
        const objtask = {
            id: Date.now(),
            task: tareaName.value
        };
        tarea.agregarTarea(objtask);
        ui.message('Agregado Correctamente','correcto');
        formulario.reset();
        ui.mostrarTasks();
    };
};
function crearDB(){
    const taskDB = window.indexedDB.open('tasklist');
    taskDB.onerror = ()=> {console.log('error')};
    taskDB.onsuccess = () => {
        db = taskDB.result;
        console.log('DB creada', db);
        ui.mostrarTasks();
    };
    taskDB.onupgradeneeded = (e) => {
        db = e.target.result;
        console.log(db)
        const objectStore = db.createObjectStore('tasks',{keyPath:'id'});

        objectStore.createIndex('task','task',{unique:false});
        objectStore.createIndex('id','id',{unique:true})
    };
};