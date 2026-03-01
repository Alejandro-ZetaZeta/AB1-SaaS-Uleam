/**
 * utils.js — Capa de Lógica (equivalente a capLogic.py)
 * Funciones utilitarias para la aplicación.
 */

/**
 * Obtiene la fecha actual formateada como dd/mm/yyyy.
 * Equivale a: datetime.today().strftime("%d/%m/%Y")
 * @returns {string} Fecha formateada
 */
export function obtenerFechaActual() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  return `${dia}/${mes}/${anio}`;
}
