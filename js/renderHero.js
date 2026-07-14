export function renderHero(
    total,
    grupoActivo,
    ultimaActualizacion,
    balances
) {
const heroSaludo = document.getElementById("heroSaludo");
const heroGrupo = document.getElementById("heroGrupo");
const heroMensaje = document.getElementById("heroMensaje");
const heroUpdate = document.getElementById("heroUpdate");
  const heroBalance = document.getElementById("heroBalance");
 const heroFrase = document.getElementById("heroFrase");
  // ===== BALANCE =====
  if (heroBalance) {
    heroBalance.textContent = total.toFixed(2) + " €";

    heroBalance.style.color =
      total < 0 ? "#b71c1c" :
      total === 0 ? "#555" :
      "#1b5e20";
  }
if (heroGrupo) {
    heroGrupo.textContent = obtenerNombreGrupo(grupoActivo);
}
let estado = "positivo";

if (total < 20) {
    estado = "bajo";
} else if (total < 60) {
    estado = "medio";
}

if (heroFrase) {
    heroFrase.textContent = obtenerFraseHero(estado);
}
  // ===== INFO =====
 const usuario = obtenerUsuarioActual();

if (usuario) {

    heroSaludo.textContent = obtenerSaludo(usuario.nombre);

    const saldoUsuario = balances.find(
        b => b.nombre === usuario.nombre
    );

    if (heroMensaje && saldoUsuario) {

        heroMensaje.textContent =
            `💰 Tu saldo: ${saldoUsuario.balance.toFixed(2)} €`;

        heroMensaje.style.color =
            saldoUsuario.balance < 0
                ? "#b71c1c"
                : saldoUsuario.balance > 0
                ? "#1b5e20"
                : "#555";
    }

} else {

    heroSaludo.textContent = obtenerSaludo("");
}
if (heroUpdate) {
  let texto = "Sin datos";

  if (ultimaActualizacion) {
    const fecha = new Date(ultimaActualizacion);
    texto = fecha.toLocaleDateString();
  }
heroUpdate.textContent = obtenerTextoFecha(ultimaActualizacion);
 
}
 function obtenerTextoFecha(fecha) {

    if (!fecha) return "📅 Sin actualizar";

    const hoy = new Date();
    const f = new Date(fecha);

    const mismoDia =
        hoy.toDateString() === f.toDateString();

    if (mismoDia)
        return "📅 Actualizado hoy";

    return "📅 " + f.toLocaleDateString();
}
}
function obtenerSaludo(nombre = "") {

    const hora = new Date().getHours();

    let saludo = "";

    if (hora < 12) {
        saludo = "☀ Buenos días";
    } else if (hora < 20) {
        saludo = "🌇 Buenas tardes";
    } else {
        saludo = "🌙 Buenas noches";
    }

    return nombre
        ? `${saludo}, ${nombre}`
        : saludo;
}
function obtenerUsuarioActual() {

    const nombre = localStorage.getItem("usuarioActual");

    if (!nombre) return null;

    return personas.find(p => p.nombre === nombre) || null;
}

   
function obtenerNombreGrupo(grupo) {

    const grupos = {
        general: "☕ Cafés Semanal",
        viernes: "🍻 Viernes Oficial",
        torreznos: "🥓 Torreznos"
    };

    return grupos[grupo] || grupo;
}

function obtenerFraseHero(estado) {

    const frases = {

        positivo: [

            "👑 Administración legendaria.",

            "☕ Todo bajo control.",

            "💰 La caja sonríe."

        ],

        medio: [

            "☕ Vamos por buen camino.",

            "👀 Conviene vigilar los gastos.",

            "🍻 Todo en orden."

        ],

        bajo: [

            "⚠️ Hoy toca controlar un poco.",

            "🍺 La siguiente ronda... con cabeza.",

            "😅 El fondo pide un respiro."

        ]

    };

    const lista = frases[estado];

    return lista[Math.floor(Math.random()*lista.length)];

}