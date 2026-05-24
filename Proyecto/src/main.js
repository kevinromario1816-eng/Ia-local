/**
 * LexiGuard AI — Script Principal de la Aplicación
 * 
 * Desarrollado con JavaScript Vanilla en estilo procedural/lineal,
 * ideal para proyectos académicos y de nivel junior de alta calidad.
 * 
 * Este archivo centraliza la gestión del DOM, la comunicación con la API
 * local de Ollama y el motor de simulación de contingencia legal.
 */

import { CONTRACT_TEMPLATES } from './templates.js';

// ==========================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let ollamaConnected = false;        // ¿Ollama está encendido y accesible?
let activeModel = 'gemma:2b';       // Modelo local seleccionado
let chatHistory = [];               // Historial de mensajes de chat
let currentContractType = '';       // Tipo de contrato analizado actual

// Puerto predeterminado de la API de Ollama
const OLLAMA_URL = 'http://localhost:11434';

// ==========================================
// 2. REFERENCIAS A ELEMENTOS DEL DOM
// ==========================================
// Declaramos las referencias para facilitar la manipulación de la interfaz
let contractInput, charCounter, analyzeBtn, clearBtn, templatesContainer, modeBadge;
let statusDot, statusText, modelSelect, modelSelectWrapper, ollamaOfflineAlert;
let emptyState, loadingOverlay, loadingTitle, loadingSubtext, tabNav, sourceBadge;
let tabDashboard, riskGaugeFill, riskScoreValue, riskBadgeText, metaContractType, metaLanguage, executiveSummaryContent, generalDiagnosisText;
let tabRisks, risksListContainer, tabNegotiation, negotiationTipsContainer;
let tabChat, chatMessagesContainer, chatUserInput, chatSendBtn;

// ==========================================
// 3. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Enlazar los elementos del DOM una vez cargado el HTML
  mapearElementosDOM();
  
  // Registrar todos los escuchadores de eventos
  configurarEventos();
  
  // Dibujar y cargar las plantillas de prueba rápida en el panel izquierdo
  cargarPlantillasRapidas();
  
  // Realizar el chequeo inicial de conexión con Ollama local
  chequearConexionOllama();

  // Configurar chequeo de conexión periódico cada 10 segundos
  // Esto permite conectar la IA real si el usuario enciende Ollama a mitad de su prueba
  setInterval(chequearConexionOllama, 10000);
});

/**
 * Vincula todas las variables globales con sus respectivos ID del HTML.
 */
function mapearElementosDOM() {
  contractInput = document.getElementById('contract-input');
  charCounter = document.getElementById('char-counter');
  analyzeBtn = document.getElementById('analyze-btn');
  clearBtn = document.getElementById('clear-btn');
  templatesContainer = document.getElementById('templates-container');
  modeBadge = document.getElementById('mode-badge');
  
  statusDot = document.getElementById('status-dot');
  statusText = document.getElementById('status-text');
  modelSelect = document.getElementById('model-select');
  modelSelectWrapper = document.getElementById('model-selector-wrapper');
  ollamaOfflineAlert = document.getElementById('ollama-offline-alert');
  
  emptyState = document.getElementById('empty-state');
  loadingOverlay = document.getElementById('loading-overlay');
  loadingTitle = document.getElementById('loading-title');
  loadingSubtext = document.getElementById('loading-subtext');
  tabNav = document.getElementById('tab-nav');
  sourceBadge = document.getElementById('source-badge');
  
  tabDashboard = document.getElementById('tab-dashboard');
  riskGaugeFill = document.getElementById('risk-gauge-fill');
  riskScoreValue = document.getElementById('risk-score-value');
  riskBadgeText = document.getElementById('risk-badge-text');
  metaContractType = document.getElementById('meta-contract-type');
  metaLanguage = document.getElementById('meta-language');
  executiveSummaryContent = document.getElementById('executive-summary-content');
  generalDiagnosisText = document.getElementById('general-diagnosis-text');
  
  tabRisks = document.getElementById('tab-risks');
  risksListContainer = document.getElementById('risks-list-container');
  tabNegotiation = document.getElementById('tab-negotiation');
  negotiationTipsContainer = document.getElementById('negotiation-tips-container');
  
  tabChat = document.getElementById('tab-chat');
  chatMessagesContainer = document.getElementById('chat-messages-container');
  chatUserInput = document.getElementById('chat-user-input');
  chatSendBtn = document.getElementById('chat-send-btn');
}

/**
 * Registra los gestores de eventos para las interacciones del usuario.
 */
