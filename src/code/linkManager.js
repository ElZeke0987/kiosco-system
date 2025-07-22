



var keyShortCuts = {
    "105": {keyCode: 105, href: "index.html", href2:"../index.html"},//i
    "100": {keyCode: 100, href: "pages/deudores.html", href2:"deudores.html"},//d
    "114": {keyCode: 114, href: "pages/registrador.html", href2:"registrador.html"},//r
    "112": {keyCode: 112, href: "pages/productos.html", href2:"productos.html"}//p
}

function keyListener(e){
    var evento = e || window.event
    var tecla = evento.keyCode || evento.which;
    if(tecla !== 105 && tecla !== 100 && tecla !== 114 && tecla !== 112){
        return
    }
    if(tecla == keyShortCuts[tecla].keyCode && document.activeElement.tagName.toLowerCase() != "input"){
        if(window.location.pathname.split("/").pop()=="index.html"){
            window.location.href = keyShortCuts[tecla].href 
        }else{
            window.location.href = keyShortCuts[tecla].href2
        }
    }
}

window.addEventListener("keypress", keyListener, false)

// }else{
//     for (var i = 0; i < linkButtons.length; i++){
//         var link = linkButtons[i];
//         link.addEventListener("keypress", keyListener)
//     }
// }