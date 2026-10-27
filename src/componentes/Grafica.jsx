import { useEffect, useRef } from 'react'
import { GraficaLinea } from '../dibujo/GraficaLinea.js'

export function Grafica({ titulo, puntos, tiempoActual, color, unidad }) {
  const canvasRef = useRef(null)
  const graficaRef = useRef(null)
  const datosRef = useRef(null)

  // Se dibuja al cambiar los datos o el tiempo
  useEffect(() => {
    if (!graficaRef.current) graficaRef.current = new GraficaLinea(canvasRef.current, { color, unidad })
    datosRef.current = { puntos, tiempoActual }
    graficaRef.current.dibujar(puntos, tiempoActual)
  }, [puntos, tiempoActual, color, unidad])

  // Al cambiar el tamaño de la ventana se vuelve a dibujar
  useEffect(() => {
    const alRedimensionar = () => {
      const { puntos: p, tiempoActual: t } = datosRef.current
      graficaRef.current?.dibujar(p, t)
    }
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [])

  return (
    <section className="tarjeta">
      <h2 className="titulo-grafica">{titulo}</h2>
      <canvas ref={canvasRef} role="img" aria-label={titulo} />
    </section>
  )
}
