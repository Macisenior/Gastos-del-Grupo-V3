// ==========================================
// HISTÓRICO DE GASTOS
// ==========================================

export function renderHistoricoGastos(gastos) {

    const contenedor =
        document.getElementById("listaHistoricos");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const meses = {};

    gastos.forEach(gasto => {

        const fecha = convertirFecha(gasto.fecha);

        const clave =
            fecha.getFullYear() + "-" +
            String(fecha.getMonth() + 1).padStart(2, "0");

        if (!meses[clave]) {

            meses[clave] = [];

        }

        meses[clave].push(gasto);

    });

    Object.keys(meses)

        .sort()

        .reverse()

        .forEach(clave => {

            const lista = meses[clave];

            contenedor.innerHTML += `

<div class="card">

    <h3>📅 ${nombreMes(clave)}</h3>

    <p>${lista.length} gastos registrados</p>

   <button onclick="verHistoricoMes('${clave}')">
    Ver
</button>

</div>

`;

        });

}
function convertirFecha(fecha) {

    if (!fecha) return new Date(0);

    if (fecha instanceof Date) return fecha;

    if (fecha.includes("-")) {

        return new Date(fecha);

    }

    return new Date(

        fecha.split("/").reverse().join("-")

    );

}

function nombreMes(clave) {

    const [año, mes] = clave.split("-");

    const nombres = [

        "Enero","Febrero","Marzo","Abril",

        "Mayo","Junio","Julio","Agosto",

        "Septiembre","Octubre","Noviembre","Diciembre"

    ];

    return nombres[Number(mes)-1] + " " + año;

}
export function verHistoricoMes(clave) {

    if (window.abrirMesHistorico) {

        window.abrirMesHistorico(clave);

    }

}

window.verHistoricoMes = verHistoricoMes;