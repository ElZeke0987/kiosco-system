var atendidoActual={
    id: undefined,
    ventasArr: [],
    total: 0,
    pagado: 0,
    vuelto: 0
};

var productos = [
    {id: "1", title: "Huevos", precio: 100},
    {id: "2", title: "Manzanas", precio: 200},
    {id: "3", title: "Leche", precio: 300},
    {id: "4", title: "Carne", precio: 400},
    {id: "5", title: "Queso", precio: 500},
]//JSON.parse(localStorage.getItem("productos")||"[]");

var clientes = [
    {id: "-1", title: "--Nuevo cliente--"},
    {id: "0", title: "--Anonimo--"},
    ...JSON.parse(localStorage.getItem("clientes")||"[]"),
]

function verifyCliente(cliente){//Verifica de que exista y lo devuelve o lo crea segun el caso

    var clienteObj;
    //Es dinamico, para cuando se pasa la ID como el nombre
    if (typeof cliente == "number"){
        clienteObj = searchValueOnLSById("clientes", cliente)
        
    }else{
        clienteObj = searchValueOnLSByPropVal("clientes", "title", cliente)
    }
    if(!clienteObj){//Si no existe lo crea
        return registrarCliente(cliente)
    }
    return clienteObj
}


function searchValueOnLSByPropVal(storageKey, prop, value){
    var storage = JSON.parse(localStorage.getItem(storageKey)||"[]")
    console.log("Now searching on ", storageKey, storage)
    console.log("value", value)
    console.log("prop", prop)
    
    if(prop=="id"){
        console.log("storage[value - 1]", storage[value - 1])
        return storage[value - 1]
    }
    for (i=0; i<storage.length; i++){
        var item = storage[i];
        if (item[prop]==value){
            return item
        }
    }
}

