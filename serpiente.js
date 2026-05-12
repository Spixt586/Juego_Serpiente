    const canvas = document.getElementById("canvasJuego");
    const ctx = canvas.getContext("2d");
 
    const TAMANIO_CELDA = 25
 
    const serpiente = [
      {
        x: 14,
        y: 13
      },
      {
        x: 14,
        y: 14
      },
      {
        x: 14,
        y: 15
      },
      {
        x: 14,
        y: 16
      }
    ]
 
    // Primera pintura del juego al cargar la página
    dibujarTodo();
 
    // =========================
    // FUNCIONES DE DIBUJO
    // =========================
 
    function dibujarTodo() {
      limpiarCanvas();
      dibujarTablero()
      // pintarCoordenada(25,25)
      dibujarSerpiente()
 
    }
 
    function limpiarCanvas() {
    //0, 0: Empieza a borrar desde la esquina superior izquierda (la coordenada de origen).
    //canvas.width, canvas.height: Borra hasta el ancho y alto total del canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
 
    function dibujarTablero(){
      dibujarLineasVerticales()
      dibujarLineasHorizontales()
      dibujarNumerosEnY()
      dibujarNumerosEnX()
    }
 
    function dibujarLineasVerticales(){
    // Recorremos el ancho(width) del canvas en saltos definidos por TAMANIO_CELDA
      for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
        ctx.strokeStyle="white"
      //Levantamos el lápiz para empezar una lista de coordenadas totalmente nueva.
        ctx.beginPath()
      //Ubícate en la columna x (que va saltando de 25 en 25),
      // pero siempre empieza desde arriba del todo (punto 0 en Y)
        ctx.moveTo(x,0)
      //Traza una ruta invisible hacia abajo
        ctx.lineTo(x,canvas.height)
      // Dibujamos físicamente la línea en el canvas
        ctx.stroke()
      }
    }
 
    function dibujarLineasHorizontales(){
      for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
        ctx.strokeStyle="white"
        ctx.beginPath()
        ctx.moveTo(0,y)
        ctx.lineTo(canvas.width,y)
        ctx.stroke()
      }
    }
 
  function dibujarNumerosEnY(){
    ctx.fillStyle="white"
    ctx.font="12px Arial"
    let contador = 0
      for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
        ctx.fillText(contador,5,y+12)
        contador++
      }
  }
 
    function dibujarNumerosEnX(){
    ctx.fillStyle="white"
    ctx.font="12px Arial"
    let contador = 0
      for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
        ctx.fillText(contador,x+2,12)
        contador++
      }
  }
 
  function pintarCoordenada(x,y,color){
    let posicionX = x * TAMANIO_CELDA
    let posicionY = y * TAMANIO_CELDA
 
      if (posicionX < canvas.width && posicionY < canvas.height){
        ctx.fillStyle=color
        ctx.fillRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA)
 
        ctx.strokeStyle="red"
        ctx.strokeRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA)
      }
  }
 
function dibujarSerpiente(){
  let colorCabeza = "green"
  for(let i = 0; i < serpiente.length ; i++){
    let serp = serpiente[i]
    if(i == 0){
      pintarCoordenada(serp.x, serp.y, colorCabeza)
    } else {
      pintarCoordenada(serp.x, serp.y, "blue")
    }
  }
}
 
function moverDerecha(){
  let posicionAnterior = {x: 0, y: 0}
  if((serpiente[0].x+2)*TAMANIO_CELDA > canvas.width)
    return
  for(let i = 0; i < serpiente.length ; i++){
    let posicionX = serpiente[i].x
    let posicionY = serpiente[i].y
    if(i == 0){
      serpiente[i].x = serpiente[i].x + 1
    } else {
      serpiente[i].x = posicionAnterior.x
      serpiente[i].y = posicionAnterior.y
    }
    posicionAnterior.x = posicionX
    posicionAnterior.y = posicionY
  }
}
 
function moverIzquierda(){
  let posicionAnterior = {x: 0, y: 0}
  if((serpiente[0].x-1)*TAMANIO_CELDA < 0)
    return
  for(let i = 0; i < serpiente.length ; i++){
    let posicionX = serpiente[i].x
    let posicionY = serpiente[i].y
    if(i == 0){
      serpiente[i].x = serpiente[i].x - 1
    } else {
      serpiente[i].x = posicionAnterior.x
      serpiente[i].y = posicionAnterior.y
    }
    posicionAnterior.x = posicionX
    posicionAnterior.y = posicionY
  }
}
 
function moverAbajo(){
  let posicionAnterior = {x: 0, y: 0}
  if((serpiente[0].y+2)*TAMANIO_CELDA > canvas.height)
    return
  for(let i = 0; i < serpiente.length ; i++){
    let posicionX = serpiente[i].x
    let posicionY = serpiente[i].y
    if(i == 0){
      serpiente[i].y = serpiente[i].y + 1
    } else {
      serpiente[i].x = posicionAnterior.x
      serpiente[i].y = posicionAnterior.y
    }
    posicionAnterior.x = posicionX
    posicionAnterior.y = posicionY
  }
}
 
function moverArriba(){
  let posicionAnterior = {x: 0, y: 0}
  if((serpiente[0].y-1)*TAMANIO_CELDA < 0)
    return
  for(let i = 0; i < serpiente.length ; i++){
    let posicionX = serpiente[i].x
    let posicionY = serpiente[i].y
    if(i == 0){
      serpiente[i].y = serpiente[i].y - 1
    } else {
      serpiente[i].x = posicionAnterior.x
      serpiente[i].y = posicionAnterior.y
    }
    posicionAnterior.x = posicionX
    posicionAnterior.y = posicionY
  }
}
 
function cambiarDireccion(direccion){
  switch(direccion){
    case "derecha":
      moverDerecha()
      break
    case "izquierda":
      moverIzquierda()
      break
    case "abajo":
      moverAbajo()
      break
    case "arriba":
      moverArriba()
      break
  }
  dibujarTodo()
}