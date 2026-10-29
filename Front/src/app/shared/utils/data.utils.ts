// Data e hora no fuso do computador. toISOString() devolve UTC, que no Brasil fica
// 3 horas à frente e, depois das 21h, já cai no dia seguinte.

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/** "2026-10-20", para inputs type="date". */
export function hojeLocal(data = new Date()): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** "2026-10-20T14:30", para inputs type="datetime-local". */
export function agoraLocal(data = new Date()): string {
  return `${hojeLocal(data)}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}
