// Dibujo del edificio: fachada, hueco, pisos, cabina, cable y diagrama de fuerzas.
// Todo se calcula en píxeles CSS; el canvas se escala por devicePixelRatio para verse nítido.

const TINTA = '#131416'
const GRIS = '#5d5f60'
const ACENTO = '#1b6c80'
const FONDO = '#ffffff'
const FACHADA = '#f4f6f8'
const BORDE = '#e8eaec'
const HUECO = '#ebedee'
const FUENTE = '12px "IBM Plex Sans", system-ui, sans-serif'
const FUENTE_NEGRITA = '600 12px "IBM Plex Sans", system-ui, sans-serif'

const TECHO = 40          // px reservados arriba para la sala de máquinas
const SUELO_MARGEN = 72   // px bajo el suelo: foso del ascensor (deja sitio a la flecha del peso)
const ANCHO_HUECO = 90    // px, ancho del hueco por donde sube la cabina
const MARGEN_CABINA = 6   // la cabina es 12 px más angosta que el hueco (6 a cada lado)
const MAX_PERSONAS = 6
const SALA_Y = 8          // px, arriba de la sala de máquinas
const RADIO_POLEA = 7

export class DibujoEdificio {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  // Ajusta el canvas al tamaño CSS × devicePixelRatio y dibuja en píxeles CSS.
  prepararLienzo() {
    const dpr = window.devicePixelRatio || 1
    const ancho = this.canvas.clientWidth
    const alto = this.canvas.clientHeight
    const anchoReal = Math.round(ancho * dpr)
    const altoReal = Math.round(alto * dpr)
    // Asignar width/height borra el canvas, así que solo se hace si el tamaño cambió
    if (this.canvas.width !== anchoReal || this.canvas.height !== altoReal) {
      this.canvas.width = anchoReal
      this.canvas.height = altoReal
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { ancho, alto }
  }

  dibujar({ numPisos, alturaPiso, posicion, pisoInicial, pisoDestino, tension, peso, personas }) {
    const { ancho, alto } = this.prepararLienzo()
    const ctx = this.ctx
    ctx.fillStyle = FONDO
    ctx.fillRect(0, 0, ancho, alto)
    ctx.font = FUENTE

    // Escala vertical: los pisos ocupan el alto disponible entre el techo y el suelo
    const xHueco = Math.round(ancho * 0.4 - ANCHO_HUECO / 2)
    const xCentro = xHueco + ANCHO_HUECO / 2
    const ySuelo = alto - SUELO_MARGEN
    const altoPiso = (ySuelo - TECHO) / numPisos
    // Altura en metros → píxeles. La losa del piso k está en (k−1)·alturaPiso.
    const yDeMetros = (metros) => ySuelo - (metros / alturaPiso) * altoPiso

    // Cabina: su base está en la posición (m); mide el 80% de un piso
    const altoCabina = 0.8 * altoPiso
    const cabina = {
      x: xHueco + MARGEN_CABINA,
      y: yDeMetros(posicion) - altoCabina,
      ancho: ANCHO_HUECO - 2 * MARGEN_CABINA,
      alto: altoCabina,
    }

    this.dibujarFachada(ancho, ySuelo)
    this.dibujarHueco(xHueco, ySuelo)
    this.dibujarPisos({ ancho, xHueco, ySuelo, altoPiso, numPisos, pisoInicial, pisoDestino })
    this.dibujarSalaMaquinas(xCentro)
    this.dibujarCable(xCentro, cabina, tension, peso)
    this.dibujarCabina(cabina, personas)
    this.dibujarFuerzas(cabina, tension, peso, alto)
  }

  // Fachada plana con borde fino; la sala de máquinas se apoya en su techo
  dibujarFachada(ancho, ySuelo) {
    const ctx = this.ctx
    ctx.fillStyle = FACHADA
    ctx.fillRect(0, TECHO, ancho, ySuelo - TECHO)
    ctx.strokeStyle = BORDE
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, TECHO + 0.5, ancho - 1, ySuelo - TECHO - 1)
  }

