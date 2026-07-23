// ============================================
// CONSUMICIONES
// ============================================

let consumiciones = {};

export function inicializarConsumiciones() {
    consumiciones = {};
}

export function mostrarPanelConsumiciones(personasSeleccionadas) {

  let panel = document.getElementById("panelConsumiciones");

if (!panel) {

    panel = document.createElement("div");
    panel.id = "panelConsumiciones";

    document.getElementById("checkboxPersonas")
        .insertAdjacentElement("afterend", panel);

}

panel.innerHTML = "";
if (!personasSeleccionadas.length) {
    panel.style.display = "none";
    return;
}

panel.style.display = "block";

panel.innerHTML = `
    <h3>🍺 Consumiciones</h3>
`;
personasSeleccionadas.forEach(p => {

    panel.innerHTML += `
        <div class="fila-consumicion">

            <span>${p.nombre}</span>

         <button
    type="button"
    data-id="${p.id}"
    onclick="cambiarConsumicion(this)">
    ${consumiciones[p.id] > 1 ? "×" + consumiciones[p.id] : "+"}
</button>  

        </div>
    `;

});
}

export function obtenerConsumiciones() {
    return consumiciones;
}

export function limpiarConsumiciones() {

    consumiciones = {};

    const panel = document.getElementById("panelConsumiciones");

    if (panel) {
        panel.innerHTML = "";
        panel.style.display = "none";
    }

}

export function cambiarConsumicion(boton) {

    let n = consumiciones[boton.dataset.id] || 1;

    n++;

    if (n > 5) n = 1;

    consumiciones[boton.dataset.id] = n;

    boton.textContent = n === 1 ? "+" : "×" + n;

}
window.cambiarConsumicion = cambiarConsumicion;