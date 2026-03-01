import tkinter as tk
from tkinter import messagebox
from capLogic import obtener_fecha_actual
from capData import GestorDocumento
"""Se importan las anteriores capas y la libreria tkinter para crear la interfaz gráfica."""

class JustificacionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Generador de Justificaciones")
        self.root.geometry("510x500")  
        self.root.configure(bg="cadetblue2")  
        self.periodos_academicos = ["--Selecciona tu periodo--","2026-1", "2026-2", "2027-1"]

        self.campos = {
            "nombre": tk.StringVar(),
            "cedula": tk.StringVar(),
            "periodo": tk.StringVar(value=self.periodos_academicos[0]),
            "telefono": tk.StringVar(),
            "correoInsti": tk.StringVar(),
            "carrera": tk.StringVar(),
            "nivel": tk.StringVar(),
            "paralelo": tk.StringVar(),
            "materia": tk.StringVar(),
            "docente": tk.StringVar(),
            "horas": tk.StringVar(),
            "motivo": tk.StringVar(),
        }

        self.etiquetas = {
            "nombre": "Nombre Completo",
            "cedula": "Cédula de Identidad",
            "periodo": "Período Académico",
            "telefono": "Teléfono",
            "correoInsti": "Correo Institucional",
            "carrera": "Carrera",
            "nivel": "Semestre",
            "paralelo": "Paralelo",
            "materia": "Asignatura",
            "docente": "Docente",
            "horas": "Horas a Justificar",
            "motivo": "Motivo de Justificación",
        }

        self.crear_formulario()

        tk.Button(
            root, text="Generar Justificación", command=self.generar_documento, bg="turquoise1", fg="black", font=("Arial", 12, "bold")).grid(row=14, column=0, columnspan=2, pady=10)

        tk.Button(
            root, text="Restablecer Formulario", command=self.restablecer_formulario, bg="salmon", fg="black", font=("Arial", 12, "bold")).grid(row=15, column=0, columnspan=2, pady=10)

    def crear_formulario(self):
        row_num = 0
        for clave, variable in self.campos.items():
            etiqueta = self.etiquetas[clave]

            # Crear etiqueta y campo en dos columnas para una mejor alineación usando grid
            tk.Label(self.root, text=etiqueta, bg="cadetblue2", font=("Arial", 10, "bold")).grid(row=row_num, column=0, sticky="e", padx=10, pady=5)
            
            # Para el período, usar OptionMenu
            if clave == "periodo":
                menu_frame = tk.Frame(self.root)  # Envolver OptionMenu en un frame
                menu_frame.grid(row=row_num, column=1, padx=10, pady=5, sticky="w")
                option_menu = tk.OptionMenu(menu_frame, variable, *self.periodos_academicos)
                option_menu.config(width=35, font=("Arial", 10))  # Ajustar el tamaño del OptionMenu
                option_menu.pack()
            else:
                entry = tk.Entry(self.root, textvariable=variable, width=40, font=("Arial", 10))
                entry.grid(row=row_num, column=1, padx=10, pady=5, sticky="w")

                # Validar longitud y tipo de datos para cedula y telefono
                if clave in ["cedula", "telefono"]:
                    entry.config(validate="key", validatecommand=(self.root.register(self.validar_entrada), "%P", 10))

            row_num += 1

    def generar_documento(self):
        try:
            datos = {clave: var.get().strip() for clave, var in self.campos.items()}
            
            # Verificar campos vacíos
            campos_vacios = [self.etiquetas[clave] for clave, valor in datos.items() if not valor or (clave == "periodo" and valor == self.periodos_academicos[0])]
            if campos_vacios:
                messagebox.showwarning("Advertencia", f"Los siguientes campos están vacíos o no válidos: {', '.join(campos_vacios)}")
                return  
            
            datos["fecha"] = obtener_fecha_actual()

            gestor_documento = GestorDocumento("VersionFinalProyecto\\patron de capas\\Oficio de Justificacion_ Tecnologias de la Informacion.docx")
            nombre_salida = f"Justificacion_{datos['nombre']}.docx"
            gestor_documento.generar_documento(datos, nombre_salida)

            messagebox.showinfo("Éxito", f"Documento generado con éxito:\n{nombre_salida}")
        except Exception as e:
            messagebox.showerror("Error", f"Ocurrió un problema: {str(e)}")

    def restablecer_formulario(self):
        for clave, var in self.campos.items():
            if clave == "periodo":
                var.set(self.periodos_academicos[0])
            else:
                var.set("")

    def validar_entrada(self, texto, max_len):
        return texto.isdigit() and len(texto) <= int(max_len)

if __name__ == "__main__":
    root = tk.Tk()
    app = JustificacionApp(root)
    root.mainloop()
