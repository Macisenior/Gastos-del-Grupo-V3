
export function verDetalleGasto(id) {

    const gasto = window.gastos.find(g => String(g.id) === String(id));

    if (!gasto) return;

    const modal = document.getElementById("modalDetalleGasto");
    const contenido = document.getElementById("contenidoDetalleGasto");

 const iconos = {
    "Lydo": "🍺",
    "Colono": "🍷",
    "Flap": "🍔",
    "Casa Mariano": "🏡",
    "Albergue": "🛏",
    "Pignatelli": "🏛"
};

const icono = iconos[gasto.sitio] || "📍";

contenido.innerHTML = `


<div class="detalle-gasto-header">

    <div class="detalle-icono">
        ${icono}
    </div>

    <div>

        <h2>${gasto.sitio}</h2>

        <div class="detalle-fecha">
            📅 ${gasto.fecha}
        </div>

    </div>

</div>

<div class="detalle-total">

    ${gasto.monto.toFixed(2)} €

</div>

${gasto.descripcion
    ? `<div class="detalle-descripcion">${gasto.descripcion}</div>`
    : ""
}

<hr>

<div id="detalleReparto">

    <em>Calculando reparto...</em>

</div>

`;
const reparto = calcularRepartoGasto(gasto, window.personas);

const lista = document.getElementById("detalleReparto");

lista.innerHTML = reparto.map(r => `

<div class="fila-reparto">

    <span>
        👤 ${r.nombre}
        ${r.peso > 1 ? "×" + r.peso : "+"}
    </span>

    <strong>
        ${r.importe.toFixed(2)} €
    </strong>

</div>

`).join("");
modal.classList.remove("oculto");
}
export function cerrarDetalleGasto() {

    document
        .getElementById("modalDetalleGasto")
        .classList.add("oculto");

}
window.verDetalleGasto = verDetalleGasto;
window.cerrarDetalleGasto = cerrarDetalleGasto;
export function calcularRepartoGasto(gasto, personas) {

    const reparto = [];

    if (!gasto.participantes) return reparto;

    // ===== MODO IMPORTE =====
    if (gasto.modo === "importe" && gasto.importesPersona) {

        gasto.participantes.forEach(id => {

            const persona = personas.find(p => p.id == id);

            reparto.push({
                nombre: persona?.nombre || "Desconocido",
                peso: 1,
                importe: gasto.importesPersona[id] || 0
            });

        });

        return reparto;
    }

    // ===== MODO CONSUMICIONES =====

    if (gasto.consumiciones) {

        let totalPesos = 0;

        gasto.participantes.forEach(id => {
            totalPesos += gasto.consumiciones[id] || 1;
        });

        gasto.participantes.forEach(id => {

            const peso = gasto.consumiciones[id] || 1;

            const persona = personas.find(p => p.id == id);

            reparto.push({

                nombre: persona?.nombre || "Desconocido",

                peso,

                importe: gasto.monto * peso / totalPesos

            });

        });

        return reparto;
    }

    // ===== REPARTO IGUAL =====

    const importe = gasto.monto / gasto.participantes.length;

    gasto.participantes.forEach(id => {

        const persona = personas.find(p => p.id == id);

        reparto.push({

            nombre: persona?.nombre || "Desconocido",

            peso: 1,

            importe

        });

    });

    return reparto;
}