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
      /* 1. Gabinete */
      .cajero-global-container {
        width: 620px;
        background-color: #1e293b;
        padding: 35px;
        border-radius: 20px;
        box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.5);
        border: 4px solid #334155;
        box-sizing: border-box;
      }

      /* 2. Pantalla con soporte para saltos de línea */
      .pantalla-container {
        background-color: #0f172a;
        border: 3px solid #38bdf8;
        border-radius: 10px;
        padding: 25px;
        text-align: center;
        color: #38bdf8;
        font-family: 'Courier New', Courier, monospace;
        min-height: 220px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
      }

      .pantalla-titulo {
        margin: 0 0 10px 0;
        font-size: 1.3rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .pantalla-mensaje {
        margin: 15px 0;
        font-size: 1.15rem;
        line-height: 1.6;
        white-space: pre-line;
        text-align: left;
        padding-left: 30px;
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

      /* Teclado en 4 columnas */
      .teclado-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
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

      .btn-vacio {
        background-color: #cbd5e1;
        box-shadow: 0 4px 0 #94a3b8;
        cursor: default;
        opacity: 0.7;
      }

      .btn-cancelar { background-color: #ef4444; color: white; box-shadow: 0 4px 0 #b91c1c; }
      .btn-borrar   { background-color: #f59e0b; color: white; box-shadow: 0 4px 0 #b45309; }
      .btn-aceptar  { background-color: #22c55e; color: white; box-shadow: 0 4px 0 #15803d; }
    `;

    var contenedorGlobal = document.createElement('div');
    contenedorGlobal.className = 'cajero-global-container';

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

    var contenedorTeclado = document.createElement('div');
    contenedorTeclado.className = 'teclado-container';

    var teclas = [
      '1', '2', '3', 'BORRAR',
      '4', '5', '6', 'CANCELAR',
      '7', '8', '9', 'ACEPTAR',
      '',  '0', '',  ''
    ];

    for (var i = 0; i < teclas.length; i++) {
      var valorTecla = teclas[i];

      var boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = valorTecla;

      if (valorTecla === '') {
        boton.className = 'btn-tecla btn-vacio';
        boton.disabled = true;
      } else {
        boton.className = 'btn-tecla btn-' + valorTecla.toLowerCase();
        boton.addEventListener(
          'click',
          this.manejarClicTecla.bind(this, valorTecla)
        );
      }

      contenedorTeclado.appendChild(boton);
    }

    contenedorGlobal.appendChild(contenedorPantalla);
    contenedorGlobal.appendChild(contenedorTeclado);

    this.shadowRoot.appendChild(estilo);
    this.shadowRoot.appendChild(contenedorGlobal);
  }

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
    this.reproducirBeep(); // Emite sonido táctil

    var eventoTecla = new CustomEvent('tecla-presionada', {
      detail: { valor: valor },
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(eventoTecla);
  }

  reproducirBeep() {
    try {
      var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var oscilador = audioCtx.createOscillator();
      var ganancia = audioCtx.createGain();

      oscilador.type = 'sine';
      oscilador.frequency.setValueAtTime(800, audioCtx.currentTime);

      ganancia.gain.setValueAtTime(0.05, audioCtx.currentTime);
      ganancia.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.08);

      oscilador.connect(ganancia);
      ganancia.connect(audioCtx.destination);

      oscilador.start();
      oscilador.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.log('Audio no permitido aún por el navegador');
    }
  }

  hablar(texto) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      var mensaje = new SpeechSynthesisUtterance(texto);
      mensaje.lang = 'es-AR';
      mensaje.rate = 0.95;
      mensaje.pitch = 1;

      window.speechSynthesis.speak(mensaje);
    }
  }
}

customElements.define('cajero-view', CajeroView);