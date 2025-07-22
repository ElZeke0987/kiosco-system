var autoComplete = document.querySelectorAll(".auto-completed");

function buscarClientes(){
    var clientes = JSON.parse(localStorage.getItem("atendidos")||"[]")
    var autoComplete = document.querySelectorAll(".auto-completed")
    autoComplete.forEach(function(autoComplete){
        autoComplete.innerHTML = ""
    })
    clientes.forEach(function(cliente){
        autoComplete.innerHTML += "<option value='" + cliente.nombre + "'>" + cliente.nombre + "</option>"
    })
}