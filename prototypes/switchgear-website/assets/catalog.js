'use strict';
// Example catalog only. Numeric values describe hypothetical sections, not factory ratings.
globalThis.Catalog = (() => {
  const products = [
    {id:'switchboards', name:'LV switchboards', standard:'UL 891', description:'Low-voltage distribution for data centers and industrial sites.'},
    {id:'switchgear', name:'LV switchgear', standard:'UL 1558', description:'Low-voltage switchgear for critical power.'},
    {id:'mv', name:'MV switchgear', standard:'IEEE C37.20.2', description:'Medium-voltage switchgear for campus and utility connections.'},
    {id:'substations', name:'Unit substations', standard:'UL 1558', description:'Transformer and switchgear in one line-up. Example ratings below describe only the low-voltage section. [Assembly standard] · [Transformer ratings]'}
  ];
  const raw = [
    ['switchboards','UL 891',208,800,42,'FB',3,'F'],
    ['switchboards','UL 891',480,1200,65,'FB',3,'F'],
    ['switchboards','UL 891',480,2000,65,'MB',3,'F'],
    ['switchboards','UL 891',600,3000,100,'MB',3,'F'],
    ['switchgear','UL 1558',480,1600,65,'FB',3,'D'],
    ['switchgear','UL 1558',480,3000,65,'MB',4,'D'],
    ['switchgear','UL 1558',480,4000,100,'MB',4,'D'],
    ['switchgear','UL 1558',600,2000,65,'FB',3,'D'],
    ['mv','IEEE C37.20.2',5000,1200,25,'MB',3,'D'],
    ['mv','IEEE C37.20.2',5000,2000,31.5,'MB',3,'D'],
    ['mv','IEEE C37.20.2',15000,1200,25,'FB',3,'D'],
    ['mv','IEEE C37.20.2',15000,3000,40,'TB',3,'D'],
    ['substations','UL 1558',480,800,42,'FB',4,'F'],
    ['substations','UL 1558',480,1200,65,'FB',4,'F'],
    ['substations','UL 1558',600,2000,100,'MB',4,'F'],
    ['substations','UL 1558',600,3000,100,'MB',4,'F']
  ];
  const fields = ['standard','voltage','bus','short'];
  const rows = raw.map((r,i) => ({id:'C'+String(i+1).padStart(2,'0'), product:r[0],standard:r[1],voltage:r[2],bus:r[3],short:r[4],function:r[5],poles:r[6],mounting:r[7]}));
  function partCode(row) { return `${row.function}${row.bus/100}-${row.poles}${row.mounting}-NA`; }
  function options(index, selected = []) {
    const candidates = rows.filter(row => fields.slice(0,index).every((key,i) => selected[i] === undefined || String(row[key]) === String(selected[i])));
    return [...new Set(candidates.map(row => String(row[fields[index]])))];
  }
  function match(selected) { return rows.filter(row => fields.every((key,i) => String(row[key]) === String(selected[i]))); }
  function byId(id) { return rows.find(row => row.id === id); }
  return {products,rows,fields,partCode,options,match,byId};
})();
