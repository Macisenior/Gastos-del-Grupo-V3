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

  // Reparto clásico si no hay consumiciones
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