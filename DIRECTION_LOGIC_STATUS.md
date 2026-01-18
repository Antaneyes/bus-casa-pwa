# Estado de la Lógica de Dirección Inteligente (Rama: direction-logic-failed)

Esta rama contiene el intento de implementación de un sistema de validación de dirección basado en vectores y la información de la EMT Valencia. 

## ¿Qué hay en esta rama?

- **Validación Vectorial Estricta (v12):** En `main.js`, la función `validateDirection` utiliza el producto punto de vectores normalizados (Cosine Similarity) para determinar si un bus se acerca a casa.
- **Configuración de Cabeceras Ampliada:** Se han añadido `keywords` y coordenadas de cabeceras para todas las líneas útiles, incluyendo circulares (C2, C3).
- **Control de Direcciones Laterales:** Lógica para distinguir entre buses que se acercan, se alejan o van de lado (perpendiculares).
- **Correcciones de Destinos:** Soporte para destinos específicos como "Ed. Bosca" o "Els Orriols".

## ¿Por qué se ha descartado de la rama principal?

1. **Inconsistencia de Datos EMT:** La API de la EMT a veces devuelve nombres de destino que no coinciden con las cabeceras configuradas o que son ambiguos (ej. buses que cambian de destino a mitad de ruta).
2. **Complejidad Sensible:** En rutas no paralelas o circulares, pequeños cambios en la posición del usuario o del bus invertían la validación (marcando como bueno algo malo y viceversa).
3. **Falsos Positivos/Negativos:** El umbral del ángulo (75 grados) no siempre era suficiente para capturar rutas complejas de la ciudad de Valencia.

## ¿Dónde nos hemos quedado?

El código es funcional pero requiere un ajuste fino de los "puntos de referencia" (Headboards) y posiblemente una base de datos más robusta de los recorridos reales, no solo los puntos finales.

**Punto de bloqueo actual:** La validación se invierte en puntos críticos (como Av. del Cid) debido a la curvatura de las líneas de bus que el modelo vectorial simple no contempla.

---
*Para volver a la versión estable: `git checkout master`*
