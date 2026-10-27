// Gráfica de una magnitud contra el tiempo: curva planeada en gris y tramo recorrido en color.
// Canvas 2D simple; todo se calcula en píxeles CSS.

const TINTA = '#131416'
const GRIS = '#5d5f60'
const FONDO = '#ffffff'
const REJILLA = '#e5e5e5'
const PLANEADA = '#cdced1'
const FUENTE = '12px "IBM Plex Sans", system-ui, sans-serif'

// Margen alrededor del área de dibujo (px): sitio para las etiquetas de los ejes
const MARGEN = { izquierda: 48, derecha: 12, arriba: 12, abajo: 24 }

export class GraficaLinea {
  constructor(canvas, { color, unidad }) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.color = color
    this.unidad = unidad
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

  // puntos: [{ t, valor }] (serie completa); tiempoActual en segundos
  dibujar(puntos, tiempoActual) {
    const { ancho, alto } = this.prepararLienzo()
    const ctx = this.ctx
    ctx.fillStyle = FONDO
    ctx.fillRect(0, 0, ancho, alto)
    ctx.font = FUENTE
    if (!puntos || puntos.length === 0) return

    const valores = puntos.map((p) => p.valor)
    const marcasY = calcularMarcas(Math.min(...valores), Math.max(...valores), 4)
    const marcasX = calcularMarcasTiempo(puntos[puntos.length - 1].t)

    const area = {
      x: MARGEN.izquierda,
      y: MARGEN.arriba,
      ancho: ancho - MARGEN.izquierda - MARGEN.derecha,
      alto: alto - MARGEN.arriba - MARGEN.abajo,
    }
    // Mapas de datos a píxeles. El eje Y va de la marca más baja a la más alta.
    const yMin = marcasY[0]
    const yMax = marcasY[marcasY.length - 1]
    const tFin = puntos[puntos.length - 1].t || 1
    const mapa = {
      x: (t) => area.x + (t / tFin) * area.ancho,
      y: (v) => area.y + ((yMax - v) / (yMax - yMin)) * area.alto,
    }

    this.dibujarRejilla(marcasY, area, mapa)
    this.dibujarEjeY(marcasY, area, mapa)
    this.dibujarEjeX(marcasX, area, mapa)

    // Curva planeada completa en gris
    this.dibujarTrazo(puntos, mapa, PLANEADA, 1.5)

    // Tramo ya recorrido (t ≤ tiempoActual) en el color de la serie, terminando en el punto actual
    const t = limitar(tiempoActual, puntos[0].t, puntos[puntos.length - 1].t)
    const valorActual = valorEn(puntos, t)
    if (t > puntos[0].t) {
      const recorrido = puntos.filter((p) => p.t <= t)
      recorrido.push({ t, valor: valorActual })
      this.dibujarTrazo(recorrido, mapa, this.color, 2)
    }

    this.dibujarPunto(mapa.x(t), mapa.y(valorActual))
  }

  // Líneas horizontales 1px en cada marca y una línea de cero más oscura
  dibujarRejilla(marcasY, area, mapa) {
    const ctx = this.ctx
    ctx.strokeStyle = REJILLA
    ctx.lineWidth = 1
    for (const marca of marcasY) {
      const y = Math.round(mapa.y(marca)) + 0.5
      this.linea(area.x, y, area.x + area.ancho, y)
    }

    ctx.globalAlpha = 0.4
    ctx.strokeStyle = TINTA
    const y0 = Math.round(mapa.y(0)) + 0.5
    this.linea(area.x, y0, area.x + area.ancho, y0)
    ctx.globalAlpha = 1
  }

  // Números a la izquierda del área; solo la marca superior lleva la unidad
  dibujarEjeY(marcasY, area, mapa) {
    const ctx = this.ctx
    ctx.fillStyle = GRIS
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    marcasY.forEach((marca, i) => {
      let texto = formatearNumero(marca)
      if (i === marcasY.length - 1 && this.unidad) texto += ' ' + this.unidad
      ctx.fillText(texto, area.x - 6, mapa.y(marca))
    })
  }

