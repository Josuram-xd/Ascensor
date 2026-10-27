import { useMemo, useState } from 'react'
import { VALORES_INICIALES } from './config.js'
import { Simulacion } from './fisica/Simulacion.js'
import { FASES } from './fisica/PerfilMovimiento.js'
import { formatear } from './utilidades/formato.js'
import { useAnimacion } from './hooks/useAnimacion.js'
import { PanelEntrada } from './componentes/PanelEntrada.jsx'
import { VistaEdificio } from './componentes/VistaEdificio.jsx'
import { TablaEnVivo } from './componentes/TablaEnVivo.jsx'
import { TablaFases } from './componentes/TablaFases.jsx'
import { ResumenViaje } from './componentes/ResumenViaje.jsx'
import { Grafica } from './componentes/Grafica.jsx'

const COLOR_GRAFICA = '#1b6c80'

// Serie {t, valor} para una gráfica, a partir de las muestras de la simulación
function serie(muestras, campo) {
  return muestras.map((e) => ({ t: e.tiempo, valor: e[campo] }))
}

// Frase con la tensión del cable en el arranque, comparada con el peso
function fraseArranque(simulacion) {
  const arranque = simulacion.resumenPorFase().find((f) => f.fase === FASES.ARRANQUE)
  const peso = simulacion.ascensor.peso(simulacion.parametros.gravedad)
  const masMenos = arranque.fuerzaNeta >= 0 ? 'más' : 'menos'
  return (
    `En el arranque el cable soporta ${formatear(arranque.tension, 0, 'N')}, ` +
    `${formatear(Math.abs(arranque.fuerzaNeta), 0, 'N')} ${masMenos} que el peso ` +
    `(${formatear(peso, 0, 'N')}).`
  )
}

export default function App() {
  const [parametros, setParametros] = useState(VALORES_INICIALES)
  const [simulacion, setSimulacion] = useState(() => new Simulacion(VALORES_INICIALES))
  const [errores, setErrores] = useState([])
  const { tiempo, enMarcha, terminado, iniciar, pausar, reiniciar } = useAnimacion(
    simulacion.tiempoTotal,
  )

  const estado = simulacion.estadoEn(tiempo)
  const muestras = useMemo(() => simulacion.muestrear(200), [simulacion])
  const puntosPosicion = useMemo(() => serie(muestras, 'posicion'), [muestras])
  const puntosVelocidad = useMemo(() => serie(muestras, 'velocidad'), [muestras])
  const puntosAceleracion = useMemo(() => serie(muestras, 'aceleracion'), [muestras])
  const hallazgo = useMemo(() => fraseArranque(simulacion), [simulacion])

  const { pisoInicial, pisoDestino } = simulacion.parametros
  const verbo = simulacion.direccion > 0 ? 'Subiendo' : 'Bajando'
  // Antes de pulsar "Iniciar simulación" la cabina está quieta en el piso inicial
  const faseVisible = tiempo === 0 && !enMarcha ? 'En reposo' : estado.fase

  // Pausar/Continuar: deshabilitado antes de empezar y al terminar
  const pausaActiva = !terminado && (enMarcha || tiempo > 0)
  const etiquetaPausa = enMarcha || !pausaActiva ? 'Pausar' : 'Continuar'

  function cambiarCampo(nombre, valor) {
    setParametros((p) => ({ ...p, [nombre]: valor }))
  }

  function alPulsarPausa() {
    if (enMarcha) pausar()
    else iniciar()
  }

  function simular() {
    const erroresValidacion = Simulacion.validar(parametros)
    setErrores(erroresValidacion)
    if (erroresValidacion.length > 0) return
    setSimulacion(new Simulacion(parametros))
    reiniciar()
    iniciar()
  }

  function reiniciarTodo() {
    setParametros(VALORES_INICIALES)
    setSimulacion(new Simulacion(VALORES_INICIALES))
    setErrores([])
    reiniciar()
  }

  return (
    <div className="marco">
      <aside className="barra-lateral">
        <div className="marca">
          <svg className="marca-icono" viewBox="0 0 20 20" aria-hidden="true">
            <rect x="2" y="2" width="7" height="16" rx="1" fill="currentColor" />
            <rect x="11" y="2" width="7" height="16" rx="1" fill="currentColor" />
          </svg>
          <div>
            <p className="marca-nombre">Simulador de ascensor</p>
            <p className="marca-sub">Física mecánica · Proyecto 4</p>
          </div>
        </div>
        <PanelEntrada
          parametros={parametros}
          errores={errores}
          onCambiar={cambiarCampo}
          onSimular={simular}
          onReiniciar={reiniciarTodo}
        />
      </aside>

      <div className="columna-principal">
        <header className="barra-superior">
          <p className="estado-viaje">
            <span>
              {verbo} del piso {pisoInicial} al {pisoDestino}
            </span>
            <span className="pastilla">{faseVisible}</span>
          </p>
          <button
            type="button"
            className="boton boton-outline"
            disabled={!pausaActiva}
            onClick={alPulsarPausa}
          >
            {etiquetaPausa}
          </button>
        </header>

        <main className="hoja">
          <div className="hoja-grid">
            <VistaEdificio simulacion={simulacion} estado={estado} />

            <div className="columna-datos">
              <div>
                <h1 className="titulo-viaje">
                  Viaje del piso {pisoInicial} al {pisoDestino}
                </h1>
                <p className="hallazgo">{hallazgo}</p>
              </div>

              <ResumenViaje simulacion={simulacion} />

              <div className="dos-tablas">
                <TablaEnVivo estado={estado} />
                <TablaFases simulacion={simulacion} estado={estado} />
              </div>

              <div className="tres-graficas">
                <Grafica
                  titulo="Posición y(t)"
                  puntos={puntosPosicion}
                  tiempoActual={tiempo}
                  color={COLOR_GRAFICA}
                  unidad="m"
                />
                <Grafica
                  titulo="Velocidad v(t)"
                  puntos={puntosVelocidad}
                  tiempoActual={tiempo}
                  color={COLOR_GRAFICA}
                  unidad="m/s"
                />
                <Grafica
                  titulo="Aceleración a(t)"
                  puntos={puntosAceleracion}
                  tiempoActual={tiempo}
                  color={COLOR_GRAFICA}
                  unidad="m/s²"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
