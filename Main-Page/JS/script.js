// 0. CONFIGURACIÓN API GOOGLE CALENDAR
const API_KEY = 'AIzaSyA0Q0QHWwzBKpPy598iI0hiL-UTIzG7Ojc';
const CALENDAR_ID = 'robotica.itse@gmail.com';

// Exponer handleClientLoad al ámbito global para que gapi.js pueda llamarlo.
window.handleClientLoad = handleClientLoad;


// 4. Base de datos de contenido (Separada de la lógica)
const baseDeDatosContenido = {
  mision: {
    titulo: 'Nuestra Misión',
    texto:
      'Fomentar la pasión por la robótica y el desarrollo tecnologico mediante proyectos colaborativos y aprendizaje práctico.',
  },
  vision: {
    titulo: 'Nuestra Visión',
    texto:
      'Ser el club de referencia nacional en innovación tecnológica estudiantil para el año 2028.',
  },
  contacto: {
    titulo: 'Contáctanos',
    texto:
      'Envíanos un correo a robotica.itse@gmail.com o visítanos en el edificio de Innovacion Digital.',
  },
  about: {
    titulo: 'Sobre Nosotros',
    texto:
      'Somos un grupo de estudiantes apasionados por C++, Python y la electrónica.',
  },
  proyectoBrazo: {
    titulo: 'Brazo Robótico v1',
    texto: 'Nuestro primer proyecto de brazo robótico, diseñado para tareas de recolección y clasificación ligera.'
  },
  proyectoSumo: {
    titulo: 'Sumo Bot',
    texto: 'Un robot autónomo diseñado para competiciones de sumo, priorizando fuerza y estrategia.'
  },
  proyectoDron: {
    titulo: 'Dron Autónomo',
    texto: 'Un dron en desarrollo capaz de navegación autónoma y mapeo aéreo.'
  }
};


/**
 * Configura todos los eventos de interacción de la UI, como el menú hamburguesa y los desplegables.
 */
function configurarEventosInteraccion() {
  // 1. Lógica del Menú Lateral (Sidebar Drawer)
  const botonMenuHamburguesa = document.getElementById('botonMenuHamburguesa');
  const sidebarIzquierdo = document.getElementById('sidebarIzquierdo');

  if (botonMenuHamburguesa && sidebarIzquierdo) {
    botonMenuHamburguesa.addEventListener('click', () => {
      // Esto activa la clase CSS que anima el ancho de 0 a 220px
      sidebarIzquierdo.classList.toggle('activo');
      const isExpanded = sidebarIzquierdo.classList.contains('activo');
      botonMenuHamburguesa.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Eventos para los elementos del menú lateral
  const menuItems = document.querySelectorAll('.sidebar-left .menu-item');
  menuItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      const contentKey = event.target.dataset.contentKey;
      if (contentKey) {
        cargarContenido(contentKey);
      }
    });
  });

  // 2. Lógica del Dropdown de Proyectos
  const botonDespliegueProyectos = document.getElementById(
    'botonDespliegueProyectos',
  );
  const listaProyectos = document.getElementById('listaProyectos');

  if (botonDespliegueProyectos && listaProyectos) {
    botonDespliegueProyectos.addEventListener('click', () => {
      // Toggle the 'active-list' class
      listaProyectos.classList.toggle('active-list');

      // Update button text based on the presence of 'active-list'
      const isExpanded = listaProyectos.classList.contains('active-list');
      if (isExpanded) {
        botonDespliegueProyectos.textContent = 'Ocultar ▴';
      } else {
        botonDespliegueProyectos.textContent = 'Despliegue ▾';
      }
      botonDespliegueProyectos.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Eventos para los elementos de la lista de proyectos
  const projectListItems = document.querySelectorAll('#listaProyectos li');
  projectListItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      const contentKey = event.target.dataset.contentKey;
      if (contentKey) {
        cargarContenido(contentKey);
      }
    });
  });

  // 3. Interacción simple con el video
  const reproductorVideo = document.getElementById('reproductorVideo');
  if (reproductorVideo) {
    reproductorVideo.addEventListener('click', () => {
      reproductorVideo.style.background = '#000';
      reproductorVideo.innerHTML =
        '<span style="color:white;">Reproduciendo video... (Simulación)</span>';
    });
  }

  // 4. Lógica de Modo Oscuro
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    // Cargar preferencia al inicio
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }
}

function cargarContenido(claveDelContenido) {
  const tituloSeccion = document.getElementById('tituloSeccion');
  const textoDescripcion = document.getElementById('textoDescripcion');

  if (baseDeDatosContenido[claveDelContenido]) {
    tituloSeccion.textContent = baseDeDatosContenido[claveDelContenido].titulo;
    textoDescripcion.innerHTML = `<p>${baseDeDatosContenido[claveDelContenido].texto}</p>`;
  }
}

/**
 * Función que se llama automáticamente cuando la librería gapi se carga.
 */
