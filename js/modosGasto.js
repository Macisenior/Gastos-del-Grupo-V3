// =======================================
// MODOS DE GASTO
// V3.1
// =======================================

// Modo activo
import { mostrarPanelConsumiciones } from "./consumiciones.js";
let modoReparto = "igual";

// Inicializar
export function iniciarModosGasto() {

    const botones = document.querySelectorAll("#selectorModoGasto .modo");

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            seleccionarModo(boton.dataset.modo);

        });

    });

    seleccionarModo("igual");
}


// Cambiar modo
export function seleccionarModo(modo) {

    modoReparto = modo;

    actualizarBotones();

    renderPanelModo();

}


// Devuelve el modo actual
export function obtenerModoGasto() {
    return modoReparto;
}
// =======================================
// OBTENER IMPORTES POR PERSONA
// =======================================
export function obtenerImportesPersona() {

    const importes = {};

    document.querySelectorAll(".importePersona").forEach(input => {

        const valor = parseFloat(input.value);

        if (!isNaN(valor) && valor > 0) {

            importes[input.dataset.id] = valor;

        }

    });

    return importes;

}

// Colorea el botón seleccionado
function actualizarBotones() {

    const botones = document.querySelectorAll("#selectorModoGasto .modo");

 botones.forEach(boton => {

    boton.classList.remove(
        "activo",
        "activo-igual",
        "activo-consumiciones",
        "activo-importe"
    );

    if (boton.dataset.modo === modoReparto) {

        boton.classList.add("activo");

        boton.classList.add("activo-" + modoReparto);

    }

});  

}
// ======================================
// Dibuja el panel inferior
// ======================================

function renderPanelModo() {

    const panel = document.getElementById("panelModo");

    // Ocultar mientras cambia el contenido
    panel.classList.add("oculto");

    // Limpiar contenido anterior
    panel.innerHTML = "";

    switch (modoReparto) {

        case "igual":

            // No hay panel
            break;

        case "consumiciones":

            mostrarPanelConsumiciones(
                panel,
                obtenerParticipantesSeleccionados()
            );

            panel.classList.remove("oculto");

            break;

        case "importe":

            renderImportePersona(panel);

            panel.classList.remove("oculto");

            break;

    }

}

// ===============================
// IMPORTE POR PERSONA
// ===============================
function renderImportePersona(panel) {

    const seleccionados =
        document.querySelectorAll("#checkboxPersonas input:checked");

    if (!seleccionados.length) {

        panel.innerHTML =
            "<p style='text-align:center;color:#777'>Selecciona participantes</p>";

        return;
    }

    let html = "<h4>💶 Importe por persona</h4>";

    seleccionados.forEach(chk => {

        const nombre =
            chk.parentElement.querySelector("span").textContent;

        html += `
            <div class="filaImportePersona">

                <span>${nombre}</span>

               <input
    type="number"
    step="0.01"
    class="importePersona"
    data-id="${chk.value}"
    placeholder="0,00"
    oninput="actualizarTotalImportePersona()">

            </div>
        `;

    });

    html += `
        <hr>
        <strong>Total:
            <span id="totalImportePersona">0.00 €</span>
        </strong>
    `;

    panel.innerHTML = html;

}

function obtenerParticipantesSeleccionados() {

    const lista = [];

    document
        .querySelectorAll("#checkboxPersonas input:checked")
        .forEach(chk => {

            lista.push({

                id: chk.value,

                nombre: chk.parentElement
                    .querySelector("span")
                    .textContent

            });

        });

    return lista;

}
// ===============================================
// CALCULAR TOTAL IMPORTE PERSONA
// ===============================================
function actualizarTotalImportePersona() {

    let total = 0;

    document
        .querySelectorAll(".importePersona")
        .forEach(input => {

            total += parseFloat(input.value) || 0;

        });

    const lblTotal = document.getElementById("totalImportePersona");

    if (lblTotal) {

        lblTotal.textContent =
            total.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

    }

}
window.actualizarTotalImportePersona =
    actualizarTotalImportePersona;