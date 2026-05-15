// Obtenemos el elemento canvas del HTML por su ID para poder dibujar cosas en él
// canvas es el lienzo HTML donde se renderiza todo el juego visualmente
const canvas = document.getElementById("canvasJuego");

// Obtenemos el contexto 2D del canvas, que es la herramienta con la que dibujamos
// ctx es el objeto con todos los métodos de dibujo (líneas, rectángulos, texto, etc.)
const ctx = canvas.getContext("2d");



// Variable que guardará el identificador del intervalo del juego (para poder pausarlo)
// intervaloSerpiente almacena el ID que devuelve setInterval, necesario para cancelarlo con clearInterval
let intervaloSerpiente;

// Dirección actual hacia donde se mueve la serpiente
// direccionActual puede ser: "arriba", "abajo", "izquierda" o "derecha"
let direccionActual = "arriba";



// Tamaño en píxeles de cada celda del tablero
// TAMANIO_CELDA define cuántos píxeles ocupa cada cuadradito de la cuadrícula (25x25 px)
const TAMANIO_CELDA = 25



// Array con las posiciones de cada segmento de la serpiente (cabeza primero)
// Cada objeto {x, y} representa una celda del tablero que ocupa la serpiente
// El índice 0 es siempre la cabeza; el último índice es siempre la cola
let SERPIENTE = [
  { x: 14, y: 13 }, // cabeza: el segmento que guía el movimiento y detecta colisiones
  { x: 14, y: 14 }, // segundo segmento del cuerpo
  { x: 14, y: 15 }, // tercer segmento del cuerpo
  { x: 14, y: 16 }  // cola: último segmento, se elimina en cada movimiento (salvo que coma)
]



// posicionComida guarda las coordenadas de celda (no píxeles) donde está la comida en el tablero
// Cuando la cabeza de la serpiente coincide con esta posición, se suma un punto
let posicionComida = {x:5,y:5};



// contadorPuntos lleva la cuenta de cuántas veces la serpiente ha comido
// Se usa también para calcular cuándo aumentar la velocidad (cada 2 puntos)
let contadorPuntos = 0;



// juegoTerminado es una bandera booleana que indica si el juego ya terminó
// Cuando es true, se detiene el movimiento de la serpiente y se muestra "Game Over"
let juegoTerminado = false;



// velocidadSerpiente controla qué tan rápido se mueve la serpiente
// Se usa como: setInterval(moverSerpiente, 1000 - velocidadSerpiente)
// A mayor valor de velocidadSerpiente, menor es el intervalo y más rápido se mueve
// Empieza en 600 (intervalo de 400ms) y sube hasta un máximo de 800 (intervalo de 200ms)
let velocidadSerpiente = 600;



// objetoDeColision es un arreglo de objetos {x, y} que representan celdas peligrosas (muros/obstáculos)
// Si la cabeza de la serpiente choca con alguna de estas celdas, el juego termina
// Al comer comida, se añade un nuevo obstáculo aleatorio al arreglo para aumentar la dificultad
let objetoDeColision = [
  {x:22,y:20}, // primer obstáculo inicial: celda columna 22, fila 20
  {x:14,y:17}  // segundo obstáculo inicial: celda columna 14, fila 17 (justo debajo de la cola inicial)
];



