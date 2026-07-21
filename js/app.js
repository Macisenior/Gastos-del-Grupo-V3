import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection, 
   deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { 
  auth, 
  db, 
  signInAnonymously, 
  onAuthStateChanged,
  onSnapshot
} from "./firebase.js";
import { renderResumen } from "./resumen.js";
import {
    calcularGastoPorPersona,
    calcularBalance
} from "./services/calculos.js";
import { renderSitios } from "./renderSitios.js";
import { renderPersonas } from "./renderPersonas.js";
import { renderGastos } from "./renderGastos.js";
import { renderBalance } from "./renderBalance.js";
import { renderHero } from "./renderHero.js";
import { generarPDF } from "./services/pdf.js";
import { exportarMesPDF } from "./services/pdf.js";
import { exportarMesActual, exportarMesManual } from "./services/pdf.js";
import { generarPDFResumen } from "./services/pdf.js";
import { exportarAportacionesAnualPro } from "./services/pdf.js";
import { exportarGastosTotalesPro } from "./services/pdf.js";
import { exportarResumenFinal } from "./services/pdf.js";
import { 
  renderPersonasRapido, 
  renderPagadorRapido,
  enviarGastoRapido,
  seleccionarTodosRapido,
  renderSitiosRapido 
} from "./rapido.js";
import { renderDetallePersona } from "./renderDetallePersona.js";

import {
    consultarEstadoGlobal,
    exportarEstadoGlobalExcel,
    exportarHistorico,
     exportarHistoricoGlobal
} from "./historicos.js";
window.exportarEstadoGlobalExcel =
    exportarEstadoGlobalExcel;
window.consultarEstadoGlobal = () => {
  document.getElementById("fechaGlobal").min = "2026-05-01";

    const fecha = document.getElementById("fechaGlobal").value;

    if (!fecha) {
        alert("Selecciona una fecha");
        return;
    }

    consultarEstadoGlobal(fecha);

};
//import { abrirAdministrador } from "./admin.js";
window.enviarGastoRapido = enviarGastoRapido;
window.seleccionarTodosRapido = seleccionarTodosRapido;


function render() {
 
  const personaEfectivo = document.getElementById("personaEfectivo");  
  const pinCard = document.getElementById("pinCard");
  const modoEdicion = document.getElementById("modoEdicion");
  const dangerZone = document.getElementById("dangerZone");
  const adminCard = document.getElementById("adminCard");
 
    
 
  // ===== SITIOS =====
 renderSitios(listaSitios);
renderSitiosRapido(listaSitios);
  // ===== PERSONAS =====
 renderPersonas(personas);
renderPersonasRapido(personas);
renderPagadorRapido(personas);
window.personas = personas;
  // ===== CÁLCULOS =====
 const gastoPersona = calcularGastoPorPersona(personas, gastos);

  const total =
    personas.reduce((s, p) => s + p.aportado, 0) -
    gastos.reduce((s, g) => s + g.monto, 0);

  // ===== ESTADO =====
  let estadoActual;
  if (total < 0) estadoActual = "negativo";
  else if (total <= 20) estadoActual = "bajo";
  else estadoActual = "positivo";

  if (estadoActual !== estadoAnterior) {
    if (estadoActual === "negativo") {
      fraseActual = frasesNegativas[Math.floor(Math.random() * frasesNegativas.length)];
    } else if (estadoActual === "bajo") {
      fraseActual = frasesBajo[Math.floor(Math.random() * frasesBajo.length)];
    } else {
      fraseActual = frasesPositivas[Math.floor(Math.random() * frasesPositivas.length)];
    }
    estadoAnterior = estadoActual;
  }

  // ===== HERO BALANCE =====
const balances = calcularBalance(personas, gastos);

renderHero(
    total,
    grupoActivo,
    ultimaActualizacion,
    balances
);
 

  // ===== QUIÉN DEBE + WHATSAPP =====
 renderBalance(personas, gastos);
// ===== RESUMEN PERSONAS =====
const resumenPersonas = document.getElementById("resumenPersonas");

if (resumenPersonas) {
 const gastoPersona = calcularGastoPorPersona(personas, gastos);

  resumenPersonas.innerHTML = personas.map(p => `
    <strong>${p.nombre}</strong><br>
    Aportado: ${p.aportado.toFixed(2)} €<br>
    Gastado: ${gastoPersona[p.id].toFixed(2)} €<br><br>
  `).join("");
}

// ===== LISTA GASTOS =====
renderGastos(gastos, personas, filtrarPorMes);
const buscarGasto = document.getElementById("buscarGasto");

if (buscarGasto && !buscarGasto.dataset.evento) {

    buscarGasto.addEventListener("input", () => {

        render();

    });

    buscarGasto.dataset.evento = "ok";
}

// ====== USUARIOS V2 ======
renderUsuarios();

// ===== GRÁFICO SITIOS =====
if (typeof Chart !== "undefined" && document.getElementById("graficoSitios")) {
  if (chartSitios) chartSitios.destroy();

  const sitios = {};
  gastos.forEach(g => {
    sitios[g.sitio] = (sitios[g.sitio] || 0) + g.monto;
  });

  chartSitios = new Chart(graficoSitios, {
    type: "doughnut",
    data: {
      labels: Object.keys(sitios),
      datasets: [{ data: Object.values(sitios) }]
    }
  });
}
// 📅 Fecha del listado

const fechaListado = document.getElementById("fechaListado");

if (fechaListado) {

  if (ultimaActualizacion) {

    fechaListado.innerHTML = `
      🕒 ${textoFechaActualizacion(ultimaActualizacion)}
    `;

  } else {

    fechaListado.innerHTML = `
      🕒 Sin actualizar
    `;

  }

}

  
}
  // 🎭 FRASES DINÁMICAS

const frasesPositivas = [
  "🕶️ Nivel de organización: ninja.",
  "🍺 Aquí no se pierde ni una ronda.",
  "🎉 Grupo en modo celebración.",
  "🧠 Control financiero absoluto.",
  "💸 Gastar sabemos. Cuadrar también.",
  "👑 Administración legendaria."
];

