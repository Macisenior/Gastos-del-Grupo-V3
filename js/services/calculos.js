export function calcularGastoPorPersona(personas, gastos) {

  const gastoPersona = {};

  personas.forEach(p => gastoPersona[p.id] = 0);

  gastos.forEach(g => {

    if (!g.participantes || !g.monto) return;
console.log("GASTO");
console.log(g);
    const pesos = {};
    let totalPesos = 0;

    g.participantes.forEach(id => {

      const peso = g.consumiciones?.[id] || 1;

      pesos[id] = peso;
      totalPesos += peso;

    });

    const valorPeso = g.monto / totalPesos;

    g.participantes.forEach(id => {

      if (!gastoPersona[id]) gastoPersona[id] = 0;

    const importe = valorPeso * pesos[id];

console.log(
    "ID:", id,
    "Peso:", pesos[id],
    "Valor peso:", valorPeso,
    "Importe:", importe
);

gastoPersona[id] += importe;

    });

  });

  return gastoPersona;
}

export function calcularBalance(personas, gastos) {

  const gastoPersona = calcularGastoPorPersona(personas, gastos);

  return personas.map(p => ({
    id: p.id,
    nombre: p.nombre,
    balance: (p.aportado || 0) - (gastoPersona[p.id] || 0)
  }));

}
export function calcularRepartoGasto(gasto, personas) {

    const resultado = [];

    const pesos = {};
    let totalPesos = 0;

    gasto.participantes.forEach(id => {

        const peso = gasto.consumiciones?.[id] || 1;

        pesos[id] = peso;

        totalPesos += peso;

    });

    const valorPeso = gasto.monto / totalPesos;

    gasto.participantes.forEach(id => {

        const persona = personas.find(p => p.id === id);

        resultado.push({

            nombre: persona?.nombre || "Desconocido",

            peso: pesos[id],

            importe: valorPeso * pesos[id]

        });

    });

    return resultado;

}