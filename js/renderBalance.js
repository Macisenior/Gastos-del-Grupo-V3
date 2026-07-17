import { calcularGastoPorPersona } from "./calculos.js";

export function renderBalance(personas, gastos) {

  const quienDebe = document.getElementById("quienDebe");
  if (!quienDebe) return;

  const gastoPersona = calcularGastoPorPersona(personas, gastos);

  const colores = [
    { color:"#22c55e", fondo:"#f3fff6" },
    { color:"#3b82f6", fondo:"#f3f8ff" },
    { color:"#8b5cf6", fondo:"#faf6ff" },
    { color:"#f97316", fondo:"#fff8f1" },
    { color:"#ec4899", fondo:"#fff4f9" },
    { color:"#14b8a6", fondo:"#f2fffd" },
    { color:"#eab308", fondo:"#fffdf2" },
    { color:"#6366f1", fondo:"#f5f6ff" }
  ];

  quienDebe.innerHTML = personas.map((p, index) => {

    let bal = (p.aportado || 0) - (gastoPersona[p.id] || 0);

    if (Math.abs(bal) < 0.01) bal = 0;

    const inicial = p.nombre.charAt(0).toUpperCase();

    const colorPersona = colores[index % colores.length];

    let tema;
    let clase;
    let estado;

    if (bal > 0) {

      clase = "positivo";
      estado = "Disponible";

      tema = {
        color: colorPersona.color,
        fondo: colorPersona.fondo
      };

    } else if (bal < 0) {

      clase = "negativo";
      estado = "Pendiente de ingreso";

     tema = {
    color: "#ef4444",
    fondo: "#fee2e2"
    };

    } else {

      clase = "neutro";
      estado = "Equilibrado";

      tema = {
        color: "#8b5cf6",
        fondo: "#f5f3ff"
      };

    }

    let botonWhatsapp = "";

    if (bal < 0 && p.telefono) {

      const mensaje = encodeURIComponent(
        `Ey ${p.nombre} 😄 Te quedan ${(-bal).toFixed(2)} € pendientes en el grupo. ¡Invita a algo! 🍻`
      );

      botonWhatsapp = `
        <a href="https://wa.me/${p.telefono}?text=${mensaje}"
           target="_blank"
           class="estado-whatsapp">
           📱
        </a>
      `;
    }

    return `
<div class="estado-card ${clase}"
    onclick="mostrarDetallePersona('${index}')"
           style="
              border-left-color:${tema.color};
              --card-color:${tema.fondo};
           ">

          <div class="estado-avatar"
               style="background:${tema.color}">
              ${inicial}
          </div>

          <div class="estado-info">

              <div class="estado-nombre">
                  ${p.nombre}
              </div>

              <div class="estado-footer">

                  <span class="estado-pill ${clase}">
                      ${estado}
                  </span>

                  ${botonWhatsapp}

              </div>

          </div>

          <div class="estado-saldo"
               style="color:${tema.color}">
             ${bal < 0 ? "-" : ""}${Math.abs(bal).toFixed(2)} €
          </div>

      </div>

    `;

  }).join("");

}