import { useEffect, useRef } from 'react'
import { NUM_PISOS, MASA_PROMEDIO_PERSONA } from '../config.js'
import { DibujoEdificio } from '../dibujo/DibujoEdificio.js'

export function VistaEdificio({ simulacion, estado }) {
  const canvasRef = useRef(null)
  const dibujoRef = useRef(null)
  const datosRef = useRef(null)

  const { alturaPiso, pisoInicial, pisoDestino, masaPasajeros } = simulacion.parametros
  const datos = {
    numPisos: NUM_PISOS,
    alturaPiso,
    posicion: estado.posicion,
    pisoInicial,
    pisoDestino,
    tension: estado.tension,
    peso: estado.peso,
    personas: Math.round(masaPasajeros / MASA_PROMEDIO_PERSONA),
  }

  // Se dibuja en cada render (cada cuadro de la animación)
  useEffect(() => {
    if (!dibujoRef.current) dibujoRef.current = new DibujoEdificio(canvasRef.current)
    datosRef.current = datos
    dibujoRef.current.dibujar(datos)
  })

  // Al cambiar el tamaño de la ventana se vuelve a dibujar con los últimos datos
  useEffect(() => {
    const alRedimensionar = () => dibujoRef.current?.dibujar(datosRef.current)
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [])

  return (
    <div className="caja-edificio">
      <canvas ref={canvasRef} role="img" aria-label="Edificio con la cabina del ascensor" />
    </div>
  )
}
