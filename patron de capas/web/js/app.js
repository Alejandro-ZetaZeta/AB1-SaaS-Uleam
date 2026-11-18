/**
 * app.js — Capa de Presentación / Controlador (equivalente a capUI.py)
 * Maneja los eventos del formulario, validación, materias dinámicas y orquestación.
 */

import { obtenerFechaActual, formatearFechaLarga } from "./utils.js";
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
const PATRON_CEDULA = /^\d{10}$/;
const PATRON_CORREO_INSTITUCIONAL = /^e\d{10}@live\.uleam\.edu\.ec$/;

// ---- Carreras y su coordinador ----
const CARRERAS = [
  // ACVT
  { nombre: "Tecnologías de la Información", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  { nombre: "Eléctrica", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  { nombre: "Ingeniería Civil", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  { nombre: "Agropecuaria", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  { nombre: "Software", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  { nombre: "Arquitectura", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  { nombre: "Alimentos", coordinador: { grado: "LICENCIADA.", nombre: "MARTHA LORENA MENDOZA NAVARRETE", cargo: "Coordinadora" } },
  // ACS
  { nombre: "Enfermería", coordinador: { grado: "Dr.", nombre: "Miguel Luis Delgado Mendoza", cargo: "Coordinador" } },
  { nombre: "Fisioterapia", coordinador: { grado: "Dr.", nombre: "Miguel Luis Delgado Mendoza", cargo: "Coordinador" } },
  { nombre: "Nutrición y Dietética", coordinador: { grado: "Dr.", nombre: "Miguel Luis Delgado Mendoza", cargo: "Coordinador" } },
  { nombre: "Medicina", coordinador: { grado: "Dr.", nombre: "Miguel Luis Delgado Mendoza", cargo: "Coordinador" } },
  { nombre: "Odontología", coordinador: { grado: "Dr.", nombre: "Miguel Luis Delgado Mendoza", cargo: "Coordinador" } },
  // ACA
  { nombre: "Administración de Empresas", coordinador: { grado: "DRA.", nombre: "KAREN ALEJANDRA MENDOZA GARCÍA", cargo: "Coordinadora" } },
  { nombre: "Agronegocios", coordinador: { grado: "DRA.", nombre: "KAREN ALEJANDRA MENDOZA GARCÍA", cargo: "Coordinadora" } },
  // ACE
  { nombre: "Pedagogía de las Ciencias Experimentales", coordinador: { grado: "LIC.", nombre: "ORLEY REYES MEZA", cargo: "Coordinador" } },
  { nombre: "Psicología Educativa", coordinador: { grado: "LIC.", nombre: "ORLEY REYES MEZA", cargo: "Coordinador" } },
  { nombre: "Educación Básica", coordinador: { grado: "LIC.", nombre: "ORLEY REYES MEZA", cargo: "Coordinador" } },
  { nombre: "Educación Inicial", coordinador: { grado: "LIC.", nombre: "ORLEY REYES MEZA", cargo: "Coordinador" } },
  // APINE
  { nombre: "Pedagogía de los Idiomas Nacionales y Extranjeros", coordinador: { grado: "LIC.", nombre: "RIDER ELOY MENDOZA SALTOS", cargo: "Coordinador" } },
  { nombre: "Educación Inicial Bilingüe", coordinador: { grado: "LIC.", nombre: "RIDER ELOY MENDOZA SALTOS", cargo: "Coordinador" } },
  { nombre: "Educación Básica Bilingüe", coordinador: { grado: "LIC.", nombre: "RIDER ELOY MENDOZA SALTOS", cargo: "Coordinador" } },
  // AAP
  { nombre: "Artes Plásticas", coordinador: { grado: "LIC.", nombre: "JORGE ISACIO CEDEÑO MOLINA", cargo: "Coordinador" } },
  { nombre: "Entrenamiento Deportivo", coordinador: { grado: "LIC.", nombre: "JORGE ISACIO CEDEÑO MOLINA", cargo: "Coordinador" } },
  // AD
  { nombre: "Derecho", coordinador: { grado: "AB.", nombre: "JOSE EUGENIO ZAMBRANO MENDIETA", cargo: "Coordinador" } },
  // Sin coordinador
  { nombre: "Gastronomía", coordinador: null },
  { nombre: "Electromecánica", coordinador: null },
];

/** Normaliza texto para comparar sin distinguir tildes ni mayúsculas. */
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const CARRERAS_POR_NOMBRE = new Map(CARRERAS.map((c) => [normalizar(c.nombre), c]));

let contadorMaterias = 1;

// ---- Inicialización ----
document.addEventListener("DOMContentLoaded", () => {
  const btnGenerar = document.getElementById("btn-generar");
  const btnRestablecer = document.getElementById("btn-restablecer");
  const btnAgregarMateria = document.getElementById("btn-agregar-materia");

  inicializarCarreras();

  // Validación numérica en tiempo real
  document.querySelectorAll("[data-numeric]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const maxLen = parseInt(input.getAttribute("maxlength")) || 10;
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    });
  });

  inicializarCorreo();

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
//  CARRERA Y COORDINADOR
// ==========================================

// ---- Estado del combobox de carreras ----
let indiceActivoCarrera = -1;

/** Prepara el combobox de carreras y su filtrado. */
function inicializarCarreras() {
  const input = document.getElementById("carrera");
  const list = document.getElementById("lista-carreras");
  const combobox = document.getElementById("carrera-combobox");

  renderizarCarreras("");

  input.addEventListener("input", () => {
    renderizarCarreras(input.value);
    abrirListaCarreras();
    actualizarCoordinador();
  });

  input.addEventListener("click", () => {
    if (list.classList.contains("hidden")) {
      renderizarCarreras("");
      abrirListaCarreras();
    }
  });

  input.addEventListener("keydown", manejarTecladoCarreras);
  input.addEventListener("blur", () => {
    const carrera = CARRERAS_POR_NOMBRE.get(normalizar(input.value));
    if (carrera) input.value = carrera.nombre;
    actualizarCoordinador();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!combobox.contains(event.target)) cerrarListaCarreras();
  });
}

/** Autocompleta el correo institucional a partir de la cédula. */
function inicializarCorreo() {
  const cedula = document.getElementById("cedula");
  const correo = document.getElementById("correoInsti");

  const actualizar = () => {
    const valor = cedula.value.trim();
    correo.value = PATRON_CEDULA.test(valor) ? `e${valor}@live.uleam.edu.ec` : "";
    correo.classList.remove("invalid");
  };

  cedula.addEventListener("input", actualizar);
  actualizar();
}

/** Dibuja las carreras que coinciden con el texto escrito. */
function renderizarCarreras(filtro) {
  const list = document.getElementById("lista-carreras");
  const busqueda = normalizar(filtro);
  const carrerasFiltradas = CARRERAS.filter((c) => normalizar(c.nombre).includes(busqueda));
  indiceActivoCarrera = -1;
  list.replaceChildren();

  if (carrerasFiltradas.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "combobox-empty";
    vacio.textContent = "No hay carreras que coincidan";
    list.appendChild(vacio);
    return;
  }

  carrerasFiltradas.forEach((carrera, index) => {
    const option = document.createElement("li");
    option.id = `carrera-opcion-${index}`;
    option.className = "combobox-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(normalizar(carrera.nombre) === busqueda));
    option.textContent = carrera.nombre;
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => seleccionarCarrera(carrera.nombre));
    list.appendChild(option);
  });
}

function abrirListaCarreras() {
  document.getElementById("lista-carreras").classList.remove("hidden");
  document.getElementById("carrera").setAttribute("aria-expanded", "true");
}

function cerrarListaCarreras() {
  const input = document.getElementById("carrera");
  document.getElementById("lista-carreras").classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  indiceActivoCarrera = -1;
  document.querySelectorAll(".combobox-option.is-active").forEach((option) => {
    option.classList.remove("is-active");
  });
}

function seleccionarCarrera(nombre) {
  const input = document.getElementById("carrera");
  input.value = nombre;
  input.classList.remove("invalid");
  actualizarCoordinador();
  cerrarListaCarreras();
  input.focus();
}

function manejarTecladoCarreras(event) {
  const input = document.getElementById("carrera");
  const list = document.getElementById("lista-carreras");

  if (event.key === "Escape" || event.key === "Tab") {
    cerrarListaCarreras();
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (list.classList.contains("hidden")) {
      renderizarCarreras(input.value);
      abrirListaCarreras();
    }

    const opciones = [...list.querySelectorAll(".combobox-option")];
    if (opciones.length === 0) return;

    const delta = event.key === "ArrowDown" ? 1 : -1;
    indiceActivoCarrera = Math.max(
      0,
      Math.min(opciones.length - 1, indiceActivoCarrera + delta)
    );
    opciones.forEach((opcion, index) => {
      opcion.classList.toggle("is-active", index === indiceActivoCarrera);
    });
    const activa = opciones[indiceActivoCarrera];
    input.setAttribute("aria-activedescendant", activa.id);
    activa.scrollIntoView({ block: "nearest" });
    return;
  }

  if (event.key === "Enter") {
    const opciones = [...list.querySelectorAll(".combobox-option")];
    const activa = opciones[indiceActivoCarrera];
    const exacta = CARRERAS_POR_NOMBRE.get(normalizar(input.value));

    if (activa) {
      event.preventDefault();
      seleccionarCarrera(activa.textContent);
    } else if (exacta) {
      event.preventDefault();
      seleccionarCarrera(exacta.nombre);
    }
  }
}

/** Muestra el coordinador de la carrera elegida (texto de solo lectura). */
function actualizarCoordinador() {
  const inputCarrera = document.getElementById("carrera");
  const info = document.getElementById("coordinador-info");
  const nombre = document.getElementById("coordinador-nombre");
  const carrera = CARRERAS_POR_NOMBRE.get(normalizar(inputCarrera.value));

  if (!carrera) {
    info.classList.add("hidden");
    return;
  }

  nombre.textContent = carrera.coordinador
    ? `${carrera.coordinador.grado} ${carrera.coordinador.nombre}`
    : "SIN COORDINADOR";
  info.classList.remove("hidden");
}

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
        <input type="text" name="horas" class="form-input materia-input w-full rounded-lg px-3 py-2 text-sm" />
        <p class="mt-1 text-[10px] text-slate-300">Ej: 08:00-10:00</p>
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
      // Formatear fecha de yyyy-mm-dd a "dd de mes de yyyy"
      if (campo === "fecha" && valor) {
        valor = formatearFechaLarga(valor);
      }
      materia[campo] = valor;
    });
    // Inyectar nivel y paralelo estáticos en cada fila
    materia.nivel = nivelGlobal;
    materia.paralelo = paraleloGlobal;
    materias.push(materia);
  });

  // Normalizar la carrera y agregar los datos del coordinador a la plantilla
  const carrera = CARRERAS_POR_NOMBRE.get(normalizar(datos.carrera));
  if (carrera) datos.carrera = carrera.nombre;
  datos.carrera_mayusculas = datos.carrera.toUpperCase();
  datos.coordinador_grado = carrera?.coordinador?.grado || "";
  datos.coordinador_nombre = carrera?.coordinador?.nombre || "SIN COORDINADOR";
  datos.coordinador_cargo = carrera?.coordinador?.cargo || "Coordinador";

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
    const cedulaIncompleta =
      campo.id === "cedula" && valor !== "" && !PATRON_CEDULA.test(valor);
    const correoInvalido =
      campo.id === "correoInsti" && valor !== "" && !PATRON_CORREO_INSTITUCIONAL.test(valor);
    const carreraInvalida =
      campo.id === "carrera" && valor !== "" && !CARRERAS_POR_NOMBRE.has(normalizar(valor));
    const esInvalido =
      !valor ||
      cedulaIncompleta ||
      correoInvalido ||
      carreraInvalida ||
      (campo.id === "periodo" && valor === PERIODOS_ACADEMICOS_DEFAULT);

    if (esInvalido) {
      let mensaje = campo.etiqueta;
      if (cedulaIncompleta) mensaje += " (10 dígitos)";
      else if (correoInvalido) mensaje += " (se genera con la cédula)";
      else if (carreraInvalida) mensaje += " (selecciona una de la lista)";
      camposVacios.push(mensaje);
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
  if (input.id === "carrera") {
    input.classList.toggle("invalid", !CARRERAS_POR_NOMBRE.has(normalizar(valor)));
  } else if (input.id === "cedula") {
    input.classList.toggle("invalid", !PATRON_CEDULA.test(valor));
  } else if (input.id === "correoInsti") {
    input.classList.toggle("invalid", !PATRON_CORREO_INSTITUCIONAL.test(valor));
  } else if (input.tagName === "SELECT") {
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

  actualizarCoordinador();
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
      `Revisa estos campos: ${camposVacios.join(", ")}`,
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