function configurarEventos() {
  // Validar y contar caracteres en el editor
  contractInput.addEventListener('input', () => {
    const longitud = contractInput.value.length;
    charCounter.textContent = `${longitud.toLocaleString()} caracteres`;
    
    // Habilitar botón de análisis si hay suficiente texto cargado
    analyzeBtn.disabled = longitud < 20;
    
    if (longitud === 0) {
      desmarcarPlantillasActivas();
      modeBadge.textContent = 'Borrador';
    }
  });

  // Botón de Limpiar Editor
  clearBtn.addEventListener('click', () => {
    contractInput.value = '';
    charCounter.textContent = '0 caracteres';
    analyzeBtn.disabled = true;
    desmarcarPlantillasActivas();
    modeBadge.textContent = 'Borrador';
    resetearVisualizadorAnalisys();
    contractInput.focus();
  });

  // Botón de Analizar Contrato
  analyzeBtn.addEventListener('click', solicitarAnalisisIA);

  // Escuchar cambio en el selector de modelos locales
  modelSelect.addEventListener('change', (e) => {
    activeModel = e.target.value;
  });

  // Manejar el cambio de pestañas de análisis
  const botonesPestaña = tabNav.querySelectorAll('.tab-btn');
  botonesPestaña.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pestañaSeleccionada = e.currentTarget.getAttribute('data-tab');
      cambiarPestañaActiva(pestañaSeleccionada, e.currentTarget);
    });
  });

  // Controlar la caja de texto del Chat de consultas
  chatUserInput.addEventListener('input', () => {
    chatSendBtn.disabled = chatUserInput.value.trim().length === 0;
  });

  chatUserInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && chatUserInput.value.trim().length > 0) {
      procesarPreguntaChat();
    }
  });

  chatSendBtn.addEventListener('click', procesarPreguntaChat);
}

/**
 * Renderiza los botones de carga rápida de contratos muestra en el panel izquierdo.
 */
function cargarPlantillasRapidas() {
  templatesContainer.innerHTML = '';
  
  CONTRACT_TEMPLATES.forEach(tmpl => {
    const chip = document.createElement('button');
    chip.className = 'chip-btn';
    chip.innerHTML = tmpl.name;
    
    chip.addEventListener('click', () => {
      desmarcarPlantillasActivas();
      chip.classList.add('active');
      
      // Inyectar contenido en el textarea y disparar su evento
      contractInput.value = tmpl.content;
      contractInput.dispatchEvent(new Event('input'));
      modeBadge.textContent = tmpl.title;
    });

    templatesContainer.appendChild(chip);
  });
}

// ==========================================
// 4. LOGICA DE COMUNICACION CON OLLAMA (IA)
// ==========================================

/**
 * Intenta conectar con Ollama en el puerto local 11434.
 */
async function chequearConexionOllama() {
  const controlador = new AbController();
  const timeoutId = setTimeout(() => controlador.abort(), 2000); // 2 segundos máximo
  
  try {
    const respuesta = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: controlador.signal
    });
    
    clearTimeout(timeoutId);
    
    if (respuesta.ok) {
      const data = await respuesta.json();
      const modelosDisponibles = data.models || [];
      ollamaConnected = true;
      
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Ollama: Online';
      ollamaOfflineAlert.style.display = 'none';
      modelSelectWrapper.style.display = 'flex';
      
      // Rellenar dinámicamente el selector con modelos locales reales
      const modeloAnterior = modelSelect.value;
      modelSelect.innerHTML = '';
      
      if (modelosDisponibles.length > 0) {
        modelosDisponibles.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name;
          opt.textContent = m.name.length > 20 ? m.name.slice(0, 18) + '...' : m.name;
          modelSelect.appendChild(opt);
        });
        
        // Mantener el modelo previamente seleccionado si aún existe
        if (modelosDisponibles.some(m => m.name === modeloAnterior)) {
          modelSelect.value = modeloAnterior;
        }
        activeModel = modelSelect.value;
      } else {
        // Fallback si Ollama corre pero no tiene modelos descargados
        const opt = document.createElement('option');
        opt.value = 'gemma:2b';
        opt.textContent = 'gemma:2b (No instalado)';
        modelSelect.appendChild(opt);
        activeModel = 'gemma:2b';
      }
    }
  } catch (error) {
    // Si falla la red o da timeout, activar el modo de demostración simulado
    clearTimeout(timeoutId);
    ollamaConnected = false;
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Ollama: Offline';
    ollamaOfflineAlert.style.display = 'flex';
    modelSelectWrapper.style.display = 'none';
    activeModel = 'Simulador IA';
  }
}

/**
 * Solicita el informe completo de riesgos legales a la IA local o al simulador.
 */
