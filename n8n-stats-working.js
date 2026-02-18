// En el nodo "Code in JavaScript1" de n8n:
let readyToTest = 0;
let working = 0;
let okUat = 0;
let okFinal = 0;
let ko = 0;
let bloqueado = 0;
let pendiente = 0;

for (const item of items) {
  const estado = (item.json.Estado || "").toUpperCase().trim();
  
  if (estado === 'READY TO TEST') readyToTest++;
  else if (estado === 'WORKING') working++;
  else if (estado === 'OK-UAT') okUat++;
  else if (estado === 'OK-FINAL') okFinal++;
  else if (estado === 'KO') ko++;
  else if (estado === 'BLOQUEADO') bloqueado++;
  else pendiente++; // Sin estado o cualquier otro valor
}

return [{
  json: { readyToTest, working, okUat, okFinal, ko, bloqueado, pendiente }
}];
