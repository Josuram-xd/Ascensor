// Cabina del ascensor: masa, peso, fuerza neta y tensión del cable
export class Ascensor {
  constructor(masaCabina, masaPasajeros) {
    this.masaCabina = masaCabina // kg
    this.masaPasajeros = masaPasajeros // kg
  }

  // Masa total del sistema (kg): m = m_cabina + m_pasajeros
  get masaTotal() {
    return this.masaCabina + this.masaPasajeros
  }

  // Peso (N): P = m·g
  peso(gravedad) {
    return this.masaTotal * gravedad
  }

  // Fuerza neta (N), con signo: ΣF = m·a
  fuerzaNeta(aceleracion) {
    return this.masaTotal * aceleracion
  }

  // Tensión del cable (N), con a con signo (+ arriba).
  // Segunda ley de Newton en el eje vertical: T − m·g = m·a  →  T = m·(g + a)
  tension(gravedad, aceleracion) {
    return this.masaTotal * (gravedad + aceleracion)
  }
}
