import { calcularGastoPorPersona } from "./calculos.js";
import { renderActividadReciente } from "./renderActividadReciente.js";

export function renderDetallePersona(persona, personas, gastos, aportaciones) {

    const contenedor = document.getElementById("detallePersonaContenido");

    if (!contenedor) return;

    if (!persona) {
        contenedor.innerHTML = "<h2>Persona no encontrada</h2>";
        return;
    }

    // =============================
    // Cálculos
    // =============================

    const gastoPersona = calcularGastoPorPersona(personas, gastos);

    const aportado = persona.aportado || 0;
    const consumido = gastoPersona[persona.id] || 0;
    const saldo = aportado - consumido;

    // =============================
    // Estado
    // =============================

    let estado;
    let color;

    if (saldo > 0) {
        estado = "😊 Vas por delante";
        color = "#22c55e";
    } else if (saldo < 0) {
        estado = "😅 Te toca invitar";
        color = "#ef4444";
    } else {
        estado = "👌 Cuentas al día";
        color = "#8b5cf6";
    }

    // =============================
    // Pintar pantalla
    // =============================

    contenedor.innerHTML = `

        <div class="detalle-card">

            <div class="detalle-avatar"
                 style="background:${color}">
                ${persona.nombre.charAt(0).toUpperCase()}
            </div>

            <div class="detalle-nombre">
                ${persona.nombre}
            </div>

            <div class="detalle-frase"
                 style="color:${color}">
                ${estado}
            </div>

            <div class="detalle-cantidad"
                 style="color:${color}">
                ${saldo.toFixed(2)} €
            </div>

        </div>

        <div class="detalle-bloque">

            <h3>📊 Resumen personal</h3>

            <div class="detalle-item">
                <span>💰 Aportado</span>
                <strong>${aportado.toFixed(2)} €</strong>
            </div>

            <div class="detalle-item">
                <span>🍺 Consumido</span>
                <strong>${consumido.toFixed(2)} €</strong>
            </div>

            <div class="detalle-item">
                <span>💚 Saldo</span>
                <strong style="color:${color}">
                    ${saldo.toFixed(2)} €
                </strong>
            </div>

        </div>

        ${renderActividadReciente(
            persona,
            personas,
            gastos,
            aportaciones
        )}

    `;
}