// Obtenemos el elemento canvas del HTML por su ID para poder dibujar cosas en él
const canvas = document.getElementById("canvasJuego");
// Obtenemos el contexto 2D del canvas, que es la herramienta con la que dibujamos
const ctx = canvas.getContext("2d");

// Variable que guardará el identificador del intervalo del juego (para poder pausarlo)
let intervaloSerpiente;
// Dirección actual hacia donde se mueve la serpiente
let direccionActual = "derecha";

// Tamaño en píxeles de cada celda del tablero
const TAMANIO_CELDA = 25

// Array con la posición de la comida en el tablero (coordenadas de celda, no píxeles)
let comida = [{x:5,y:5}]

// Array con las posiciones de cada segmento de la serpiente (cabeza primero)
const SERPIENTE = [
  { x: 14, y: 13 }, // cabeza
  { x: 14, y: 14 },
  { x: 14, y: 15 },
  { x: 14, y: 16 }  // cola
]

// Dibujamos el estado inicial del juego al cargar la página
dibujarTodo();

// =========================
// FUNCIONES DE DIBUJO
// =========================

// Función principal de dibujo: borra el canvas y repinta todo desde cero
function dibujarTodo() {
  limpiarCanvas();    // Borra todo lo que había
  dibujarTablero();   // Pinta la cuadrícula con números
  dibujarSerpiente(); // Pinta la serpiente encima
  dibujarComida();    // Pinta la comida encima
}

// Borra completamente el canvas de esquina a esquina
function limpiarCanvas() {
  // 0,0 es la esquina superior izquierda; canvas.width/height llega hasta la esquina inferior derecha
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Dibuja el tablero completo: líneas de la cuadrícula y números de coordenadas
function dibujarTablero(){
  dibujarLineasVerticales()   // Líneas de arriba a abajo
  dibujarLineasHorizontales() // Líneas de izquierda a derecha
  dibujarNumerosEnY()         // Números a lo largo del eje Y
  dibujarNumerosEnX()         // Números a lo largo del eje X
}

// Dibuja todas las líneas verticales de la cuadrícula, separadas por TAMANIO_CELDA píxeles
function dibujarLineasVerticales(){
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.strokeStyle = "white"    // Color de la línea: blanco
    ctx.beginPath()              // Iniciamos un nuevo trazo (evita unir con trazos anteriores)
    ctx.moveTo(x, 0)             // Colocamos el lápiz en la parte superior de la columna x
    ctx.lineTo(x, canvas.height) // Trazamos una línea hacia abajo hasta el final del canvas
    ctx.stroke()                 // Dibujamos físicamente la línea
  }
}

// Dibuja todas las líneas horizontales de la cuadrícula, separadas por TAMANIO_CELDA píxeles
function dibujarLineasHorizontales(){
  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.strokeStyle = "white"   // Color de la línea: blanco
    ctx.beginPath()             // Iniciamos un nuevo trazo
    ctx.moveTo(0, y)            // Colocamos el lápiz al inicio de la fila y
    ctx.lineTo(canvas.width, y) // Trazamos una línea hacia la derecha hasta el final del canvas
    ctx.stroke()                // Dibujamos físicamente la línea
  }
}

// Dibuja los números de fila (eje Y) a la izquierda de cada línea horizontal
function dibujarNumerosEnY(){
  ctx.fillStyle = "white"  // Color del texto: blanco
  ctx.font = "12px Arial"  // Fuente y tamaño del texto
  let contador = 0
  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.fillText(contador, 5, y + 12) // Escribe el número 5px desde la izquierda, 12px hacia abajo (para que no quede cortado)
    contador++
  }
}

// Dibuja los números de columna (eje X) encima de cada línea vertical
function dibujarNumerosEnX(){
  ctx.fillStyle = "white"  // Color del texto: blanco
  ctx.font = "12px Arial"  // Fuente y tamaño del texto
  let contador = 0
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.fillText(contador, x + 2, 12) // Escribe el número 2px a la derecha de la línea y a 12px desde arriba
    contador++
  }
}

// Pinta un cuadrado de color en la celda indicada por coordenadas de cuadrícula (no píxeles)
function pintarCoordenada(x, y, color){
  // Convertimos coordenadas de celda a píxeles reales en el canvas
  let posicionX = x * TAMANIO_CELDA
  let posicionY = y * TAMANIO_CELDA

  // Solo pintamos si la celda está dentro de los límites del canvas
  if (posicionX < canvas.width && posicionY < canvas.height){
    ctx.fillStyle = color  // Color de relleno del cuadrado
    // Dibuja el cuadrado relleno del tamaño de una celda
    ctx.fillRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA)

    ctx.strokeStyle = "red"  // Color del borde: rojo
    // Dibuja el borde del cuadrado encima del relleno
    ctx.strokeRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA)
  }
}

