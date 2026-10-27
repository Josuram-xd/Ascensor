// Perfil de velocidad del viaje: arranque, movimiento, frenado y detención
export const FASES = {
  ARRANQUE: 'Arranque',
  MOVIMIENTO: 'Movimiento',
  FRENADO: 'Frenado',
  DETENCION: 'Detención',
}

// Todas las magnitudes son positivas (m, m/s², m/s); el sentido se aplica en Simulacion
export class PerfilMovimiento {
  constructor(distancia, aceleracion, velocidadMaxima) {
    this.distancia = distancia // m
    this.aceleracion = aceleracion // m/s²
    this.velocidadMaxima = velocidadMaxima // m/s

    // Distancia necesaria para llegar a la velocidad máxima partiendo del reposo:
    // v² = 2·a·x  →  x = v²/(2·a)
    const distanciaHastaVmax = (velocidadMaxima ** 2) / (2 * aceleracion)

    if (distancia >= 2 * distanciaHastaVmax) {
      // Perfil trapezoidal: hay un tramo a velocidad constante
      this.velocidadPico = velocidadMaxima // m/s
      this.tiempoAceleracion = velocidadMaxima / aceleracion // v = a·t  →  t = v/a
      this.distanciaAceleracion = distanciaHastaVmax // m
      // Movimiento rectilíneo uniforme: x = v·t  →  t = (d − 2·x_acel) / v
      this.tiempoCrucero = (distancia - 2 * distanciaHastaVmax) / velocidadMaxima
    } else {
      // Perfil triangular: no alcanza la velocidad máxima; cada mitad del viaje recorre d/2
      // v² = 2·a·(d/2)  →  v = √(a·d)
      this.velocidadPico = Math.sqrt(aceleracion * distancia) // m/s
      this.tiempoAceleracion = this.velocidadPico / aceleracion // t = v/a
      this.distanciaAceleracion = distancia / 2 // m
      this.tiempoCrucero = 0 // s, no hay tramo constante
    }

    // El frenado dura lo mismo que el arranque (simétrico)
    this.tiempoTotal = 2 * this.tiempoAceleracion + this.tiempoCrucero // s
  }

  // Estado del perfil en el instante t (s):
  // { fase, recorrido (m desde el origen), rapidez (m/s ≥ 0), aceleracion (m/s², relativa al viaje) }
  estadoEn(t) {
    if (t >= this.tiempoTotal) {
      return { fase: FASES.DETENCION, recorrido: this.distancia, rapidez: 0, aceleracion: 0 }
    }

    const tiempo = Math.max(t, 0)
    const a = this.aceleracion
    const v = this.velocidadPico
    const tA = this.tiempoAceleracion
    const tC = this.tiempoCrucero
    const dA = this.distanciaAceleracion

    if (tiempo < tA) {
      // Arranque (MRUA desde el reposo): x = ½·a·t²  v = a·t
      return { fase: FASES.ARRANQUE, recorrido: 0.5 * a * tiempo ** 2, rapidez: a * tiempo, aceleracion: a }
    }

    if (tiempo < tA + tC) {
      // Movimiento (MRU): x = x0 + v·t
      const tEnTramo = tiempo - tA
      return { fase: FASES.MOVIMIENTO, recorrido: dA + v * tEnTramo, rapidez: v, aceleracion: 0 }
    }

    // Frenado (MRUA desacelerado): x = x0 + v·t − ½·a·t²  con  v(t) = v − a·t
    const tEnFrenado = tiempo - tA - tC
    const x0 = this.distancia - dA // posición al empezar a frenar
    return {
      fase: FASES.FRENADO,
      recorrido: x0 + v * tEnFrenado - 0.5 * a * tEnFrenado ** 2,
      rapidez: Math.max(v - a * tEnFrenado, 0),
      aceleracion: -a,
    }
  }

  // Duración (s) de cada fase
  duracionDe(fase) {
    switch (fase) {
      case FASES.ARRANQUE:
        return this.tiempoAceleracion
      case FASES.MOVIMIENTO:
        return this.tiempoCrucero
      case FASES.FRENADO:
        return this.tiempoAceleracion
      default:
        return 0
    }
  }
}
