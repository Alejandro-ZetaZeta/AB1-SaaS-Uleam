/**
 * utils.js — Capa de Lógica (equivalente a capLogic.py)
 * Funciones utilitarias para la aplicación.
 */

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/**
 * Convierte una fecha yyyy-mm-dd a "dd de mes de yyyy".
 * @param {string} fechaISO — Fecha en formato yyyy-mm-dd
 * @returns {string} Fecha formateada
 */
export function formatearFechaLarga(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia} de ${MESES[Number(mes) - 1]} de ${anio}`;
}

/**
 * Convierte una fecha yyyy-mm-dd a dd/mm/yyyy.
 * @param {string} fechaISO — Fecha en formato yyyy-mm-dd
 * @returns {string} Fecha formateada
 */
export function formatearFechaCorta(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

/**
 * Obtiene la fecha actual formateada como "dd de mes de yyyy".
 * @returns {string} Fecha formateada
 */
export function obtenerFechaActual() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return formatearFechaLarga(`${hoy.getFullYear()}-${mes}-${dia}`);
}
