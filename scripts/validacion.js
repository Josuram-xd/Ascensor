// Validación: compara cálculos hechos a mano con la clase Simulacion.
// Los valores "manual" se calculan aquí con las fórmulas de la física, sin usar las clases.
// Uso: npm run validar
import { Simulacion } from '../src/fisica/Simulacion.js'
import { FASES } from '../src/fisica/PerfilMovimiento.js'
import { formatear } from '../src/utilidades/formato.js'

const G = 9.81 // m/s²
const TOLERANCIA = 0.01 // % de error máximo aceptado

function fila(magnitud, unidad, decimales, manual, programa) {
  return { magnitud, unidad, decimales, manual, programa }
}

// Caso 1 (rúbrica): cabina 500 kg, pasajeros 200 kg, a = 1,5 m/s², v = 2,5 m/s, del piso 1 al 5, h = 3 m
function casoRubrica() {
  const sim = new Simulacion({
    masaCabina: 500, masaPasajeros: 200, gravedad: G, aceleracion: 1.5,
    velocidadMaxima: 2.5, alturaPiso: 3, pisoInicial: 1, pisoDestino: 5,
  })
  // Cálculos a mano
  const m = 500 + 200 // kg: masa total
  const a = 1.5 // m/s²
  const v = 2.5 // m/s
  const d = (5 - 1) * 3 // m: 4 pisos de 3 m
  const tA = v / a // s: t = v/a
  const dA = (v * v) / (2 * a) // m: x = v²/(2a)
  const tC = (d - 2 * dA) / v // s: t = x/v (MRU)
  const tTotal = 2 * tA + tC // s
  const estadoArranque = sim.estadoEn(0)
  const estadoMovimiento = sim.estadoEn(3) // t = 3 s está dentro del tramo a velocidad constante
  const posicionEn4 = dA + v * (4 - tA) // m: MRU tras el arranque
  return {
    nombre: 'Rúbrica: piso 1 → 5',
    filas: [
      fila('Masa total', 'kg', 0, m, sim.ascensor.masaTotal),
      fila('Peso', 'N', 0, m * G, estadoArranque.peso), // P = m·g
      fila('Fuerza neta (arranque)', 'N', 0, m * a, estadoArranque.fuerzaNeta), // ΣF = m·a
      fila('Tensión (arranque)', 'N', 0, m * (G + a), estadoArranque.tension), // T = m(g + a)
      fila('Tensión (movimiento, t = 3 s)', 'N', 0, m * G, estadoMovimiento.tension), // a = 0 → T = m·g
      fila('Distancia', 'm', 0, d, sim.distancia),
      fila('Tiempo total', 's', 2, tTotal, sim.tiempoTotal),
      fila('Posición (t = 4 s)', 'm', 2, posicionEn4, sim.estadoEn(4).posicion),
    ],
  }
}

// Caso 2: misma cabina, bajando del piso 5 al 2 (3 pisos, 9 m)
function casoBajando() {
  const sim = new Simulacion({
    masaCabina: 500, masaPasajeros: 200, gravedad: G, aceleracion: 1.5,
    velocidadMaxima: 2.5, alturaPiso: 3, pisoInicial: 5, pisoDestino: 2,
  })
  const m = 700 // kg
  const a = 1.5 // m/s²
  const v = 2.5 // m/s
  const d = (5 - 2) * 3 // m
  const tA = v / a // s
  const dA = (v * v) / (2 * a) // m
  const tC = (d - 2 * dA) / v // s
  const estado = sim.estadoEn(0)
  return {
    nombre: 'Bajando: piso 5 → 2',
    filas: [
      fila('Distancia', 'm', 0, d, sim.distancia),
      fila('Aceleración (arranque)', 'm/s²', 2, -a, estado.aceleracion), // hacia abajo: −a
      fila('Fuerza neta (arranque)', 'N', 0, -m * a, estado.fuerzaNeta), // ΣF = m·a con a < 0
      fila('Tensión (arranque)', 'N', 0, m * (G - a), estado.tension), // T = m(g + a), a < 0
      fila('Tiempo total', 's', 2, 2 * tA + tC, sim.tiempoTotal),
    ],
  }
}

