export function renderActividadReciente(persona, personas, gastos, aportaciones) {

    const hoy = new Date();

    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const hace2 = new Date();
    hace2.setDate(hoy.getDate() - 2);

    // =============================
    // Evolución del saldo
    // =============================

    const saldoHoy = window.calcularSaldoEnFecha(persona.id, hoy);
    const saldoAyer = window.calcularSaldoEnFecha(persona.id, ayer);
    const saldoHace2 = window.calcularSaldoEnFecha(persona.id, hace2);

    const diferencia = saldoHoy - saldoAyer;

    // =============================
    // Gastos últimos 3 días
    // =============================

    const limite = new Date();
    limite.setDate(hoy.getDate() - 3);

    const gastosRecientes = [];

    gastos.forEach(gasto => {

        if (!gasto.participantes.includes(persona.id)) return;

        const fecha = convertirFecha(gasto.fecha);

        if (fecha < limite) return;

        gastosRecientes.push({

            fecha,
            sitio: gasto.sitio || "",
            descripcion: gasto.descripcion || "",
            importe: gasto.monto / gasto.participantes.length

        });

    });

    gastosRecientes.sort((a, b) => b.fecha - a.fecha);

    // =============================
    // Últimos ingresos
    // =============================

    const ingresos = aportaciones

        .filter(a =>
            a.personaId == persona.id ||
            a.nombre == persona.nombre
        )

        .sort((a, b) =>
            convertirFecha(b.date) -
            convertirFecha(a.date)
        )

        .slice(0, 2);
const ultimoIngreso = ingresos.length ? ingresos[0] : null;
    // =============================
    // HTML
    // =============================
let html = "";

html += generarResumenAutomatico(
    saldoHoy,
    ultimoIngreso,
    gastosRecientes
);

html += `
   

<div class="detalle-bloque">

<h3>📅 Situación reciente</h3>

<div class="detalle-item">
<div>Hace 2 días</div>
<strong>${saldoHace2.toFixed(2)} €</strong>
</div>

<div class="detalle-item">
<div>Ayer</div>
<strong>${saldoAyer.toFixed(2)} €</strong>
</div>

<div class="detalle-item">
<div>Hoy</div>
<strong>${saldoHoy.toFixed(2)} €</strong>
</div>

<div class="detalle-item">

<div>
<strong>Diferencia desde ayer</strong>
</div>

<strong style="color:${diferencia >= 0 ? "#22c55e" : "#ef4444"}">

${diferencia >= 0 ? "+" : ""}${diferencia.toFixed(2)} €

</strong>

</div>

<hr style="margin:20px 0">

<h3>☕ Gastos recientes</h3>

`;

    if (!gastosRecientes.length) {

        html += `
<p style="opacity:.7">
No has participado en gastos durante los últimos 3 días.
</p>
`;

    } else {

        gastosRecientes.forEach(g => {

            html += `

<div class="detalle-item">

<div>

<strong>${iconoSitio(g.sitio)} ${g.sitio}</strong><br>

<small>${g.descripcion}</small><br>

<small>${formatearFecha(g.fecha)}</small>

</div>

<strong style="color:#ef4444">

-${g.importe.toFixed(2)} €

</strong>

</div>

`;

        });

    }

    html += `

<hr style="margin:20px 0">

<h3>💰 Últimos ingresos</h3>

`;

    if (!ingresos.length) {

        html += `
<p style="opacity:.7">
No hay ingresos recientes.
</p>
`;

    } else {

        ingresos.forEach(i => {

            html += `

<div class="detalle-item">

<div>

<strong>Ingreso</strong><br>

<small>${formatearFecha(convertirFecha(i.date))}</small>

</div>

<strong style="color:#22c55e">

+${Number(i.amount).toFixed(2)} €

</strong>

</div>

`;

        });

    }

    html += `
</div>
`;

    return html;

}

// =======================================

function convertirFecha(fecha) {

    if (!fecha) return new Date(0);

    if (fecha instanceof Date) return fecha;

    if (fecha.includes("-")) {
        return new Date(fecha);
    }

    return new Date(
        fecha.split("/").reverse().join("-")
    );

}

function formatearFecha(fecha) {

    return fecha.toLocaleDateString("es-ES");

}

function iconoSitio(sitio) {

    const s = (sitio || "").toLowerCase();

    if (s.includes("cafe")) return "☕";

    if (s.includes("viernes")) return "🍺";

    if (s.includes("torrez")) return "🥓";

    return "📍";

}
function generarResumenAutomatico(saldo, ultimoIngreso, gastosRecientes) {

    let icono = "🟢";
    let titulo = "Todo va bien";
    let mensaje = "";

    if (saldo < 0) {

        icono = "🔴";
        titulo = "Saldo insuficiente";

        mensaje =
        `Actualmente tu saldo es de <strong>${saldo.toFixed(2)} €</strong>.<br><br>
        Has consumido más de lo aportado.<br>
        Necesitas ingresar <strong>${Math.abs(saldo).toFixed(2)} €</strong> para volver a tener saldo positivo.`;

    }

    else if (saldo < 5) {

        icono = "🟡";
        titulo = "Saldo ajustado";

        mensaje =
        `Te quedan <strong>${saldo.toFixed(2)} €</strong>.<br><br>
        Todavía puedes participar en nuevos gastos, aunque sería recomendable realizar un ingreso pronto.`;

    }

    else {

        mensaje =
        `Dispones de <strong>${saldo.toFixed(2)} €</strong>.<br><br>
        Tu saldo es suficiente para seguir participando en los próximos gastos del grupo.`;

    }

    if (ultimoIngreso) {

        mensaje += `<br><br>💰 Último ingreso: <strong>${Number(ultimoIngreso.amount).toFixed(2)} €</strong>.`;

    }

    if (gastosRecientes.length == 0) {

        mensaje += `<br>😴 No has participado en gastos durante los últimos días.`;

    }

    else if (gastosRecientes.length == 1) {

        mensaje += `<br>🍺 Has participado en <strong>1 gasto</strong> recientemente.`;

    }

    else {

        mensaje += `<br>🍺 Has participado en <strong>${gastosRecientes.length} gastos</strong> recientemente.`;

    }

    return `

<div class="detalle-bloque">

<h3>${icono} ${titulo}</h3>

<p style="line-height:1.7">

${mensaje}

</p>

</div>

`;

}