  // Columna central del hueco, un poco más oscura que la fachada; baja hasta el foso
  dibujarHueco(xHueco, ySuelo) {
    this.ctx.fillStyle = HUECO
    this.ctx.fillRect(xHueco, TECHO, ANCHO_HUECO, ySuelo + SUELO_MARGEN / 2 - TECHO)
  }

  // Losas, números de piso, marcas de inicio/destino y línea de suelo
  dibujarPisos({ ancho, xHueco, ySuelo, altoPiso, numPisos, pisoInicial, pisoDestino }) {
    const ctx = this.ctx
    // Losa del piso k en ySuelo − (k−1)·altoPiso; hay numPisos + 1 losas
    const yLosa = (k) => ySuelo - (k - 1) * altoPiso

    ctx.strokeStyle = BORDE
    ctx.lineWidth = 1
    for (let k = 1; k <= numPisos + 1; k++) {
      this.linea(0, yLosa(k), ancho, yLosa(k))
    }

    // Números centrados en cada piso, a la izquierda del hueco
    for (let k = 1; k <= numPisos; k++) {
      const esDestino = k === pisoDestino
      ctx.font = esDestino ? FUENTE_NEGRITA : FUENTE
      ctx.fillStyle = esDestino ? TINTA : GRIS
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(k), xHueco - 10, yLosa(k) - altoPiso / 2)
    }
    ctx.font = FUENTE

    // Marca gris en el piso de inicio; marca de acento en el destino (cruza el hueco)
    ctx.strokeStyle = GRIS
    this.linea(xHueco - 14, yLosa(pisoInicial), xHueco, yLosa(pisoInicial))
    ctx.strokeStyle = ACENTO
    this.linea(xHueco - 14, yLosa(pisoDestino), xHueco + ANCHO_HUECO, yLosa(pisoDestino))

