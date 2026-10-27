// Constantes y valores de partida del simulador

// Número de pisos del edificio (piso 1 en y = 0 m)
export const NUM_PISOS = 10

// Valores iniciales del formulario (ejemplo de la rúbrica)
export const VALORES_INICIALES = {
  masaCabina: 500, // kg
  masaPasajeros: 200, // kg
  gravedad: 9.81, // m/s²
  aceleracion: 1.5, // m/s²
  velocidadMaxima: 2.5, // m/s
  alturaPiso: 3, // m
  pisoInicial: 1,
  pisoDestino: 5,
}

// kg; solo sirve para dibujar cuántas personas hay en la cabina
export const MASA_PROMEDIO_PERSONA = 70