// sumarPuntos se encarga de incrementar el puntaje, aumentar la velocidad cada 2 puntos,
// agregar un nuevo obstáculo aleatorio al tablero y actualizar el marcador en el HTML
function sumarPuntos(puntos){
  // Incrementa el contador de puntos en 1
  contadorPuntos++;

  // Cada 2 puntos se aumenta la velocidad, siempre y cuando no supere el límite de 800
  if(contadorPuntos % 2 == 0 && velocidadSerpiente <= 800){
    // Sube la velocidad sumando 100 al valor actual
    velocidadSerpiente += 100;
    // Cancela el intervalo anterior para reemplazarlo con el nuevo más rápido
    clearInterval(intervaloSerpiente)
    // Crea un nuevo intervalo con el tiempo actualizado (menor tiempo = más rápido)
    intervaloSerpiente = setInterval(moverSerpiente,1000 - velocidadSerpiente);
  } 

  // Si en este mismo movimiento también se atrapó comida, se genera un nuevo obstáculo aleatorio
  // Nota: atraparComida() aquí ya es true porque se llamó justo después de comer
  if(atraparComida() == true){
    // nuevaX es la columna aleatoria dentro del rango del canvas
    let nuevaX = Math.floor(Math.random() * (canvas.width / TAMANIO_CELDA));
    // nuevaY es la fila aleatoria dentro del rango del canvas
    let nuevaY = Math.floor(Math.random() * (canvas.height / TAMANIO_CELDA));

    // Se agrega el nuevo obstáculo al arreglo de colisiones
    objetoDeColision.push({x: nuevaX, y: nuevaY})
  }

  // Selecciona el elemento HTML con id "puntaje" y actualiza su contenido con el puntaje actual
  let etiquetaPuntaje = document.getElementById("puntaje")
  etiquetaPuntaje.innerHTML = contadorPuntos;
}

// Dibujamos el estado inicial del juego al cargar la página
dibujarTodo();



// =========================
// FUNCIONES DE DIBUJO
// =========================



// Función principal de dibujo: borra el canvas y repinta todo desde cero
// Se llama en cada tick del juego para reflejar el estado actualizado
function dibujarTodo() {
  limpiarCanvas();    // Borra todo lo que había
  dibujarTablero();   // Pinta la cuadrícula con números
  dibujarSerpiente(); // Pinta la serpiente encima
  pintarComida();     // Pinta la comida
  dibujarObjetoDeDaño()//Pinta muro aleatorio
}



// Borra completamente el canvas de esquina a esquina
// Sin esto, los dibujos anteriores quedarían superpuestos al redibujar
function limpiarCanvas() {
  // 0,0 es la esquina superior izquierda; canvas.width/height llega hasta la esquina inferior derecha
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}



// Dibuja el tablero completo: líneas de la cuadrícula y números de coordenadas
// Llama a las cuatro funciones que construyen la cuadrícula visual
function dibujarTablero(){
  dibujarLineasVerticales()   // Líneas de arriba a abajo
  dibujarLineasHorizontales() // Líneas de izquierda a derecha
  dibujarNumerosEnY()         // Números a lo largo del eje Y
  dibujarNumerosEnX()         // Números a lo largo del eje X
}



// Dibuja todas las líneas verticales de la cuadrícula, separadas por TAMANIO_CELDA píxeles
// El bucle recorre el canvas de izquierda a derecha saltando de 25 en 25 píxeles
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
// El bucle recorre el canvas de arriba a abajo saltando de 25 en 25 píxeles
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
// El contador va de 0 hasta la cantidad de filas del tablero, una por cada celda
function dibujarNumerosEnY(){
  ctx.fillStyle = "white"  // Color del texto: blanco
  ctx.font = "12px Arial"  // Fuente y tamaño del texto
  // contador lleva el número que se imprime en cada fila (empieza en 0)
  let contador = 0
  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.fillText(contador, 5, y + 12) // Escribe el número 5px desde la izquierda, 12px hacia abajo (para que no quede cortado)
    contador++
  }
}



// Dibuja los números de columna (eje X) encima de cada línea vertical
// El contador va de 0 hasta la cantidad de columnas del tablero, una por cada celda
function dibujarNumerosEnX(){
  ctx.fillStyle = "white"  // Color del texto: blanco
  ctx.font = "12px Arial"  // Fuente y tamaño del texto
  // contador lleva el número que se imprime en cada columna (empieza en 0)
  let contador = 0
  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.fillText(contador, x + 2, 12) // Escribe el número 2px a la derecha de la línea y a 12px desde arriba
    contador++
  }
}