const frasesNegativas = [
  "⚠️ Momento de invitar algo...",
  "🍻 Se viene ronda obligatoria.",
  "😏 Aquí hay cuentas pendientes...",
  "💸 Alguien está mirando para otro lado...",
  "🔥 Esto se arregla con una cerveza."
];
const frasesBajo = [
  "⚠️ Ojo, vamos ajustados.",
  "🍺 Últimas rondas con cabeza.",
  "💸 El fondo empieza a bajar.",
  "🧐 Controlando gastos...",
  "📉 Estamos en zona delicada."
];
// ---- estado ----

let listaSitios = [
  { nombre: "Flap", color: "#4CAF50" },
  { nombre: "Colono", color: "#2196F3" },
  { nombre: "Lydo", color: "#FF9800" }
];
let btnCrearGrupo;
let dangerZone;
let pinCard;
let modoEdicion;
let personas = [];
let gastos = [];
let aportaciones = [];
let pinGuardado = null;
let edicionActiva = false;
let chartPersonas, chartSitios;
let importandoBackup = false;
let gastoEditando = null;
let ultimaActualizacion = null;
let estadoAnterior = null;
let fraseActual = "";
let unsubscribeGrupo = null;
let cargandoGrupo = false;
let usuarioEditando = null;

 
  console.log("Intentando login anónimo...");
  signInAnonymously(auth).catch(console.error);
onAuthStateChanged(auth, async (user) => {
  if (user) {

    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "block";

    console.log("Auth OK", user.uid);

    await new Promise(resolve => setTimeout(resolve, 1500));
    await cargarListaGrupos();
    await pintarDashboardGlobal();
    const hoy = new Date().toISOString().split("T")[0];

if (fechaGasto) fechaGasto.value = hoy;

const fechaIngreso = document.getElementById("cashDate");
if (fechaIngreso) fechaIngreso.value = hoy;
   iniciarAplicacion();
    // ❌ quitar render();

    if (loading) loading.style.display = "none";
  }
});

  if (btnCrearGrupo) btnCrearGrupo.style.display = "none";
 

 



// 📂 Grupo activo
let grupoActivo = localStorage.getItem("grupoActivo") || "general";

// 📄 Referencia dinámica
function getDocRef() {
  return doc(db, "grupos", grupoActivo);
}
function colorGrupo(id) {
  if (id === "general") return "#2e7d32";          // verde café
  if (id === "Viernes Oficial") return "#f59e0b";  // dorado cerveza
  if (id === "Torreznos") return "#b91c1c";        // rojo torrezno
  return "#374151"; // color por defecto
}

async function cargarListaGrupos() {
  const snap = await getDocs(collection(db, "grupos"));
  const ordenDeseado = ["general", "Viernes Oficial", "Torreznos"];

const docsOrdenados = snap.docs.sort((a, b) => {
  return ordenDeseado.indexOf(a.id) - ordenDeseado.indexOf(b.id);
});
  const container = document.getElementById("selectorGrupoChips");

  if (!container) return;

  container.innerHTML = "";

    docsOrdenados.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const chip = document.createElement("div");
    chip.className = "grupo-chip";
    chip.textContent = `${data.emoji || "📁"} ${data.nombreVisible || id}`;

    if (id === grupoActivo) {
      chip.classList.add("activo");
      chip.style.background = colorGrupo(id);
      chip.style.color = "white";
    }

    chip.onclick = () => cambiarGrupo(id);

    container.appendChild(chip);
  });
}
async function cambiarGrupo(id) {

  if (id === grupoActivo) return; // no hacer nada si ya está activo

  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "block";

  // 🔄 Cambiar grupo
  grupoActivo = id;
  localStorage.setItem("grupoActivo", grupoActivo);

  // 🔒 Bloquear edición al cambiar
  bloquearEdicion();

  // 🔄 Recargar datos
cargar();

  // 🔄 Volver a pintar chips activos
  await cargarListaGrupos();

  if (loading) loading.style.display = "none";
} 

// ➕ Crear nuevo grupo
window.crearGrupo = async () => {



  if (!edicionActiva) {
    alert("Debes desbloquear la edición con el PIN");
    return;
  }

  const nombre = prompt("Nombre del nuevo grupo:");
  if (!nombre) return;

  await setDoc(doc(db, "grupos", nombre), {
    nombreVisible: "☕ " + nombre,
    emoji: "☕",
    color: "#0f766e",
    personas: [],
    gastos: [],
    aportaciones: [],
    pin: null
  });

  grupoActivo = nombre;
  localStorage.setItem("grupoActivo", nombre);

  await cargarListaGrupos();

  cargar();   // 🔥 sin await
};


