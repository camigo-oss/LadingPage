# 1. Instrucciones de inicio/ejecución de vuestra web
Para ejecutar y visualizar correctamente el proyecto de la Landing Page, sigue estos pasos: 

  Clonar el repositorio:
  git clone de la url de mi repositorio, es decir, git clone https://github.com/camigo-oss/LadingPage

Abrir la carpeta del proyecto.
Ejecutar el archivo index.html directamente en el navegador.


Estructura del proyecto: Debes asegúrarte de tener en el mismo directorio los archivos principales: el archivo HTML (index.html), la hoja de estilos CSS (styles.css) y el archivo de script (script.js).

Dependencias externas: El proyecto utiliza librerías externas que se cargan mediante enlaces CDN, destacando GSAP (para la animación de zoom de la sección final) y fuentes de Google Fonts (Cormorant Garamond y DM Sans).

Ejecución: Puedes abrir el archivo index.html directamente en cualquier navegador web moderno (Chrome, Firefox, Edge o Safari). Para una experiencia de desarrollo óptima, se recomienda utilizar un servidor local (como la extensión Live Server de Visual Studio Code) que permita recargar los cambios en tiempo real.

# 2. Enumeración de las 5 funcionalidades más importantes implementadas

- Cursor personalizado mejorado
- Hero cinematográfico con scroll (Parallax y Keyframes)
- Galería interactiva en las Cards
- Filtros de destinos y Favoritos (localStorage)
- Formulario multi-step, Animación GSAP Zoom-Through
- Backend Enlace a WhatsApp

# 3. Funcionalidad 1: Cursor personalizado mejorado
## 3.1. Descripción por escrito del comportamiento de la funcionalidad (Qué hace)
Oculta el cursor por defecto y lo sustituye por un cursor personalizado.

## 3.2. Explicación del funcionamiento (Cómo lo hace)
Mediante la función  initCursor(), verifica si el dispositivo tiene capacidades táctiles ('ontouchstart' in window). Si es así, desactiva el cursor personalizado para mantener la accesibilidad, utiliza un bucle requestAnimationFrame para calcular la posición del seguidor (follower) respecto al cursor principal, detecta los eventos mouseover y mouseout sobre los selectores interactivos almacenados en la variable hoverSels para añadir clases CSS y modificar las etiquetas de texto del cursor.

## 3.3. Fragmentos de código más relevantes y explicación
``` JavaScript
let fx = 0, fy = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursor.style.left = cx + 'px';
  cursor.style.top = cy + 'px';
});

function animFollower() {
  fx += (cx - fx) * 0.10;
  fy += (cy - fy) * 0.10;
  follower.style.left = fx + 'px';
  follower.style.top = fy + 'px';
  requestAnimationFrame(animFollower);
}
animFollower();
 ```
Qué hace: Actualiza la posición del cursor principal con la posición del ratón y usa un algoritmo de interpolación para que el elemento .cursor-follower se desplace de forma fluida hacia el objetivo.

Relación con otros archivos: Se conecta con el archivo styles.css para posicionar los elementos con position: fixed y modificar el estilo de .cursor y .cursor-follower.

# 4. Funcionalidad 2: Hero cinematográfico con scroll (Parallax y Keyframes)
## 4.1. Descripción por escrito del comportamiento de la funcionalidad (Qué hace)
Muestra un hero que reacciona dinámicamente al scroll, revelando elementos, actualizando una barra de progreso, aplicando efectos de paralaje (parallax) sobre la imagen y texto, e intercambiando la imagen de fondo según los fotogramas del scroll.

## 4.2. Explicación del funcionamiento (Cómo lo hace)
Utiliza IntersectionObserver para iniciar el contador numérico de estadísticas cuando la sección es visible.

Controla el evento scroll de la ventana para calcular el porcentaje de desplazamiento de la sección y aplicar transformaciones mediante requestAnimationFrame para un rendimiento óptimo.

Pre-carga cuatro imágenes distintas y las intercambia de manera fluida utilizando transiciones de opacidad y escala según el porcentaje de desplazamiento.

