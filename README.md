# Simulador de ascensor: fuerzas y movimiento

Proyecto 4 de Física Mecánica (Ingeniería de Software, Universidad Cooperativa de Colombia).

El programa simula un ascensor que viaja entre dos pisos de un edificio de 10 pisos. El usuario
introduce las masas, la gravedad, la aceleración y los pisos; el programa calcula la masa total, el
peso, la fuerza neta, la tensión del cable, la velocidad y el tiempo de desplazamiento, anima la
cabina y dibuja las gráficas y(t), v(t) y a(t).

## Cómo ejecutarlo

Requisitos: Node.js 18 o superior.

```bash
npm install        # solo la primera vez
npm run dev        # abre http://localhost:5173
```

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm run validar` | Compara resultados calculados a mano con los del programa (sección Validación del informe) |
| `npm run build` | Genera la versión final en la carpeta `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` para probarla |

## Cómo se usa

1. En el panel izquierdo escribe los datos: masa de la cabina, masa de pasajeros, aceleración,
   velocidad máxima, gravedad, piso inicial, piso destino y altura por piso.
2. Pulsa **Iniciar simulación**. La cabina arranca, se mueve, frena y se detiene en el piso destino.
3. Durante el viaje, la tabla **En tiempo real** muestra tiempo, posición, velocidad, aceleración,
   fuerza neta, peso y tensión. La tabla **Fuerzas por fase** resalta la fase actual.
4. **Pausar / Continuar** (arriba a la derecha) detiene y reanuda la animación.
5. **Reiniciar** vuelve a los valores del ejemplo de la rúbrica.

Si un dato no es válido (por ejemplo, una aceleración mayor que la gravedad), aparece un mensaje
bajo el formulario y la simulación no arranca.

## Fundamento físico

Eje vertical positivo **hacia arriba**. El piso 1 está en y = 0 m y el piso k en
y = (k − 1) · altura por piso.

| Magnitud | Ecuación | Dónde está en el código |
| --- | --- | --- |
| Masa total | m = m_cabina + m_pasajeros | `Ascensor.masaTotal` |
| Peso | P = m · g | `Ascensor.peso()` |
| Fuerza neta (2.ª ley de Newton) | ΣF = m · a | `Ascensor.fuerzaNeta()` |
| Tensión del cable | T − m·g = m·a  →  T = m(g + a) | `Ascensor.tension()` |
| Arranque (MRUA) | x = ½·a·t², v = a·t | `PerfilMovimiento.estadoEn()` |
| Movimiento (MRU) | x = x₀ + v·t | `PerfilMovimiento.estadoEn()` |
| Frenado (MRUA) | x = x₀ + v·t − ½·a·t² | `PerfilMovimiento.estadoEn()` |
| Distancia para llegar a v máx. | v² = 2·a·x  →  x = v² / (2a) | constructor de `PerfilMovimiento` |

La aceleración lleva signo. Al **subir**, el arranque tiene a = +a y el frenado a = −a. Al
**bajar** es al revés. Por eso una sola fórmula, T = m(g + a), cubre los dos casos del enunciado:

- Acelera hacia arriba: T = m(g + a), el cable soporta **más** que el peso.
- Acelera hacia abajo: mg − T = m·a, es decir T = m(g − a), el cable soporta **menos** que el peso.
- Velocidad constante o detenido: a = 0, por lo tanto T = m·g = P.

### Etapas del viaje

1. **Arranque**: acelera desde el reposo hasta la velocidad máxima.
2. **Movimiento**: avanza a velocidad constante (a = 0).
3. **Frenado**: desacelera con la misma magnitud de aceleración.
4. **Detención**: llega al piso destino (v = 0, a = 0).

Si la distancia es corta y no alcanza la velocidad máxima, no hay tramo de velocidad constante: la
cabina acelera hasta la mitad del recorrido y frena el resto (perfil triangular, v_pico = √(a·d)).

### Supuestos

- La cabina es un cuerpo rígido; el cable no tiene masa ni se estira.
- Sin rozamiento ni resistencia del aire, y sin contrapeso.
- La aceleración de arranque y la de frenado tienen la misma magnitud.
- La aceleración debe ser menor que g: si no, al bajar la tensión sería ≤ 0 (cable flojo).

### Ejemplo de la rúbrica

Cabina 500 kg, pasajeros 200 kg, g = 9,81 m/s², a = 1,5 m/s², piso 1 → 5, 3 m por piso y
velocidad máxima 2,5 m/s:

| Resultado | Valor |
| --- | --- |
| Masa total | 700 kg |
| Peso | 6.867 N |
| Fuerza neta en el arranque | 1.050 N |
| Tensión en el arranque | 7.917 N |
| Tensión a velocidad constante | 6.867 N |
| Tensión en el frenado | 5.817 N |
| Distancia | 12 m |
| Tiempo de desplazamiento | 6,47 s |

`npm run validar` comprueba estos valores y otros casos (bajando, perfil triangular, frenado): todos dan 0 % de error.

## Diseño del software

- **Lenguaje:** JavaScript.
- **Herramientas:** [Vite](https://vite.dev) (servidor de desarrollo y compilación) y
  [React](https://react.dev) (interfaz).
- **Dibujo:** API Canvas 2D del navegador, sin librerías de gráficas.

### Estructura de carpetas

```
src/
├── config.js                 Constantes: número de pisos y valores iniciales
├── fisica/                   MODELO: solo física, sin nada de pantalla
│   ├── Ascensor.js           Clase Ascensor: masa, peso, fuerza neta, tensión
│   ├── PerfilMovimiento.js   Clase PerfilMovimiento: fases y cinemática (MRUA / MRU)
│   └── Simulacion.js         Clase Simulacion: une las dos anteriores y valida los datos
├── dibujo/                   DIBUJO en Canvas
│   ├── DibujoEdificio.js     Clase DibujoEdificio: edificio, cabina, cable y flechas T y P
│   └── GraficaLinea.js       Clase GraficaLinea: gráfica de una magnitud contra el tiempo
├── utilidades/
│   └── formato.js            formatear(): números en español con su unidad ("7.917 N")
├── hooks/
│   └── useAnimacion.js       Reloj de la animación (requestAnimationFrame)
├── componentes/              INTERFAZ en React (cada parte de la pantalla)
│   ├── PanelEntrada.jsx      Formulario de datos y botones
│   ├── VistaEdificio.jsx     Lienzo del edificio
│   ├── ResumenViaje.jsx      Masa total, peso, distancia, velocidad máxima, tiempo
│   ├── TablaEnVivo.jsx       Variables en tiempo real
│   ├── TablaFases.jsx        Aceleración, fuerza neta y tensión de cada fase
│   └── Grafica.jsx           Lienzo de una gráfica
├── App.jsx                   Une todo: estado, botones y distribución de la pantalla
├── main.jsx                  Punto de entrada de React
└── estilos.css               Estilos
scripts/
└── validacion.js             Casos de validación (npm run validar)
```

### Programación orientada a objetos

La física está separada en tres clases con una responsabilidad cada una:

- `Ascensor` sabe **qué fuerzas** actúan sobre la cabina, dada una aceleración.
- `PerfilMovimiento` sabe **cómo se mueve** la cabina en el tiempo (fase, recorrido, rapidez,
  aceleración), sin conocer masas ni fuerzas.
- `Simulacion` **compone** las dos: convierte pisos en metros, aplica el sentido del viaje
  (+1 sube, −1 baja) y entrega el estado completo en cualquier instante con `estadoEn(t)`.

El dibujo también es POO: `DibujoEdificio` y `GraficaLinea` reciben un `<canvas>` en el
constructor y tienen un único método público `dibujar(...)`. Cada parte del dibujo es un método
privado pequeño (`dibujarPisos`, `dibujarCabina`, `dibujarFlecha`, …).

### Modelo computacional (de la ecuación al algoritmo)

1. Al pulsar **Iniciar simulación**, `Simulacion.validar()` revisa los datos y se crea una
   `new Simulacion(datos)`.
2. El constructor calcula la distancia d = |y_final − y_inicial| y crea el `PerfilMovimiento`, que
   calcula de una vez cuánto dura cada fase y el tiempo total.
3. El hook `useAnimacion` avanza un reloj con el tiempo real (unas 60 veces por segundo).
4. En cada cuadro, `simulacion.estadoEn(t)`:
   - pregunta al perfil en qué fase está y aplica la ecuación de esa fase (MRUA o MRU);
   - multiplica por el sentido del viaje para obtener posición, velocidad y aceleración con signo;
   - con esa aceleración, el `Ascensor` calcula ΣF = m·a, P = m·g y T = m(g + a).
5. React muestra el estado en las tablas, y las clases de dibujo pintan la cabina y el punto actual
   en las gráficas.
6. Las gráficas usan `simulacion.muestrear(200)`: 200 estados equiespaciados entre 0 y el tiempo
   total. La curva completa se ve en gris y el tramo ya recorrido en color.

El cálculo es **analítico** (fórmulas exactas en cada instante), no una integración paso a paso.
Por eso los resultados coinciden exactamente con los cálculos hechos a mano.

### Qué muestra la pantalla

- **Edificio** con 10 pisos, sala de máquinas con polea, cable y cabina con pasajeros (una figura
  por cada 70 kg). El cable se engrosa cuando la tensión supera al peso. Junto a la cabina, el
  diagrama de cuerpo libre: flecha **T** hacia arriba y **P** hacia abajo, con largo proporcional
  a la fuerza.
- **Resumen del viaje**, **tabla en tiempo real** y **fuerzas por fase**.
- **Gráficas** de posición y(t), velocidad v(t) y aceleración a(t).