// Pinta un cuadrado de color en la celda indicada por coordenadas de cuadrícula (no píxeles)
// Decide el color según si la celda es: cabeza, obstáculo, comida o cuerpo normal
//Corregí el tema de los parametros, ya no recibe 3, solo recibe los dos que se suponía que debía de recibir
//si no estoy mal se refería a esta función
function pintarCoordenada(x, y){
  // Convertimos coordenadas de celda a píxeles reales en el canvas
  // posicionX es la coordenada horizontal en píxeles donde empieza la celda
  let posicionX = x * TAMANIO_CELDA
  // posicionY es la coordenada vertical en píxeles donde empieza la celda
  let posicionY = y * TAMANIO_CELDA

  // Solo pintamos si la celda está dentro de los límites del canvas
  if (posicionX < canvas.width && posicionY < canvas.height){
    //Acá lo que se ara con el if anidado es que si es la cabeza de la serpiente (por el tamaño del arreglo), quiero que
    //se pinte de verde la cabeza
    if(x === SERPIENTE[0].x && y === SERPIENTE[0].y){
      // Si las coordenadas coinciden con la cabeza (índice 0 del arreglo SERPIENTE), se pinta verde
      ctx.fillStyle = "green"
    }else if (objetoDeColision.some(obj => obj.x === x && obj.y === y)) {
      // Si las coordenadas coinciden con algún obstáculo del arreglo objetoDeColision, se pinta amarillo
      // .some() recorre el arreglo y devuelve true si al menos un objeto coincide con x e y
    ctx.fillStyle = "yellow";
    }else if(x === posicionComida.x && y === posicionComida.y){
      // Si las coordenadas coinciden con la posición actual de la comida, se pinta rojo
      ctx.fillStyle ="red"//color de la comida
    }else{
      // Si no es ninguna de las anteriores, es un segmento normal del cuerpo de la serpiente
      ctx.fillStyle = "blue"//color del cuerpo  
    }
    // Dibuja el cuadrado relleno del color definido arriba
    ctx.fillRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA)
    ctx.strokeStyle = "red" //color del borde
    // Dibuja el borde del cuadrado encima del relleno
    ctx.strokeRect(posicionX, posicionY, TAMANIO_CELDA, TAMANIO_CELDA)
  }
}



// Recorre todos los segmentos de la SERPIENTE y los pinta en el canvas
// Usa pintarCoordenada para que cada segmento reciba el color que le corresponde
function dibujarSerpiente(){
  // colorCabeza se declara pero no se usa directamente; la lógica de color está en pintarCoordenada
  let colorCabeza = "green"  // La cabeza (índice 0) se pinta de verde
  for(let i = 0; i < SERPIENTE.length; i++){
    // serp es el segmento actual del arreglo SERPIENTE en la iteración i
    let serp = SERPIENTE[i]
    if(i == 0){
      pintarCoordenada(serp.x, serp.y) // Cabeza en verde
    } else {
      pintarCoordenada(serp.x, serp.y)      // Cuerpo en azul
    }
  }
}



// Función que se ejecuta en cada tick del intervalo: mueve la serpiente y redibuja todo
// Es la función central del game loop; se repite automáticamente gracias a setInterval
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

  // Si el juego terminó durante el movimiento (colisión o salida del mapa), se detiene aquí
  if(juegoTerminado){
    return null;
  }
  // Después de mover, redibujamos todo el canvas para reflejar la nueva posición
  dibujarTodo();
}



// Mueve la serpiente un paso hacia la derecha
// Crea una nueva cabeza en X+1, la inserta al frente del arreglo y elimina la cola (a menos que haya comida)
function moverDerecha(){
  // nuevoElemento es el objeto {x, y} que representará la nueva posición de la cabeza
  let nuevoElemento = {x:0, y:0}
  // Si la cabeza se saldría del canvas hacia la derecha, no hacemos nada
  if((SERPIENTE[0].x + 2) * TAMANIO_CELDA > canvas.width)
    {
    gameOver();
    return;
  }
  // La nueva cabeza tiene X+1 (un paso a la derecha) e Y igual
  nuevoElemento.x = SERPIENTE[0].x + 1
  nuevoElemento.y = SERPIENTE[0].y
  // Insertamos la nueva cabeza al principio del array
  SERPIENTE.unshift(nuevoElemento)
  // Eliminamos el último elemento (la cola), manteniendo el mismo tamaño
  if(atraparComida() == true){
    // Si la nueva cabeza está sobre la comida, se suma punto y se reubica la comida aleatoriamente
    sumarPuntos();
    posicionComida.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    posicionComida.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }else{
    // Si no hay comida, se elimina la cola para mantener el tamaño de la serpiente
    SERPIENTE.pop()
  }

  // Verifica si la cabeza chocó con algún obstáculo; si es así, termina el juego
  if(colisionObjetoDeDaño() == true){
    gameOver()
    // Nota: estas dos líneas reasignan .x y .y a objetoDeColision (que es un arreglo),
    // lo cual no tiene efecto real; el reposicionamiento correcto se hace dentro de sumarPuntos
    objetoDeColision.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    objetoDeColision.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }
}