// Caso 3: triangular, piso 1 → 2 (3 m es menor que la distancia de 2·2,08 m para llegar a vmax)
function casoTriangular() {
  const sim = new Simulacion({
    masaCabina: 500, masaPasajeros: 200, gravedad: G, aceleracion: 1.5,
    velocidadMaxima: 2.5, alturaPiso: 3, pisoInicial: 1, pisoDestino: 2,
  })
  const a = 1.5 // m/s²
  const d = 3 // m
  const vPico = Math.sqrt(a * d) // m/s: v² = a·d
  const tA = vPico / a // s
  const resumen = sim.resumenPorFase()
  const duracionMovimiento = resumen.find((f) => f.fase === FASES.MOVIMIENTO).duracion
  return {
    nombre: 'Triangular: piso 1 → 2',
    filas: [
      fila('Velocidad pico', 'm/s', 2, vPico, sim.perfil.velocidadPico),
      fila('Tiempo total', 's', 2, 2 * tA, sim.tiempoTotal), // t = 2·√(d/a)
      fila('Duración de Movimiento', 's', 2, 0, duracionMovimiento), // no hay tramo constante
    ],
  }
}

// Caso 4: rúbrica, tramo a velocidad constante (MRU) con tensión T = m·g
function casoMovimiento() {
  const sim = new Simulacion({
    masaCabina: 500, masaPasajeros: 200, gravedad: G, aceleracion: 1.5,
    velocidadMaxima: 2.5, alturaPiso: 3, pisoInicial: 1, pisoDestino: 5,
  })
  const m = 700 // kg
  const estado = sim.estadoEn(3)
  const estado4 = sim.estadoEn(4)
  const posicionEn4 = (2.5 * 2.5) / (2 * 1.5) + 2.5 * (4 - 2.5 / 1.5) // m: x = dA + v·(t − tA)
  return {
    nombre: 'Movimiento (velocidad constante)',
    filas: [
      fila('Velocidad (t = 4 s)', 'm/s', 2, 2.5, estado4.velocidad),
      fila('Posición (t = 4 s)', 'm', 2, posicionEn4, estado4.posicion),
      fila('Fuerza neta (t = 3 s)', 'N', 0, 0, estado.fuerzaNeta), // a = 0 → ΣF = 0
      fila('Tensión (t = 3 s)', 'N', 0, m * G, estado.tension), // T = m·g
    ],
  }
}

// Caso 5: rúbrica, frenado (t = 5,5 s, cuando faltan 0,7 s para la fase de frenado)
function casoFrenado() {
  const sim = new Simulacion({
    masaCabina: 500, masaPasajeros: 200, gravedad: G, aceleracion: 1.5,
    velocidadMaxima: 2.5, alturaPiso: 3, pisoInicial: 1, pisoDestino: 5,
  })
  const a = 1.5 // m/s²
  const v = 2.5 // m/s
  const d = 12 // m
  const tA = v / a // s
  const dA = (v * v) / (2 * a) // m
  const tC = (d - 2 * dA) / v // s
  const tf = 5.5 - (tA + tC) // s: tiempo dentro del frenado
  const rapidez = v - a * tf // m/s: v = v0 − a·t
  const posicion = d - dA + v * tf - 0.5 * a * tf * tf // m: x = x0 + v·t − ½·a·t²
  const estado = sim.estadoEn(5.5)
  return {
    nombre: 'Frenado: rúbrica en t = 5,5 s',
    filas: [
      fila('Velocidad (frenado)', 'm/s', 2, rapidez, estado.velocidad),
      fila('Aceleración (frenado)', 'm/s²', 2, -a, estado.aceleracion), // frenando: −a
      fila('Posición (frenado)', 'm', 2, posicion, estado.posicion),
    ],
  }
}

const casos = [casoRubrica(), casoBajando(), casoTriangular(), casoMovimiento(), casoFrenado()]

let aprobado = true
const tabla = []
for (const caso of casos) {
  for (const f of caso.filas) {
    // Si el valor manual es 0, el error se mide en unidades absolutas
    const base = f.manual !== 0 ? Math.abs(f.manual) : 1
    const errorPorcentual = (Math.abs(f.programa - f.manual) / base) * 100
    if (errorPorcentual > TOLERANCIA) aprobado = false
    tabla.push({
      Caso: caso.nombre,
      Magnitud: f.magnitud,
      Manual: formatear(f.manual, f.decimales, f.unidad),
      Programa: formatear(f.programa, f.decimales, f.unidad),
      'Error %': formatear(errorPorcentual, 2, '%'),
    })
  }
}

console.log('Validación: cálculo a mano vs. clase Simulacion\n')
console.table(tabla)
console.log(aprobado ? 'Resultado: todos los casos coinciden (error <= 0,01 %).' : 'Resultado: hay diferencias mayores a 0,01 %.')
process.exitCode = aprobado ? 0 : 1