async function solicitarAnalisisIA() {
  const textoContrato = contractInput.value.trim();
  if (textoContrato.length < 20) return;

  mostrarOverlayCarga(true, 'Auditando Contrato...', 'La IA local está escaneando cláusulas abusivas e identificando riesgos...');
  resetearVisualizadorAnalisys();
  
  try {
    let resultados;
    
    if (!ollamaConnected) {
      // Retraso artificial para simular el procesamiento de una IA de verdad
      await new Promise(resolve => setTimeout(resolve, 1500));
      resultados = simularAnalisisLegal(textoContrato);
    } else {
      // 1. Construir el Prompt del Sistema con Directrices de Formateo
      const systemPrompt = `Eres un auditor legal de élite. Audita el contrato provisto y genera un informe estructurado en ESPAÑOL.
Debes usar obligatoriamente las siguientes etiquetas estructurales exactas entre corchetes para delimitar las secciones en tu respuesta:

[TIPO_CONTRATO]
Escribe aquí el nombre del contrato (ej: Acuerdo de Confidencialidad).

[NIVEL_RIESGO]
Escribe un único número entero del 1 al 10 (ej: 7).

[RESUMEN]
Escribe un resumen ejecutivo breve de máximo 4 líneas sobre el propósito del contrato y si es seguro firmarlo.

[RIESGOS]
Escribe una lista de las cláusulas más riesgosas encontradas. Cada riesgo debe seguir este formato estricto:
- RIESGO: [BAJO / MEDIO / ALTO] | Título del Riesgo
- CLAUSULA: "Párrafo del contrato"
- EXPLICACION: Explicación de la consecuencia.

[NEGOCIACION]
Sugerencias alternativas en este formato:
- TIP: Consejo.
- REDRAFT: "Redacción propuesta."`;

      // 2. Realizar petición POST al endpoint de generación sin streaming (para facilitar el parseo)
      const respuesta = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt: `Analiza este contrato:\n\n${textoContrato}`,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: 0.1, // Temperatura ultra baja para máxima rigurosidad y evitar alucinaciones
            num_predict: 2048
          }
        })
      });
      
      if (!respuesta.ok) {
        throw new Error('Servicio de Ollama no disponible temporalmente');
      }
      
      const data = await respuesta.json();
      resultados = parsearRespuestaIA(data.response, textoContrato);
    }
    
    // Inyectar toda la información procesada en el Tablero de Inteligencia
    dibujarReporteCompleto(resultados);
    
  } catch (error) {
    console.error('Error durante la llamada:', error);
    // Caída graciosa a simulación ante errores HTTP imprevistos
    const simulado = simularAnalisisLegal(textoContrato);
    dibujarReporteCompleto(simulado);
  } finally {
    mostrarOverlayCarga(false);
  }
}

/**
 * Parsea el texto devuelto por la IA basándose en las etiquetas estructurales.
 * Método robusto de strings (indexOf) con expresiones de fallback.
 */
