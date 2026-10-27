import { useCallback, useEffect, useRef, useState } from 'react'

// Reloj de la simulación: avanza con el tiempo real (requestAnimationFrame) y se detiene en `duracion`
export function useAnimacion(duracion) {
  const [tiempo, setTiempo] = useState(0)
  const [enMarcha, setEnMarcha] = useState(false)
  // Copia del tiempo para leerlo dentro del bucle sin reiniciarlo
  const tiempoRef = useRef(0)

  useEffect(() => {
    if (!enMarcha) return
    let ultimo = performance.now()
    let id
    const paso = () => {
      const ahora = performance.now()
      // Tiempo transcurrido real, en segundos
      const nuevo = Math.min(tiempoRef.current + (ahora - ultimo) / 1000, duracion)
      ultimo = ahora
      tiempoRef.current = nuevo
      setTiempo(nuevo)
      if (nuevo >= duracion) setEnMarcha(false)
      else id = requestAnimationFrame(paso)
    }
    id = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(id)
  }, [enMarcha, duracion])

  const iniciar = useCallback(() => {
    // Si ya terminó, vuelve a empezar desde 0
    if (tiempoRef.current >= duracion) {
      tiempoRef.current = 0
      setTiempo(0)
    }
    setEnMarcha(true)
  }, [duracion])

  const pausar = useCallback(() => setEnMarcha(false), [])

  const reiniciar = useCallback(() => {
    tiempoRef.current = 0
    setTiempo(0)
    setEnMarcha(false)
  }, [])

  return { tiempo, enMarcha, terminado: tiempo >= duracion, iniciar, pausar, reiniciar }
}
