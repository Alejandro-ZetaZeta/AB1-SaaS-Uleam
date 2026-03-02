/**
 * app.js — Capa de Presentación / Controlador (equivalente a capUI.py)
 * Maneja los eventos del formulario, validación, materias dinámicas y orquestación.
 */

import { obtenerFechaActual } from "./utils.js";
import { generarDocumento } from "./docGenerator.js";

// ---- Definición de campos personales (datos que NO se repiten) ----
const CAMPOS_PERSONALES = [
  { id: "nombre", etiqueta: "Nombre Completo" },
  { id: "cedula", etiqueta: "Cédula de Identidad" },
  { id: "periodo", etiqueta: "Período Académico" },
  { id: "telefono", etiqueta: "Teléfono" },
  { id: "correoInsti", etiqueta: "Correo Institucional" },
  { id: "carrera", etiqueta: "Carrera" },
  { id: "nivel", etiqueta: "Semestre" },
  { id: "paralelo", etiqueta: "Paralelo" },
  { id: "motivo", etiqueta: "Motivo de Justificación" },
];

// ---- Campos de cada materia (se repiten por fila) ----
const CAMPOS_MATERIA = ["materia", "docente", "horas", "fecha"];
const ETIQUETAS_MATERIA = {
  materia: "Asignatura",
  docente: "Docente",
  horas: "Horas Clase",
  fecha: "Fecha a Justificar",
};

const PERIODOS_ACADEMICOS_DEFAULT = "--Selecciona tu periodo--";

let contadorMaterias = 1;

// ---- Inicialización ----
document.addEventListener("DOMContentLoaded", () => {
  const btnGenerar = document.getElementById("btn-generar");
  const btnRestablecer = document.getElementById("btn-restablecer");
  const btnAgregarMateria = document.getElementById("btn-agregar-materia");

  // Validación numérica en tiempo real
  document.querySelectorAll("[data-numeric]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const maxLen = parseInt(input.getAttribute("maxlength")) || 10;
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    });
  });

  // Validación visual al salir de campos personales
  document.querySelectorAll("#justificacion-form > div .form-input").forEach((input) => {
    input.addEventListener("blur", () => validarCampoPersonal(input));
    input.addEventListener("input", () => input.classList.remove("invalid"));
  });

  btnGenerar.addEventListener("click", handleGenerar);
  btnRestablecer.addEventListener("click", restablecerFormulario);
  btnAgregarMateria.addEventListener("click", agregarMateria);
});

// ==========================================
//  MATERIAS DINÁMICAS
// ==========================================

/** Agrega una nueva fila de materia al formulario */
function agregarMateria() {
  contadorMaterias++;
  const container = document.getElementById("materias-container");

  const row = document.createElement("div");
  row.className = "materia-row glass-card rounded-xl p-4 mb-3 relative animate-fade-in-up";
  row.dataset.index = contadorMaterias - 1;

  row.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-bold text-sky-300 uppercase tracking-wider">Materia #${contadorMaterias}</span>
      <button type="button" class="btn-eliminar-materia text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg p-1.5 transition-all" title="Eliminar materia">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-100 uppercase tracking-wider mb-1">Asignatura</label>
        <input type="text" name="materia" class="form-input materia-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Ej: Prog. Web" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-100 uppercase tracking-wider mb-1">Docente</label>
        <input type="text" name="docente" class="form-input materia-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Ej: Ing. López" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-100 uppercase tracking-wider mb-1">Horas Clase</label>
        <input type="text" name="horas" class="form-input materia-input w-full rounded-lg px-3 py-2 text-sm" placeholder="Ej: 08:00-10:00" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-100 uppercase tracking-wider mb-0.5">Fecha</label>
        <input type="date" name="fecha" class="form-input materia-input w-full rounded-lg px-3 py-2 text-sm" />
      </div>
    </div>
  `;

  container.appendChild(row);

  // Vincular botón eliminar
  row.querySelector(".btn-eliminar-materia").addEventListener("click", () => {
    row.classList.add("opacity-0", "scale-95");
    row.style.transition = "all 0.3s ease";
    setTimeout(() => {
      row.remove();
      renumerarMaterias();
    }, 300);
  });
}

/** Renumera las etiquetas "Materia #N" después de eliminar una */
function renumerarMaterias() {
  const rows = document.querySelectorAll(".materia-row");
  contadorMaterias = rows.length;
  rows.forEach((row, i) => {
    row.dataset.index = i;
    const label = row.querySelector("span");
    if (label) label.textContent = `Materia #${i + 1}`;
  });
}

// ==========================================
//  RECOLECCIÓN Y VALIDACIÓN
// ==========================================

/**
 * Recolecta todos los datos del formulario.
 * Retorna un objeto con datos personales + array de materias.
 */
