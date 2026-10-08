import { CajeroModel } from './cajeroModel.js';
import { CajeroView } from './cajeroView.js';
import { CajeroController } from './cajeroController.js';

var vista = document.getElementById('cajero');

var modelo = new CajeroModel();

if (vista) {
  var controlador = new CajeroController(modelo, vista);
  controlador.iniciar();

  window.miCajero = modelo;
  console.log("Cajero unificado cargado correctamente.");
} else {
  console.error("No se encontró el elemento #cajero en el DOM.");
}