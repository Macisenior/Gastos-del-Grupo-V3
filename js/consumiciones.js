// ============================================
// CONSUMICIONES
// V3.1
// ============================================

let consumiciones = {};

export function inicializarConsumiciones() {
    consumiciones = {};
}

// ============================================
// DIBUJAR PANEL DE CONSUMICIONES
// ============================================
export function mostrarPanelConsumiciones(panel, personasSeleccionadas) {

    panel.innerHTML = "";

    if (!personasSeleccionadas.length) {
        panel.innerHTML = `
            <p style="text-align:center;color:#777;">
                Selecciona participantes
            </p>
        `;
        return;
    }

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

// ============================================
// OBTENER CONSUMICIONES
// ============================================
export function obtenerConsumiciones() {
    return consumiciones;
}

// ============================================
// LIMPIAR CONSUMICIONES
// ============================================
export function limpiarConsumiciones() {

    consumiciones = {};

}

// ============================================
// CAMBIAR CONSUMICIÓN
// ============================================
export function cambiarConsumicion(boton) {

    let n = consumiciones[boton.dataset.id] || 1;

    n++;

    if (n > 5) n = 1;

    consumiciones[boton.dataset.id] = n;

    boton.textContent = n === 1 ? "+" : "×" + n;

}

window.cambiarConsumicion = cambiarConsumicion;