  // Etiquetas de segundos debajo del área; la primera alineada a la izquierda, sin salirse por la derecha
  dibujarEjeX(marcasX, area, mapa) {
    const ctx = this.ctx
    ctx.fillStyle = GRIS
    ctx.textBaseline = 'top'
    const yTexto = area.y + area.alto + 6
    marcasX.forEach((t, i) => {
      const texto = formatearNumero(t) + ' s'
      if (i === 0) {
        ctx.textAlign = 'left'
        ctx.fillText(texto, area.x, yTexto)
      } else {
        const mitad = ctx.measureText(texto).width / 2
        const x = Math.min(mapa.x(t), area.x + area.ancho + MARGEN.derecha - mitad - 2)
        ctx.textAlign = 'center'
        ctx.fillText(texto, x, yTexto)
      }
    })
  }

  // Trazo de segmentos rectos entre los puntos (sin suavizado ni relleno)
  dibujarTrazo(puntos, mapa, color, grosor) {
    if (puntos.length < 2) return
    const ctx = this.ctx
    ctx.beginPath()
    puntos.forEach((p, i) => {
      if (i === 0) ctx.moveTo(mapa.x(p.t), mapa.y(p.valor))
      else ctx.lineTo(mapa.x(p.t), mapa.y(p.valor))
    })
    ctx.strokeStyle = color
    ctx.lineWidth = grosor
    ctx.stroke()
  }

  // Punto actual: disco de 8 px con anillo blanco de 2 px
  dibujarPunto(x, y) {
    const ctx = this.ctx
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.strokeStyle = FONDO
    ctx.lineWidth = 2
    ctx.stroke()
  }

  linea(x1, y1, x2, y2) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }
}

// Marcas "bonitas" (1, 2, 2,5 o 5 × 10ⁿ) para el eje Y.
// Incluye el 0 y deja al menos una marca más allá de los datos, así la línea nunca toca el borde.
function calcularMarcas(min, max, cantidad = 4) {
  let inicio = Math.min(min, 0)
  let fin = Math.max(max, 0)
  if (fin - inicio < 1e-9) {
    // Todos los valores son iguales a 0: rango de −1 a 1
    inicio = -1
    fin = 1
  }
  let paso = pasoBonito((fin - inicio) / cantidad)
  let marcas = generarMarcas(inicio, fin, paso)
  // Si quedan más de 6 líneas, se usa un paso más grande
  while (marcas.length > 6) {
    paso = pasoBonito(paso * 1.01)
    marcas = generarMarcas(inicio, fin, paso)
  }
  return marcas
}

// Eje X: pasos bonitos desde 0 hasta el tiempo final (4 a 6 marcas)
function calcularMarcasTiempo(tFin) {
  if (tFin <= 0) return [0]
  const paso = pasoBonito(tFin / 5)
  const marcas = []
  for (let n = 0; n * paso <= tFin + 1e-9; n++) {
    marcas.push(redondear(n * paso))
  }
  return marcas
}

// Paso bonito mayor o igual que el valor bruto: 1, 2, 2,5 o 5 por 10 elevado a n
function pasoBonito(bruto) {
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const base = bruto / potencia
  const escalon = [1, 2, 2.5, 5, 10].find((e) => e >= base - 1e-9)
  return redondear(escalon * potencia)
}

// Marcas en múltiplos del paso: una por debajo de inicio y una por encima de fin.
// Si el rango empieza o termina justo en 0, el 0 es el borde (no hay marcas negativas sin datos negativos).
function generarMarcas(inicio, fin, paso) {
  let n0 = Math.floor(inicio / paso)
  if (inicio < 0 && redondear(n0 * paso) >= inicio) n0 -= 1
  const n1 = fin > 0 ? Math.floor(fin / paso) + 1 : 0
  const marcas = []
  for (let n = n0; n <= n1; n++) marcas.push(redondear(n * paso))
  return marcas
}

// Interpola linealmente el valor en el tiempo t (la serie está ordenada por t)
function valorEn(puntos, t) {
  if (t <= puntos[0].t) return puntos[0].valor
  for (let i = 0; i < puntos.length - 1; i++) {
    const a = puntos[i]
    const b = puntos[i + 1]
    if (t <= b.t) {
      const fraccion = (t - a.t) / (b.t - a.t || 1)
      return a.valor + fraccion * (b.valor - a.valor)
    }
  }
  return puntos[puntos.length - 1].valor
}

// Números en es-CO con 2 decimales como máximo; evita mostrar "-0"
function formatearNumero(valor) {
  const limpio = Math.abs(valor) < 1e-12 ? 0 : valor
  return limpio.toLocaleString('es-CO', { maximumFractionDigits: 2 })
}

// Quita el ruido de punto flotante (0.1 + 0.2 → 0.3)
function redondear(valor) {
  return Number(valor.toPrecision(12))
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo)
}
