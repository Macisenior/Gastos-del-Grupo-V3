export function calcularGastoPorPersona(personas, gastos) {
  const gastoPersona = {};

  personas.forEach(p => gastoPersona[p.id] = 0);

  gastos.forEach(g => {
    if (!g.participantes || !g.monto) return;

    g.participantes.forEach(id => {
      if (!gastoPersona[id]) gastoPersona[id] = 0;
      gastoPersona[id] += calcularImportePersonaEnGasto(g, id);
    });
  });

  return gastoPersona;
}
export function calcularImportePersonaEnGasto(gasto, personaId) {

  if (!gasto.participantes?.includes(personaId)) return 0;

  // =============================
// NUEVO MODO: IMPORTE POR PERSONA
// =============================
// ======================================
// MODO IMPORTE POR PERSONA
// ======================================

if (gasto.modo === "importe" && gasto.importesPersona) {

    return gasto.importesPersona[personaId] || 0;

}

// ======================================
// REPARTO IGUAL
// ======================================

if (!gasto.consumiciones) {

    return gasto.monto / gasto.participantes.length;

}


// =============================
// REPARTO IGUAL
// =============================

if (!gasto.consumiciones) {

    return gasto.monto / gasto.participantes.length;

}

  let totalPesos = 0;

  gasto.participantes.forEach(id => {
    totalPesos += gasto.consumiciones[id] || 1;
  });

  const miPeso = gasto.consumiciones[personaId] || 1;

  return gasto.monto * miPeso / totalPesos;
}
export function calcularBalance(personas, gastos) {

    const gastoPersona = calcularGastoPorPersona(personas, gastos);

    return personas.map(persona => ({

        id: persona.id,

        nombre: persona.nombre,

        aportado: persona.aportado || 0,

        gastado: gastoPersona[persona.id] || 0,

        balance:
            (persona.aportado || 0) -
            (gastoPersona[persona.id] || 0)

    }));

}