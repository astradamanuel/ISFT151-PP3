export class CajeroModel {
  constructor() {
    this.saldo = 50000;
    this.pinCorrecto = "1234";
    this.tarjetaInsertada = false;
    this.limiteExtraccion = 20000;
    this.intentosPin = 0;
    this.maxIntentos = 3;
    this.historial = [];
  }

  // Insertar o retirar tarjeta
  insertarTarjeta() {
    this.tarjetaInsertada = true;
  }

  retirarTarjeta() {
    this.tarjetaInsertada = false;
    this.intentosPin = 0;
  }

  // Validación de PIN
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

  // Consulta de Saldo
  obtenerSaldo() {
    return this.saldo;
  }

  // Extracción de Dinero con validaciones
  extraerDinero(monto) {
    var numeroMonto = Number(monto);

    if (isNaN(numeroMonto) || numeroMonto <= 0) {
      return { exito: false, mensaje: "Monto inválido." };
    }

    if (numeroMonto % 100 !== 0) {
      return { exito: false, mensaje: "Ingrese un monto múltiplo de $100." };
    }

    if (numeroMonto > this.limiteExtraccion) {
      return { exito: false, mensaje: "Supera el límite por extracción." };
    }

    if (numeroMonto > this.saldo) {
      return { exito: false, mensaje: "Saldo insuficiente." };
    }

    // Si pasa todas las validaciones:
    this.saldo = this.saldo - numeroMonto;
    this.registrarMovimiento("Extracción", numeroMonto);

    return { exito: true, saldoRestante: this.saldo };
  }

  // Depósito
  depositarDinero(monto) {
    var numeroMonto = Number(monto);

    if (isNaN(numeroMonto) || numeroMonto <= 0) {
      return { exito: false, mensaje: "Monto inválido." };
    }

    this.saldo = this.saldo + numeroMonto;
    this.registrarMovimiento("Depósito", numeroMonto);

    return { exito: true, nuevoSaldo: this.saldo };
  }

  // Método auxiliar interno para guardar transacciones
  registrarMovimiento(tipo, monto) {
    var registro = {
      tipo: tipo,
      monto: monto,
      fecha: new Date().toLocaleString()
    };
    this.historial.push(registro);
  }
}