import { NUM_PISOS } from '../config.js'

const PISOS = Array.from({ length: NUM_PISOS }, (_, i) => i + 1)

// Campo numérico con unidad. Un valor NaN (campo vacío) se muestra vacío.
function CampoNumero({ nombre, etiqueta, valor, unidad, paso, onCambiar }) {
  return (
    <div className="campo">
      <label htmlFor={nombre}>{etiqueta}</label>
      <div className="entrada">
        <input
          id={nombre}
          type="number"
          step={paso}
          value={Number.isNaN(valor) ? '' : valor}
          onChange={(e) => onCambiar(nombre, parseFloat(e.target.value))}
        />
        <span className="sufijo">{unidad}</span>
      </div>
    </div>
  )
}

// Selector de piso (1 a NUM_PISOS)
function CampoPiso({ nombre, etiqueta, valor, onCambiar }) {
  return (
    <div className="campo">
      <label htmlFor={nombre}>{etiqueta}</label>
      <select id={nombre} value={valor} onChange={(e) => onCambiar(nombre, Number(e.target.value))}>
        {PISOS.map((piso) => (
          <option key={piso} value={piso}>
            {piso}
          </option>
        ))}
      </select>
    </div>
  )
}

export function PanelEntrada({ parametros, errores, onCambiar, onSimular, onReiniciar }) {
  function enviar(e) {
    e.preventDefault()
    onSimular()
  }

  return (
    // noValidate: los errores los muestra nuestro panel, no el navegador
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="grupo">
        <h2 className="subtitulo">Masas</h2>
        <CampoNumero nombre="masaCabina" etiqueta="Masa de la cabina" valor={parametros.masaCabina}
          unidad="kg" paso="1" onCambiar={onCambiar} />
        <CampoNumero nombre="masaPasajeros" etiqueta="Masa de pasajeros" valor={parametros.masaPasajeros}
          unidad="kg" paso="1" onCambiar={onCambiar} />
      </div>

      <div className="grupo">
        <h2 className="subtitulo">Movimiento</h2>
        <CampoNumero nombre="aceleracion" etiqueta="Aceleración" valor={parametros.aceleracion}
          unidad="m/s²" paso="0.1" onCambiar={onCambiar} />
        <CampoNumero nombre="velocidadMaxima" etiqueta="Velocidad máxima" valor={parametros.velocidadMaxima}
          unidad="m/s" paso="0.1" onCambiar={onCambiar} />
        <CampoNumero nombre="gravedad" etiqueta="Gravedad" valor={parametros.gravedad}
          unidad="m/s²" paso="0.01" onCambiar={onCambiar} />
      </div>

      <div className="grupo">
        <h2 className="subtitulo">Recorrido</h2>
        <CampoPiso nombre="pisoInicial" etiqueta="Piso inicial" valor={parametros.pisoInicial}
          onCambiar={onCambiar} />
        <CampoPiso nombre="pisoDestino" etiqueta="Piso destino" valor={parametros.pisoDestino}
          onCambiar={onCambiar} />
        <CampoNumero nombre="alturaPiso" etiqueta="Altura por piso" valor={parametros.alturaPiso}
          unidad="m" paso="0.1" onCambiar={onCambiar} />
      </div>

      {errores.length > 0 && (
        <ul className="errores" role="alert">
          {errores.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="acciones">
        <button type="submit" className="boton boton-primario">
          Iniciar simulación
        </button>
        <button type="button" className="boton boton-secundario" onClick={onReiniciar}>
          Reiniciar
        </button>
      </div>
    </form>
  )
}