window.borrarGrupo = async () => {

  if (!edicionActiva) return;

  if (grupoActivo === "general") {
    alert("No se puede borrar el grupo general.");
    return;
  }

  const seguro = confirm(
    "⚠ Esta acción eliminará el grupo completo.\n\n¿Seguro que quieres continuar?"
  );

  if (!seguro) return;

  await deleteDoc(doc(db, "grupos", grupoActivo));

  grupoActivo = "general";
  localStorage.setItem("grupoActivo", "general");

  await cargarListaGrupos();

  cargar();   // 🔥 sin await
};
// 🔹 FUERA de exportarMesPDF
function filtrarPorMes(gastos, mes, año) {
  return gastos.filter(g => {

    if (!g.fecha) return false;

    const partes = g.fecha.split("/");
    if (partes.length !== 3) return false;

    const mesNum = parseInt(partes[1], 10) - 1;
    const añoNum = parseInt(partes[2], 10);

    return mesNum === mes && añoNum === año;
  });
}
const FECHA_INICIO = new Date("2026-04-01");
// 🔥 calcular saldo actual (válida para cualquier grupo)
function calcularSaldoActual(
    personaId,
    personasGrupo = personas,
    gastosGrupo = gastos
) {

    let gastado = 0;

    gastosGrupo.forEach(g => {

        if (!g.participantes || !g.monto) return;

        if (
            (g.participantes || [])
                .map(Number)
                .includes(Number(personaId))
        ) {
            gastado += g.monto / g.participantes.length;
        }

    });

    const persona = personasGrupo.find(
        p => Number(p.id) === Number(personaId)
    );

    return (persona?.aportado || 0) - gastado;

}
// 🔥 calcular saldo desde abril (solo movimientos)
function calcularMovimientosDesdeInicio(
    personaId,
    fecha,
    aportacionesGrupo = aportaciones,
    gastosGrupo = gastos
) {

    let aportado = 0;
    let gastado = 0;

    // ===== APORTACIONES =====
    aportacionesGrupo.forEach(a => {

        const f = new Date(a.date);

        if (
            f >= FECHA_INICIO &&
            f <= fecha &&
            Number(a.personaId) === Number(personaId)
        ) {
            aportado += a.amount;
        }

    });

    // ===== GASTOS =====
    gastosGrupo.forEach(g => {

        if (!g.fecha) return;

        const [d, m, y] = g.fecha.split("/");

        const f = new Date(`${y}-${m}-${d}`);

        if (
            f >= FECHA_INICIO &&
            f <= fecha &&
            (g.participantes || []).map(Number).includes(Number(personaId))
        ) {
            gastado += g.monto / g.participantes.length;
        }

    });

    return aportado - gastado;

}
// 🔥 FUNCIÓN UNIVERSAL
function calcularSaldoEnFecha(
    personaId,
    fecha,
    personasGrupo = personas,
    gastosGrupo = gastos,
    aportacionesGrupo = aportaciones
) {

    // Saldo actual del grupo que estemos usando
    const saldoHoy = calcularSaldoActual(
        personaId,
        personasGrupo,
        gastosGrupo
    );

    // Movimientos hasta la fecha consultada
    const movimientosFecha = calcularMovimientosDesdeInicio(
        personaId,
        fecha,
        aportacionesGrupo,
        gastosGrupo
    );

    // Movimientos hasta hoy
    const movimientosHoy = calcularMovimientosDesdeInicio(
        personaId,
        new Date(),
        aportacionesGrupo,
        gastosGrupo
    );

    // Saldo inicial del periodo
    const saldoInicial = saldoHoy - movimientosHoy;

    return saldoInicial + movimientosFecha;

}
window.calcularSaldoEnFecha = calcularSaldoEnFecha;
window.verEstadoEnFecha = function() {

  const input = document.getElementById("fechaConsulta");
  if (!input.value) {
    alert("Selecciona una fecha");
    return;
  }
window.calcularSaldoEnFecha = calcularSaldoEnFecha;
  const fecha = new Date(input.value);
  const cont = document.getElementById("estadoFechaCard");

let totalGrupo = 0;
personas.forEach(p => {
  totalGrupo += calcularSaldoEnFecha(p.id, fecha);
});
let html = `
  <h3 style="margin-bottom:10px;">
    📅 Estado en ${input.value}
  </h3>

  <p><strong>👥 Participantes:</strong> ${personas.length}</p>
  <p><strong>💰 Total disponible:</strong>
    <span style="color:${totalGrupo < 0 ? "#ef4444" : "#22c55e"}">
    ${totalGrupo.toFixed(2)} €  
    </span>
  </p>

  <hr style="margin:12px 0;">
`;


  personas.forEach(p => {

    const saldo = calcularSaldoEnFecha(p.id, fecha);
   
    let color = "";
    let texto = "";

    if (saldo < 0) {
      color = "#ef4444";
      texto = `${p.nombre} debe ${Math.abs(saldo).toFixed(2)} €`;
    } else if (saldo > 0) {
      color = "#22c55e";
      texto = `${p.nombre} dispone de ${saldo.toFixed(2)} €`;
    } else {
      color = "#a78bfa";
      texto = `${p.nombre} equilibrado`;
    }

    html += `
      <div class="estado-linea">
        <span class="estado-dot" style="background:${color}"></span>
        <span>${texto}</span>
      </div>
    `;
  });

  cont.innerHTML = html;
  cont.classList.remove("hidden");
};
window.exportarEstadoPDF = () => {

  const fInicio = new Date(document.getElementById("fechaInicio").value);
  const fFin = new Date(document.getElementById("fechaFin").value);

  if (!fInicio || !fFin) {
    alert("Selecciona fechas");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 15;

  // 🧾 CABECERA
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Estado del grupo", 10, y);
  y += 8;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Desde ${fInicio.toLocaleDateString()} hasta ${fFin.toLocaleDateString()}`,
    10,
    y
  );

  y += 10;

  let fecha = new Date(fInicio);
  let estadoAnterior = null;

  while (fecha <= fFin) {

    let estadoActual = [];

    // 🔥 calcular estado del día
    personas.forEach(p => {
      const saldo = calcularSaldoEnFecha(p.id, fecha);
      estadoActual.push(saldo.toFixed(2));
    });

    // 🔥 comparar con día anterior
    const igual = estadoAnterior &&
      estadoAnterior.every((v, i) => v === estadoActual[i]);

    if (!igual) {

      // 📅 FECHA
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(fecha.toLocaleDateString("es-ES"), 10, y);
      y += 4;

      pdf.setDrawColor(200);
      pdf.line(10, y, 200, y);
      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(13);

      // 👥 PERSONAS
      personas.forEach((p, i) => {

        const saldo = parseFloat(estadoActual[i]);

     const nombre = p.nombre;
const valor = (saldo >= 0 ? "+" : "") + saldo.toFixed(2) + " €";

// 🔴 color según saldo
if (saldo < 0) {
  pdf.setTextColor(220, 38, 38); // rojo
} else {
  pdf.setTextColor(0, 0, 0); // negro
}

pdf.text(nombre, 10, y);
pdf.text(valor, 170, y, { align: "right" });

// 🔁 resetear color (importante)
pdf.setTextColor(0, 0, 0);   

        y += 7;
      });

      y += 10;

      // 📄 salto de página
      if (y > 270) {
        pdf.addPage();
        y = 15;
      }
    }

    estadoAnterior = estadoActual;
    fecha.setDate(fecha.getDate() + 1);
  }

  // 🧾 RESUMEN FINAL
  pdf.addPage();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Resumen final", 10, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  let yFinal = 30;

personas.forEach(p => {

  const saldo = calcularSaldoEnFecha(p.id, fFin);
  const texto = `${p.nombre}: ${(saldo >= 0 ? "+" : "")}${saldo.toFixed(2)} €`;

  // 🔴 color según saldo
  if (saldo < 0) {
    pdf.setTextColor(220, 38, 38); // rojo
  } else {
    pdf.setTextColor(0, 0, 0); // negro
  }

  pdf.text(texto, 10, yFinal);

  // 🔁 resetear color
  pdf.setTextColor(0, 0, 0);

  yFinal += 6;
});

  pdf.save("estado_historico_pro.pdf");
};
// 🔹 EXPORTAR PDF
window.exportarMesPDF = (mes, año) => {
  exportarMesPDF(mes, año, personas, gastos);
};


window.exportarBackup = () => {
  const backup = {
    fecha: new Date().toISOString(),
    personas,
    gastos,
    aportaciones
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup_gastos_grupo.json";
  a.click();
  URL.revokeObjectURL(url);
};
window.abrirResumen = () => {

  document.querySelectorAll(".pantalla")
    .forEach(p => p.classList.remove("activa"));

  document.getElementById("pantallaResumen")
    .classList.add("activa");

  renderResumen(personas, gastos, aportaciones);
};

 
   window.importarBackup = async () => {
  const input = document.getElementById("archivoBackup");
  if (!input.files.length) {
    alert("Selecciona un archivo");
    return;
  }

  const file = input.files[0];
  const texto = await file.text();
  const data = JSON.parse(texto);

  if (!data.personas || !data.gastos) {
    alert("Archivo no válido");
    return;
  }

  if (!confirm("Esto reemplazará los datos actuales. ¿Continuar?")) return;

  importandoBackup = true;

  aportaciones = data.aportaciones || [];
  personas = data.personas;
  gastos = data.gastos;

  await guardar();

  importandoBackup = false;
  render();
};
 function textoFechaActualizacion(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);
  const hoy = new Date();

  const diff = Math.floor(
    (hoy.setHours(0,0,0,0) - fecha.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return "Actualizado hoy";
  if (diff === 1) return "Actualizado ayer";
  return `Actualizado hace ${diff} días`;
}
function tiempoDesde(fecha) {
  if (!fecha) return "—";

  const ahora = new Date();
  const diff = Math.floor((ahora - fecha) / 1000);

  if (diff < 60) return "Hace unos segundos";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "Ayer";

  return fecha.toLocaleDateString();
}
function crearBackupLocal() {

  const backup = {
    _backup: {
      app: "Gastos de grupo",
      generado: new Date().toISOString(),
      personas: personas.length,
      gastos: gastos.length,
      aportaciones: aportaciones.length
    },
    personas,
    gastos,
    aportaciones
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const fecha = new Date()
    .toISOString()
    .replace(/:/g, "-")
    .replace("T", "_")
    .slice(0, 19);

  const nombre = `backup-gastos-${fecha}.json`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();

  console.log("📦 Backup local creado:", nombre);
}
function cargar(){

  if (unsubscribeGrupo) {
    unsubscribeGrupo(); // 🔥 desuscribirse del grupo anterior
  }

  const docRef = getDocRef();

  unsubscribeGrupo = onSnapshot(docRef, (snap) => {

    if (snap.exists()) {
      const d = snap.data();

      aportaciones = d.aportaciones || [];
      personas = d.personas || [];
      gastos = d.gastos || [];
      pinGuardado = d.pin || null;

   if (d.ultimaActualizacion) {
  if (typeof d.ultimaActualizacion.toDate === "function") {
    ultimaActualizacion = d.ultimaActualizacion.toDate();
  } else if (d.ultimaActualizacion.seconds) {
    // 🔥 caso Firebase Timestamp serializado
    ultimaActualizacion = new Date(d.ultimaActualizacion.seconds * 1000);
  } else {
    ultimaActualizacion = new Date(d.ultimaActualizacion);
  }
} else {
  ultimaActualizacion = null;
}
  


console.log("Usuario actual:", localStorage.getItem("usuarioActual"));   
    } 
render();
   
  });
}

   

 
 
  edicionActiva = false; // 🔐 FORZAR bloqueo al cargar

 
  if (btnCrearGrupo) btnCrearGrupo.style.display = "none";

  
  if (dangerZone) dangerZone.classList.add("hidden");
  


if (pinCard) pinCard.classList.remove("hidden");
if (modoEdicion) modoEdicion.classList.add("hidden");


async function guardar() {
  if (!edicionActiva) return;

  // 🛑 B) No guardar si TODO está vacío
  if (
    (!personas || personas.length === 0) &&
    (!gastos || gastos.length === 0) &&
    (!aportaciones || aportaciones.length === 0)
  ) {
    console.warn("⛔ Guardado cancelado: datos vacíos");
    return;
  }

  // 🛟 Backup SOLO si NO estamos importando
  if (!importandoBackup) {
    crearBackupLocal();
  }

  try {
  console.log("📦 ENVIANDO A FIRESTORE");  
  await setDoc(
  getDocRef(),
  {
    personas,
    gastos,
    aportaciones,
    pin: pinGuardado ?? null,
    ultimaActualizacion: new Date()
  },
  { merge: true }
);

    console.log("✅ Guardado seguro en Firestore");
  } catch (e) {
    console.error("❌ Error al guardar:", e);
  }
}
window.pedirPin = async () => {

  // ===== BLOQUEAR =====
  if (edicionActiva) {

    bloquearEdicion();

    render();

    return;
  }

  // ===== CREAR PIN =====
  if (!pinGuardado) {

    const nuevo = prompt("Crea un PIN para editar");

    if (!nuevo) return;

    pinGuardado = nuevo;

    await guardar();

    activarEdicion();

    render();

    return;
  }

  // ===== PEDIR PIN =====
  const intento = prompt("Introduce el PIN");

  if (String(intento) === String(pinGuardado)) {

    activarEdicion();

    render();

  } else {

    alert("PIN incorrecto");

  }

};
function bloquearEdicion() {

  edicionActiva = false;

  document.querySelectorAll(".editable")
    .forEach(e => e.classList.add("hidden"));

  if (btnCrearGrupo)
    btnCrearGrupo.style.display = "none";

  if (dangerZone)
    dangerZone.classList.add("hidden");

  if (adminCard)
    adminCard.classList.add("hidden");

  if (modoEdicion)
    modoEdicion.classList.add("hidden");

  actualizarBotonEdicion();
}

function actualizarBotonEdicion() {
  const btn = document.querySelector("#pinCard button");
  if (!btn) return;

  if (edicionActiva) {
  btn.textContent = "🔒 Bloquear";
    btn.style.background = "#dc2626"; // rojo elegante
  } else {
   btn.textContent = "🔓 Desbloquear";
    btn.style.background = "#16a34a"; // verde elegante
  }
}
function activarEdicion() {

  edicionActiva = true;

  document.querySelectorAll(".editable")
    .forEach(e => e.classList.remove("hidden"));

  if (btnCrearGrupo)
    btnCrearGrupo.style.display = "block";

  if (dangerZone && grupoActivo !== "general")
    dangerZone.classList.remove("hidden");

  if (adminCard)
    adminCard.classList.remove("hidden");

  if (modoEdicion)
    modoEdicion.classList.remove("hidden");

  actualizarBotonEdicion();
}

function agregarPersona() {

    if (!edicionActiva) {
        alert("Debes desbloquear la edición con el PIN");
        return;
    }

    const inputNombre =
        document.getElementById("nombrePersonaV2") ||
        document.getElementById("nombrePersona");

    const inputAporte =
        document.getElementById("aportePersonaV2") ||
        document.getElementById("aportePersona");

    const inputTelefono =
        document.getElementById("telefonoPersonaV2") ||
        document.getElementById("telefonoPersona");

    const nombre = inputNombre.value.trim();
    const aporte = +inputAporte.value;
    const telefono = inputTelefono.value.trim();

    if (!nombre || !aporte) {
        alert("Faltan datos");
        return;
    }

    personas.push({
        id: Date.now(),
        nombre,
        aportado: aporte,
        telefono
    });

    inputNombre.value = "";
    inputAporte.value = "";
    inputTelefono.value = "";

    guardar();
    render();
}

window.agregarPersona = agregarPersona;

window.añadirEfectivo = async () => {

    const personaEfectivo = document.getElementById("personaEfectivo");
    const efectivoExtra = document.getElementById("efectivoExtra");
    const cashDate = document.getElementById("cashDate");

    const p = personas.find(p => p.id == personaEfectivo.value);
    const amount = +efectivoExtra.value;
    const date = cashDate.value;
  if (!p || !amount || !date) {
    alert("Faltan datos");
    return;
  }
// Comprobar si ya existe un ingreso para esa persona en esa fecha
const yaExiste = aportaciones.some(a =>
    a.personaId === p.id &&
    a.date === date
);

if (yaExiste) {

    const continuar = confirm(
        `⚠️ ${p.nombre} ya tiene un ingreso registrado el ${date}.\n\n¿Quieres añadir otro ingreso?`
    );

    if (!continuar) return;

}
  // sumar al total de la persona
  p.aportado += amount;

  // guardar histórico
 aportaciones.push({
  id: Date.now(),
  personaId: p.id,
  nombre: p.nombre,
  amount,
  date
});

  efectivoExtra.value = "";
  cashDate.value = new Date().toISOString().split("T")[0];

  await guardar();
  render();
};

window.eliminarGasto = async function(id) {

  if (!confirm("¿Seguro que quieres eliminar este gasto?")) return;

  // 🔥 eliminar del array local
  gastos = gastos.filter(g => g.id != id);

  // 🔥 guardar documento actualizado
  await guardar();

  // 🔥 refrescar UI
  render();

  console.log("Gasto eliminado correctamente");

};
window.eliminarAportacion = async function(id) {

  const aportacion = aportaciones.find(a => a.id == id);

  if (!aportacion) {
    alert("Esta aportación ya no existe.");
    render();
    return;
  }

  if (!confirm(`¿Eliminar la aportación de ${aportacion.amount.toFixed(2)} € de ${aportacion.nombre}?`)) {
    return;
  }

  const persona = personas.find(p => p.id == aportacion.personaId);

  if (persona) {
   persona.aportado -= aportacion.amount;
  }

  aportaciones = aportaciones.filter(a => a.id != id);

  await guardar();

  render();

};
window.repararIdsAportaciones = async function () {

  let reparadas = 0;

  aportaciones.forEach((a, index) => {

    if (!a.id) {
      a.id = Date.now() + index;
      reparadas++;
    }

  });

  

  await guardar();

  render();

  alert(`Se han reparado ${reparadas} aportaciones.`);

};
window.agregarGasto = async () => {

  

    // ===== Participantes =====

    const part = [...document.querySelectorAll("#checkboxPersonas input:checked")]
        .map(c => +c.value);

    if (part.length === 0) {
        alert("Selecciona al menos un participante");
        return;
    }

    // ===== Sitio =====

    const btnActivo = document.querySelector(".sitio-chip.activo");
    const sitioManual = document.getElementById("sitioManual").value.trim();

    const sitioSeleccionado =
        sitioManual || (btnActivo ? btnActivo.dataset.sitio : null);

    if (!sitioSeleccionado) {
        alert("Selecciona o escribe un sitio");
        return;
    }

    // ===== Datos =====

    const descripcion = document.getElementById("descripcionGasto").value.trim();

    const monto = +document.getElementById("montoGasto").value;

    const fecha = document.getElementById("fechaGasto").value
        ? new Date(document.getElementById("fechaGasto").value).toLocaleDateString()
        : new Date().toLocaleDateString();

    if (!monto || monto <= 0) {
        alert("Introduce un importe válido");
        return;
    }

    // ===== NUEVO O EDITAR =====

    if (gastoEditando) {

        gastoEditando.sitio = sitioSeleccionado;
        gastoEditando.descripcion = descripcion || "cafes";
        gastoEditando.monto = monto;
        gastoEditando.participantes = part;
        gastoEditando.fecha = fecha;

    } else {

        gastos.push({

            id: Date.now(),
            sitio: sitioSeleccionado,
            descripcion: descripcion || "cafes",
            monto,
            participantes: part,
            fecha

        });

    }

    // ===== Restaurar modo normal =====

    gastoEditando = null;

    const btn = document.getElementById("btnAgregarGasto");

    if (btn) {
        btn.textContent = "Añadir gasto";
        btn.style.background = "orange";
    }

    const titulo = document.querySelector(".card.editable h2");

    if (titulo) {
        titulo.textContent = "💳 Añadir gasto";
    }

   

    await guardar();

    render();

    // ===== Limpiar formulario =====

    document.getElementById("montoGasto").value = "";

    document.getElementById("descripcionGasto").value = "cafes";

    const hoy = new Date().toISOString().split("T")[0];

    document.getElementById("fechaGasto").value = hoy;

    const fechaIngreso = document.getElementById("cashDate");

    if (fechaIngreso) fechaIngreso.value = hoy;

    document
        .querySelectorAll("#checkboxPersonas input")
        .forEach(cb => cb.checked = false);

    document.getElementById("sitioManual").value = "";

};
window.actualizarTelefono = async (id, valor) => {

    const persona = personas.find(p => p.id === id);

    if (!persona) return;

    persona.telefono = valor.trim();

    await guardar();

    render();

};

  // Evento selección
document.querySelectorAll(".sitio-chip").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".sitio-chip")
      .forEach(b => b.classList.remove("activo"));

    btn.classList.add("activo");

    sitioSeleccionado = btn.dataset.sitio;
  });
});  


const heroInfo = document.getElementById("heroInfo");
const grupoSelect = document.getElementById("selectorGrupo");
if (grupoSelect) {
  grupoSelect.disabled = !edicionActiva;
}
const fechaInput = document.getElementById("fechaGasto");
if (fechaInput && !fechaInput.value) {
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.value = hoy;
}
const descripcionInput = document.getElementById("descripcionGasto");

const btnTodos = document.getElementById("btnTodos");
const btnLimpiar = document.getElementById("btnLimpiar");

if (btnTodos && btnLimpiar) {

  btnTodos.onclick = () => {
    document.querySelectorAll("#checkboxPersonas input").forEach(c => {
      c.checked = true;
    });
     actualizarContadorGasto(); 
  };

  btnLimpiar.onclick = () => {
    document.querySelectorAll("#checkboxPersonas input").forEach(c => {
      c.checked = false;
    });
      actualizarContadorGasto();
  };

}
if (descripcionInput && !descripcionInput.value) {
  descripcionInput.value = "cafes";
}
if (heroInfo) {

  let textoRelativo = "Sin registros aún";
  let textoFechaFija = "—";
  let badge = "⚪";

  if (ultimaActualizacion) {

    const ahora = new Date();
    const diff = Math.floor((ahora - ultimaActualizacion) / 1000);

    textoFechaFija = ultimaActualizacion.toLocaleDateString();

    if (diff < 60) {
      textoRelativo = "Actualizado hace unos segundos";
      badge = "🟢";
    } else if (diff < 3600) {
      textoRelativo = `Actualizado hace ${Math.floor(diff / 60)} min`;
      badge = "🟢";
    } else if (diff < 86400) {
      textoRelativo = `Actualizado hace ${Math.floor(diff / 3600)} h`;
      badge = "🟡";
    } else {
      textoRelativo = `Actualizado el ${textoFechaFija}`;
      badge = "🔴";
    }
  }

 heroInfo.innerHTML = `
  <div class="hero-meta">
    <div class="hero-top">
      <span class="hero-group">${grupoActivo.toUpperCase()}</span>
      <span class="hero-fixed-date">📅 ${textoFechaFija}</span>
    </div>
    <div class="hero-update">${badge} ${textoRelativo}</div>
  </div>
`;
}
function renderUsuarios() {

    const cont =
        document.getElementById("listaUsuariosV2") ||
        document.getElementById("listaUsuarios");

    if (!cont) return;

    const buscador = document.getElementById("buscarUsuario");

    const texto = buscador
        ? buscador.value.toLowerCase().trim()
        : "";

    const colores = [
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
        "#f97316",
        "#ec4899",
        "#14b8a6",
        "#eab308",
        "#6366f1"
    ];

    const lista = personas.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    const titulo = document.getElementById("tituloUsuarios");

    if (titulo) {

        titulo.textContent =
            texto === ""
                ? `👥 Personas (${personas.length})`
                : `👥 Personas (${lista.length} de ${personas.length})`;

    }

    cont.innerHTML = lista.map((p, index) => {

        const editando = usuarioEditando === p.id;

        const color = colores[index % colores.length];

        if (editando) {

            return `

            <div class="usuario-card">

                <div class="usuario-avatar"
                     style="background:${color}">

                    ${p.nombre.charAt(0).toUpperCase()}

                </div>

                <div class="usuario-info">

                    <input
                        id="editNombre${p.id}"
                        value="${p.nombre}"
                        placeholder="Nombre"
                        style="width:100%;margin-bottom:8px;">

                    <input
                        id="editTelefono${p.id}"
                        value="${p.telefono || ""}"
                        placeholder="Teléfono"
                        style="width:100%;margin-bottom:8px;">

                    <input
                        id="editSaldo${p.id}"
                        type="number"
                        value="${p.aportado}"
                        placeholder="Saldo inicial"
                        style="width:100%;margin-bottom:12px;">

                    <div style="display:flex;gap:8px;">

                        <button
                            style="flex:1"
                            onclick="guardarUsuario(${p.id})">

                            💾 Guardar

                        </button>

                        <button
                            class="rojo"
                            style="flex:1"
                            onclick="cancelarEdicionUsuario()">

                            ❌ Cancelar

                        </button>

                    </div>

                </div>

            </div>

            `;

        }

        return `

        <div class="usuario-card">

            <div class="usuario-avatar"
                 style="background:${color}">

                ${p.nombre.charAt(0).toUpperCase()}

            </div>

            <div class="usuario-info">

                <div class="usuario-nombre">
                    ${p.nombre}
                </div>

                <div class="usuario-telefono">
                    📞 ${p.telefono || "Sin teléfono"}
                </div>

            </div>

            <div class="usuario-acciones">

                <button onclick="editarUsuario(${p.id})">
                    ✏ Editar
                </button>

                <button
                    class="rojo"
                    onclick="confirmarEliminar(${p.id})">

                    🗑

                </button>

            </div>

        </div>

        `;

    }).join("");

}
window.renderUsuarios = renderUsuarios;

function editarUsuario(id) {

    usuarioEditando = id;

    renderUsuarios();

}

window.editarUsuario = editarUsuario;

function cancelarEdicionUsuario() {

    usuarioEditando = null;

    renderUsuarios();

}

window.cancelarEdicionUsuario = cancelarEdicionUsuario;

function confirmarEliminar(id) {

    const persona = personas.find(p => p.id === id);

    if (!persona) return;

    if (confirm(`¿Seguro que deseas eliminar a "${persona.nombre}"?\n\nEsta acción no se puede deshacer.`)) {

        eliminarPersona(id);

    }

}
function guardarUsuario(id) {

    const persona = personas.find(p => p.id === id);

    if (!persona) return;

    persona.nombre = document.getElementById(`editNombre${id}`).value.trim();

    persona.telefono = document.getElementById(`editTelefono${id}`).value.trim();

    persona.aportado = parseFloat(
        document.getElementById(`editSaldo${id}`).value
    ) || 0;

    usuarioEditando = null;

    guardar();

    render();

}

window.guardarUsuario = guardarUsuario;
window.confirmarEliminar = confirmarEliminar;



window.abrirGestionUsuarios = function() {
  document.getElementById("pantallaPrincipal").style.display = "none";
  document.getElementById("pantallaUsuarios").style.display = "block";
  renderUsuarios();
};
function mostrarPantalla(id) {

    document.querySelectorAll(".pantalla").forEach(p => {
        p.classList.remove("activa");
    });

    const pantalla = document.getElementById(id);

    if (pantalla) {
        pantalla.classList.add("activa");
    }
}
window.mostrarPantalla = mostrarPantalla;
window.volverPrincipal = function () {

    mostrarPantalla("pantallaPrincipal");

    // 🔥 Forzar estado visual correcto
    if (!edicionActiva) {
        document.querySelectorAll(".editable")
            .forEach(e => e.classList.add("hidden"));
    }

    render();


 

  // 🔥 Forzar estado visual correcto
  if (!edicionActiva) {
    document.querySelectorAll(".editable")
      .forEach(e => e.classList.add("hidden"));
  }

  render();
};
window.actualizarNombresGrupos = async function () {

  await setDoc(doc(db, "grupos", "general"), {
    nombreVisible: "Cafés Semanal",
    emoji: "☕"
  }, { merge: true });

  await setDoc(doc(db, "grupos", "viernes oficial"), {
    nombreVisible: "Cervezas del Viernes",
    emoji: "🍺"
  }, { merge: true });

  await setDoc(doc(db, "grupos", "torreznos"), {
    nombreVisible: "Torreznos",
    emoji: "🥓"
  }, { merge: true });


};
 
window.exportarResumenFinal = () =>
  exportarResumenFinal(personas, gastos);
window.abrirResumen = abrirResumen;
window.generarPDFResumen = () =>
  generarPDFResumen(personas, gastos, aportaciones);
window.exportarGastosTotalesPro = () =>
  exportarGastosTotalesPro(personas, gastos);
window.exportarAportacionesAnualPro = () =>
  exportarAportacionesAnualPro(personas, aportaciones);

window.enviarWhatsAppPersona = function(id) {

  
  const p = personas.find(x => x.id === id);
  if (!p) return;

  const nombre = p.nombre;
  const aportado = p.aportado || 0;

 let gastado = 0;

gastos.forEach(g => {

  if (!g.participantes || !g.monto) return;

  if ((g.participantes || [])
    .map(id => Number(id))
    .includes(Number(p.id))) {

    const parte = g.monto / g.participantes.length;
    gastado += parte;

  }

}); 
  const saldo = aportado - gastado;

  let mensaje = `☕ Cafe semanal\n\n`;
  mensaje += `👤 ${nombre}\n`;
  mensaje += `💰 Aportado: ${aportado.toFixed(2)} €\n`;
  mensaje += `💸 Gastado: ${gastado.toFixed(2)} €\n`;
  mensaje += `📊 Saldo: ${saldo.toFixed(2)} €`;
const telefono = p.telefono.replace(/\D/g, "");
 const url = `https://wa.me/${p.telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
};


function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
window.exportarMesActual = () => exportarMesActual(personas, gastos);
window.exportarMesManual = () => exportarMesManual(personas, gastos);window.abrirRapido = function() {
  document.querySelectorAll(".pantalla")
    .forEach(p => p.style.display = "none");

  document.getElementById("pantallaRapida").style.display = "block";
};

window.volverApp = function() {

    document.querySelectorAll(".pantalla")
        .forEach(p => p.style.display = "none");

    document.getElementById("pantallaPrincipal").style.display = "block";

    render();

};
async function pintarDashboardGlobal() {

  const snap = await getDocs(collection(db, "grupos"));

  let totalGlobal = 0;

  let html = `
    <div class="monedero-card">

      <div class="monedero-titulo">
        💰 Mi Monedero
      </div>

      <div class="monedero-subtitulo">
        Dinero disponible en todos los grupos
      </div>

      

      <div class="monedero-lista">
  `;
const grupos = [];

snap.forEach(docSnap => {

    const data = docSnap.data();

    const nombre = data.nombreVisible || docSnap.id;

    const personas = data.personas || [];
    const gastos = data.gastos || [];

    const totalAportado = personas.reduce((s, p) => s + (p.aportado || 0), 0);
    const totalGastado = gastos.reduce((s, g) => s + (g.monto || 0), 0);

    const totalGrupo = totalAportado - totalGastado;

    totalGlobal += totalGrupo;

    grupos.push({
        nombre,
        totalGrupo
    });

});

// Ordenar de mayor a menor saldo
grupos.sort((a, b) => b.totalGrupo - a.totalGrupo);

// Pintar tarjetas
grupos.forEach(grupo => {

    const color = grupo.totalGrupo < 0 ? "#ef4444" : "#22c55e";

    html += `

        <div class="grupo-card">

            <span class="grupo-nombre">
                ${grupo.nombre}
            </span>

            <span class="grupo-total"
                  style="color:${color}">
                ${grupo.totalGrupo.toFixed(2)} €
            </span>

        </div>

    `;

});

  html += `

      </div>

      <div class="monedero-total-final">

          ${totalGlobal.toFixed(2)} €

      </div>

    </div>

  `;

  const box = document.getElementById("dashboardGlobal");

  if (box) {

    box.innerHTML = html;

    box.classList.remove("hidden");

  }

}
function abrirAdministrador() {

    mostrarPantalla("pantallaAdmin");

}
window.abrirAdministrador = abrirAdministrador;

window.pedirPinAdmin = () => {

    // Ya está desbloqueado durante esta sesión
    if (sessionStorage.getItem("adminOK") === "true") {

        abrirAdministrador();
        return;

    }

    const pin = prompt("🔑 Introduce el PIN de administrador");

    if (pin === pinGuardado) {

        sessionStorage.setItem("adminOK", "true");

        abrirAdministrador();

    } else {

        alert("❌ PIN incorrecto.");

    }

};
function abrirAdminUsuarios() {

    mostrarPantalla("pantallaAdminUsuarios");

}

window.abrirAdminUsuarios = abrirAdminUsuarios;
function abrirAdminGastos() {

    mostrarPantalla("pantallaAdminGastos");

}

window.volverResumen = () => {

    abrirAdministrador();

};

window.abrirAdminGastos = abrirAdminGastos;
function editarGasto(id) {

    const gasto = gastos.find(g => g.id == id);

    if (!gasto) return;

   
    gastoEditando = gasto;
    document.getElementById("pantallaAdminGastos").style.display = "none";
document.getElementById("pantallaPrincipal").style.display = "block";

const card = document.querySelector(".card.editable");

card.classList.remove("hidden");
    // ---------- FECHA ----------

    document.getElementById("fechaGasto").value =
        convertirFechaInput(gasto.fecha);

    // ---------- DESCRIPCIÓN ----------

    document.getElementById("descripcionGasto").value =
        gasto.descripcion || "";

    // ---------- IMPORTE ----------

    document.getElementById("montoGasto").value =
        gasto.monto;

}
function convertirFechaInput(fecha) {

    const [d, m, a] = fecha.split("/");

    return `${a}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;

}
window.editarGasto = editarGasto;
function renderBienvenida() {

    const lista = document.getElementById("listaUsuariosBienvenida");

    if (!lista) return;

   lista.innerHTML = personas.map((p, i) => {

    const colores = [
        "#ef4444",
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
        "#84cc16",
        "#f97316",
        "#6366f1",
        "#14b8a6"
    ];

    const color = colores[i % colores.length];

    return `

    <div class="usuario-card"
         onclick="seleccionarUsuario('${p.id}')">

        <div class="usuario-avatar"
             style="background:${color}; color:white;">

            ${p.nombre.charAt(0).toUpperCase()}

        </div>

        <div class="usuario-info">

            <div class="usuario-nombre">

                ${p.nombre}

            </div>

            <div class="usuario-telefono">

                Toca para continuar

            </div>

        </div>

    </div>

    `;

}).join("");
}
window.renderBienvenida = renderBienvenida;
function abrirBienvenida() {

    mostrarPantalla("pantallaBienvenida");

      cargarPersonasBienvenida();

}
async function cargarPersonasBienvenida() {

    const snap = await getDoc(getDocRef());

    if (!snap.exists()) return;

    const datos = snap.data();

    personas = datos.personas || [];

    renderBienvenida();

}
window.abrirBienvenida = abrirBienvenida;

function seleccionarUsuario(id) {

    const persona = personas.find(p => String(p.id) === String(id));

    if (!persona) return;

    localStorage.setItem("usuarioActual", persona.nombre);

    mostrarPantalla("pantallaPrincipal");

    render();   // Pinta inmediatamente lo que haya

    cargar();   // Firestore actualizará cuando llegue el snapshot
}
window.seleccionarUsuario = seleccionarUsuario;
function iniciarAplicacion() {

    const usuario = localStorage.getItem("usuarioActual");

    if (usuario) {

    cargar();

    } else {

        abrirBienvenida();

    }

}

window.iniciarAplicacion = iniciarAplicacion;
window.mostrarDetallePersona = function(index) {

    const persona = personas[index];

    mostrarPantalla("pantallaDetallePersona");

    renderDetallePersona(
        persona,
        personas,
        gastos,
        aportaciones
    );

};
window.exportarHistoricoDesdeUI = () => {

    const desde = document.getElementById("fechaDesde").value;
    const hasta = document.getElementById("fechaHasta").value;

    if (!desde || !hasta) {
        alert("Selecciona las dos fechas.");
        return;
    }

    exportarHistorico(desde, hasta);

};
window.exportarHistoricoGlobalDesdeUI = () => {

    const desde = document.getElementById("fechaDesde").value;
    const hasta = document.getElementById("fechaHasta").value;

    if (!desde || !hasta) {
        alert("Selecciona las dos fechas.");
        return;
    }

    exportarHistoricoGlobal(desde, hasta);

};
window.cerrarSesionAdmin = () => {

    sessionStorage.removeItem("adminOK");

    alert("🔒 Administrador bloqueado.");

    mostrarPantalla("pantallaPrincipal");

};