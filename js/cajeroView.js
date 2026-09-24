export class CajeroView extends HTMLElement {
  constructor() {
    super();

    // 1. Crear Shadow DOM
    this.attachShadow({ mode: 'open' });

    // 2. Bindings de métodos (sin funciones flecha)
    this.actualizarPantalla = this.actualizarPantalla.bind(this);
    this.manejarClicTecla = this.manejarClicTecla.bind(this);

    // 3. Referencias internas de la pantalla
    this.tituloElemento = null;
    this.mensajeElemento = null;
    this.subtituloElemento = null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
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
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      'CANCELAR', '0', 'BORRAR',
      'ACEPTAR'
    ];

    for (var i = 0; i < teclas.length; i++) {
      var valorTecla = teclas[i];

      var boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = valorTecla;
      boton.className = 'btn-tecla btn-' + valorTecla.toLowerCase();

      boton.addEventListener(
        'click',
        this.manejarClicTecla.bind(this, valorTecla)
      );

      contenedorTeclado.appendChild(boton);
    }

    // ENSAMBLAJE EN EL SHADOW DOM
    contenedorGlobal.appendChild(contenedorPantalla);
    contenedorGlobal.appendChild(contenedorTeclado);

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

// Registro del nuevo Custom Element
customElements.define('cajero-view', CajeroView);