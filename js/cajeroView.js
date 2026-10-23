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
      /* 1. Gabinete más ancho y cómodo */
      .cajero-global-container {
        width: 760px;
        background-color: #1e293b;
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 30px 40px -10px rgba(0, 0, 0, 0.6);
        border: 5px solid #334155;
        box-sizing: border-box;
      }

      /* 2. Pantalla con más espacio y mejor tipografía */
      .pantalla-container {
        background-color: #0f172a;
        border: 3px solid #38bdf8;
        border-radius: 12px;
        padding: 25px;
        text-align: center;
        color: #38bdf8;
        font-family: 'Courier New', Courier, monospace;
        min-height: 250px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
      }

      .pantalla-titulo {
        margin: 0 0 10px 0;
        font-size: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .pantalla-mensaje {
        margin: 10px 0;
        font-size: 1.25rem;
        line-height: 1.5;
        white-space: pre-line;
        text-align: left;
        padding-left: 20px;
      }

      /* Subtítulo adaptado para contener 22 dígitos sin desbordarse */
      .pantalla-subtitulo {
        margin-top: 15px;
        background-color: #020617;
        border: 2px dashed #38bdf8;
        border-radius: 8px;
        padding: 10px 15px;
        font-size: 1.35rem;
        font-weight: bold;
        letter-spacing: 0.12em;
        color: #4ade80;
        min-height: 45px;
        word-break: break-all;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Teclado más grande y fácil de presionar */
      .teclado-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-top: 30px;
      }

      .btn-tecla {
        padding: 22px 10px;
        font-size: 1.3rem;
        font-weight: bold;
        border-radius: 10px;
        border: none;
        background-color: #e2e8f0;
        color: #0f172a;
        cursor: pointer;
        box-shadow: 0 5px 0 #94a3b8;
      }

      .btn-tecla:active {
        transform: translateY(3px);
        box-shadow: 0 2px 0 #94a3b8;
      }

      .btn-vacio {
        background-color: #cbd5e1;
        box-shadow: 0 5px 0 #94a3b8;
        cursor: default;
        opacity: 0.7;
      }

      .btn-cancelar { background-color: #ef4444; color: white; box-shadow: 0 5px 0 #b91c1c; }
      .btn-borrar   { background-color: #f59e0b; color: white; box-shadow: 0 5px 0 #b45309; }
      .btn-aceptar  { background-color: #22c55e; color: white; box-shadow: 0 5px 0 #15803d; }
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
    this.reproducirBeep();

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

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(mensaje);
    }
  }
}

customElements.define('cajero-view', CajeroView);