  const iconos = {
            "Lydo": "🍺",
            "Colono": "🍷",
            "Flap": "🍔",
            "Casa Mariano": "🏡",
            "Albergue": "🛏",
            "Pignatelli": "🏛"
        };
    import { verDetalleGasto } from "./detalleGasto.js";    
export function renderGastos(gastos, personas, filtrarPorMes) {

    const listaGastos = document.getElementById("listaGastos");
    if (!listaGastos) return;

    const hoy = new Date();
    const gastosVisibles = filtrarPorMes(
        gastos,
        hoy.getMonth(),
        hoy.getFullYear()
    );

    const buscador = document.getElementById("buscarGasto");
    const texto = buscador ? buscador.value.toLowerCase().trim() : "";

    const lista = gastosVisibles

        // Buscar
        .filter(g => {

            const participantes = g.participantes
                .map(id => personas.find(p => p.id === id)?.nombre.toLowerCase() || "")
                .join(" ");

            return (
                g.sitio.toLowerCase().includes(texto) ||
                participantes.includes(texto) ||
                g.fecha.includes(texto) ||
                g.monto.toString().includes(texto)
            );

        })

        // Ordenar por fecha descendente
        .sort((a, b) => {

            const [da, ma, aa] = a.fecha.split("/");
            const [db, mb, ab] = b.fecha.split("/");

            return new Date(ab, mb - 1, db) - new Date(aa, ma - 1, da);

        });

    listaGastos.innerHTML = lista.map(g => {

        const nombres = g.participantes
            .map(id => personas.find(p => p.id === id)?.nombre || "");

        const participantes = nombres.join(" · ");

      

        const icono = iconos[g.sitio] || "📍";

        return `

<div
    class="usuario-card gasto-card"
    onclick="verDetalleGasto('${g.id}')">

    <div class="usuario-avatar">
        ${icono}
    </div>

    <div class="usuario-info">

        <div class="usuario-nombre">
            ${g.sitio}
        </div>

        <div class="usuario-telefono">
            📅 ${g.fecha}
        </div>

        <div class="usuario-telefono">
            👥 (${nombres.length}) ${participantes}
        </div>

    </div>

    <div class="usuario-acciones">

        <div class="gasto-monto">
            ${g.monto.toFixed(2)} €
        </div>

        <button
            class="rojo"
            onclick="event.stopPropagation(); eliminarGasto('${g.id}')">

            🗑

        </button>

    </div>

</div>

`;

    }).join("");

}