## 4.3. Fragmentos de código más relevantes y explicación
```JavaScript
function changeHeroImage(idx) {
  if (idx === lastImgIdx || isChanging || !img) return;
  isChanging = true;
  img.style.transition = 'opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease';
  img.style.opacity = '0';
  img.style.transform = 'scale(1.06)';

  setTimeout(() => {
    img.src = heroImages[idx];
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
    lastImgIdx = idx;
    setTimeout(() => { isChanging = false; }, 800);
  }, 400);
}
```
Qué hace: Controla el cambio de imagen de fondo del hero de forma controlada y evita transiciones simultáneas mientras se realiza un cambio.

Relación con otros archivos: Se relaciona directamente con #hero-main-img y el contenedor #hero-img-wrap en index.html.

# 5. Funcionalidad 3: Galería interactiva en las Cards
## 5.1. Descripción por escrito del comportamiento de la funcionalidad (Qué hace)
Al pasar el cursor sobre las tarjetas de destino (.destino-card), se inicia un carrusel automático que va alternando entre las distintas imágenes disponibles en la tarjeta cada 900ms, actualizando los indicadores visuales (dots).

## 5.2. Explicación del funcionamiento (Cómo lo hace)
Crea de manera dinámica los puntos indicadores (dots) en el contenedor .card-gallery-dots según la cantidad de imágenes dentro de la tarjeta.

Utiliza temporizadores (setInterval) controlados por los eventos mouseenter y mouseleave.

Mantiene el índice de la imagen actual (currentIdx) y asegura que la transición al salir de la tarjeta devuelva el estado a la imagen inicial.

## 5.3. Fragmentos de código más relevantes y explicación
```JavaScript
function goToImg(idx) {
  const prev = imgs[currentIdx];
  const next = imgs[idx];

  prev.classList.remove('card-img-active');
  prev.classList.add('card-img-leaving');
  setTimeout(() => prev.classList.remove('card-img-leaving'), 550);

  next.classList.add('card-img-active');

  const dots = getDots();
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));

  currentIdx = idx;
}
```
Qué hace: Realiza la animación de cambio entre una imagen activa y la siguiente, aplicando y eliminando clases de CSS y actualizando los dots.

Relación con otros archivos: Afecta directamente a los elementos de la clase .card-img dentro de .destino-card en index.html y styles.css.

# 6. Funcionalidad 4: Filtros de destinos y Favoritos (localStorage)
## 6.1. Descripción por escrito del comportamiento de la funcionalidad (Qué hace)
Filtros: Permite mostrar u ocultar los destinos según el tipo seleccionado mediante un efecto de opacidad y desplazamiento.

Favoritos: Permite al usuario guardar o eliminar destinos, actualizando el contador y la lista en un panel lateral persistente usando localStorage.

## 6.2. Explicación del funcionamiento (Cómo lo hace)
El filtro añade y elimina la clase .hidden a los elementos .destino-card utilizando una transición de opacidad y transformación.

La gestión de favoritos utiliza localStorage con la clave viajes_estelares_fav_v2 para asegurar que los elementos persistan entre sesiones de navegación.

## 6.3. Fragmentos de código más relevantes y explicación
```JavaScript
favBtns.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const id = btn.dataset.id;
    let favs = getFavorites();
    const isSaved = favs.includes(id);
    if (isSaved) { favs = favs.filter(f => f !== id); showToast('Eliminado de favoritos'); }
    else { favs.push(id); showToast(`✦ ${destinoData[id]?.name} guardado en favoritos`); }
    saveFavorites(favs); refreshFavBtns();
  });
});
```
Qué hace: Alterna el estado de un destino en favoritos, lo guarda en el almacenamiento local y muestra un mensaje emergente (toast).

Relación con otros archivos: Se conecta con el panel lateral #favoritos-panel en index.html y utiliza la función de utilidad showToast.

# 7. Funcionalidad 5: Formulario multi-step y Animación GSAP Zoom-Through
## 7.1. Descripción por escrito del comportamiento de la funcionalidad (Qué hace)
Formulario: Permite realizar una reserva en tres pasos (selección, datos personales y presupuesto) validando la información en cada paso antes de enviar los datos.

Animación GSAP: Efecto visual en la sección .zoom-section que fija la pantalla y escala el contenedor hasta revelar la información final al hacer scroll.

## 7.2. Explicación del funcionamiento (Cómo lo hace)
El formulario controla los estados mediante la función goToStep(n) y valida los campos requeridos con mensajes dinámicos usando showToast.