function handleClientLoad() {
  gapi.load('client', () => {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    }).then(() => {
      console.log('Google API client initialized.');
      listarEventos(); // Intentar cargar eventos de la API
    }).catch((error) => {
      console.error('Error initializing Google API client', error);
      // Si falla la inicialización de la API, el calendario estático ya está visible
    });
  });
}

/**
 * Carga eventos de la API de Google Calendar y los muestra.
 */
function listarEventos() {
  const cuadriculaCalendario = document.getElementById('cuadriculaCalendario');
  const nombreMesActual = document.getElementById('nombreMesActual');

  // Obtenemos la fecha actual para el mes y año
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();
  const diaHoy = fechaActual.getDate();

  const nombresMeses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];

  if (nombreMesActual) {
    nombreMesActual.textContent = `${nombresMeses[mesActual]} ${anioActual}`;
  }

  // Si no hay cuadriculaCalendario, salimos
  if (!cuadriculaCalendario) {
    console.warn("Element 'cuadriculaCalendario' not found.");
    return;
  }

  // Limpiamos contenido previo (del estático o de un intento anterior)
  cuadriculaCalendario.innerHTML = '';

  // Calcular días del mes y primer día de la semana (como antes)
  const diasEnElMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const primerDiaSemana = new Date(anioActual, mesActual, 1).getDay(); // 0=Domingo, 1=Lunes

  // Rellenar espacios vacíos antes del día 1
  for (let i = 0; i < primerDiaSemana; i++) {
    cuadriculaCalendario.appendChild(document.createElement('div'));
  }

  // Obtener eventos del calendario
  gapi.client.calendar.events.list({
    'calendarId': CALENDAR_ID,
    'timeMin': (new Date(anioActual, mesActual, 1)).toISOString(),
    'timeMax': (new Date(anioActual, mesActual, diasEnElMes + 1)).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  }).then(response => {
    const events = response.result.items;
    const eventosPorDia = {};

    if (events) {
      events.forEach(event => {
        const start = event.start.dateTime || event.start.date;
        const eventDate = new Date(start);
        const day = eventDate.getDate();
        if (!eventosPorDia[day]) {
          eventosPorDia[day] = [];
        }
        eventosPorDia[day].push(event);
      });
    }

    // 5. Bucle para crear los días reales (1 al 28/29/30/31)
    for (let diaContador = 1; diaContador <= diasEnElMes; diaContador++) {
      const celdaDia = document.createElement('div');
      celdaDia.textContent = diaContador;
      celdaDia.classList.add('calendar-cell');

      // Resaltar el día de hoy
      if (diaContador === diaHoy) {
        celdaDia.classList.add('today');
        celdaDia.title = 'Hoy';
      }

      // Marcar días con eventos
      if (eventosPorDia[diaContador]) {
        celdaDia.classList.add('has-event');
        celdaDia.title = eventosPorDia[diaContador].map(e => e.summary).join('\\n');
      }

      cuadriculaCalendario.appendChild(celdaDia);
    }
  }).catch(error => {
    console.error('Error fetching events from Google Calendar API', error);
    // Si falla la API, el calendario estático ya está visible, no hacemos nada más.
  });
}

/**
 * Inicializa el calendario con lógica estática (anterior) como fallback o si no hay API.
 * Se renombra la función original 'inicializarCalendario' a 'inicializarCalendarioEstatico'
 */
function inicializarCalendarioEstatico() {
  const cuadriculaCalendario = document.getElementById('cuadriculaCalendario');
  const nombreMesActual = document.getElementById('nombreMesActual');

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();
  const diaHoy = fechaActual.getDate();

  const nombresMeses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];

  if (nombreMesActual) {
    nombreMesActual.textContent = `${nombresMeses[mesActual]} ${anioActual}`;
  }

  if (cuadriculaCalendario) {
    cuadriculaCalendario.innerHTML = '';

    const diasEnElMes = new Date(anioActual, mesActual + 1, 0).getDate();
    const primerDiaSemana = new Date(anioActual, mesActual, 1).getDay();

    for (let espacioVacio = 0; espacioVacio < primerDiaSemana; espacioVacio++) {
      cuadriculaCalendario.appendChild(document.createElement('div'));
    }

    for (let diaContador = 1; diaContador <= diasEnElMes; diaContador++) {
      const celdaDia = document.createElement('div');
      celdaDia.textContent = diaContador;
      celdaDia.classList.add('calendar-cell');

      if (diaContador === diaHoy) {
        celdaDia.classList.add('today');
        celdaDia.title = 'Hoy';
      }

      cuadriculaCalendario.appendChild(celdaDia);
    }
  }
}

// Asegúrate de que configurarEventosInteraccion se ejecute siempre
document.addEventListener('DOMContentLoaded', () => {
  configurarEventosInteraccion();
  // Llamar al calendario estático al inicio, se reemplazará si la API carga correctamente
  inicializarCalendarioEstatico();
});