// Recorre todos los segmentos de la SERPIENTE y los pinta en el canvas
function dibujarSerpiente(){
  let colorCabeza = "green"  // La cabeza (índice 0) se pinta de verde
  for(let i = 0; i < SERPIENTE.length; i++){
    let serp = SERPIENTE[i]
    if(i == 0){
      pintarCoordenada(serp.x, serp.y, colorCabeza) // Cabeza en verde
    } else {
      pintarCoordenada(serp.x, serp.y, "blue")      // Cuerpo en azul
    }
  }
}

// Función que se ejecuta en cada tick del intervalo: mueve la serpiente y redibuja todo
moverSerpiente = function(){
  console.log("moviendo");
  // Según la dirección actual, llamamos a la función de movimiento correspondiente
  switch(direccionActual){
    case "derecha":
      moverDerecha()
      break;
    case "izquierda":
      moverIzquierda()
      break;
    case "abajo":
      moverAbajo()
      break;
    case "arriba":
      moverArriba()
      break;
  }
  // Después de mover, redibujamos todo el canvas para reflejar la nueva posición
  dibujarTodo();
}

// Mueve la serpiente un paso hacia la derecha
function moverDerecha(){
  let nuevoElemento = {x:0, y:0}
  // Si la cabeza se saldría del canvas hacia la derecha, no hacemos nada
  if((SERPIENTE[0].x + 2) * TAMANIO_CELDA > canvas.width)
    return
  // La nueva cabeza tiene X+1 (un paso a la derecha) e Y igual
  nuevoElemento.x = SERPIENTE[0].x + 1
  nuevoElemento.y = SERPIENTE[0].y
  // Insertamos la nueva cabeza al principio del array
  SERPIENTE.unshift(nuevoElemento)
  // Eliminamos el último elemento (la cola), manteniendo el mismo tamaño
  SERPIENTE.pop()
}

// Mueve la serpiente un paso hacia la izquierda
function moverIzquierda(){
  let nuevoElemento = {x:0, y:0}
  let posicionAnterior = {x: 0, y: 0} // (variable no utilizada, dejada tal cual)
  // Si la cabeza se saldría del canvas hacia la izquierda, no hacemos nada
  if((SERPIENTE[0].x - 1) * TAMANIO_CELDA < 0)
    return
  // La nueva cabeza tiene X-1 (un paso a la izquierda) e Y igual
  nuevoElemento.x = SERPIENTE[0].x - 1
  nuevoElemento.y = SERPIENTE[0].y
  // Insertamos la nueva cabeza al principio y eliminamos la cola
  SERPIENTE.unshift(nuevoElemento)
  SERPIENTE.pop()
}

// Mueve la serpiente un paso hacia abajo
function moverAbajo(){
  let nuevoElemento = {x:0, y:0}
  let posicionAnterior = {x: 0, y: 0} // (variable no utilizada, dejada tal cual)
  // Si la cabeza se saldría del canvas hacia abajo, no hacemos nada
  if((SERPIENTE[0].y + 2) * TAMANIO_CELDA > canvas.height)
    return
  // La nueva cabeza tiene X igual e Y+1 (un paso hacia abajo)
  nuevoElemento.x = SERPIENTE[0].x
  nuevoElemento.y = SERPIENTE[0].y + 1
  // Insertamos la nueva cabeza al principio y eliminamos la cola
  SERPIENTE.unshift(nuevoElemento)
  SERPIENTE.pop()
}

// Mueve la serpiente un paso hacia arriba
function moverArriba(){
  let nuevoElemento = {x:0, y:0}
  let posicionAnterior = {x: 0, y: 0} // (variable no utilizada, dejada tal cual)
  // Si la cabeza se saldría del canvas hacia arriba, no hacemos nada
  if((SERPIENTE[0].y - 1) * TAMANIO_CELDA < 0)
    return
  // La nueva cabeza tiene X igual e Y-1 (un paso hacia arriba)
  nuevoElemento.x = SERPIENTE[0].x
  nuevoElemento.y = SERPIENTE[0].y - 1
  // Insertamos la nueva cabeza al principio y eliminamos la cola
  SERPIENTE.unshift(nuevoElemento)
  SERPIENTE.pop()
}

// Arranca el juego: empieza a llamar a moverSerpiente cada 500ms (2 veces por segundo)
function iniciarJuego(){
  intervaloSerpiente = setInterval(moverSerpiente, 500);
}

// Pausa el juego: cancela el intervalo para que la serpiente deje de moverse
function pausarJuego(){
  clearInterval(intervaloSerpiente);
}

// Cambia la dirección de movimiento de la serpiente (se llama desde los botones del HTML)
function cambiarDireccion(direccion){
  direccionActual = direccion;
}

// Pinta la comida en su posición actual del array comida (coordenada de celda, no píxeles)
function dibujarComida(){
  pintarCoordenada(comida[0].x, comida[0].y, "red"); // La comida se pinta en rojo
}