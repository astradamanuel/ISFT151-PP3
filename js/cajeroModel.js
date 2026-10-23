import { DESTINATARIOS_FRECUENTES, BASE_DATOS_BANCARIA } from './mockData.js';

export class CajeroModel {
  constructor() {
    this.saldo = 50000;
    this.pinCorrecto = "1234";
    this.tarjetaInsertada = false;
    this.limiteExtraccion = 20000;
    this.intentosPin = 0;
    this.maxIntentos = 3;
    this.historial = [];

    this.destinatariosFrecuentes = DESTINATARIOS_FRECUENTES;
    this.baseDeDatosBancaria = BASE_DATOS_BANCARIA;
  }

  obtenerDestinatariosFrecuentes() {
    return this.destinatariosFrecuentes;
  }

  obtenerDestinatarioPorId(id) {
    for (var i = 0; i < this.destinatariosFrecuentes.length; i++) {
      if (this.destinatariosFrecuentes[i].id === id) {
        return this.destinatariosFrecuentes[i];
      }
    }
    return null;
  }

  buscarCuentaPorAliasOCBU(clave) {
    return this.baseDeDatosBancaria[clave] || null;
  }

  transferirDinero(monto, destinatario) {
    var numeroMonto = Number(monto);

    if (numeroMonto > this.saldo) {
      return { exito: false, mensaje: "Saldo insuficiente." };
    }
    
    this.saldo = this.saldo - numeroMonto;
    
    this.registrarMovimiento("Transferencia a " + destinatario.nombre, numeroMonto);

    return { exito: true, saldoRestante: this.saldo };
  }

  insertarTarjeta() {
    this.tarjetaInsertada = true;
  }

  retirarTarjeta() {
    this.tarjetaInsertada = false;
    this.intentosPin = 0;
  }

  validarPin(pinIngresado) {
    if (pinIngresado === this.pinCorrecto) {
      this.intentosPin = 0;
      return true;
    } else {
      this.intentosPin = this.intentosPin + 1;
      return false;
    }
  }

  pinBloqueado() {
    return this.intentosPin >= this.maxIntentos;
  }

  obtenerSaldo() {
    return this.saldo;
  }

  extraerDinero(monto) {
    var numeroMonto = Number(monto);

    if (isNaN(numeroMonto) || numeroMonto <= 0) {
      return { exito: false, mensaje: "Monto inválido." };
    }

    if (numeroMonto % 100 !== 0) {
      return { exito: false, mensaje: "Ingrese un monto múltiplo de 100 pesos." };
    }

    if (numeroMonto > this.limiteExtraccion) {
      return { exito: false, mensaje: "Supera el límite por extracción." };
    }

    if (numeroMonto > this.saldo) {
      return { exito: false, mensaje: "Saldo insuficiente." };
    }

    this.saldo = this.saldo - numeroMonto;
    this.registrarMovimiento("Extracción", numeroMonto);

    return { exito: true, saldoRestante: this.saldo };
  }

  depositarDinero(monto) {
    var numeroMonto = Number(monto);

    if (isNaN(numeroMonto) || numeroMonto <= 0) {
      return { exito: false, mensaje: "Monto inválido." };
    }

    this.saldo = this.saldo + numeroMonto;
    this.registrarMovimiento("Depósito", numeroMonto);

    return { exito: true, nuevoSaldo: this.saldo };
  }

  registrarMovimiento(tipo, monto) {
    var registro = {
      tipo: tipo,
      monto: monto,
      fecha: new Date().toLocaleString()
    };
    this.historial.push(registro);
  }
}