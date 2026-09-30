// cajeroController.js

export class CajeroController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.estadoActual = 'INICIO';
    this.bufferEntrada = '';

    this.manejarTecla = this.manejarTecla.bind(this);
  }

  iniciar() {
    // Escuchar los eventos emitidos por el nuevo componente unificado
    this.view.addEventListener('tecla-presionada', this.manejarTecla);
    this.irAEstadoInicio();
  }

  irAEstadoInicio() {
    this.estadoActual = 'INICIO';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'BIENVENIDO A RED LINK',
      'Presione ACEPTAR para comenzar',
      ''
    );
  }

  irAPedirPin() {
    this.estadoActual = 'PEDIR_PIN';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'INGRESO DE PIN',
      'Ingrese su clave de 4 dígitos:',
      ''
    );
  }

  irAMenu() {
    this.estadoActual = 'MENU';
    this.bufferEntrada = '';
    var mensajeMenu = "1. CONSULTAR SALDO\n2. EXTRAER DINERO\n3. TRANSFERIR";
    this.view.actualizarPantalla("MENÚ PRINCIPAL", mensajeMenu, "Seleccione una opción");
  }

  irAExtraer() {
    this.estadoActual = 'EXTRAER';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'EXTRAER DINERO',
      'Ingrese el monto (múltiplo de 100):',
      '$ 0'
    );
  }

  manejarTecla(evento) {
    var valor = evento.detail.valor;

    if (valor === 'CANCELAR') {
      this.irAEstadoInicio();
      return;
    }

    if (this.estadoActual === 'INICIO') {
      if (valor === 'ACEPTAR') {
        this.irAPedirPin();
      }
    } else if (this.estadoActual === 'PEDIR_PIN') {
      this.procesarPin(valor);
    } else if (this.estadoActual === 'MENU') {
      this.procesarMenu(valor);
    } else if (this.estadoActual === 'EXTRAER') {
      this.procesarExtraccion(valor);
    }
  }

  procesarPin(valor) {
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
    } else if (valor === 'ACEPTAR') {
      if (this.bufferEntrada.length === 4) {
        var esValido = this.model.validarPin(this.bufferEntrada);

        if (esValido) {
          this.irAMenu();
          return;
        } else {
          if (this.model.pinBloqueado()) {
            this.view.actualizarPantalla(
              'TARJETA BLOQUEADA',
              'Superó los 3 intentos fallidos.',
              'Presione CANCELAR'
            );
            return;
          } else {
            this.bufferEntrada = '';
            this.view.actualizarPantalla(
              'PIN INCORRECTO',
              'Intente nuevamente:',
              ''
            );
            return;
          }
        }
      }
    } else if (!isNaN(Number(valor)) && this.bufferEntrada.length < 4) {
      this.bufferEntrada = this.bufferEntrada + valor;
    }

    var enmascarado = '';
    for (var i = 0; i < this.bufferEntrada.length; i++) {
      enmascarado = enmascarado + '*';
    }

    this.view.actualizarPantalla(
      'INGRESO DE PIN',
      'Ingrese su clave de 4 dígitos:',
      enmascarado
    );
  }

  procesarMenu(valor) {
    if (valor === '1') {
      var saldo = this.model.obtenerSaldo();
      this.view.actualizarPantalla(
        'CONSULTA DE SALDO',
        'Su saldo disponible es: $' + saldo,
        'Presione CANCELAR para salir'
      );
    } else if (valor === '2') {
      this.irAExtraer();
    }
  }

  procesarExtraccion(valor) {
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
    } else if (valor === 'ACEPTAR') {
      var resultado = this.model.extraerDinero(this.bufferEntrada);

      if (resultado.exito) {
        this.view.actualizarPantalla(
          'OPERACIÓN EXITOSA',
          'Retire su dinero. Saldo restante: $' + resultado.saldoRestante,
          'Presione CANCELAR para salir'
        );
      } else {
        this.view.actualizarPantalla(
          'ERROR DE EXTRACCIÓN',
          resultado.mensaje,
          'Presione CANCELAR para volver'
        );
      }
      return;
    } else if (!isNaN(Number(valor))) {
      this.bufferEntrada = this.bufferEntrada + valor;
    }

    this.view.actualizarPantalla(
      'EXTRAER DINERO',
      'Ingrese el monto (múltiplo de 100):',
      '$ ' + (this.bufferEntrada || '0')
    );
  }
}