    // Línea de suelo
    ctx.strokeStyle = TINTA
    ctx.lineWidth = 2
    this.linea(0, ySuelo, ancho, ySuelo)
  }

  // Caja de la sala de máquinas con borde de tinta, centrada sobre el hueco
  dibujarSalaMaquinas(xCentro) {
    const ctx = this.ctx
    const ancho = 110
    const alto = TECHO - SALA_Y
    ctx.fillStyle = FONDO
    ctx.fillRect(xCentro - ancho / 2, SALA_Y, ancho, alto)
    ctx.strokeStyle = TINTA
    ctx.lineWidth = 1
    ctx.strokeRect(xCentro - ancho / 2 + 0.5, SALA_Y + 0.5, ancho - 1, alto - 1)
  }

  // Cable de la polea a la cabina; se engrosa cuando la tensión supera al peso
  dibujarCable(xCentro, cabina, tension, peso) {
    const ctx = this.ctx
    const pesoSeguro = peso > 0 ? peso : 1
    const yPolea = SALA_Y + (TECHO - SALA_Y) / 2
    // T/P entre 0,7 y 1,3 → grosor de 1,5 a 4,5 px
    const grosor = 1.5 + 3 * limitar((tension / pesoSeguro - 0.7) / 0.6, 0, 1)

    ctx.strokeStyle = ACENTO
    ctx.lineWidth = grosor
    this.linea(xCentro, yPolea, xCentro, cabina.y)

    // Polea encima del cable para que tape su inicio
    ctx.beginPath()
    ctx.arc(xCentro, yPolea, RADIO_POLEA, 0, 2 * Math.PI)
    ctx.fillStyle = FONDO
    ctx.fill()
    ctx.strokeStyle = TINTA
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Cabina blanca con borde de tinta, puertas y pasajeros (máximo 6)
  dibujarCabina(cabina, personas) {
    const ctx = this.ctx
    ctx.fillStyle = FONDO
    ctx.fillRect(cabina.x, cabina.y, cabina.ancho, cabina.alto)
    ctx.strokeStyle = TINTA
    ctx.lineWidth = 1.5
    ctx.strokeRect(cabina.x, cabina.y, cabina.ancho, cabina.alto)

    // Puertas: dos mitades separadas por una línea fina en el centro
    const xCentro = cabina.x + cabina.ancho / 2
    ctx.strokeStyle = GRIS
    ctx.lineWidth = 1
    this.linea(xCentro, cabina.y + 2, xCentro, cabina.y + cabina.alto - 2)

    const cantidad = Math.min(Math.max(0, Math.floor(personas || 0)), MAX_PERSONAS)
    if (cantidad > 0) this.dibujarPersonas(cabina, cantidad)
  }

  // Figuras sencillas (cabeza y cuerpo) repartidas por la cabina, al 60% de opacidad
  dibujarPersonas(cabina, cantidad) {
    const ctx = this.ctx
    const suelo = cabina.y + cabina.alto - 3
    const altoCuerpo = cabina.alto * 0.42
    const radioCabeza = Math.max(2.5, cabina.alto * 0.08)
    const separacion = cabina.ancho / cantidad

    ctx.fillStyle = TINTA
    ctx.globalAlpha = 0.6
    for (let i = 0; i < cantidad; i++) {
      const cx = cabina.x + separacion * (i + 0.5)
      ctx.fillRect(cx - 4, suelo - altoCuerpo, 8, altoCuerpo)
      ctx.beginPath()
      ctx.arc(cx, suelo - altoCuerpo - radioCabeza - 2, radioCabeza, 0, 2 * Math.PI)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // Diagrama de cuerpo libre: T (cable, hacia arriba) y P (peso, hacia abajo)
  dibujarFuerzas(cabina, tension, peso, alto) {
    const x = cabina.x + cabina.ancho + 12
    const base = cabina.y + cabina.alto
    // Cada flecha se recorta para no salirse del canvas
    const largoT = Math.min(longitudFlecha(tension, peso), cabina.y - 2)
    const largoP = Math.min(longitudFlecha(peso, peso), alto - base - 2)

    if (largoT > 0) {
      this.dibujarFlecha({
        x, yInicio: cabina.y, largo: largoT, haciaArriba: true,
        color: ACENTO, texto: 'T = ' + formatearNewton(tension),
      })
    }
    if (largoP > 0) {
      this.dibujarFlecha({
        x, yInicio: base, largo: largoP, haciaArriba: false,
        color: TINTA, texto: 'P = ' + formatearNewton(peso),
      })
    }
  }

  // Flecha de 2 px con cabeza triangular rellena y su etiqueta al lado
  dibujarFlecha({ x, yInicio, largo, haciaArriba, color, texto }) {
    const ctx = this.ctx
    const dir = haciaArriba ? -1 : 1
    const yFin = yInicio + dir * largo
    const cabeza = Math.min(8, largo)
    const yBaseCabeza = yFin - dir * cabeza

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    this.linea(x, yInicio, x, yBaseCabeza)

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, yFin)
    ctx.lineTo(x - 4, yBaseCabeza)
    ctx.lineTo(x + 4, yBaseCabeza)
    ctx.closePath()
    ctx.fill()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, x + 8, (yInicio + yFin) / 2)
  }

  // Traza un segmento recto entre dos puntos con el estilo actual
  linea(x1, y1, x2, y2) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }
}

// Largo de flecha proporcional a la fuerza: 60 px por cada peso, entre 20 y 110 px
function longitudFlecha(fuerza, peso) {
  const pesoSeguro = peso > 0 ? peso : 1
  return limitar(60 * (fuerza / pesoSeguro), 20, 110)
}

// Ej.: 7917 → "7.917 N"
function formatearNewton(valor) {
  return valor.toLocaleString('es-CO', { maximumFractionDigits: 0 }) + ' N'
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo)
}
