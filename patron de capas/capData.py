from datetime import datetime
from docxtpl import DocxTemplate

class GestorDocumento:
    def __init__(self, plantilla):
        self.plantilla = plantilla

    """Uso de la libreria docxtpl para manipular y editar la plantilla.docx"""
    def generar_documento(self, datos, nombre_salida):
        doc = DocxTemplate(self.plantilla)
        doc.render(datos)
        doc.save(nombre_salida)

"""Uso de la libreria datetime para obtener la fecha actual del host que ejecuta el programa"""
@staticmethod
def obtener_fecha_actual():
    return datetime.today().strftime("%d/%m/%Y")
