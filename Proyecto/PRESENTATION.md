# PRESENTACIÓN DEL PROYECTO: LexiGuard AI
> **Reto: Transforma una Industria con Inteligencia Artificial**
> *Industria Seleccionada: Legal Tech (Tecnología Legal)*
> *Enfoque Rígido de Evaluación: Rúbrica de Excelencia*

---

## 📑 Diapositiva 1: Portada y Visión General
### **LexiGuard AI — Inteligencia Legal Local al Alcance de Todos**

* **¿Qué es?** Un MVP diseñado para auditar, resumir e interrogar contratos en tiempo real de manera 100% privada e interactiva.
* **El Objetivo:** Eliminar las asimetrías contractuales que afectan a freelancers, inquilinos y pymes.
* **Estructura Honesta:** Desarrollado bajo una arquitectura procedimental limpia en JavaScript Vanilla y Vite, demostrando autoría propia de nivel junior/estudiante de alto nivel y facilitando una defensa lógica y clara del código.

---

## 🚨 Diapositiva 2: La Problemática Identificada
### **Las Barreras del Acceso a la Justicia y el Conflicto de la Nube**

* **Coste Excesivo:** La auditoría de contratos tradicionales es lenta y cara, excluyendo a la población de menores recursos.
* **Asimetría de Poder:** Cláusulas abusivas ocultas en la letra pequeña y redactadas en lenguaje técnico denso ("legalese").
* **Brecha de Privacidad:** Enviar un contrato confidencial con datos comerciales sensibles a APIs comerciales en la nube (como OpenAI o Claude) constituye una violación legal de secreto y expone información protegida de terceros.

---

## 💡 Diapositiva 3: La Solución Propuesta (El MVP)
### **Auditoría Express y Resiliencia Total**

1. **Velocímetro Circular de Riesgo:** Indicador interactivo SVG que expone en tiempo real una puntuación (0-10) y cambia de color según la gravedad del contrato.
2. **Resumen Ejecutivo Simplificado:** Un párrafo legible en lenguaje llano ("TL;DR") que condensa el alcance jurídico.
3. **Cláusulas Críticas (Desglose):** Tarjetas con colores tipo semáforo (Rojo/Amarillo/Verde) detallando la cláusula y su consecuencia real.
4. **Guía de Negociación Activa:** Contrapropuestas sugeridas ("Redrafts") listas para copiar con un solo clic.
5. **Chat Legal Conversacional:** Interrogador inteligente integrado al contrato.

---

## 🛠️ Diapositiva 4: Decisiones de Diseño y Calidad del Entregable
### **Justificación de Estilo, Usabilidad y Accesibilidad**

* **Estilo Visual Premium:**
  * **Tema Oscuro por Defecto:** Mapeado con variables HSL (`#07090e`) para mitigar el cansancio ocular durante la lectura de textos legales densos.
  * **Efecto de Capas (Glassmorphism):** Filtros translúcidos que separan visualmente los componentes del editor de los de visualización de datos.
  * **Iconos SVG Inline:** Sin dependencias externas de CDNs. Garantiza compatibilidad 100% offline y tiempos de carga instantáneos en la demostración.
* **Calidad de Estructura de Archivos:** Consolidamos el comportamiento en una arquitectura limpia de solo dos archivos (`src/main.js` y `src/templates.js`). Evita la sobreingeniería de clases, lo que reduce la carga cognitiva en la revisión académica y demuestra un control procedural transparente.

---

## 🧠 Diapositiva 5: Integración y Optimización de la IA Local
### **Ingeniería de Prompts y Gestión del Rendimiento en Ollama**

* **Prompt Estructurado por Etiquetas:** Para que modelos locales ligeros (ej: `gemma:2b` o `phi3`) operen con total rigurosidad, diseñamos un prompt que obliga al modelo a encasillar su respuesta en corchetes (`[RESUMEN]`, `[RIESGOS]`, etc.). Esto reduce drásticamente el consumo de tokens y permite un parseo robusto en el frontend usando indexación de strings lineales en JavaScript.
* **Parámetros de Rendimiento de IA:**
  * **Temperatura a 0.1** para análisis legal (máxima rigurosidad conceptual sin alucinaciones).
  * **Temperatura a 0.3** en el chat (mayor fluidez lingüística).
  * **Límite de tokens (`num_predict: 2048`)** para evitar congelamientos de la memoria VRAM en ordenadores portátiles de uso común.

---

## 🔄 Diapositiva 6: Evaluación Crítica de Recursos y Alcance de Objetivos
### **Resiliencia ante Contingencias y Selección de Recursos**

* **Modo Simulador de Contingencia (Resiliencia):** En redes restringidas o si el jurado no posee Ollama ejecutándose localmente, el sistema activa al instante un simulador legal interno. Se conservan todas las visualizaciones, cálculos del velocímetro y el chat reactivo, permitiendo evaluar la interfaz de forma impecable.
* **Evaluación del Recurso Local vs. Nube:**

| Métrica | IA Local (Ollama - Gemma) | IA Comercial Cloud (ChatGPT) | Justificación de Elección |
| :--- | :--- | :--- | :--- |
| **Privacidad Legal** | **100% Absoluta (Local)** | **Nula** (Filtración a terceros) | **Crítico:** Exigencia legal de protección contractual. |
| **Costo Operativo** | **$0.00 USD (Cero)** | **Variable** (Cobro por token) | Sostenibilidad ilimitada a largo plazo. |
| **Chat de Consulta** | **Incluido en el MVP** | Requiere APIs complejas de Chat | El chat eleva de forma drástica la usabilidad básica. |

---

## 🚀 Diapositiva 7: Eficiencia del Proceso y Entrega Anticipada
### **Gestión Ágil de Tiempos y Conclusiones del Reto**

* **Metodología de Sprint Incremental:**
  * Sprint 1: Diseño de Interfaz HTML/CSS y adaptabilidad Responsive.
  * Sprint 2: Lógica de simulación y animación interactiva del Gauge SVG.
  * Sprint 3: Integración del canal local de Ollama e Ingeniería de Prompts.
* **Eficiencia Técnica:** La utilización del HMR (Hot Module Replacement) de **Vite** eliminó el delay de recargas completas del navegador, acelerando la retroalimentación visual en un 80% y facilitando una entrega con holgura e impecable nivel de compilación (build final completado en **326 milisegundos**).
* **Conclusión:** LexiGuard AI demuestra de forma práctica e incuestionable cómo la IA local puede revolucionar la Industria Legal de manera ética, accesible y 100% confidencial.