// Mueve la serpiente un paso hacia la izquierda
// Crea una nueva cabeza en X-1, la inserta al frente del arreglo y elimina la cola (a menos que haya comida)
function moverIzquierda(){
  // nuevoElemento es el objeto {x, y} que representará la nueva posición de la cabeza
  let nuevoElemento = {x:0, y:0}
  let posicionAnterior = {x: 0, y: 0} // (variable no utilizada, dejada tal cual)
  // Si la cabeza se saldría del canvas hacia la izquierda, no hacemos nada
  if((SERPIENTE[0].x - 1) * TAMANIO_CELDA < 0){
    gameOver();
    return;
  }
  // La nueva cabeza tiene X-1 (un paso a la izquierda) e Y igual
  nuevoElemento.x = SERPIENTE[0].x - 1
  nuevoElemento.y = SERPIENTE[0].y
  // Insertamos la nueva cabeza al principio y eliminamos la cola
  SERPIENTE.unshift(nuevoElemento)
  if(atraparComida() == true){
    // Si la nueva cabeza está sobre la comida, se suma punto y se reubica la comida aleatoriamente
    sumarPuntos();
    posicionComida.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    posicionComida.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }else{
    // Si no hay comida, se elimina la cola para mantener el tamaño de la serpiente
    SERPIENTE.pop()
  }

  // Verifica si la cabeza chocó con algún obstáculo; si es así, termina el juego
  if(colisionObjetoDeDaño() == true){
    gameOver()
    objetoDeColision.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    objetoDeColision.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }
}



// Mueve la serpiente un paso hacia abajo
// Crea una nueva cabeza en Y+1, la inserta al frente del arreglo y elimina la cola (a menos que haya comida)
function moverAbajo(){
  // nuevoElemento es el objeto {x, y} que representará la nueva posición de la cabeza
  let nuevoElemento = {x:0, y:0}
  let posicionAnterior = {x: 0, y: 0} // (variable no utilizada, dejada tal cual)
  // Si la cabeza se saldría del canvas hacia abajo, no hacemos nada
  if((SERPIENTE[0].y + 2) * TAMANIO_CELDA > canvas.height){
    gameOver();
    return;
  }
  // La nueva cabeza tiene X igual e Y+1 (un paso hacia abajo)
  nuevoElemento.x = SERPIENTE[0].x
  nuevoElemento.y = SERPIENTE[0].y + 1
  // Insertamos la nueva cabeza al principio y eliminamos la cola
  SERPIENTE.unshift(nuevoElemento)
  if(atraparComida() == true){
    // Si la nueva cabeza está sobre la comida, se suma punto y se reubica la comida aleatoriamente
    sumarPuntos()
    posicionComida.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    posicionComida.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }else{
    // Si no hay comida, se elimina la cola para mantener el tamaño de la serpiente
    SERPIENTE.pop()
  }

  // Verifica si la cabeza chocó con algún obstáculo; si es así, termina el juego
  if(colisionObjetoDeDaño() == true){
    gameOver()
    objetoDeColision.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    objetoDeColision.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }
}



