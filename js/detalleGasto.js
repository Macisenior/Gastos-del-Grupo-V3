import { calcularRepartoGasto } from "./services/calculos.js";
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