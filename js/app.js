import { CajeroModel } from './cajeroModel.js';
import { CajeroView } from './cajeroView.js';
import { CajeroController } from './cajeroController.js';

// 1. Obtener la referencia de la vista unificada
var vista = document.getElementById('cajero');

// 2. Instanciar Modelo y Controlador
var modelo = new CajeroModel();

if (vista) {
  var controlador = new CajeroController(modelo, vista);
  controlador.iniciar();

  window.miCajero = modelo;
  console.log("Cajero unificado cargado correctamente.");
} else {
  console.error("No se encontró el elemento #cajero en el DOM.");
}