// Mueve la serpiente un paso hacia arriba
// Crea una nueva cabeza en Y-1, la inserta al frente del arreglo y elimina la cola (a menos que haya comida)
// También contiene el listener de teclado (está aquí por la estructura original del código)
function moverArriba(){
  // nuevoElemento es el objeto {x, y} que representará la nueva posición de la cabeza
  let nuevoElemento = {x:0, y:0}
  let posicionAnterior = {x: 0, y: 0} // (variable no utilizada, dejada tal cual)
  // Si la cabeza se saldría del canvas hacia arriba, no hacemos nada
  if((SERPIENTE[0].y - 1) * TAMANIO_CELDA < 0){
    gameOver();
    return;
  }
  // La nueva cabeza tiene X igual e Y-1 (un paso hacia arriba)
  nuevoElemento.x = SERPIENTE[0].x
  nuevoElemento.y = SERPIENTE[0].y - 1
  // Insertamos la nueva cabeza al principio y eliminamos la cola
  SERPIENTE.unshift(nuevoElemento)



  // Escuchamos el evento 'keydown' (tecla presionada) en toda la ventana
window.addEventListener("keydown", function(event) {
  // Evita que la página se desplace con las flechas
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.code)) {
      event.preventDefault();
  }

  // Cambia la dirección según la tecla presionada, evitando que la serpiente se mueva en sentido contrario
  switch (event.code) {
    case "ArrowUp":
      // Solo permite ir arriba si la serpiente no venía bajando (evita colisión consigo misma)
      if (direccionActual !== "abajo") cambiarDireccion("arriba");
      break;
    case "ArrowDown":
      // Solo permite ir abajo si la serpiente no venía subiendo
      if (direccionActual !== "arriba") cambiarDireccion("abajo");
      break;
    case "ArrowLeft":
      // Solo permite ir izquierda si la serpiente no venía yendo a la derecha
      if (direccionActual !== "derecha") cambiarDireccion("izquierda");
      break;
    case "ArrowRight":
      // Solo permite ir derecha si la serpiente no venía yendo a la izquierda
      if (direccionActual !== "izquierda") cambiarDireccion("derecha");
      break;
  }
});



  if(atraparComida() == true){
    // Si la nueva cabeza está sobre la comida, se suma punto y se reubica la comida aleatoriamente
    sumarPuntos();
    posicionComida.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    posicionComida.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }else{
    // Si no hay comida, se elimina la cola para mantener el tamaño de la serpiente
    SERPIENTE.pop()
  }

  // Verifica si la cabeza chocó con algún obstáculo; si es así, termina el juego
  if(colisionObjetoDeDaño() == true){
    gameOver()
    objetoDeColision.x = Math.floor(Math.random()*(canvas.width/TAMANIO_CELDA));
    objetoDeColision.y = Math.floor(Math.random()*(canvas.height/TAMANIO_CELDA));
  }
}



// Arranca el juego: empieza a llamar a moverSerpiente cada 500ms (2 veces por segundo)
// Inicia el intervalo del game loop y actualiza el estado visible en pantalla
function iniciarJuego(){
  // Crea el intervalo que llamará a moverSerpiente repetidamente según la velocidad actual
  intervaloSerpiente = setInterval(moverSerpiente, 1000 - velocidadSerpiente);
  cambiarEstado("Jugando");
}



// Pausa el juego: cancela el intervalo para que la serpiente deje de moverse
// La serpiente y el tablero quedan congelados en pantalla hasta que se reanude
function pausarJuego(){
  clearInterval(intervaloSerpiente);
  cambiarEstado("Descanzando")
}



// Cambia la dirección de movimiento de la serpiente (se llama desde los botones del HTML)
// direccion debe ser uno de los valores: "arriba", "abajo", "izquierda", "derecha"
function cambiarDireccion(direccion){
  direccionActual = direccion;
}

//Ahora si pinta correctamente la comida de manera aleatoria, el problema era que multiplicaba directamente con el canvas
//había que encerrar la división entre paréntesis
// pintarComida llama a pintarCoordenada con la posición actual de la comida para que se dibuje en el canvas
function pintarComida(){
    pintarCoordenada(posicionComida.x,posicionComida.y)
}

