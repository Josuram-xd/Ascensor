import { useMemo } from 'react'
import { formatear } from '../utilidades/formato.js'

export function TablaFases({ simulacion, estado }) {
  const filas = useMemo(() => simulacion.resumenPorFase(), [simulacion])

  return (
    <section className="tarjeta">
      <h2 className="titulo-tarjeta">Fuerzas por fase</h2>
      <div className="desplazable">
        <table>
          <thead>
            <tr>
              <th scope="col">Fase</th>
              <th scope="col" className="num">Duración</th>
              <th scope="col" className="num">Aceleración</th>
              <th scope="col" className="num">Fuerza neta</th>
              <th scope="col" className="num">Tensión</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.fase} className={f.fase === estado.fase ? 'fila-actual' : undefined}>
                <th scope="row">{f.fase}</th>
                <td className="num">{formatear(f.duracion, 2, 's')}</td>
                <td className="num">{formatear(f.aceleracion, 2, 'm/s²')}</td>
                <td className="num">{formatear(f.fuerzaNeta, 0, 'N')}</td>
                <td className="num">{formatear(f.tension, 0, 'N')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
