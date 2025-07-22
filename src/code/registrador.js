var atendidoActual={
    id: undefined,
    ventasArr: [],
    "nombre-atendido": undefined,
    total: 0,
    pagado: 0,
    ventasArr: []
};


function verifyCliente(cliente){//Verifica de que exista y lo devuelve o lo crea segun el caso
    var clienteObj;
    //Es dinamico, para cuando se pasa la ID como el nombre
    if (typeof cliente == "number"){
        clienteObj = searchValueOnLSById("clientes", cliente)
        
    }else{
        clienteObj = searchValueOnLSByPropVal("clientes", "name", cliente)
    }
    if(!clienteObj){//Si no existe lo crea
        return registrarCliente(cliente)
    }
    return clienteObj
}


function searchValueOnLSByPropVal(storageKey, prop, value){
    var storage = JSON.parse(localStorage.getItem(storageKey)||"[]")
    if(prop=="id"){
        return storage[value]
    }
    for (i=0; i<storage.length; i++){
        var item = storage[i];
        if (item[prop]==value){
            return item
        }
    }
}

function searchValueOnLSById(storageKey, id){
    return searchValueOnLSByPropVal("id", id)
}

function getLastId(storageKey){
    var storage = JSON.parse(localStorage.getItem(storageKey)||"[]")
    return storage.length
}

function addOnLS(storageKey, valueObject){
    if(localStorage !== undefined){
        var newStorage = JSON.parse(localStorage.getItem(storageKey)||"[]")
        newStorage.push(valueObject)
        localStorage.setItem(storageKey, JSON.stringify(newStorage))
        return getLastId(storageKey) 
    }
}

function changeOnLS(storageKey, id, value, prop, addToArr=false){
    var storage = JSON.parse(localStorage.getItem(storageKey)||"[]")
    if(addToArr){
        storage[id][prop].push(value)
    }else{
        storage[id][prop] = value
    }
    localStorage.setItem(storageKey, JSON.stringify(storage))
}

function registrarVenta(idAtendido, producto, cantidad, precio){
    var venta = {idAtendido, producto, cantidad, precio, total: precio*cantidad}
    changeOnLS("atendidos", idAtendido, venta, "ventasArr", true)
    changeOnLS("atendidos", idAtendido, venta.total, "total")
    //addOnLS("ventas", venta)
}



function registrarAtendido(cliente=-1, total=0, pagado=0){
    var atendido = {clientId: getLastId("atendidos"), nombre: "", total, pagado, ventasArr: []}//Si no se pone nada quedara en -1 y se renderizaraa como ( Nombre faltante )
    
    if(cliente!==-1) {
        var cliente = verifyCliente(cliente)
        atendido.nombre = cliente.name
        atendido.clientId = cliente.id
    }

    
    addOnLS("atendidos", atendido)
    return atendido
}

function registrarCliente(clienteName){
    var cliente;
    if(typeof clienteName == "number"){
        cliente = {nombre: "", id: clienteName, anonimo: 1}
        //Generar pop up porque solo se paso una ID inexistente y por ende se debe agregar el nombre
    }else{
        var cliente = {nombre: clienteName, id: getLastId("clientes")+1}
    }
    addOnLS("clientes", cliente)
    return cliente
}
var clientNameInp;
function renderNewAtend(e){
    
    e.target.outerHTML = 
    "<div class='compra-form'>" +
    
       '<div class="compra-buttons">' +
            '<button style="display: inline-block;" type="button">Reiniciar compra</button>' +
            '<button style="display: inline-block;" type="button">Cancelar compra</button>' +
            '<button style="display: inline-block;" type="button">Completar compra</button>' +
            '<button style="display: inline-block;" type="button" class="add-compra">Añadir compra</button>' +
       '</div>' +
        '<div style="display: inline-block;" class="client-name">' +
            '<label style="display: inline-block;" for="name-client">Nombre/ID de Cliente</label>' +

            '<input placeholder="" style="display: inline-block;" id="name-client" type="text">' +
            '<datalist id="clientes" class="auto-completed" style="display: inline-block;"></datalist>' +
        '</div>' +
        
        
    "</div>";
    clientNameInp = document.querySelector("#name-client");
}

function renderEnterAtend(target){
    console.log("target rendering enter atend",target) 
    if(target.value){
        target.parentNode.outerHTML = "<div class='client-name modificable' id='nombre-atendido'>"+target.value+"</div>"
    }else{
        target.parentNode.outerHTML = "<div class='client-name modificable' id='nombre-atendido'>(Nombre faltante)</div>"
    }

}

