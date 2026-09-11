export const hqBrands = [
  {slug:'heritage',name:'Heritage'}, {slug:'asas',name:'ASAS'},
  {slug:'wariswatan',name:'Waris Watan'}, {slug:'bajuorangmelayu',name:'Baju Orang Melayu'},
];
export function selectedBrand(value: unknown) { return typeof value === 'string' && hqBrands.some(b=>b.slug===value) ? value : ''; }
export const paymentLabels: Record<string,string> = {pending:'Menunggu bayaran',paid:'Dibayar',failed:'Bayaran gagal',refunded:'Dipulangkan',partially_refunded:'Pulangan sebahagian'};
export const fulfillmentLabels: Record<string,string> = {unfulfilled:'Belum dipacking',packing:'Sedang dipacking',packed:'Siap dipacking',shipped:'Dihantar',delivered:'Diterima'};
export const rm = (value: number|string) => new Intl.NumberFormat('ms-MY',{style:'currency',currency:'MYR'}).format(Number(value)/100);
