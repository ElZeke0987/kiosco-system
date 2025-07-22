var atendidoActual={
    id: undefined,
    ventasArr: [],
    "nombre-atendido": undefined,
    total: 0,
    pagado: 0,
    ventasArr: []
};

var productos = [
    {id: "1", title: "Huevos", precio: 100},
    {id: "2", title: "Manzanas", precio: 200},
    {id: "3", title: "Leche", precio: 300},
    {id: "4", title: "Carne", precio: 400},
    {id: "5", title: "Queso", precio: 500},
]//JSON.parse(localStorage.getItem("productos")||"[]");

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

function buscarCompras(idAtendido){
    var atendido = searchValueOnLSById("atendidos", idAtendido)
    return atendido.ventasArr
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
    var addCompra = document.querySelector(".add-compra")
    addCompra.addEventListener("click", renderAddCompra)
}

function renderEnterAtend(target){
    console.log("target rendering enter atend",target) 
    if(target.value){
        target.parentNode.outerHTML = "<div>" +
            "<div class='client-name modificable' id='nombre-atendido'>"+target.value+"</div>" +
            "<div class='compras-atendido'>" +
                "<h3>Compras de este atendido</h3>" +
                "<ul class='compras-list'></ul>" +
            "</div>" +
        "</div>"
    }else{
        target.parentNode.outerHTML = "<div>" +
            "<div class='client-name modificable' id='nombre-atendido'>(Nombre faltante)</div>" +
            "<div class='compras-atendido'>" +
                "<h3>Compras de este atendido</h3>" +
                "<ul class='compras-list'></ul>" +
            "</div>" +
        "</div>"
    }
    atendidoActual.id = getLastId("atendidos")+1
    atendidoActual.nombre = target.value
    atendidoActual.clientId = target.value

}

function renderComprasList(){
    var comprasList = document.querySelector(".compras-list")
    comprasList.innerHTML = ""
    atendidoActual.ventasArr.forEach(function(compra){
        var li = document.createElement("li")
        li.textContent = compra.producto + " - " + compra.cantidad + " - " + compra.precio
        comprasList.appendChild(li)
    })
}
function renderAgainBuyButton(e){
    e.target.parentNode.outerHTML = '<button style="display: inline-block;" type="button" class="add-compra">Añadir compra</button>'
    document.querySelector(".add-compra").addEventListener("click", renderAddCompra)
}
var actualCompra = {id: -1, name: "", cantidad: 0, precio: 0};

function onBuyInputChange(e){
    console.log("onBuyInputChange", e.target.value)
    console.log("testing input",e.target.value)
        if(e.target.id==="producto-name"){
            var splited = e.target.value.split(" ")
            var id = splited[0]
            var name = splited[1]
            var precio = splited[3]
            actualCompra.id = id
            actualCompra.name = name
            actualCompra.precio = parseInt(precio)
        }else if(e.target.id==="cantidad"){
            actualCompra[e.target.id] = parseInt(e.target.value)
        }
}

function renderAddCompra(e){
    var newCompraForm = document.createElement("div")
    newCompraForm.className = "new-compra-form"
    newCompraForm.innerHTML = "<div class='compra-buttons'>" +
    "<input id='producto-name' list='productos-auto' type='text' placeholder='Buscar por nombre de producto' class='search-buttons'/>" +
    "<input id='cantidad' type='number' placeholder='Cantidad' class='search-buttons' onchange='onBuyInputChange(event)'>" +
    "<datalist id='productos-auto' class='productos-auto'></datalist>" +
    "<button type='button' class='compra-buttons' id='cancelar-compra'>Cancelar</button>" +
    "<button type='button' class='compra-buttons' id='agregar-compra'>Agregar</button>" +
    "</div>";
    e.target.replaceWith(newCompraForm)
    
    for (var j = 0; j < productos.length; j++) {
        var option = document.createElement("option");
        option.value = productos[j].id + " " + productos[j].title + " $ " + productos[j].precio;
        option.textContent = productos[j].title;
        document.querySelector(".productos-auto").appendChild(option)
    }
    newCompraForm.querySelector(".search-buttons").addEventListener("input", function(e){
        onBuyInputChange(e)
    })
   
    var cancelarCompra = document.querySelector("#cancelar-compra")
    var agregarCompra = document.querySelector("#agregar-compra")
    cancelarCompra.addEventListener("click", function(e){
        actualCompra = null
        renderAgainBuyButton(e)
    })
    
    agregarCompra.addEventListener("click", function(e){
        e.preventDefault()
        var producto = searchValueOnLSById("productos", actualCompra.id)
        atendidoActual.ventasArr.push({
            producto: producto.title,  // ← Usar referencia cacheada
            cantidad: actualCompra.cantidad,      // ← Usar referencia cacheada
            precio: precio // ← Este no existe!
        })
})
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
            console.log("hasTextInput", hasTextInput)
            console.log("document.activeElement", document.activeElement)
            if(tecla==77 && !hasTextInput){
                modifyMode = false
                holdModifyMode = !holdModifyMode
                renderEnterAtend(document.querySelector("#name-client"))
            }
            else if (!hasTextInput) {
                holdModifyMode = false
                modifyMode = !modifyMode
                renderEnterAtend(document.querySelector("#name-client"))
            }
        }

    }
    var modifyMode = false;
    var holdModifyMode = false;
    function mouseOutHandler(e){
        console.log("Mouse out on input")
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
    function mouseHoverHandler(e){
        if(modifyMode||holdModifyMode){
            if(e.target.classList.contains("modificable") && e.target.tagName!="INPUT"){
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



