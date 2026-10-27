import { formatear } from '../utilidades/formato.js'

export function TablaEnVivo({ estado }) {
  const filas = [
    ['Tiempo', formatear(estado.tiempo, 2, 's')],
    ['Posición', formatear(estado.posicion, 2, 'm')],
    ['Velocidad', formatear(estado.velocidad, 2, 'm/s')],
    ['Aceleración', formatear(estado.aceleracion, 2, 'm/s²')],
    ['Fuerza neta', formatear(estado.fuerzaNeta, 0, 'N')],
    ['Peso', formatear(estado.peso, 0, 'N')],
    ['Tensión', formatear(estado.tension, 0, 'N')],
  ]

  return (
    <section className="tarjeta">
      <h2 className="titulo-tarjeta">En tiempo real</h2>
      <table>
        <tbody>
          {filas.map(([etiqueta, valor]) => (
            <tr key={etiqueta}>
              <th scope="row">{etiqueta}</th>
              <td className="num">{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