//verificando el código el botón de pausa funciona correctamente junto al de iniciar



//Ahora toca hacer la función de atraparComida



// atraparComida verifica si la cabeza de la serpiente está exactamente en la misma celda que la comida
// Devuelve true si hay coincidencia (se "comió"), false si no
function atraparComida(){
  if(SERPIENTE[0].x === posicionComida.x && SERPIENTE[0].y === posicionComida.y){
    return true;
  }else{
    return false;
  }
}



// cambiarEstado actualiza el texto del elemento HTML con id "estado" para mostrar el estado actual del juego
// Los posibles estados son: "Jugando", "Descanzando", "Game Over", "Listo"
function cambiarEstado(estado){
  document.getElementById("estado").innerText = estado;
}



// gameOver se ejecuta cuando la serpiente choca con una pared o un obstáculo
// Activa la bandera juegoTerminado para detener el movimiento y cambia el estado a "Game Over"
function gameOver(){
  juegoTerminado = true
  cambiarEstado("Game Over")
}



// reiniciarJuego restaura todas las variables al estado inicial para poder volver a jugar
// Limpia el canvas, reposiciona la serpiente, restablece el puntaje, la velocidad y los obstáculos
function reiniciarJuego(){
  limpiarCanvas();
  dibujarTablero();
  // Se reestablece el arreglo SERPIENTE a su posición y tamaño originales (4 segmentos verticales)
  SERPIENTE = [
    { x: 14, y: 13 }, // cabeza: posición inicial de arranque
    { x: 14, y: 14 }, // segundo segmento
    { x: 14, y: 15 }, // tercer segmento
    { x: 14, y: 16 }  // cola: último segmento inicial
  ]
  // Resetea el marcador visible en el HTML a 0
  document.getElementById("puntaje").innerText = 0
  // Resetea el contador interno de puntos a 0
  contadorPuntos = 0
  // Restablece la dirección inicial de movimiento
  direccionActual = "arriba"
  cambiarEstado("Listo");
  // Desactiva la bandera de fin de juego para que el movimiento pueda ocurrir nuevamente
  juegoTerminado = false
  pintarComida();
  dibujarSerpiente();
  // Cancela cualquier intervalo activo antes de reiniciar (evita que corran dos intervalos a la vez)
  clearInterval(intervaloSerpiente)
  // Restablece la velocidad al valor inicial
  velocidadSerpiente = 600;
  dibujarObjetoDeDaño()
  // Restablece el arreglo de obstáculos a los dos obstáculos iniciales fijos
  objetoDeColision = [
  {x:22,y:20}, // primer obstáculo fijo al reiniciar
  {x:14,y:17}  // segundo obstáculo fijo al reiniciar
  ];
}



// dibujarObjetoDeDaño recorre el arreglo objetoDeColision y pinta cada obstáculo en el canvas
// Usa pintarCoordenada para que cada obstáculo aparezca en su celda correspondiente con color amarillo
function dibujarObjetoDeDaño(){
    // i recorre cada índice del arreglo de obstáculos de principio a fin
    for(let i = 0; i < objetoDeColision.length; i++){
      // Pinta la celda del obstáculo i usando sus coordenadas x e y
      pintarCoordenada(objetoDeColision[i].x,objetoDeColision[i].y)
    }
}



// colisionObjetoDeDaño verifica si la cabeza de la serpiente coincide con algún obstáculo del arreglo
// Si hay colisión, detiene el intervalo del juego y devuelve true; si no hay colisión, devuelve false
function colisionObjetoDeDaño(){
  // i recorre cada obstáculo en objetoDeColision para comparar su posición con la cabeza
  for(let i = 0; i < objetoDeColision.length; i++){
    if(SERPIENTE[0].x === objetoDeColision[i].x && SERPIENTE[0].y === objetoDeColision[i].y){
      // Si la cabeza (índice 0) coincide en x e y con el obstáculo i, se detiene el juego
      clearInterval(intervaloSerpiente);
      return true;
    }
  }
  // Si ningún obstáculo coincidió con la cabeza, no hay colisión
  return false;
}