function renderAddCompra(e){
    var newCompraForm = document.createElement("div")
    newCompraForm.className = "new-compra-form"
    newCompraForm.innerHTML = "<input id='producto' type='text' placeholder='Buscar por ID de producto' class='compra-buttons'/>" +
    "<input id='producto' type='text' placeholder='Buscar por nombre de producto' class='compra-buttons'/>" +
    "<input id='cantidad' type='number' placeholder='Cantidad' class='compra-buttons'/>" +
    "<button type='button' class='compra-buttons'>Agregar</button>" +
    "</div>";
    var inputs = newCompraForm.querySelectorAll("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("input", function(e){
            var value = e.target.value;
            var list = document.createElement("datalist");
            list.id = "productos-"+e.target.id;
            e.target.setAttribute("list", list.id);
            var productos = [
                {id: "1", title: "Producto 1", precio: 100},
                {id: "2", title: "Producto 2", precio: 200},
                {id: "3", title: "Producto 3", precio: 300},
                {id: "4", title: "Producto 4", precio: 400},
                {id: "5", title: "Producto 5", precio: 500},
            ]//JSON.parse(localStorage.getItem("productos")||"[]");
            for (var j = 0; j < productos.length; j++) {
                var option = document.createElement("option");
                option.value = productos[j].id + " - " + productos[j].title;
                if (typeof option.textContent == "undefined") {
                    option.innerText = productos[j].title;
                } else {
                    option.textContent = productos[j].title;
                }
                list.appendChild(option);
            }
        });
    }
    e.target.parentNode.replaceWith(newCompraForm)
}



function autoFunc() {
    function keypressHandler(e) {
        
        e = e || window.event;

        var tecla = e.keyCode || e.which; 
        // 13 es el código de Enter
        if (tecla == 13) {
            if (document.activeElement.id === "name-client") {

                atendidoActual.id = getLastId("atendidos")+1 // registrarAtendido(clientNameInp.value)
                renderEnterAtend(clientNameInp)
                
            }
            if (document.activeElement.id === "nombre-atendido") {
                console.log("enter atendido")
                modifyMode = false
                holdModifyMode = false
                renderEnterAtend(document.querySelector("#nombre-atendido"))
            }
        }
        if (tecla == 109 || (tecla == 106 && e.shiftKey)||tecla==77) {
            console.log("changed to modify mode: ", modifyMode, holdModifyMode)
            var hasTextInput = document.activeElement && document.activeElement.tagName === "INPUT" && document.activeElement.type === "text"
            // si se presiona la tecla 'm' (109) y hay un input de texto activo, no hacer nada
            // si no hay un input de texto activo, se renderiza una nueva comprar (renderNewAtend) en el mismo lugar que el bot  n de registrar atendido
            if(tecla==77 && !hasTextInput){
                modifyMode = false
                holdModifyMode = !holdModifyMode
                renderEnterAtend(document.querySelector("#nombre-atendido"))
            }
            else if (!hasTextInput) {
                holdModifyMode = false
                modifyMode = !modifyMode
                renderEnterAtend(document.querySelector("#nombre-atendido"))
            }
        }

    }
    var modifyMode = false;
    var holdModifyMode = false;
    function mouseOutHandler(e){
        console.log("Mouse out on input")
        if(modifyMode||holdModifyMode){
            if(e.target.classList.contains("hover-modificable")){
                e.target.classList.remove("hover-modificable")
                var newDiv = document.createElement("div")
                newDiv.className = e.target.className
                newDiv.textContent = e.target.value
                e.target.replaceWith(newDiv)
                if(e.target.id=="nombre-atendido" && e.target.value !== "(Nombre faltante)"){
                    atendidoActual["nombre-atendido"] = e.target.value//Se actualiza el nombre del atendido por el lado logico
                }
                modifyMode=false
            }
        }
    }
    function mouseHoverHandler(e){
        if(modifyMode||holdModifyMode){
            if(e.target.classList.contains("modificable")&&e.target.tagName!="INPUT"){
                e.target.classList.add("hover-modificable")
                var newInput = document.createElement("input")
                newInput.type = "text"
                newInput.className = e.target.className
                console.log(e.target)
                newInput.value = e.target.textContent

                newInput.addEventListener("mouseout", mouseOutHandler)
               
                e.target.replaceWith(newInput)
            }
        }
    }
    var atendidoGenerator = document.querySelector(".atend-generator")
    var compraGenerator = document.querySelector(".add-compra")

    if (window.addEventListener) {
        window.addEventListener("keypress", keypressHandler,false);
        window.addEventListener("mouseover", mouseHoverHandler,false);
        if(atendidoGenerator){
            atendidoGenerator.addEventListener("click", renderNewAtend)
        }
        if(compraGenerator){
            compraGenerator.addEventListener("click", renderAddCompra)
        }
    } else if (window.attachEvent) {
        window.attachEvent("onkeypress", keypressHandler,false);
        window.attachEvent("onmouseover", mouseHoverHandler,false);
        if(atendidoGenerator){
            atendidoGenerator.attachEvent("onclick", renderNewAtend)
        }
        if(compraGenerator){
            compraGenerator.attachEvent("onclick", renderAddCompra)
        }
    }
}
autoFunc()