function searchValueOnLSById(storageKey, id){
    return searchValueOnLSByPropVal(storageKey, "id", id)
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

function changeOnLS(storageKey, id, value, prop, addToArr=false, addNumber=false    ){
    var storage = JSON.parse(localStorage.getItem(storageKey)||"[]")
    if(addToArr){
        storage[id - 1][prop].push(value)
    }
    else if(addNumber){
        storage[id - 1][prop] = parseInt(storage[id - 1][prop]) + value
    }
    else{
        storage[id - 1][prop] = value
    }
    
    localStorage.setItem(storageKey, JSON.stringify(storage))
}

function registrarVenta(idAtendido, producto, cantidad, precio){
    var venta = {idAtendido, producto, cantidad, precio, total: precio*cantidad}
    changeOnLS("atendidos", idAtendido, venta, "ventasArr", true)
    changeOnLS("atendidos", idAtendido, venta.total, "total")
    //addOnLS("ventas", venta)
}

/* Deuda Systema
    Deuda < 0 o negativa -> Debe el kiosco
    Deuda > 0 o positiva -> Debe el cliente
 */

function getSignDeudaTotal(deudaTotal){
    if(deudaTotal>0){
        return "-"
    }else if(deudaTotal<0){
        return "+"
    }else{
        return ""
    }
}

function registrarAtendido(){//Si no se pone nada quedara en -1 y se renderizaraa como ( Nombre faltante )
    var total = 0;
    for(var i = 0; i < atendidoActual.ventasArr.length; i++){
        var venta = atendidoActual.ventasArr[i];
        total += venta.total
    }
    atendidoActual.total = total
    atendidoActual.pagado = parseInt(prompt("Ingrese el monto pagado"))||0
    atendidoActual.vuelto = atendidoActual.pagado - atendidoActual.total
    if(atendidoActual.vuelto == 0){
        if(atendidoActual.total == 0){
            alert("No se pago ni se vendio nada :)")
        }
        else{
            alert("Cliente pago justo: $", atendidoActual.pagado)
        }
    }else {
        var deudaByClient = searchValueOnLSById("clientes", atendidoActual.clientId)
         // deuda negativa (debe el kiosco) - Vuelto positivo (paga el cliente), el kiosco debe mas
        // deuda negativa y vuelto negativo, el cliente paga  con lo que el kiosco le debe (tipo pagare)
        // deuda negativa y vuelto positivo, mas deuda para el cliente
        // deuda positiva y vuelto negativo, menos deuda para el cliente
        // deuda positiva y vuelto positivo, menos deuda para el cliente
        // deuda 0 y vuelto positivo, mas deuda para el kiosco con el cliente o pagare para el cliente
        var deudaTotal = deudaByClient.deuda - atendidoActual.vuelto;
        var msgToShow;
        var tipoDeuda;
        var extraTip;
        var signoDeuda;
        var signoVuelto;

        if(deudaTotal<0){
            extraTip = "(Pagare)"
            signoDeuda = "+"
        }else if(deudaTotal>0){
            extraTip = "(Deuda)"
            signoDeuda = "-"
        }else if(deudaTotal==0){
            extraTip = "(Deuda Neutra)"
            signoDeuda = ""
        }
       
        if(atendidoActual.vuelto<0){
            signoVuelto = "-"
        }else if(atendidoActual.vuelto>0){
            signoVuelto = "+"
        }else{
            signoVuelto = ""
        }

        if(atendidoActual.pagado<0){
            extraTip += "\n(Pagos negativos no se pueden hacer, siempre positivo)"
        }
        if(deudaTotal<0){
            tipoDeuda = "Kiosco a Cliente"
        }
        else if(deudaTotal>0){
            tipoDeuda = "Cliente a Kiosco"
        }
       
        
        if(atendidoActual.vuelto<0){// El cliente pago de menos
            alert("El vuelto es negativo, se suma a la deuda como numero positivo")
            deudaTotal = deudaByClient.deuda + Math.abs(atendidoActual.vuelto) //Cuando el vuelto es negativo, se suma a la deuda como numero positivo
            msgToShow = atendidoActual.nombre + " Pago entrante:   -$" + Math.abs(atendidoActual.vuelto) +"\nDeuda anterior: " + getSignDeudaTotal(deudaByClient.deuda) + "$"+Math.abs(deudaByClient.deuda)+"\nDeuda total: " + getSignDeudaTotal(deudaTotal) + "$" + deudaTotal + "\nTipo de deuda: " + tipoDeuda + "\n" + extraTip
        }else if(atendidoActual.vuelto>0){//El cliente pago mas de lo que debia: Vuelto / Deuda del kiosco
            alert("El vuelto es positivo, se verifica si se resta o no de alguna deuda existente")
            if(deudaTotal>0){ // anterior deuda positiva (debe el cliente -> kiosco) se paga ese excedente a la deuda
                msgToShow = atendidoActual.nombre + " Deuda saldada con:   $" + Math.abs(atendidoActual.vuelto) +"\nDeuda anterior:  $"+ deudaByClient.deuda +"\nDeuda final: " + getSignDeudaTotal(deudaTotal) + "$" + deudaTotal + "\nTipo de deuda: Deuda Parcialmente Saldada" + "\n" + extraTip
            }
            else if(deudaTotal<0){// anterior deuda negativa (debe el kiosco -> cliente)                
                msgToShow = "Pagare aumentado:   +$" + atendidoActual.vuelto +"\nDeuda anterior:  " + getSignDeudaTotal(deudaByClient.deuda) + "$"+ Math.abs(deudaByClient.deuda) +"\nDeuda final: +$" + Math.abs(deudaTotal) + "\nTipo de deuda: Pagare Aumentado" + "\n" + extraTip
                
            }
            else if(deudaTotal==0){
                msgToShow = atendidoActual.nombre + " Deuda SALDADA/NEUTRALIZADA con: " + signoVuelto + "$" + Math.abs(atendidoActual.vuelto) +"\nDeuda anterior: " + signoDeuda + "$"+deudaByClient.deuda+"\nDeuda final: $0" + "\nTipo de deuda: Deuda Saldada" + "\n" + extraTip
                deudaTotal = 0
                
            }
            
        }
        atendidoActual.deuda = 0
        atendidoActual.vuelto = 0
        alert(msgToShow)
        alert("Deuda total: " + getSignDeudaTotal(deudaTotal) + "$" + Math.abs(deudaTotal) + "\nVUELTO: " + atendidoActual.vuelto)
        changeOnLS("clientes", atendidoActual.clientId, deudaTotal, "deuda", false)
    }
    addOnLS("atendidos", atendidoActual)
    console.log("Deudor actual desde el LS Test: ", searchValueOnLSById("clientes", atendidoActual.clientId))
    return atendidoActual
}

function registrarCliente(){
    var clienteName = prompt("Ingrese el nombre del cliente")
    var cliente;
    if(typeof clienteName == "number"){
        alert("El valor tiene que ser un nombre")
        registrarCliente()
    }else{
        var cliente = {id: getLastId("clientes")+1, title: clienteName, deuda: 0}
    }
    addOnLS("clientes", cliente)
    return cliente
}

function buscarCompras(idAtendido){
    var atendido = searchValueOnLSById("atendidos", idAtendido)
    return atendido.ventasArr
}

function searchByProp(list, prop, value, forRegexProp="title"){
    var result;
    for(var i = 0; i < list.length; i++){
        if(list[i][prop] == value){
            result = list[i]
            break
        }else if (buscarConRegex(list[i][forRegexProp], value)){
            result = list[i]

            break
        }
    }
    return result
}

var clientNameInp;
function renderNewAtend(e){
    var dataList = document.createElement("datalist")
    dataList.id = "clientes-auto"
    renderOptions(dataList, clientes)
    e.target.outerHTML = 
    "<div class='compra-form'>" +
    
        '<div style="display: inline-block;" class="client-name">' +
            '<label style="display: inline-block;" for="name-client" >Nombre/ID de Cliente</label>' +

            '<input placeholder="" style="display: inline-block;" id="name-client" list="clientes-auto"  type="text">' +
                dataList.outerHTML +
        '</div>' +
        
        
    "</div>";
   
}

function completarCompra(e){
    registrarAtendido()
    //location.reload()
}

function renderEnterAtend(target){


    var splittedTargetValue = target.value.split(" ")
    var id = splittedTargetValue[0]
    var clienteObj;
    if(id=="-1"){
        clienteObj = registrarCliente()
    }else{
        clienteObj = searchByProp(clientes, "id", id)
    }
    id = clienteObj.id
    var nombre = clienteObj.title;
    if(id=="0"){
        nombre = "Anonimo"
    }
    atendidoActual.id = getLastId("atendidos")+1
    atendidoActual.nombre = nombre
    atendidoActual.clientId = id
    var compraButtons = document.createElement("div")
    compraButtons.className = "compra-buttons"
    compraButtons.innerHTML = 
            '<button style="display: inline-block;" type="button">Reiniciar compra</button>' +
            '<button style="display: inline-block;" type="button">Cancelar compra</button>' +
            '<button style="display: inline-block;" type="button" onclick="completarCompra(event)">Completar compra</button>' +
            '<button style="display: inline-block;" type="button" class="add-compra" onclick="renderAddCompra(event)">Añadir compra</button>'
    
    var comprasList = document.createElement("div")
    comprasList.className = "compras-list"
    comprasList.innerHTML =
            "<h3>Compras de este atendido</h3>" +
            "<ul class='compras-list'></ul>" 
    var clientName = document.createElement("div")
    clientName.className = "client-name modificable"
    clientName.id = "nombre-atendido"
    clientName.textContent = "id " + id + " nombre: " + nombre
    if(!target.value||id=="0"){
        clientName.textContent = "--Anonimo--"
    }
    target.parentNode.outerHTML = 
        "<div>" +
            compraButtons.outerHTML +
            clientName.outerHTML +
            comprasList.outerHTML +
        "</div>"

    //atendidoActual.clientId = target.value || getLastId("clientes")+1

}
var actualCompra = {id: -1, name: "", cantidad: 0, precio: 0};
function renderComprasList(){
    var comprasList = document.querySelector(".compras-list")
    comprasList.innerHTML = ""
    for(var i = 0; i < atendidoActual.ventasArr.length; i++){
        var compra = atendidoActual.ventasArr[i]
        var li = document.createElement("li")
        li.textContent = compra.producto + " - x" + compra.cantidad + " $" + compra.precio + " = $" + compra.cantidad * compra.precio
        comprasList.appendChild(li)
    }

}
function renderAgainBuyButton(e){
    e.target.parentNode.outerHTML = '<button style="display: inline-block;" type="button" class="add-compra" onclick="renderAddCompra(event)">Añadir compra</button>'
}


function onBuyInputChange(e){
    
    console.log("onBuyInputChange", e.target.value)
    if(e.target.id==="producto-name"){
        var datalist = e.target.list
        renderOptions(datalist, productos, true, e.target.value)
        var splited = e.target.value.split(" ")
        var id = splited[0]
        var name = searchByProp(productos, "id", id).title
        actualCompra.id = id
        actualCompra.name = name
        actualCompra.precio = searchByProp(productos, "id", id).precio
    }else if(e.target.id==="cantidad"){
        actualCompra[e.target.id] = parseInt(e.target.value)
    }
}

function onBuyAddClick(e){
    e.preventDefault()
    atendidoActual.ventasArr.push({
        producto: actualCompra.name, 
        cantidad: actualCompra.cantidad,      
        precio: actualCompra.precio,
        total: actualCompra.precio * actualCompra.cantidad
    })
    renderComprasList()
    actualCompra = {id: -1, name: "", cantidad: 0, precio: 0};
    renderAgainBuyButton(e)
}

function onBuyCancelClick(e){
    e.preventDefault()
    actualCompra = {id: -1, name: "", cantidad: 0, precio: 0};
    renderAgainBuyButton(e)
}

function buscarConRegex(texto, termino) {
    var regex = new RegExp(termino, 'i'); // 'i' = case-insensitive
    return regex.test(texto);
}

// Búsqueda con múltiples términos:
function buscarMultiplesTerminos(textos, termino) {
    var regex = new RegExp(termino, 'i');
    var textosString = textos.join(" ").toLowerCase()
    console.log("regex", regex)
    console.log("textos", textos)
    console.log("termino", termino.toLowerCase())
    console.log("regex.test(" + textosString + ")", regex.test(textosString))

   return regex.test(textosString)
}

function renderOptions(element, list=productos, entire=false, byValueInput){
    element.innerHTML = ""
    console.log("List: ", list)
    var listToUse = list
    var limit = 3
    var filteredList = []
    if(entire && byValueInput){
        for (var j = 0; j < listToUse.length; j++) {
            console.log("--checking--", listToUse[j])
            if(buscarMultiplesTerminos([listToUse[j].id, listToUse[j].title], byValueInput)){
                console.log("found", listToUse[j])
                filteredList.push(listToUse[j])
                var newFilteredOption = document.createElement("option");
                newFilteredOption.value = listToUse[j].id + " - " + listToUse[j].title;
                newFilteredOption.textContent = listToUse[j].precio;
                element.appendChild(newFilteredOption)
            }
        }
        limit = filteredList.length
        listToUse = filteredList
        return
    }
    if(byValueInput){
        return
    }
    for (var j = 0; j < Math.min(limit, listToUse.length); j++) {
        var option = document.createElement("option");
        var textPriceToAdd = ""
        if(listToUse[j].precio){
            textPriceToAdd = "$ " + listToUse[j].precio
        }
        option.value = listToUse[j].id + " - " + listToUse[j].title;
        option.textContent = textPriceToAdd;
        element.appendChild(option)
    }
}

function renderAddCompra(e){
    var datalist = document.createElement("datalist")
    datalist.id = "productos-auto"
    renderOptions(datalist, productos)

    var newCompraForm = document.createElement("div")
    newCompraForm.className = "new-compra-form"
    newCompraForm.innerHTML = "<div class='compra-buttons'>" +
    "<input id='producto-name' list='productos-auto' type='text' placeholder='Buscar por nombre de producto' class='search-buttons' oninput='onBuyInputChange(event)' />" +
    "<input id='cantidad' type='number' placeholder='Cantidad' class='search-buttons' onchange='onBuyInputChange(event)'/>" +
    datalist.outerHTML +
    "<button type='button' class='compra-buttons' id='cancelar-compra' onclick='onBuyCancelClick(event)'>Cancelar</button>" +
    "<button type='button' class='compra-buttons' id='agregar-compra' onclick='onBuyAddClick(event)'>Agregar</button>" +
    "</div>";
    e.target.replaceWith(newCompraForm)
    
}

function autoFunc() {
    function keypressHandler(e) {
        
        e = e || window.event;

        var tecla = e.keyCode || e.which; 
        // 13 es el código de Enter
        if (tecla == 13) {
            if (document.activeElement.id === "name-client") {
                console.log("enter name-client", document.activeElement.value)
                renderEnterAtend(document.activeElement)
                
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


    } else if (window.attachEvent) {
        window.attachEvent("onkeypress", keypressHandler,false);
        window.attachEvent("onmouseover", mouseHoverHandler,false);


    }
}
autoFunc()