function recolectarDatos() {
  const datos = {};

  // Campos personales
  CAMPOS_PERSONALES.forEach((campo) => {
    const el = document.getElementById(campo.id);
    datos[campo.id] = el ? el.value.trim() : "";
  });

  // Array de materias (para el loop en el template)
  const materias = [];
  const nivelGlobal = document.getElementById("nivel").value.trim();
  const paraleloGlobal = document.getElementById("paralelo").value.trim();

  document.querySelectorAll(".materia-row").forEach((row) => {
    const materia = {};
    CAMPOS_MATERIA.forEach((campo) => {
      const input = row.querySelector(`input[name="${campo}"]`);
      let valor = input ? input.value.trim() : "";
      // Formatear fecha de yyyy-mm-dd a dd/mm/yyyy
      if (campo === "fecha" && valor) {
        const [y, m, d] = valor.split("-");
        valor = `${d}/${m}/${y}`;
      }
      materia[campo] = valor;
    });
    // Inyectar nivel y paralelo estáticos en cada fila
    materia.nivel = nivelGlobal;
    materia.paralelo = paraleloGlobal;
    materias.push(materia);
  });

  datos.materias = materias;
  return datos;
}

/** Valida campos personales y materias */
function validarFormulario() {
  const camposVacios = [];

  // Validar campos personales
  CAMPOS_PERSONALES.forEach((campo) => {
    const el = document.getElementById(campo.id);
    const valor = el ? el.value.trim() : "";
    const esInvalido =
      !valor || (campo.id === "periodo" && valor === PERIODOS_ACADEMICOS_DEFAULT);

    if (esInvalido) {
      camposVacios.push(campo.etiqueta);
      el?.classList.add("invalid");
    } else {
      el?.classList.remove("invalid");
    }
  });

  // Validar cada fila de materia
  document.querySelectorAll(".materia-row").forEach((row, i) => {
    CAMPOS_MATERIA.forEach((campo) => {
      const input = row.querySelector(`input[name="${campo}"]`);
      if (input && !input.value.trim()) {
        camposVacios.push(`${ETIQUETAS_MATERIA[campo]} (Materia #${i + 1})`);
        input.classList.add("invalid");
      } else if (input) {
        input.classList.remove("invalid");
      }
    });
  });

  return camposVacios;
}

/** Valida un campo personal al perder foco */
function validarCampoPersonal(input) {
  const valor = input.value.trim();
  if (input.tagName === "SELECT") {
    input.classList.toggle("invalid", valor === PERIODOS_ACADEMICOS_DEFAULT);
  } else {
    input.classList.toggle("invalid", valor === "");
  }
}

/** Restablece todos los campos del formulario */
function restablecerFormulario() {
  // Limpiar campos personales
  CAMPOS_PERSONALES.forEach((campo) => {
    const el = document.getElementById(campo.id);
    if (!el) return;
    if (campo.id === "periodo") {
      el.value = PERIODOS_ACADEMICOS_DEFAULT;
    } else {
      el.value = "";
    }
    el.classList.remove("invalid", "valid");
  });

  // Eliminar filas extras de materias y limpiar la primera
  const container = document.getElementById("materias-container");
  const rows = container.querySelectorAll(".materia-row");
  rows.forEach((row, i) => {
    if (i === 0) {
      // Limpiar la primera fila
      row.querySelectorAll("input").forEach((input) => {
        input.value = "";
        input.classList.remove("invalid", "valid");
      });
    } else {
      row.remove();
    }
  });
  contadorMaterias = 1;

  mostrarToast("Formulario restablecido", "info");
}

// ==========================================
//  GENERACIÓN DEL DOCUMENTO
// ==========================================

async function handleGenerar() {
  const btnGenerar = document.getElementById("btn-generar");
  const camposVacios = validarFormulario();

  if (camposVacios.length > 0) {
    mostrarToast(
      `Campos vacíos: ${camposVacios.join(", ")}`,
      "warning"
    );
    return;
  }

  const textoOriginal = btnGenerar.innerHTML;
  btnGenerar.innerHTML = `<span class="spinner"></span> Generando...`;
  btnGenerar.disabled = true;

  try {
    const datos = recolectarDatos();
    datos.fecha = obtenerFechaActual();

    const nombreSalida = `Justificacion_${datos.nombre}.docx`;
    await generarDocumento(datos, nombreSalida);

    mostrarToast(`✅ Documento generado: ${nombreSalida}`, "success");
  } catch (error) {
    console.error("Error al generar documento:", error);
    mostrarToast(`❌ Error: ${error.message}`, "error");
  } finally {
    btnGenerar.innerHTML = textoOriginal;
    btnGenerar.disabled = false;
  }
}

// ==========================================
//  TOAST (reemplaza messagebox de tkinter)
// ==========================================

function mostrarToast(mensaje, tipo = "info") {
  const toastPrevio = document.querySelector(".toast");
  if (toastPrevio) toastPrevio.remove();

  const colores = {
    success: "from-emerald-500 to-emerald-600",
    error: "from-red-500 to-red-600",
    warning: "from-amber-500 to-amber-600",
    info: "from-sky-500 to-sky-600",
  };

  const iconos = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const toast = document.createElement("div");
  toast.className = `toast bg-gradient-to-r ${colores[tipo]} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm`;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-xl">${iconos[tipo]}</span>
      <p class="text-sm font-medium leading-snug">${mensaje}</p>
    </div>
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
