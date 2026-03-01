/**
 * docGenerator.js — Capa de Datos (equivalente a capData.py / GestorDocumento)
 * Carga la plantilla .docx, renderiza los placeholders y descarga el resultado.
 */

const TEMPLATE_PATH =
  "templates/Oficio de Justificacion_ Tecnologias de la Informacion.docx";

/**
 * Genera un documento Word a partir de la plantilla y los datos del formulario.
 * Equivale a:
 *   doc = DocxTemplate(plantilla)
 *   doc.render(datos)
 *   doc.save(nombre_salida)
 *
 * @param {Object} datos — Diccionario con los valores del formulario
 * @param {string} nombreSalida — Nombre del archivo de salida
 */
export async function generarDocumento(datos, nombreSalida) {
  // 1. Cargar la plantilla como ArrayBuffer
  const response = await fetch(TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error(
      `No se pudo cargar la plantilla: ${response.status} ${response.statusText}`
    );
  }
  const content = await response.arrayBuffer();

  // 2. Descomprimir con PizZip (equivalente a la lectura interna de docxtpl)
  const zip = new window.PizZip(content);

  // 3. Crear instancia de Docxtemplater y renderizar
  const doc = new window.docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });

  doc.render(datos);

  // 4. Generar el blob del documento resultante
  const out = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  // 5. Descargar el archivo (equivalente a doc.save())
  const saveAs = window.saveAs;
  saveAs(out, nombreSalida);
}
