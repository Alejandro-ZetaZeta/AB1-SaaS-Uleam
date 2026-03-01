from capData import obtener_fecha_actual

"""Esta clase es la clave del diccionario de todos los datos encapsulados
que se sobreeescribiran en la copia de la plantilla"""
class DatosJustificacion:
    @staticmethod
    def recolectar_datos():
        nombre = input()
        cedula = input()
        periodo = input()
        telefono = input()
        correoInsti = input()
        carrera = input()
        nivel = input()
        paralelo = input()
        materia = input()
        docente = input()
        horas = input()
        motivo = input()
        fecha = obtener_fecha_actual()

        return {
            "nombre": nombre,
            "cedula": cedula,
            "periodo": periodo,
            "telefono": telefono,
            "correoInsti": correoInsti,
            "carrera": carrera,
            "nivel": nivel,
            "paralelo": paralelo,
            "materia": materia,
            "docente": docente,
            "horas": horas,
            "motivo": motivo,
            "fecha": fecha
        }