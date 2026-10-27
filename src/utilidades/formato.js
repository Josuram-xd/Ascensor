// Formato de cifras en español (Colombia): "7.917 N", "2,50 m/s"
export function formatear(valor, decimales, unidad) {
  const factor = 10 ** decimales
  // Se redondea antes de poner el signo, para que −0,001 no se muestre como "−0,00"
  const magnitud = Math.round(Math.abs(valor) * factor) / factor
  const signo = valor < 0 && magnitud !== 0 ? '−' : ''
  const numero = magnitud.toLocaleString('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
  return unidad ? `${signo}${numero} ${unidad}` : `${signo}${numero}`
}
