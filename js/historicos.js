let ultimoInformeGlobal = [];
let ultimaFechaConsulta = "";
let ultimoHistorico = [];
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { db } from "./firebase.js";
// Fecha desde la que el histórico es fiable
const FECHA_HISTORICO = new Date("2026-05-01");
async function calcularEstadoGlobal(fechaConsulta) {

    const snap = await getDocs(collection(db, "grupos"));

    let totalGlobal = 0;
    let grupos = [];

    snap.forEach(docSnap => {

        const data = docSnap.data();

        const personas = data.personas || [];

        // Total aportaciones registradas
        const totalAportacionesRegistradas = (data.aportaciones || [])
            .reduce((s, a) => s + Number(a.amount || 0), 0);

        // Saldo inicial
        const saldoInicial = personas
            .reduce((s, p) => s + Number(p.aportado || 0), 0)
            - totalAportacionesRegistradas;

        // Aportaciones hasta la fecha
        const aportacionesHastaFecha = (data.aportaciones || [])
            .filter(a => new Date(a.date) <= fechaConsulta)
            .reduce((s, a) => s + Number(a.amount || 0), 0);

        const totalAportado = saldoInicial + aportacionesHastaFecha;

        // Gastos hasta la fecha
        const totalGastado = (data.gastos || [])
            .filter(g => {

                if (!g.fecha) return false;

                const [d,m,y] = g.fecha.split("/");

                return new Date(`${y}-${m}-${d}`) <= fechaConsulta;

            })
            .reduce((s,g)=>s + Number(g.monto || 0),0);

        const saldo = totalAportado - totalGastado;

        grupos.push({

            grupo: data.nombreVisible || docSnap.id,
            emoji: data.emoji || "📁",
            personas: personas.length,
            saldo

        });

        totalGlobal += saldo;

    });

    return {

        grupos,
        totalGlobal

    };

}
export async function consultarEstadoGlobal(fecha) {

    const fechaConsulta = new Date(fecha);
    const resultado = document.getElementById("resultadoGlobal");
if (fechaConsulta < FECHA_HISTORICO) {

    resultado.innerHTML = `
        <div class="card">

            <h3>🌍 Estado global</h3>

            <p>
                El histórico fiable comienza el
                <strong>01/05/2026</strong>.
            </p>

            <p style="opacity:.8">
                Antes de esa fecha las aportaciones no se registraban
                completamente, por lo que los resultados podrían ser incorrectos.
            </p>

        </div>
    `;

    return;
}
    resultado.innerHTML = "<p>Consultando...</p>";

    try {

        const snap = await getDocs(collection(db, "grupos"));

        let totalGlobal = 0;
ultimoInformeGlobal = [];
ultimaFechaConsulta = fecha;
        let html = `
            <div class="card">
                <h3>🌍 Estado global</h3>
                <p>Fecha: ${fecha}</p>
                <hr>
        `;

        snap.forEach(docSnap => {

            const data = docSnap.data();

            const personas = data.personas || [];

          // 1. Todas las aportaciones registradas (sin fecha)
const totalAportacionesRegistradas = (data.aportaciones || [])
    .reduce((s, a) => s + Number(a.amount || 0), 0);

// 2. Saldo inicial
const saldoInicial = (data.personas || [])
    .reduce((s, p) => s + Number(p.aportado || 0), 0)
    - totalAportacionesRegistradas;

// 3. Aportaciones hasta la fecha
const aportacionesHastaFecha = (data.aportaciones || [])
    .filter(a => new Date(a.date) <= fechaConsulta)
    .reduce((s, a) => s + Number(a.amount || 0), 0);

// 4. Total aportado para el histórico
const totalAportado = saldoInicial + aportacionesHastaFecha;

            // ===== GASTOS HASTA LA FECHA =====
            const totalGastado = (data.gastos || [])
                .filter(g => {

                    if (!g.fecha) return false;

                    const [d, m, y] = g.fecha.split("/");

                    const fechaGasto = new Date(`${y}-${m}-${d}`);

                    return fechaGasto <= fechaConsulta;

                })
                .reduce((s, g) => s + (g.monto || 0), 0);

            const saldo = totalAportado - totalGastado;
ultimoInformeGlobal.push({

    grupo: data.nombreVisible || docSnap.id,
    personas: personas.length,
    saldo: saldo

});
            totalGlobal += saldo;

            html += `

                <div class="grupo-card">

                    <h4>${data.emoji || "📁"} ${data.nombreVisible || docSnap.id}</h4>

                    <p>👥 ${personas.length} personas</p>

                    <p>
                        💰
                        <strong style="color:${saldo >= 0 ? "#16a34a" : "#dc2626"}">
                            ${saldo.toFixed(2)} €
                        </strong>
                    </p>

                </div>

            `;

        });

        html += `

            <hr style="margin:20px 0;">

            <div class="grupo-card">

                <h3>💰 TOTAL GLOBAL</h3>

                <h2 style="color:#16a34a">

                    ${totalGlobal.toFixed(2)} €

                </h2>

            </div>

        `;

        html += "</div>";

        resultado.innerHTML = html;

    } catch (e) {

        console.error(e);

        resultado.innerHTML =
            "<p style='color:red'>Error leyendo Firestore</p>";

    }

}
export function exportarEstadoGlobalExcel() {

    if (!ultimoInformeGlobal.length) {

        alert("Primero consulta una fecha.");

        return;

    }

    const datos = [

        ["ESTADO GLOBAL"],
        ["Fecha", ultimaFechaConsulta],
        [],
        ["Grupo", "Personas", "Saldo (€)"]

    ];

    ultimoInformeGlobal.forEach(g => {

        datos.push([

            g.grupo,
            g.personas,
            Number(g.saldo.toFixed(2))

        ]);

    });

    datos.push([]);

    const total = ultimoInformeGlobal
        .reduce((s, g) => s + g.saldo, 0);

    datos.push([
        "TOTAL GLOBAL",
        "",
        Number(total.toFixed(2))
    ]);

    const ws = XLSX.utils.aoa_to_sheet(datos);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Estado Global"
    );

    XLSX.writeFile(
        wb,
        `Estado_Global_${ultimaFechaConsulta}.xlsx`
    );

}
export async function exportarHistorico(desde, hasta) {

    ultimoHistorico = [];

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    const snap = await getDocs(collection(db, "grupos"));

    snap.forEach(docSnap => {

        const data = docSnap.data();

        const nombreGrupo = data.nombreVisible || docSnap.id;
        const emoji = data.emoji || "📁";

        // ===== APORTACIONES =====

        (data.aportaciones || []).forEach(a => {

            const fecha = new Date(a.date);

            if (fecha >= fechaDesde && fecha <= fechaHasta) {

                ultimoHistorico.push({

                    fecha: a.date,
                    grupo: `${emoji} ${nombreGrupo}`,
                    tipo: "Ingreso",
                    persona: a.nombre || "",
                   concepto: "Ingreso",
                    importe: Number(a.amount || 0)

                });

            }

        });

        // ===== GASTOS =====

        (data.gastos || []).forEach(g => {

            if (!g.fecha) return;

            const [d,m,y] = g.fecha.split("/");

            const fecha = new Date(`${y}-${m}-${d}`);

            if (fecha >= fechaDesde && fecha <= fechaHasta) {

                ultimoHistorico.push({

                    fecha: g.fecha,
                    grupo: `${emoji} ${nombreGrupo}`,
                    tipo: "Gasto",
                    persona: "",
                    concepto: g.descripcion || g.concepto || "Gasto",
                    importe: Number(g.monto || 0)

                });

            }

        });

    });

    if (!ultimoHistorico.length) {

        alert("No hay movimientos en ese periodo.");

        return;

    }

    ultimoHistorico.sort((a,b)=>{

        return new Date(a.fecha) - new Date(b.fecha);

    });

  const datos = [

    ["📊 EVOLUCIÓN GLOBAL DE LOS GRUPOS"],
    ["Desde", new Date(desde).toLocaleDateString("es-ES")],
    ["Hasta", new Date(hasta).toLocaleDateString("es-ES")],
    ["Generado", new Date().toLocaleString("es-ES")],
    []

];

    let ingresos = 0;
    let gastos = 0;

    ultimoHistorico.forEach(m=>{

        datos.push([

            m.fecha,
            m.grupo,
            m.tipo,
            m.persona,
            m.concepto,
            m.importe

        ]);

        if(m.tipo==="Ingreso")
            ingresos+=m.importe;
        else
            gastos+=m.importe;

    });

    datos.push([]);

    datos.push(["","","","","Ingresos",ingresos]);
    datos.push(["","","","","Gastos",gastos]);
    datos.push(["","","","","Saldo",ingresos-gastos]);

    const ws = XLSX.utils.aoa_to_sheet(datos);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb,ws,"Historico");

    XLSX.writeFile(
        wb,
        `Historico_${desde}_${hasta}.xlsx`
    );

}
export async function exportarHistoricoGlobal(desde, hasta) {

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    const datos = [
        ["EVOLUCIÓN GLOBAL"],
        ["Desde", desde],
        ["Hasta", hasta],
        [],
       
    ];
const primerEstado = await calcularEstadoGlobal(fechaDesde);

const cabecera = ["Fecha"];

primerEstado.grupos.forEach(g => {

    cabecera.push(`${g.emoji} ${g.grupo}`);

});

cabecera.push("💰 TOTAL");

datos.push(cabecera);

    for (
        let fecha = new Date(fechaDesde);
        fecha <= fechaHasta;
        fecha.setDate(fecha.getDate() + 1)
    ) {

        const estado = await calcularEstadoGlobal(new Date(fecha));

       const fila = [

    fecha.toLocaleDateString("es-ES")

];

estado.grupos.forEach(g => {

    fila.push(Number(g.saldo.toFixed(2)));

});

fila.push(Number(estado.totalGlobal.toFixed(2)));

datos.push(fila);

    }
datos.push([]);
datos.push(["RESUMEN"]);

const inicio = await calcularEstadoGlobal(fechaDesde);
const fin = await calcularEstadoGlobal(fechaHasta);

datos.push([
    "Saldo inicial",
    Number(inicio.totalGlobal.toFixed(2))
]);

datos.push([
    "Saldo final",
    Number(fin.totalGlobal.toFixed(2))
]);

datos.push([
    "Variación",
    Number((fin.totalGlobal - inicio.totalGlobal).toFixed(2))
]);
    const ws = XLSX.utils.aoa_to_sheet(datos);
const columnas = [];

columnas.push({ wch: 14 }); // Fecha

primerEstado.grupos.forEach(() => {
    columnas.push({ wch: 16 });
});

columnas.push({ wch: 14 }); // Total

ws["!cols"] = columnas;
ws["!autofilter"] = {
    ref: `A6:${String.fromCharCode(64 + cabecera.length)}6`
};
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Evolución"
    );

    XLSX.writeFile(
        wb,
        `Evolucion_Global_${desde}_${hasta}.xlsx`
    );

}