Utiliza el plugin ScrollTrigger de la librería GSAP para generar una animación continua conectada al scroll del usuario.

## 7.3. Fragmentos de código más relevantes y explicación
```JavaScript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".zoom-section",
    start: "top top",
    end: "+=3000",
    scrub: 1,
    pin: true,
  }
});

tl.to(zoomWrapper, {
  scale: 35, 
  ease: "power2.in",
  duration: 1
}, 0);
```
Qué hace: Fija la sección .zoom-section mediante la propiedad pin de ScrollTrigger y realiza una escala profunda del contenedor (zoomWrapper).

Relación con otros archivos: Se relaciona con la librería externa GSAP y los elementos .zoom-wrapper en index.html.

# 8. Funcionalidades adicionales
## 8.1 Descripción por escrito del comportamiento de la funcionalidad (Qué hace):
Muestra un temporizador en tiempo real que indica los días, horas y minutos restantes antes de que finalice la promoción (fijada el 30 de junio del año en curso).

## 8.2 Explicación del funcionamiento (Cómo lo hace): 
Calcula la diferencia en milisegundos entre la fecha actual y la fecha objetivo usando el objeto Date. Se actualiza periódicamente mediante un intervalo cada 30 segundos, completando los ceros a la izquierda mediante el método pad(n).

## 8.3 Fragmentos de código más relevantes de la funcionalidad adicional y explicación:

```JavaScript
const pad = n => String(n).padStart(2, '0');
function tick() {
  const diff = target - new Date();
  if (diff <= 0) { cdDays.textContent = cdHours.textContent = cdMins.textContent = '00'; return; }
  cdDays.textContent  = pad(Math.floor(diff / 86400000));
  cdHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
  cdMins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
}
tick();
setInterval(tick, 30000);
```
Explicación: * target almacena la fecha del 30 de junio del año actual.

La función tick() resta la fecha actual a la fecha objetivo y divide el resultado para obtener los días (entre 86400000 ms), horas y minutos.

setInterval(..., 30000) ejecuta la función cada 30 segundos actualizando la vista.

Relación: Afecta directamente a los elementos con los IDs #cd-days, #cd-hours y #cd-mins en index.html.

# 9. Funcionalidad Backend (WhatsApp)
## 9.1. Descripción por escrito del comportamiento de la funcionalidad (Qué hace)
Permite a los usuarios contactar directamente con la agencia de viajes a través de WhatsApp. Al hacer clic en el enlace, el usuario es redirigido a la aplicación de WhatsApp con un chat iniciado en el número corporativo de la agencia.

## 9.2. Explicación del funcionamiento (Cómo lo hace)
Utiliza un enlace HTML (<a>) en el footer con el protocolo https://wa.link/ configurado en el href. Al ser un enlace estático, el navegador web interpreta la URL abriendo un nuevo destino en una pestaña o redirigiendo a la app.

## 9.3. Fragmentos de código más relevantes y explicación
```HTML
<a href="https://wa.link/59xl3g">WhatsApp</a>
```
Qué hace: Redirige al cliente al enlace de acortador de WhatsApp (wa.link) en el número corporativo de Viajes Estelares.

Relación con otros archivos: Se ubica en el footer del archivo index.html y afecta a la experiencia de usuario facilitando la comunicación directa.

# 10. Responsividad
## 10.1. Descripción por escrito del comportamiento de la responsividad (Qué hace)
Garantiza que la página se adapte a dispositivos móviles, tabletas y ordenadores de escritorio, ajustando el diseño de las tarjetas, el menú de navegación y los componentes interactivos.

## 10.2. Explicación del funcionamiento (Cómo lo hace)
Utiliza Media Queries en CSS junto con clases en JavaScript que miden el ancho de la ventana (window.innerWidth) para recalcular el número de elementos visibles en el slider de testimonios, adaptando la navegación móvil cuando se activa el botón #hamburger.

## 10.3. Fragmentos de código más relevantes y explicación
```JavaScript
function getPerPage() {
  if (window.innerWidth >= 900) return 3;
  if (window.innerWidth >= 600) return 2;
  return 1;
}
```
Qué hace: Devuelve la cantidad de testimonios que deben mostrarse en el slider dependiendo de la resolución de la pantalla del usuario.

Relación con otros archivos: Afecta al desplazamiento (translateX) del contenedor #testimonios-track en styles.css y script.js.