function parsearRespuestaIA(textoPlano, textoContrato) {
  const extraerBloque = (etiqueta) => {
    const inicioTag = `[${etiqueta}]`;
    const idxInicio = textoPlano.indexOf(inicioTag);
    if (idxInicio === -1) return '';
    
    const inicioContenido = idxInicio + inicioTag.length;
    // Buscar la siguiente etiqueta como límite
    const idxFin = textoPlano.indexOf('[', inicioContenido);
    
    if (idxFin === -1) {
      return textoPlano.substring(inicioContenido).trim();
    }
    return textoPlano.substring(inicioContenido, idxFin).trim();
  };

  const tipoContrato = extraerBloque('TIPO_CONTRATO') || 'Contrato Detectado';
  
  const riesgoStr = extraerBloque('NIVEL_RIESGO');
  const numeroRiesgo = Math.min(10, Math.max(1, parseInt(riesgoStr.replace(/\D/g, '')) || 5));
  
  const resumen = extraerBloque('RESUMEN') || 'Revisión general lista.';
  const riesgosRaw = extraerBloque('RIESGOS');
  const negociacionRaw = extraerBloque('NEGOCIACION');

  // Parseo lineal de riesgos
  const riesgos = [];
  const lineasRiesgos = riesgosRaw.split('\n');
  let riesgoActual = null;

  lineasRiesgos.forEach(linea => {
    const l = linea.trim();
    if (l.startsWith('- RIESGO:')) {
      if (riesgoActual) riesgos.push(riesgoActual);
      
      const metadatos = l.substring(9).split('|');
      const nivel = metadatos[0] ? metadatos[0].replace(/[\[\]]/g, '').trim() : 'MEDIO';
      const titulo = metadatos[1] ? metadatos[1].trim() : 'Cláusula Crítica';
      
      riesgoActual = { nivel, titulo, clausula: '', explicacion: '' };
    } else if (l.startsWith('- CLAUSULA:') && riesgoActual) {
      riesgoActual.clausula = l.substring(11).replace(/"/g, '').trim();
    } else if (l.startsWith('- EXPLICACION:') && riesgoActual) {
      riesgoActual.explicacion = l.substring(14).trim();
    }
  });
  if (riesgoActual) riesgos.push(riesgoActual);

  // Parseo lineal de consejos
  const consejos = [];
  const lineasNegociacion = negociacionRaw.split('\n');
  let consejoActual = null;

  lineasNegociacion.forEach(linea => {
    const l = linea.trim();
    if (l.startsWith('- TIP:')) {
      if (consejoActual) consejos.push(consejoActual);
      consejoActual = { consejo: l.substring(6).trim(), redraft: '' };
    } else if (l.startsWith('- REDRAFT:') && consejoActual) {
      consejoActual.redraft = l.substring(10).replace(/"/g, '').trim();
    }
  });
  if (consejoActual) consejos.push(consejoActual);

  // Proveer fallbacks si la IA falló el formato
  if (riesgos.length === 0) {
    riesgos.push({
      nivel: numeroRiesgo > 7 ? 'ALTO' : 'MEDIO',
      titulo: 'Verificar Cláusulas de Responsabilidad',
      clausula: 'El texto del contrato describe términos generales.',
      explicacion: 'Se sugiere revisar manualmente las indemnizaciones y penalizaciones económicas descritas en el cuerpo del texto.'
    });
  }

  if (consejos.length === 0) {
    consejos.push({
      consejo: 'Aclarar límites de propiedad intelectual y compensaciones futuras.',
      redraft: 'Las partes acuerdan que todos los derechos de autor quedarán en reserva hasta el pago total de los importes pactados.'
    });
  }

  return {
    tipoContrato,
    nivelRiesgo: numeroRiesgo,
    resumen,
    riesgos,
    consejos,
    isSimulado: false
  };
}

// ==========================================
// 5. MANIPULACIÓN DEL DOM Y RENDERING
// ==========================================

/**
 * Pinta todo el contenido analizado en las pestañas correspondientes de la interfaz.
 */
function dibujarReporteCompleto(datos) {
  currentContractType = datos.tipoContrato;
  
  // Ocultar estado vacío y mostrar navegación de pestañas
  emptyState.style.display = 'none';
  tabNav.style.display = 'flex';
  sourceBadge.style.display = 'block';
  
  // Estilo visual del origen de los datos
  sourceBadge.textContent = datos.isSimulado ? 'IA Simulada (Ollama Offline)' : 'IA Local Activa';
  sourceBadge.style.background = datos.isSimulado ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
  sourceBadge.style.color = datos.isSimulado ? 'var(--accent-warning)' : 'var(--accent-success)';

  // Forzar tab Dashboard activa por defecto
  const botonDash = tabNav.querySelector('[data-tab="dashboard"]');
  cambiarPestañaActiva('dashboard', botonDash);

  // 1. Renderizar Medidor de Riesgo y Metadatos (Pestaña Dashboard)
  animarVelocimetroRiesgo(datos.nivelRiesgo);
  metaContractType.textContent = datos.tipoContrato;
  metaLanguage.textContent = deducirIdioma(contractInput.value);
  executiveSummaryContent.innerHTML = `<p>${datos.resumen}</p>`;

  // Diagnóstico textual personalizado
  let diagnostico = '';
  if (datos.nivelRiesgo >= 8) {
    diagnostico = `🚨 **Diagnóstico Crítico:** Este documento contiene términos jurídicos abusivos y altamente asimétricos. **Se recomienda no firmar** sin redactar nuevas condiciones en los apartados de *Cláusulas Críticas*.`;
  } else if (datos.nivelRiesgo >= 5) {
    diagnostico = `⚠️ **Diagnóstico Moderado:** Contrato con riesgos intermedios aceptables. Sin embargo, amerita renegociar plazos o intereses para evitar penalizaciones injustas.`;
  } else {
    diagnostico = `✅ **Diagnóstico Seguro:** Se detecta un acuerdo equilibrado con bajo nivel de fricción. Es seguro proceder tras validar las fechas pactadas.`;
  }
  generalDiagnosisText.innerHTML = formatearNegritasMarkdown(diagnostico);

  // 2. Renderizar Cláusulas Críticas (Pestaña 2)
  risksListContainer.innerHTML = '';
  datos.riesgos.forEach(risk => {
    const divItem = document.createElement('div');
    const nivelStr = risk.nivel.toLowerCase();
    
    // Normalizar clases de colores
    let riesgoClase = 'low';
    let riesgoLabel = 'Bajo';
    if (nivelStr === 'high' || nivelStr === 'alto') {
      riesgoClase = 'high';
      riesgoLabel = 'Alto';
    } else if (nivelStr === 'medium' || nivelStr === 'medio') {
      riesgoClase = 'medium';
      riesgoLabel = 'Medio';
    }

    divItem.className = `risk-item ${riesgoClase}`;
    divItem.innerHTML = `
      <div class="risk-header">
        <span class="risk-title">${risk.titulo}</span>
        <span class="risk-badge ${riesgoClase}">${riesgoLabel}</span>
      </div>
      <div class="risk-clause">
        "${risk.clausula}"
      </div>
      <p class="risk-description">${risk.explicacion}</p>
    `;
    risksListContainer.appendChild(divItem);
  });

  // 3. Renderizar Pestaña de Negociación (Pestaña 3)
  negotiationTipsContainer.innerHTML = '';
  datos.consejos.forEach((tip, idx) => {
    const divTip = document.createElement('div');
    divTip.className = 'negotiation-tip';
    divTip.innerHTML = `
      <div class="negotiation-tip-header">
        <span>💡 Consejo #${idx + 1}: ${tip.consejo}</span>
      </div>
      <div class="redraft-block" id="redraft-text-${idx}">${tip.redraft}</div>
      <button class="chip-btn" style="align-self: flex-end; margin-top: 8px; padding: 4px 10px; font-size: 0.75rem;">
        Copiar Redraft
      </button>
    `;

    // Vincular funcionalidad de copia rápida en el portapapeles
    const btnCopia = divTip.querySelector('button');
    btnCopia.addEventListener('click', () => {
      navigator.clipboard.writeText(tip.redraft).then(() => {
        btnCopia.innerText = 'Copiado ✓';
        setTimeout(() => btnCopia.innerText = 'Copiar Redraft', 1500);
      });
    });

    negotiationTipsContainer.appendChild(divTip);
  });

  // 4. Inicializar Historial del Chat Legal (Pestaña 4)
  chatHistory = [];
  chatMessagesContainer.innerHTML = `
    <div class="chat-bubble system">
      ¡Análisis de <strong>${datos.tipoContrato}</strong> completado! 
      He calificado el nivel de riesgo en <strong>${datos.nivelRiesgo}/10</strong>.
      Pregúntame sobre penalizaciones, condiciones de terminación o plazos del contrato.
    </div>
  `;
  chatUserInput.value = '';
  chatSendBtn.disabled = true;
}

/**
 * Calcula y aplica el stroke-dashoffset en base al score (3/4 de círculo).
 */
function animarVelocimetroRiesgo(score) {
  const circunferenciaCirculo = 282.7; // 2 * Math.PI * r (45)
  const longitudArcoUtil = 212.0;       // 3/4 de circunferencia útil
  
  // Cálculo angular exacto para el gráfico circular
  const dashOffset = circunferenciaCirculo - ((score / 10) * longitudArcoUtil);
  
  let color = 'var(--accent-success)';
  let texto = 'Bajo';
  let clase = 'low';

  if (score >= 8) {
    color = 'var(--accent-danger)';
    texto = 'Alto';
    clase = 'high';
  } else if (score >= 5) {
    color = 'var(--accent-warning)';
    texto = 'Medio';
    clase = 'medium';
  }

  // Modificar atributos SVG directamente
  riskGaugeFill.style.stroke = color;
  riskGaugeFill.style.strokeDashoffset = dashOffset;
  
  riskScoreValue.textContent = score;
  riskScoreValue.style.color = color;
  
  riskBadgeText.textContent = texto;
  riskBadgeText.className = `gauge-text ${clase}`;
}

/**
 * Transiciona entre las pestañas del panel derecho.
 */
function cambiarPestañaActiva(idTab, botonPresionado) {
  tabNav.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  botonPresionado.classList.add('active');

  const paneles = [tabDashboard, tabRisks, tabNegotiation, tabChat];
  paneles.forEach(p => p.classList.remove('active'));

  const panelActivo = document.getElementById(`tab-${idTab}`);
  if (panelActivo) {
    panelActivo.classList.add('active');
    
    // Auto-scroll del chat si se cambia a la pestaña conversacional
    if (idTab === 'chat') {
      setTimeout(() => {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        chatUserInput.focus();
      }, 80);
    }
  }
}

/**
 * Muestra u oculta la pantalla flotante de carga.
 */
function mostrarOverlayCarga(mostrar, titulo = '', subtitulo = '') {
  if (mostrar) {
    loadingTitle.textContent = titulo;
    loadingSubtext.textContent = subtitulo;
    loadingOverlay.style.display = 'flex';
  } else {
    loadingOverlay.style.display = 'none';
  }
}

/**
 * Limpia el visualizador y retorna la UI al estado vacío inicial.
 */
function resetearVisualizadorAnalisys() {
  emptyState.style.display = 'flex';
  tabNav.style.display = 'none';
  sourceBadge.style.display = 'none';
  
  const paneles = [tabDashboard, tabRisks, tabNegotiation, tabChat];
  paneles.forEach(p => p.classList.remove('active'));

  risksListContainer.innerHTML = '';
  negotiationTipsContainer.innerHTML = '';
  chatMessagesContainer.innerHTML = '';
  chatHistory = [];
}

/**
 * Desmarca la clase active de todas las plantillas seleccionadas.
 */
function desmarcarPlantillasActivas() {
  templatesContainer.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
}

// ==========================================
// 6. CHAT DE PREGUNTAS CON EFECTO TYPING
// ==========================================

/**
 * Envia el mensaje del usuario a la IA local o simulación.
 */
async function procesarPreguntaChat() {
  const textoPregunta = chatUserInput.value.trim();
  if (textoPregunta.length === 0) return;

  // 1. Imprimir la burbuja del usuario
  insertarMensajeChat('user', textoPregunta);
  chatUserInput.value = '';
  chatSendBtn.disabled = true;

  // 2. Insertar burbuja con tres puntos de carga (Loading)
  const cargandoBubble = insertarIndicadorCargaChat();
  
  const textoContrato = contractInput.value.trim();
  
  try {
    let respuestaIA;
    
    if (!ollamaConnected) {
      await new Promise(resolve => setTimeout(resolve, 800));
      respuestaIA = simularRespuestaChat(textoContrato, textoPregunta);
    } else {
      // Formatear el historial de chat acumulado
      const historialFormateado = chatHistory.map(msg => 
        `${msg.sender === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}`
      ).join('\n');

      const prompt = `Eres LexiGuard, un asesor de IA. Responde de forma concisa y profesional en ESPAÑOL preguntas sobre este contrato:
      
CONTRATO:
${textoContrato}

HISTORIAL DE CHAT:
${historialFormateado}

Usuario: ${textoPregunta}
Asistente:`;

      const respuesta = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt: prompt,
          stream: false,
          options: { temperature: 0.3 }
        })
      });
      
      if (!respuesta.ok) throw new Error('Servidor offline');
      const data = await respuesta.json();
      respuestaIA = data.response.trim();
    }

    // Remover indicador de carga
    cargandoBubble.remove();
    
    // Imprimir respuesta final con efecto máquina de escribir (Typing effect)
    insertarMensajeChat('ai', respuestaIA, true);

  } catch (err) {
    cargandoBubble.remove();
    insertarMensajeChat('ai', 'Lo siento, no pude procesar la consulta por fallos de red con Ollama.');
  }
}

