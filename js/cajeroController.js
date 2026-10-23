export class CajeroController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.estadoActual = 'INICIO';
    this.bufferEntrada = '';
    this.manejarTecla = this.manejarTecla.bind(this);

    // TABLA DE DESPACHO: acciones de cancelar (usando funciones tradicionales)
    // TABLA DE DESPACHO: acciones de cancelar
    this.accionesCancelar = {
      'INICIO': function() {
      },
      'PEDIR_PIN': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),
      'MENU': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),
      'CONSULTAR_SALDO': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),
      'EXTRAER': function() {
        this.irAMenu();
      }.bind(this),
      'TARJETA_BLOQUEADA': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),
      'ERROR_EXTRACCION': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),
      'ERROR_TRANSFERENCIA': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),

      'TRANSFERIR_LISTA': function() { this.irAMenu(); }.bind(this),
      'TRANSFERIR_INGRESO': function() { this.irAMenu(); }.bind(this),
      'TRANSFERIR_MONTO': function() { this.irAMenu(); }.bind(this),
      'TRANSFERIR_CONFIRMAR': function() { this.irAMenu(); }.bind(this),
      'OPERACION_EXITOSA': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this),
      'TRANSFERENCIA_EXITOSA': function() {
        this.model.retirarTarjeta();
        this.irAEstadoInicio();
      }.bind(this)
    };

    // Qué procesador maneja cada estado
    this.procesadores = {
      'INICIO': null,
      'PEDIR_PIN': function(valor) { return this.procesarPin(valor); }.bind(this),
      'MENU': function(valor) { return this.procesarMenu(valor); }.bind(this),
      'EXTRAER': function(valor) { return this.procesarExtraccion(valor); }.bind(this),
      'TRANSFERIR_LISTA': function(valor) { return this.procesarTransferirLista(valor); }.bind(this),
      'TRANSFERIR_INGRESO': function(valor) { return this.procesarTransferirIngreso(valor); }.bind(this),
      'TRANSFERIR_MONTO': function(valor) { return this.procesarTransferirMonto(valor); }.bind(this),
      'TRANSFERIR_CONFIRMAR': function(valor) { return this.procesarTransferirConfirmar(valor); }.bind(this),
      'CONSULTAR_SALDO': function(valor) {
        if (valor === '1') { this.irAMenu(); }
      }.bind(this),
      'OPERACION_EXITOSA': function(valor) {
        if (valor === '1') { this.irAMenu(); }
      }.bind(this),
      'TRANSFERENCIA_EXITOSA': function(valor) {
        if (valor === '1') { this.irAMenu(); }
      }.bind(this),
      'ERROR_EXTRACCION': function(valor) {
        if (valor === '1') { 
          this.irAExtraer(); 
        } else if (valor === '2') { 
          this.irAMenu(); 
        }
      }.bind(this),
      'ERROR_TRANSFERENCIA': function(valor) {
        if (valor === '1') { 
          this.irATransferirLista(); 
        } else if (valor === '2') { 
          this.irAMenu(); 
        }
      }.bind(this)
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
      'Ingrese su clave de 4 dígitos:(1234)',
      ''
    );
    this.view.hablar('Ingrese su clave de cuatro dígitos.(1234)');
  }

  irAMenu() {
    this.estadoActual = 'MENU';
    this.bufferEntrada = '';
    var mensajeMenu = "1. CONSULTAR SALDO\n2. EXTRAER DINERO\n3. TRANSFERIR";
    this.view.actualizarPantalla(
      'MENÚ PRINCIPAL',
      mensajeMenu,
      'Seleccione una opción o CANCELAR para salir'
    );
    this.view.hablar('Menú principal. Seleccione una opción, o presione cancelar para retirar su tarjeta y salir de forma segura.');
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

    if (valor === 'CANCELAR') {
      const accionCancelar = this.accionesCancelar[this.estadoActual];
      if (accionCancelar) {
        accionCancelar();
      } else {
        console.warn(`No hay acción definida para CANCELAR en estado: ${this.estadoActual}`);
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
      this.view.actualizarPantalla('INGRESO DE PIN', 'Ingrese su clave de 4 dígitos:(1234)', enmascarado);
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
      this.view.actualizarPantalla('PIN INCORRECTO', 'Intente nuevamente: 1233244652893205786767 ', '');
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
        'Su saldo disponible es:\n$' + saldo,
        '1: Volver al Menú  |  CANCELAR: Salir'
      );
      this.view.hablar('Su saldo disponible es de ' + saldo + ' pesos. Presione 1 para volver al menú principal, o presione cancelar para retirar su tarjeta y salir.');
    } else if (valor === '2') {
      this.irAExtraer();
    } else if (valor === '3') {
      this.irATransferirLista();
    }
  }

  procesarExtraccion(valor) {
    if (!isNaN(Number(valor))) {
      this.bufferEntrada = this.bufferEntrada + valor;
      this.actualizarPantallaSegunEstado();
      return;
    }
    if (valor === 'ACEPTAR') {
      const resultado = this.model.extraerDinero(this.bufferEntrada);

      if (resultado.exito) {
        this.estadoActual = 'OPERACION_EXITOSA';
        this.view.actualizarPantalla(
          'OPERACIÓN EXITOSA',
          'Retire su dinero. Saldo restante: $' + resultado.saldoRestante,
          '1: Volver al Menú  |  CANCELAR: Salir'
        );
        this.view.hablar('Operación exitosa. Retire su dinero. Presione 1 para volver al menú principal, o presione cancelar para retirar su tarjeta y salir de forma segura.');
        this.bufferEntrada = '';
        return;
      }
      
      this.estadoActual = 'ERROR_EXTRACCION';
      this.view.actualizarPantalla(
        'ERROR DE EXTRACCIÓN',
        resultado.mensaje,
        '1:Reintentar|2:Menú|Cancelar: Salir'
      );
      this.view.hablar(resultado.mensaje + ' Presione 1 para reintentar, 2 para ir al menú, o cancelar para salir.');
      this.bufferEntrada = '';
      return;
    }
  }

  irATransferirLista() {
    this.estadoActual = 'TRANSFERIR_LISTA';
    this.bufferEntrada = '';
    
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
    if (valor === 'BORRAR') return;

    if (valor === '1' || valor === '2') {
      const id = Number(valor);
      const destinatario = this.model.obtenerDestinatarioPorId(id);
      if (destinatario) {
        this.destinatarioSeleccionado = {
          nombre: destinatario.nombre,
          dni: destinatario.dni,
          banco: destinatario.banco,
          cbu: destinatario.cbu
        }; 
        this.irATransferirMonto();
      }
    } else if (valor === '3') {
      this.irATransferirIngreso();
    }
  }

  irATransferirIngreso() {
    this.estadoActual = 'TRANSFERIR_INGRESO';
    this.bufferEntrada = '';
    
    this.cbuObjetivo = "1233244652893205786767"; 

    this.view.actualizarPantalla(
      'PRÁCTICA DE CBU',
      'Copie este CBU:\n' + this.cbuObjetivo,
      'CANCELAR: Volver al Menú'
    );
    this.view.hablar('Por favor, practique escribiendo el CBU que ve en pantalla, o presione cancelar para volver al menú principal.');
  }

  actualizarPantallaSegunEstado() {
    if (this.estadoActual === 'PEDIR_PIN') {
      const enmascarado = '*'.repeat(this.bufferEntrada.length);
      this.view.actualizarPantalla('INGRESO DE PIN', 'Ingrese su clave de 4 dígitos:(1234)', enmascarado);
    } 
    else if (this.estadoActual === 'EXTRAER') {
      this.view.actualizarPantalla('EXTRAER DINERO', 'Ingrese el monto (múltiplo de 100):', '$ ' + (this.bufferEntrada || '0'));
    }
    else if (this.estadoActual === 'TRANSFERIR_INGRESO') {
      this.view.actualizarPantalla(
        'PRÁCTICA DE CBU',
        'Copie este CBU:\n' + this.cbuObjetivo,
        this.bufferEntrada || ''
      );
    }
    else if (this.estadoActual === 'TRANSFERIR_MONTO') {
      this.view.actualizarPantalla(
        'MONTO A TRANSFERIR',
        'A: ' + this.destinatarioSeleccionado.nombre + '\nIngrese el monto:',
        '$ ' + (this.bufferEntrada || '0')
      );
    }
  }

  procesarTransferirIngreso(valor) {
    if (valor === 'BORRAR') {
      this.bufferEntrada = this.bufferEntrada.slice(0, -1);
      this.actualizarPantallaSegunEstado();
      return;
    }

    if (valor === 'ACEPTAR') {
      if (this.bufferEntrada === this.cbuObjetivo) {
        const datosEncontrados = this.model.buscarCuentaPorAliasOCBU(this.cbuObjetivo) || { 
          nombre: "PEDRO LOPEZ", 
          dni: "30987654", 
          banco: "SANTANDER" 
        };
        
        this.destinatarioSeleccionado = { 
          nombre: datosEncontrados.nombre, 
          dni: datosEncontrados.dni,
          banco: datosEncontrados.banco,
          cbu: this.cbuObjetivo 
        };
        
        this.irATransferirMonto();
      } else {
        this.view.actualizarPantalla(
          'CBU INCORRECTO',
          'El número no coincide con el CBU de guía.\nIntente nuevamente: ' + this.cbuObjetivo,
          'CANCELAR: Volver al Menú'
        );
        this.view.hablar('El CBU es incorrecto. Revise los números y vuelva a intentarlo, o toque cancelar para volver al menú principal.');
        this.bufferEntrada = '';
      }
      return;
    }

    if (!isNaN(Number(valor))) {
      this.bufferEntrada = this.bufferEntrada + valor;
      this.actualizarPantallaSegunEstado();
    }
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
    
    var mensajeConfirmacion = "Monto: $" + this.montoTransferencia + 
                              "\nA: " + this.destinatarioSeleccionado.nombre + 
                              "\nDNI: " + this.destinatarioSeleccionado.dni + 
                              "\nBanco: " + this.destinatarioSeleccionado.banco;

    this.view.actualizarPantalla(
      'CONFIRMAR TRANSFERENCIA',
      mensajeConfirmacion,
      '1: ACEPTAR  |  2: CANCELAR'
    );
    
    this.view.hablar('Confirme la transferencia de ' + this.montoTransferencia + ' pesos a ' + this.destinatarioSeleccionado.nombre + '. Presione 1 para aceptar o 2 para cancelar e ir al menú.');
  }

  procesarTransferirConfirmar(valor) {
    if (valor === '1' || valor === 'ACEPTAR') {
      const resultado = this.model.transferirDinero(this.montoTransferencia, this.destinatarioSeleccionado);
      
      if (resultado.exito) {
        this.estadoActual = 'TRANSFERENCIA_EXITOSA';
      
        this.view.actualizarPantalla(
          'TRANSFERENCIA EXITOSA',
          'Se transfirieron $' + this.montoTransferencia + '\nSaldo restante: $' + resultado.saldoRestante,
          '1: Volver al Menú  |  CANCELAR: Salir'
        );
        this.view.hablar('Transferencia exitosa. Presione 1 para volver al menú principal, o presione cancelar para retirar su tarjeta y salir.');
      } else {
        this.estadoActual = 'ERROR_TRANSFERENCIA';
        this.view.actualizarPantalla(
          'ERROR DE TRANSFERENCIA',
          resultado.mensaje,
          '1:Reintentar|2:Menú|Cancelar: Salir'
        );
        this.view.hablar(resultado.mensaje + ' Presione 1 para reintentar, 2 para volver al menú, o cancelar para salir de forma segura.');
      }
      return;
    }

    if (valor === '2' || valor === 'CANCELAR' || valor === 'BORRAR') {
      this.irAMenu();
      return;
    }
  }
}