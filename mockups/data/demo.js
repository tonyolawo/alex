/* Alex - demo data for mockups (Kenyan SMB) */
window.DEMO = {
  app: { name: "Alex", assistant: "Alex" },
  business: {
    name: "Rainbow Hardware",
    area: "Nairobi, CBD",
    pin: "P051234567V",
    phone: "0721 000 111",
    mpesa: "0721 000 111",
    owner: "Amina",
    vatNo: "D0000123",
  },
  items: [
    { name: "Cement (50kg bag)", stock: 240, price: 680, unit: "bag", min: 30 },
    { name: "GI Iron Sheet", stock: 900, price: 1150, unit: "sheet", min: 200 },
    { name: "Nails 3\" (per kg)", stock: 45, price: 210, unit: "kg", min: 100 },
    { name: "Water Tank 1000L", stock: 12, price: 18500, unit: "tank", min: 5 },
    { name: "PVC Pipe 6m", stock: 320, price: 480, unit: "pc", min: 50 },
    { name: "Bulb 12W LED", stock: 41, price: 95, unit: "pc", min: 20 },
  ],
  customers: [
    { name: "Bora Builders Ltd", tin: "P102938475X", phone: "0722 333 444", email: "accounts@borabuilders.co.ke", purchases: "KES 1,248,000" },
    { name: "Faith Njoroge", tin: "A002345678F", phone: "0733 556 677", email: "faith.n@gmail.com", purchases: "KES 84,300" },
    { name: "Kijabe Traders", tin: "P057284910M", phone: "0700 123 456", email: "kijabetraders@gmail.com", purchases: "KES 312,700" },
  ],
  suppliers: [
    { name: "Bamburi Cement Ltd", tin: "P000214789Q", phone: "0735 111 222" },
    { name: "Mabati Rolling Mills", tin: "P051230004M", phone: "0735 333 444" },
  ],
  week: { count: 128, amount: 1248500 },
  month: { count: 512, amount: 4960000 },
  profit: { revenue: 4960000, cogs: 2910000, expenses: 640000, margin: 0.284 },
  vat: { due: "2026-10-25", amount: 312400, period: "Aug 2026" },
  notices: [
    { title: "Stock reporting filing for Sep 2026", date: "2026-09-12", by: "KRA eTIMS" },
  ],
  store: {
    url: "alexstore.rainbow.co.ke",
    orders: [
      { customer: "Diana Wambui", item: "GI Iron Sheet x 20", amount: 23000, status: "pending" },
      { customer: "Mbugua & Sons", item: "Cement x 40 bags", amount: 27200, status: "new" },
    ],
  },
  recent: {
    invoices: [
      { id: "INV-2026-0148", customer: "Bora Builders Ltd", amount: 45600, status: "fulfilled" },
      { id: "INV-2026-0149", customer: "Faith Njoroge", amount: 34950, status: "pending" },
    ],
  },
  fmtKES: function (n) {
    return "KES " + Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 });
  },
};