/**
 * Añade una burbuja de chat al panel e inicia el renderizado.
 */
function insertarMensajeChat(remitente, texto, efectoTipeado = false) {
  const burbuja = document.createElement('div');
  burbuja.className = `chat-bubble ${remitente}`;
  chatMessagesContainer.appendChild(burbuja);

  // Registrar en el historial de memoria
  chatHistory.push({ sender: remitente, text: texto });

  if (efectoTipeado) {
    let i = 0;
    const velocidad = 15; // ms por letra
    
    const tipear = () => {
      if (i < texto.length) {
        burbuja.innerHTML = convertirMarkdownBasico(texto.slice(0, i + 1));
        i++;
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        setTimeout(tipear, velocidad);
      } else {
        burbuja.innerHTML = convertirMarkdownBasico(texto);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }
    };
    tipear();
  } else {
    burbuja.innerHTML = convertirMarkdownBasico(texto);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }
  return burbuja;
}

/**
 * Añade una burbuja de carga para dar sensación de procesamiento.
 */
function insertarIndicadorCargaChat() {
  const burbuja = document.createElement('div');
  burbuja.className = 'chat-bubble ai';
  burbuja.style.display = 'flex';
  burbuja.style.gap = '6px';
  burbuja.style.alignItems = 'center';
  burbuja.innerHTML = `
    <span class="spinner" style="width:10px; height:10px; border-width:2px; margin:0;"></span>
    <span style="font-size:0.75rem; color:var(--text-muted)">IA analizando contrato...</span>
  `;
  chatMessagesContainer.appendChild(burbuja);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  return burbuja;
}

