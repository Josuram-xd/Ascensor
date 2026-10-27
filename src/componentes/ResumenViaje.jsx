import { formatear } from '../utilidades/formato.js'

// Celda con el número grande y la unidad aparte, en gris
function celda(etiqueta, valor, decimales, unidad) {
  const texto = formatear(valor, decimales, unidad)
  return { etiqueta, numero: texto.slice(0, -unidad.length).trim(), unidad }
}

export function ResumenViaje({ simulacion }) {
  const { ascensor, distancia, perfil, tiempoTotal, parametros } = simulacion
  const celdas = [
    celda('Masa total', ascensor.masaTotal, 0, 'kg'),
    celda('Peso', ascensor.peso(parametros.gravedad), 0, 'N'),
    celda('Distancia', distancia, 1, 'm'),
    celda('Velocidad máxima alcanzada', perfil.velocidadPico, 2, 'm/s'),
    celda('Tiempo de desplazamiento', tiempoTotal, 2, 's'),
  ]

  return (
    <dl className="resumen">
      {celdas.map((c) => (
        <div className="celda" key={c.etiqueta}>
          <dt>{c.etiqueta}</dt>
          <dd>
            <span className="valor">{c.numero}</span>
            <span className="unidad">{c.unidad}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
