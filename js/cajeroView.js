export class CajeroView extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.actualizarPantalla = this.actualizarPantalla.bind(this);
    this.manejarClicTecla = this.manejarClicTecla.bind(this);

    this.tituloElemento = null;
    this.mensajeElemento = null;
    this.subtituloElemento = null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
  var estilo = document.createElement('style');
  estilo.textContent = `
      /* 1. Gabinete más grande */
  .cajero-global-container {
    width: 620px;               /* Subimos de 520px a 620px */
    background-color: #1e293b;
    padding: 35px;
    border-radius: 20px;
    box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.5);
    border: 4px solid #334155;
    box-sizing: border-box;
  }

  /* 2. Pantalla más amplia con soporte de saltos de línea */
  .pantalla-container {
    background-color: #0f172a;
    border: 3px solid #38bdf8;
    border-radius: 10px;
    padding: 25px;
    text-align: center;
    color: #38bdf8;
    font-family: 'Courier New', Courier, monospace;
    min-height: 220px;          /* Aumentamos la altura de la pantalla */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .pantalla-mensaje {
    margin: 15px 0;
    font-size: 1.15rem;
    line-height: 1.6;
    white-space: pre-line;      /* PERMITE SALTOS DE LÍNEA (\n) */
    text-align: left;           
    padding-left: 30px;
  }

    /* Botón ciego / ciego gris sin función */
    .btn-vacio {
      background-color: #cbd5e1;
      box-shadow: 0 4px 0 #94a3b8;
      cursor: default;
      opacity: 0.7;
    }

    .pantalla-titulo {
      margin: 0 0 10px 0;
      font-size: 1.3rem;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .pantalla-mensaje {
      margin: 10px 0;
      font-size: 1.1rem;
    }

    .pantalla-subtitulo {
      margin-top: 15px;
      background-color: #020617;
      border: 2px dashed #38bdf8;
      border-radius: 6px;
      padding: 12px;
      font-size: 1.8rem;
      font-weight: bold;
      letter-spacing: 0.4em;
      color: #4ade80;
      min-height: 38px;
    }

    /* Teclado en 4 COLUMNAS exactas */
    .teclado-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr); /* 4 columnas para que coincida con la foto */
      gap: 12px;
      margin-top: 25px;
    }

    .btn-tecla {
      padding: 16px 8px;
      font-size: 1.1rem;
      font-weight: bold;
      border-radius: 8px;
      border: none;
      background-color: #e2e8f0;
      color: #0f172a;
      cursor: pointer;
      box-shadow: 0 4px 0 #94a3b8;
    }

    .btn-tecla:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #94a3b8;
    }

    /* Colores de botones de acción de la columna derecha */
    .btn-cancelar { background-color: #ef4444; color: white; box-shadow: 0 4px 0 #b91c1c; }
    .btn-borrar   { background-color: #f59e0b; color: white; box-shadow: 0 4px 0 #b45309; }
    .btn-aceptar  { background-color: #22c55e; color: white; box-shadow: 0 4px 0 #15803d; }
      `;

  var contenedorGlobal = document.createElement('div');
  contenedorGlobal.className = 'cajero-global-container';

  // --- SECCIÓN PANTALLA ---
  var contenedorPantalla = document.createElement('div');
  contenedorPantalla.className = 'pantalla-container';

  this.tituloElemento = document.createElement('h2');
  this.tituloElemento.className = 'pantalla-titulo';

  this.mensajeElemento = document.createElement('p');
  this.mensajeElemento.className = 'pantalla-mensaje';

  this.subtituloElemento = document.createElement('div');
  this.subtituloElemento.className = 'pantalla-subtitulo';

  contenedorPantalla.appendChild(this.tituloElemento);
  contenedorPantalla.appendChild(this.mensajeElemento);
  contenedorPantalla.appendChild(this.subtituloElemento);

  // --- SECCIÓN TECLADO ---
  var contenedorTeclado = document.createElement('div');
  contenedorTeclado.className = 'teclado-container';

  var teclas = [
    '1', '2', '3', 'BORRAR',
    '4', '5', '6', 'CANCELAR',
    '7', '8', '9', 'ACEPTAR',
    '', '0', ''
  ];

  for (var i = 0; i < teclas.length; i++) {
  var valorTecla = teclas[i];

  var boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = valorTecla;

  if (valorTecla === '') {
    boton.className = 'btn-tecla btn-vacio';
    boton.disabled = true; // Mantiene el botón visible en gris pero inactivo
  } else {
    boton.className = 'btn-tecla btn-' + valorTecla.toLowerCase();
    boton.addEventListener(
      'click',
      this.manejarClicTecla.bind(this, valorTecla)
    );
  }

  contenedorTeclado.appendChild(boton);
}

  // 3. Ensamblaje en el Shadow DOM
  contenedorGlobal.appendChild(contenedorPantalla);
  contenedorGlobal.appendChild(contenedorTeclado);

  this.shadowRoot.appendChild(estilo);
  this.shadowRoot.appendChild(contenedorGlobal);
}

  // --- MÉTODOS PÚBLICOS Y MANEJO DE EVENTOS ---

  actualizarPantalla(titulo, mensaje, subtitulo) {
    if (this.tituloElemento) {
      this.tituloElemento.textContent = titulo || '';
    }
    if (this.mensajeElemento) {
      this.mensajeElemento.textContent = mensaje || '';
    }
    if (this.subtituloElemento) {
      this.subtituloElemento.textContent = subtitulo || '';
    }
  }

  manejarClicTecla(valor) {
    var eventoTecla = new CustomEvent('tecla-presionada', {
      detail: { valor: valor },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(eventoTecla);
  }
}

customElements.define('cajero-view', CajeroView);