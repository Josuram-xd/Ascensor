import { NUM_PISOS } from '../config.js'
import { Ascensor } from './Ascensor.js'
import { PerfilMovimiento, FASES } from './PerfilMovimiento.js'

// Campos numéricos del viaje, con su nombre en español para los mensajes de error
const ETIQUETAS = {
  masaCabina: 'La masa de la cabina',
  masaPasajeros: 'La masa de los pasajeros',
  gravedad: 'La gravedad',
  aceleracion: 'La aceleración',
  velocidadMaxima: 'La velocidad máxima',
  alturaPiso: 'La altura por piso',
  pisoInicial: 'El piso inicial',
  pisoDestino: 'El piso destino',
}

function esNumero(valor) {
  const esTextoONumero = typeof valor === 'number' || (typeof valor === 'string' && valor.trim() !== '')
  return esTextoONumero && Number.isFinite(Number(valor))
}

// Copia los campos numéricos (los valores de los formularios llegan como texto)
function convertirANumeros(parametros) {
  const numeros = {}
  for (const campo of Object.keys(ETIQUETAS)) {
    numeros[campo] = Number(parametros[campo])
  }
  return numeros
}

export class Simulacion {
  constructor(parametros) {
    const errores = Simulacion.validar(parametros)
    if (errores.length > 0) throw new Error(errores.join(' '))

    const p = convertirANumeros(parametros)
    this.parametros = p
    this.ascensor = new Ascensor(p.masaCabina, p.masaPasajeros)

    // +1 si sube, −1 si baja
    this.direccion = p.pisoDestino > p.pisoInicial ? 1 : -1

    // Altura del piso k: y = (k − 1)·alturaPiso
    this.alturaInicial = (p.pisoInicial - 1) * p.alturaPiso // m
    this.alturaFinal = (p.pisoDestino - 1) * p.alturaPiso // m

    // Distancia recorrida: d = |y_final − y_inicial|
    this.distancia = Math.abs(this.alturaFinal - this.alturaInicial) // m
    this.perfil = new PerfilMovimiento(this.distancia, p.aceleracion, p.velocidadMaxima)
    this.tiempoTotal = this.perfil.tiempoTotal // s
  }

  // Estado completo del ascensor en el instante t (s), con signo (+ arriba)
  estadoEn(t) {
    const tiempo = Math.min(Math.max(t, 0), this.tiempoTotal)
    const perfil = this.perfil.estadoEn(tiempo)
    const g = this.parametros.gravedad

    // La aceleración del perfil es relativa al viaje; aquí se pasa al eje vertical
    const aceleracion = this.direccion * perfil.aceleracion // m/s²

    return {
      tiempo, // s
      fase: perfil.fase,
      posicion: this.alturaInicial + this.direccion * perfil.recorrido, // m: y = y0 ± x
      velocidad: this.direccion * perfil.rapidez, // m/s: v = ±rapidez
      aceleracion, // m/s²
      fuerzaNeta: this.ascensor.fuerzaNeta(aceleracion), // N: ΣF = m·a
      peso: this.ascensor.peso(g), // N: P = m·g
      tension: this.ascensor.tension(g, aceleracion), // N: T = m·(g + a)
    }
  }

  // Fuerzas y duración de cada fase, en orden Arranque, Movimiento, Frenado, Detención
  resumenPorFase() {
    const a = this.parametros.aceleracion
    const g = this.parametros.gravedad

    // Aceleración de cada fase respecto al sentido del viaje
    const aceleracionPorFase = {
      [FASES.ARRANQUE]: a,
      [FASES.MOVIMIENTO]: 0,
      [FASES.FRENADO]: -a,
      [FASES.DETENCION]: 0,
    }

    return Object.values(FASES).map((fase) => {
      const aceleracion = this.direccion * aceleracionPorFase[fase] // m/s², con signo
      return {
        fase,
        duracion: this.perfil.duracionDe(fase), // s
        aceleracion,
        fuerzaNeta: this.ascensor.fuerzaNeta(aceleracion), // N
        tension: this.ascensor.tension(g, aceleracion), // N
      }
    })
  }

  // Estados equiespaciados en el tiempo, de 0 a tiempoTotal (ambos incluidos)
  muestrear(cantidad = 200) {
    const intervalos = Math.max(cantidad - 1, 1)
    const estados = []
    for (let i = 0; i < cantidad; i++) {
      const fraccion = i / intervalos // va de 0 a 1; en el último punto vale exactamente 1
      estados.push(this.estadoEn(this.tiempoTotal * fraccion))
    }
    return estados
  }

  // Lista de errores en español; [] si los parámetros son válidos
  static validar(parametros) {
    const errores = []

    for (const [campo, etiqueta] of Object.entries(ETIQUETAS)) {
      if (!esNumero(parametros[campo])) errores.push(`${etiqueta} debe ser un número.`)
    }
    if (errores.length > 0) return errores

    const p = convertirANumeros(parametros)

    if (p.masaCabina <= 0) errores.push('La masa de la cabina debe ser mayor que 0 kg.')
    if (p.masaPasajeros < 0) errores.push('La masa de los pasajeros no puede ser negativa.')
    if (p.gravedad <= 0) errores.push('La gravedad debe ser mayor que 0 m/s².')
    if (p.aceleracion <= 0) errores.push('La aceleración debe ser mayor que 0 m/s².')
    if (p.aceleracion >= p.gravedad) {
      errores.push('La aceleración debe ser menor que la gravedad; si no, el cable quedaría flojo al bajar.')
    }
    if (p.velocidadMaxima <= 0) errores.push('La velocidad máxima debe ser mayor que 0 m/s.')
    if (p.alturaPiso <= 0) errores.push('La altura por piso debe ser mayor que 0 m.')

    const pisos = [
      ['pisoInicial', 'El piso inicial'],
      ['pisoDestino', 'El piso destino'],
    ]
    for (const [campo, nombre] of pisos) {
      if (!Number.isInteger(p[campo]) || p[campo] < 1 || p[campo] > NUM_PISOS) {
        errores.push(`${nombre} debe ser un número entero entre 1 y ${NUM_PISOS}.`)
      }
    }
    if (p.pisoInicial === p.pisoDestino) errores.push('El piso inicial y el piso destino deben ser distintos.')

    return errores
  }
}
