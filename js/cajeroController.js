export class CajeroController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.estadoActual = 'INICIO';
    this.bufferEntrada = '';

    this.manejarTecla = this.manejarTecla.bind(this);

        // TABLA DE DESPACHO:acciones de cancelar
    this.accionesCancelar = {
      'INICIO': () => {
      
      },
      'PEDIR_PIN': () => {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      },
      'MENU': () => {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      },
      'CONSULTAR_SALDO': () => { this.irAMenu(); },
      'EXTRAER': () => {
        this.irAMenu();
      },
      'TARJETA_BLOQUEADA': () => {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      },

      'TRANSFERIR_LISTA': () => { this.irAMenu(); },
      'TRANSFERIR_INGRESO': () => { this.irAMenu(); },
      'TRANSFERIR_MONTO': () => { this.irAMenu(); },
      'TRANSFERIR_CONFIRMAR': () => { this.irAMenu(); },
      'TRANSFERENCIA_EXITOSA': () => { this.irAMenu(); },
      'TRANSFERENCIA_ERROR': () => { this.irAMenu(); }
    };
        //que procesador maneja cada estado
      this.procesadores = {
      'INICIO': null,
      'PEDIR_PIN': (valor) => this.procesarPin(valor),
      'MENU': (valor) => this.procesarMenu(valor),
      'EXTRAER': (valor) => this.procesarExtraccion(valor),
      'TRANSFERIR_LISTA': (valor) => this.procesarTransferirLista(valor),
      'TRANSFERIR_INGRESO': (valor) => this.procesarTransferirIngreso(valor),
      'TRANSFERIR_MONTO': (valor) => this.procesarTransferirMonto(valor),
      'TRANSFERIR_CONFIRMAR': (valor) => this.procesarTransferirConfirmar(valor)
    };
  }

  iniciar() {
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
    this.view.hablar('Bienvenido a Red Link. Presione ACEPTAR para comenzar.');
  }

  irAPedirPin() {
    this.estadoActual = 'PEDIR_PIN';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'INGRESO DE PIN',
      'Ingrese su clave de 4 dígitos:',
      ''
    );
    this.view.hablar('Ingrese su clave de cuatro dígitos.');
  }

  irAMenu() {
    this.estadoActual = 'MENU';
    this.bufferEntrada = '';
    var mensajeMenu = "1. CONSULTAR SALDO\n2. EXTRAER DINERO\n3. TRANSFERIR";
    this.view.actualizarPantalla(
      'MENÚ PRINCIPAL',
      mensajeMenu,
      'Seleccione una opción'
    );
    this.view.hablar('Menú principal. Seleccione una opción.');
  }

  irAExtraer() {
    this.estadoActual = 'EXTRAER';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'EXTRAER DINERO',
      'Ingrese el monto (múltiplo de 100):',
      '$ 0'
    );
    this.view.hablar('Ingrese el monto a extraer.');
  }

  manejarTecla(evento) {
    const valor = evento.detail.valor;

    // 1. CANCELAR: Siempre usa la tabla de acciones
    if (valor === 'CANCELAR') {
      const accionCancelar = this.accionesCancelar[this.estadoActual];
      if (accionCancelar) {
        accionCancelar();
      } else {
        console.warn(`No hay acción definida para CANCELAR en estado: ${this.estadoActual}`);
      }
      return;
    }


    if (valor === 'BORRAR') {
      if (this.estadoActual === 'PEDIR_PIN' || this.estadoActual === 'EXTRAER' || this.estadoActual === 'TRANSFERIR_INGRESO' || this.estadoActual === 'TRANSFERIR_MONTO') {
        this.bufferEntrada = this.bufferEntrada.slice(0, -1);
        this.actualizarPantallaSegunEstado();
      }
      return;
    }

    
    if (this.estadoActual === 'INICIO' && valor === 'ACEPTAR') {
      this.irAPedirPin();
      return;
    }

  
    const procesador = this.procesadores[this.estadoActual];
    if (procesador) {
      procesador(valor);
    } else {
      console.warn(`No hay procesador definido para estado: ${this.estadoActual}`);
    }
  }

  actualizarPantallaSegunEstado() {
    if (this.estadoActual === 'PEDIR_PIN') {
      const enmascarado = '*'.repeat(this.bufferEntrada.length);
      this.view.actualizarPantalla('INGRESO DE PIN', 'Ingrese su clave de 4 dígitos:', enmascarado);
    } 
    else if (this.estadoActual === 'EXTRAER') {
      this.view.actualizarPantalla('EXTRAER DINERO', 'Ingrese el monto (múltiplo de 100):', '$ ' + (this.bufferEntrada || '0'));
    }
  }

  procesarPin(valor) {
  
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
      this.actualizarPantallaSegunEstado();
      return; 
    }

    if (!isNaN(Number(valor)) && this.bufferEntrada.length < 4) {
      this.bufferEntrada = this.bufferEntrada + valor;
      this.actualizarPantallaSegunEstado();
      return;
    }

    if (valor === 'ACEPTAR' && this.bufferEntrada.length === 4) {
      const esValido = this.model.validarPin(this.bufferEntrada);

      if (esValido) {
        this.irAMenu();
        return;
      }

      if (this.model.pinBloqueado()) {
        this.irATarjetaBloqueada();
        return;
      }

      this.bufferEntrada = '';
      this.view.actualizarPantalla('PIN INCORRECTO', 'Intente nuevamente:', '');
      this.view.hablar('Clave incorrecta. Intente nuevamente.');
      return;
    }
  }

  procesarMenu(valor) {
    if (valor === '1') {
      this.estadoActual = 'CONSULTAR_SALDO';
      const saldo = this.model.obtenerSaldo();
      this.view.actualizarPantalla(
        'CONSULTA DE SALDO',
        'Su saldo disponible es: $' + saldo,
        'Presione CANCELAR para volver al menú'
      );
      this.view.hablar('Su saldo disponible es de ' + saldo + ' pesos. Presione cancelar para volver al menú.');
    } else if (valor === '2') {
      this.irAExtraer();
    } else if (valor === '3') {
      this.irATransferirLista(); // <-- NUEVO
    }
  }

  procesarExtraccion(valor) {
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
      this.actualizarPantallaSegunEstado();
      return;
    }

    
    if (!isNaN(Number(valor))) {
      this.bufferEntrada = this.bufferEntrada + valor;
      this.actualizarPantallaSegunEstado();
      return;
    }

    if (valor === 'ACEPTAR') {
      const resultado = this.model.extraerDinero(this.bufferEntrada);

      if (resultado.exito) {
        this.view.actualizarPantalla(
          'OPERACIÓN EXITOSA',
          'Retire su dinero. Saldo restante: $' + resultado.saldoRestante,
          'Presione CANCELAR para volver al menú'
        );
        this.view.hablar('Operación exitosa. Retire su dinero. Presione cancelar para volver al menú principal.');
        this.bufferEntrada = ''; // Limpiamos el buffer para la próxima operación
        return;
      }

      this.view.actualizarPantalla(
        'ERROR DE EXTRACCIÓN',
        resultado.mensaje,
        'Presione CANCELAR para volver al menú'
      );
      this.view.hablar(resultado.mensaje + ' Presione cancelar para volver al menú principal.');
      this.bufferEntrada = '';
      return;
    }
  }
    // --- MÉTODOS DE TRANSFERENCIA ---

  irATransferirLista() {
    this.estadoActual = 'TRANSFERIR_LISTA';
    this.bufferEntrada = '';
    
    // Obtenemos los datos del modelo
    const frecuentes = this.model.obtenerDestinatariosFrecuentes();
    const mensaje = "1. " + frecuentes[0].nombre + "\n2. " + frecuentes[1].nombre + "\n3. INGRESAR CBU/ALIAS";
    
    this.view.actualizarPantalla(
      'TRANSFERENCIAS',
      mensaje,
      'Seleccione una opción'
    );
    this.view.hablar('Elija un destinatario frecuente o presione 3 para ingresar un CBU o alias.');
  }

  procesarTransferirLista(valor) {
    // Guarda: Si es borrar, no hace nada aquí
    if (valor === 'BORRAR') return;

    if (valor === '1' || valor === '2') {
      const id = Number(valor);
      const destinatario = this.model.obtenerDestinatarioPorId(id);
      if (destinatario) {
        this.destinatarioSeleccionado = destinatario; // Guardamos en el controlador temporalmente
        this.irATransferirMonto();
      }
    } else if (valor === '3') {
      this.irATransferirIngreso();
    }
  }

  irATransferirIngreso() {
    this.estadoActual = 'TRANSFERIR_INGRESO';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'INGRESAR DESTINATARIO',
      'Escriba el CBU o Alias:',
      ''
    );
    this.view.hablar('Ingrese el CBU o alias del destinatario y presione aceptar.');
  }

  procesarTransferirIngreso(valor) {
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
      this.view.actualizarPantalla('INGRESAR DESTINATARIO', 'Escriba el CBU o Alias:', this.bufferEntrada);
      return;
    }

    if (valor === 'ACEPTAR') {
      if (this.bufferEntrada.length > 0) {
        const datosEncontrados = this.model.buscarCuentaPorAliasOCBU(this.bufferEntrada.toLowerCase());
        
        if (datosEncontrados) {
          this.destinatarioSeleccionado = { 
            nombre: datosEncontrados.nombre, 
            banco: datosEncontrados.banco,
            cbu: this.bufferEntrada 
          };
          this.irATransferirMonto();
        } else {
          this.view.actualizarPantalla(
            'DESTINATARIO NO ENCONTRADO',
            'Verifique el CBU o Alias.',
            'Presione CANCELAR para volver'
          );
          this.view.hablar('Destinatario no encontrado. Verifique los datos.');
          this.bufferEntrada = '';
        }
      }
      return;
    }

    // Si es un carácter válido (letra o número), lo agregamos
    this.bufferEntrada = this.bufferEntrada + valor;
    this.view.actualizarPantalla('INGRESAR DESTINATARIO', 'Escriba el CBU o Alias:', this.bufferEntrada);
  }

  irATransferirMonto() {
    this.estadoActual = 'TRANSFERIR_MONTO';
    this.bufferEntrada = '';
    this.view.actualizarPantalla(
      'MONTO A TRANSFERIR',
      'A: ' + this.destinatarioSeleccionado.nombre + '\nIngrese el monto:',
      '$ 0'
    );
    this.view.hablar('Va a transferir a ' + this.destinatarioSeleccionado.nombre + '. Ingrese el monto.');
  }

  procesarTransferirMonto(valor) {
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
      this.view.actualizarPantalla('MONTO A TRANSFERIR', 'A: ' + this.destinatarioSeleccionado.nombre + '\nIngrese el monto:', '$ ' + (this.bufferEntrada || '0'));
      return;
    }

    if (valor === 'ACEPTAR') {
      if (this.bufferEntrada.length > 0) {
        this.montoTransferencia = Number(this.bufferEntrada);
        this.irATransferirConfirmar();
      }
      return;
    }

    if (!isNaN(Number(valor))) {
      this.bufferEntrada = this.bufferEntrada + valor;
      this.view.actualizarPantalla('MONTO A TRANSFERIR', 'A: ' + this.destinatarioSeleccionado.nombre + '\nIngrese el monto:', '$ ' + (this.bufferEntrada || '0'));
    }
  }

  irATransferirConfirmar() {
    this.estadoActual = 'TRANSFERIR_CONFIRMAR';
    this.view.actualizarPantalla(
      'CONFIRMAR TRANSFERENCIA',
      'Monto: $' + this.montoTransferencia + '\nA: ' + this.destinatarioSeleccionado.nombre,
      '1. ACEPTAR  2. CANCELAR'
    );
    this.view.hablar('Confirme la transferencia de ' + this.montoTransferencia + ' pesos a ' + this.destinatarioSeleccionado.nombre + '. Presione 1 para aceptar o 2 para cancelar.');
  }

  procesarTransferirConfirmar(valor) {
    if (valor === '1' || valor === 'ACEPTAR') {
      const resultado = this.model.transferirDinero(this.montoTransferencia, this.destinatarioSeleccionado);
      
      if (resultado.exito) {
        this.estadoActual = 'TRANSFERENCIA_EXITOSA';
      
        this.view.actualizarPantalla(
          'TRANSFERENCIA EXITOSA',
          'Se transfirieron $' + this.montoTransferencia + '\nSaldo restante: $' + resultado.saldoRestante,
          'Presione CANCELAR para volver al menú'
        );
        this.view.hablar('Transferencia exitosa. Presione cancelar para volver al menú principal.');
      } else {
        this.view.actualizarPantalla(
          'ERROR DE TRANSFERENCIA',
          resultado.mensaje,
          'Presione CANCELAR para volver al menú'
        );
        this.view.hablar(resultado.mensaje + ' Presione cancelar para volver al menú.');
      }
      return;
    }

    if (valor === '2' || valor === 'CANCELAR' || valor === 'BORRAR') {
      this.irAMenu();
      return;
    }
  }
}