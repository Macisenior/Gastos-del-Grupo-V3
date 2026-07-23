import { mostrarPanelConsumiciones } from "./consumiciones.js";

export function renderPersonas(personas) {

  const checkboxPersonas = document.getElementById("checkboxPersonas");
  const personaEfectivo = document.getElementById("personaEfectivo");

  if (!checkboxPersonas || !personaEfectivo) return;

  checkboxPersonas.innerHTML = "";
  personaEfectivo.innerHTML = "";
personaEfectivo.innerHTML =
    `<option value="">👤 Selecciona una persona...</option>`;
  personas.forEach(p => {
    checkboxPersonas.innerHTML += `
      <label class="persona-chip">
        <input
    type="checkbox"
    value="${p.id}"
    onchange="actualizarContadorGasto()"
>
        <span>${p.nombre}</span>
      </label>
    `;

    personaEfectivo.innerHTML += `
      <option value="${p.id}">${p.nombre}</option>
    `;
  });
 actualizarContadorGasto(); 

}

function actualizarContadorGasto() {

    const total =
        document.querySelectorAll("#checkboxPersonas input").length;

    const seleccionados =
        document.querySelectorAll("#checkboxPersonas input:checked").length;

    const contador =
        document.getElementById("contadorGasto");

    if (!contador) return;

    if (seleccionados === 0) {

        contador.textContent =
            `👥 0 de ${total} seleccionados`;

    } else if (seleccionados === total) {

        contador.textContent =
            `✅ Todos seleccionados`;

    } else {

        contador.textContent =
            `👥 ${seleccionados} de ${total} seleccionados`;
const personasSeleccionadas = [...document.querySelectorAll("#checkboxPersonas input:checked")]
    .map(chk => ({
        id: chk.value,
        nombre: chk.nextElementSibling.textContent
    }));

mostrarPanelConsumiciones(personasSeleccionadas);
console.log("Panel de consumiciones");
console.log(personasSeleccionadas);

    }
}
window.actualizarContadorGasto = actualizarContadorGasto;