// ==========================================
// 7. UTILIDADES Y SIMULADORES DE CONTINGENCIA
// ==========================================

/**
 * Deduce el idioma analizando palabras comunes.
 */
function deducirIdioma(texto) {
  const esp = ['el', 'la', 'los', 'contrato', 'de', 'y'];
  const eng = ['the', 'this', 'agreement', 'of', 'and'];
  
  const tokens = texto.toLowerCase().split(/\W+/).slice(0, 100);
  let cEsp = 0;
  let cEng = 0;
  
  tokens.forEach(t => {
    if (esp.includes(t)) cEsp++;
    if (eng.includes(t)) cEng++;
  });
  
  return cEsp >= cEng ? 'Español 🇪🇸' : 'Inglés 🇺🇸';
}

/**
 * Reemplaza negritas de Markdown (**texto**) a etiquetas strong HTML.
 */
function formatearNegritasMarkdown(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

/**
 * Conversor HTML simple para los mensajes de chat.
 */
function convertirMarkdownBasico(t) {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

/**
 * Simulador de Análisis en memoria para que el MVP funcione sin Ollama.
 */
function simularAnalisisLegal(textoContrato) {
  const tl = textoContrato.toLowerCase();
  
  // 1. Caso NDA
  if (tl.includes('confidencialidad') || tl.includes('nda') || tl.includes('divulgación')) {
    return {
      tipoContrato: "Acuerdo de No Divulgación (NDA)",
      nivelRiesgo: 8,
      resumen: "Este contrato de confidencialidad es altamente asimétrico a favor de la Empresa. Impone términos de secreto indefinidos en el tiempo y sanciones pecuniarias desproporcionadas para el Colaborador.",
      riesgos: [
        {
          nivel: "ALTO",
          titulo: "Penalidad Excesiva por Filtración",
          clausula: "multa penal fija automática de 150,000 USD en concepto de daños punitivos",
          explicacion: "Una sanción económica automática sin necesidad de que la Empresa pruebe el daño patrimonial real es totalmente leonina y te asfixia financieramente en caso de litigio."
        },
        {
          nivel: "ALTO",
          titulo: "Confidencialidad Vitalicia",
          clausula: "Esta obligación tendrá carácter INDEFINIDO y PERPETUO",
          explicacion: "Los NDA de estándares profesionales delimitan la confidencialidad a un plazo razonable (2 a 5 años). Mantener obligaciones de por vida vulnera tu desarrollo profesional."
        },
        {
          nivel: "MEDIO",
          titulo: "Jurisdicción en Delaware, EE. UU.",
          clausula: "las partes se someten a los juzgados de la ciudad de Delaware, Estados Unidos",
          explicacion: "Someterse a tribunales internacionales encarece y dificulta cualquier defensa legal, forzándote a costear honorarios de juristas extranjeros y viajes."
        }
      ],
      consejos: [
        {
          consejo: "Establecer una duración de confidencialidad temporal.",
          redraft: "La obligación de confidencialidad de este acuerdo estará vigente durante la relación y por un período máximo de tres (3) años desde su terminación."
        },
        {
          consejo: "Eliminar multas punitivas directas.",
          redraft: "En caso de incumplimiento demostrado, la parte responsable responderá por los daños y perjuicios directos reales que sean acreditados ante el juzgado."
        }
      ],
      isSimulado: true
    };
  }

  // 2. Caso Alquiler
  if (tl.includes('arrendamiento') || tl.includes('alquiler') || tl.includes('inquilino')) {
    return {
      tipoContrato: "Contrato de Arrendamiento Urbano",
      nivelRiesgo: 9,
      resumen: "Este contrato vulnera el derecho constitucional a la inviolabilidad del hogar y te traslada costos de mantenimiento estructural que corresponden legalmente al propietario.",
      riesgos: [
        {
          nivel: "ALTO",
          titulo: "Intromisión sin Consentimiento",
          clausula: "derecho a ingresar a la vivienda... en cualquier momento, sin necesidad de previo aviso escrito",
          explicacion: "El arrendatario tiene derecho a la intimidad. El propietario no puede acceder a la propiedad arrendada sin permiso formal, salvo emergencias extremas."
        },
        {
          nivel: "ALTO",
          titulo: "Costos de Reparación Estructural",
          clausula: "reparaciones... desgaste natural de la caldera de calefacción, la fontanería antigua",
          explicacion: "Trasladar los costos del desgaste estructural y natural de suministros esenciales al inquilino es ilegal. El arrendador debe asegurar la habitabilidad básica."
        }
      ],
      consejos: [
        {
          consejo: "Exigir aviso formal previo para visitas.",
          redraft: "El Arrendador podrá inspeccionar la vivienda una vez por trimestre previo aviso por escrito con 48 horas de anticipación y mediando acuerdo mutuo."
        },
        {
          consejo: "Reubicar costos de conservación estructural.",
          redraft: "El Arrendador costeará todas las reparaciones mayores e indispensables para conservar la vivienda en estado habitable, conforme dictan las leyes de vivienda."
        }
      ],
      isSimulado: true
    };
  }

  // 3. Caso Freelance
  if (tl.includes('freelance') || tl.includes('servicios') || tl.includes('entregables')) {
    return {
      tipoContrato: "Contrato de Prestación de Servicios de Desarrollo",
      nivelRiesgo: 7,
      resumen: "El acuerdo de servicios autónomos restringe indebidamente tu libertad comercial al exigir exclusividad nacional sin compensación, y dilata los pagos excesivamente.",
      riesgos: [
        {
          nivel: "ALTO",
          titulo: "Cláusula de Exclusividad Abusiva",
          clausula: "no podrá prestar servicios... a ninguna otra empresa del sector... por un año posterior",
          explicacion: "Impedir que un trabajador autónomo contrate con otros clientes anula su naturaleza comercial. Un pacto de no competencia post-contractual requiere compensación monetaria."
        },
        {
          nivel: "MEDIO",
          titulo: "Plazo de Pago Dilatado (90 Días)",
          clausula: "El pago se realizará a los noventa (90) días naturales posteriores",
          explicacion: "Cobrar a 90 días naturales asfixia el flujo de caja del autónomo y viola las normativas de lucha contra la morosidad comercial."
        }
      ],
      consejos: [
        {
          consejo: "Garantizar la libertad de contratación independiente.",
          redraft: "El Desarrollador actúa de forma autónoma y podrá prestar servicios a terceros, salvo que exista conflicto directo y uso verificado de datos protegidos del Cliente."
        },
        {
          consejo: "Establecer cobros comerciales a 30 días.",
          redraft: "Los honorarios serán liquidados en un plazo máximo de 30 días tras la entrega de la factura correspondiente por parte del Desarrollador."
        }
      ],
      isSimulado: true
    };
  }

  // 4. Caso TOS
  if (tl.includes('términos y condiciones') || tl.includes('socialhub') || tl.includes('uso')) {
    return {
      tipoContrato: "Términos y Condiciones de Servicio (TOS)",
      nivelRiesgo: 8,
      resumen: "Los Términos de Servicio de SocialHub exigen accesos de geolocalización intrusivos y excluyen cualquier tipo de responsabilidad civil ante hackeos masivos de cuentas.",
      riesgos: [
        {
          nivel: "ALTO",
          titulo: "Comercialización Invasiva de Privacidad",
          clausula: "rastrear... ubicación en segundo plano... y vender esta información a terceras empresas",
          explicacion: "El rastreo permanente y la venta de geolocalización a anunciantes debe requerir consentimiento activo y explícito, permitiendo al usuario revocarlo cuando desee."
        },
        {
          nivel: "ALTO",
          titulo: "Deslinde de Seguridad Digital",
          clausula: "SocialHub queda exenta de toda responsabilidad civil en caso de robo masivo de datos",
          explicacion: "Las plataformas digitales tienen el deber de salvaguarda. Deslindar negligencias graves de seguridad es abusivo ante las leyes de protección al consumidor."
        }
      ],
      consejos: [
        {
          consejo: "Habilitar la opción de exclusión voluntaria de datos.",
          redraft: "El Usuario mantendrá absoluto control de privacidad, pudiendo denegar el rastreo de ubicación desde las preferencias internas de la plataforma."
        }
      ],
      isSimulado: true
    };
  }

  // 5. Caso General
  return {
    tipoContrato: "Documento Contractual General",
    nivelRiesgo: 5,
    resumen: "El documento cargado califica con un nivel de riesgo moderado. Define obligaciones mutuas ordinarias, pero requiere precisar los términos de rescisión anticipada.",
    riesgos: [
      {
        nivel: "MEDIO",
        titulo: "Indefinición de Plazos de Entrega",
        clausula: "El documento legal no define con precisión los plazos límites de entrega de las prestaciones.",
        explicacion: "La falta de fechas claras puede propiciar demoras operativas e interpretaciones divergentes sobre el grado de cumplimiento del acuerdo."
      }
    ],
    consejos: [
      {
        consejo: "Incorporar cronogramas con plazos definidos.",
        redraft: "Las actividades se realizarán respetando el calendario de hitos acordado por escrito, fijando una holgura de cinco (5) días hábiles en caso de incidentes."
      }
    ],
    isSimulado: true
  };
}

/**
 * Simulador de Respuestas de Chat en memoria para que la Demo funcione offline.
 */
function simularRespuestaChat(textoContrato, mensaje) {
  const m = mensaje.toLowerCase();
  const tc = textoContrato.toLowerCase();

  const esNDA = tc.includes('confidencialidad') || tc.includes('nda');
  const esAlquiler = tc.includes('arrendamiento') || tc.includes('alquiler');
  const esFreelance = tc.includes('freelance') || tc.includes('desarrollador');

  if (esNDA) {
    if (m.includes('plazo') || m.includes('duracion') || m.includes('tiempo')) {
      return "Según la **Cláusula 2** del NDA, la confidencialidad es **INDEFINIDA y PERPETUA**. Esto te obliga de por vida. En NDA comerciales, lo normal es negociar un límite de **2 a 5 años**.";
    }
    if (m.includes('multa') || m.includes('sancion') || m.includes('dinero') || m.includes('dolar')) {
      return "La **Cláusula 3** impone una multa fija de **150,000 USD** automática por filtraciones. Al ser daños punitivos, la Empresa no debe probar daño real. Sugiero renegociar esto para responder solo por 'daños y perjuicios reales debidamente demostrados'.";
    }
  }

  if (esAlquiler) {
    if (m.includes('entrar') || m.includes('visita') || m.includes('dueño')) {
      return "La **Cláusula 2** permite al casero entrar a la casa en **cualquier momento sin avisar**. Esto viola tu derecho a la inviolabilidad del domicilio. Deberías modificarla exigiendo un aviso formal escrito (mínimo de 48 horas).";
    }
    if (m.includes('caldera') || m.includes('reparacion') || m.includes('rompe')) {
      return "La **Cláusula 3** te carga con todos los gastos estructurales y averías del desgaste natural (caldera, fontanería). Las leyes imponen que estos gastos indispensables de habitabilidad corresponden al propietario, no al inquilino.";
    }
  }

  if (esFreelance) {
    if (m.includes('competencia') || m.includes('exclusividad') || m.includes('otro cliente')) {
      return "La **Cláusula 2** te prohíbe dar servicios a otras agencias del sector durante el contrato y **un año posterior**. Esto es nulo e ilegal para un autónomo si no hay una compensación económica explícita e importante.";
    }
    if (m.includes('pago') || m.includes('cobrar') || m.includes('plazo')) {
      return "La **Cláusula 3** difiere tus honorarios a **90 días naturales** desde la entrega. Esto excede los plazos estándar de proveedores autónomos y atenta contra tu liquidez. Negocia un plazo máximo de **30 días**.";
    }
  }

  // Respuestas del Sistema Genéricas
  if (m.includes('hola') || m.includes('buenos dias')) {
    return "¡Hola! Estoy listo para auditar el contrato contigo. ¿Tienes alguna pregunta sobre cláusulas específicas, multas o responsabilidades?";
  }
  if (m.includes('riesgo') || m.includes('peligro') || m.includes('malo')) {
    return "El contrato tiene cláusulas desfavorables. Por favor, chequea la pestaña de **Cláusulas Críticas** donde desglosé en colores cada uno de los riesgos con sus explicaciones.";
  }
  if (m.includes('firmar') || m.includes('consejo')) {
    return "Mi consejo es **NO firmar en este estado**. Toma las sugerencias equilibradas que redacté en la pestaña de **Negociación** y propónselas a la otra parte para lograr un acuerdo equitativo.";
  }

  return "Entendido. Según el documento cargado, te aconsejo prestar atención a los límites de responsabilidad civil y plazos de terminación. Si deseas consultar algo concreto sobre multas o indemnidades, dime para guiarte.";
}
