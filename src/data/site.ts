/* Site copy — hardcoded for v2.
 * To edit: change here and redeploy. We will move to Supabase later if needed.
 */

export const SITE = {
  brandSuffix: "booking & talento",
  contactEmail: "hola@mygloven.com",

  hero: {
    hashtag: "#mygloven",
    activeLabel: "en activo · 10 may 2026",
    title: "Booking, gestión y talento",
    subtitle:
      "Agencia de management y booking. Conectamos artistas y venues en eventos memorables — de un cumpleaños a un festival.",
    stats: [
      { lbl: "Artistas", num: "47", suffix: "." },
      { lbl: "Venues", num: "152", suffix: "." },
      { lbl: "Shows / año", num: "200", suffix: "+" },
    ],
  },

  marquee: [
    "MYGLOVEN — booking & talento",
    "200+ shows / año",
    "España · Portugal · Europa",
    "Roster activo · 47 artistas",
    "Primavera Pro 2026 · 04→06 jun",
  ],

  clients: ["Razzmatazz", "Sónar", "Primavera", "Mad Cool", "NEU", "Lev Festival", "FIB"],

  features: [
    {
      title: "Curado artístico.",
      description:
        "Cada artista pasa por un filtro propio: presencia, encaje y solidez en directo.",
    },
    {
      title: "Producción operativa.",
      description:
        "Riders, contratos, transporte y backstage. La parte aburrida la hacemos nosotros.",
    },
    {
      title: "Red de espacios.",
      description:
        "Más de 150 venues por España y Portugal. De club íntimo a anfiteatro al aire libre.",
    },
    {
      title: "Datos y reporte.",
      description:
        "Cierre de cada show con métricas, factura y feedback. Sin sorpresas, sin papeles.",
    },
  ],

  about: {
    primary:
      "Mygloven nació en 2019 entre Barcelona y Madrid. Empezamos representando a tres artistas en circuitos de club; hoy operamos más de 200 fechas anuales en festivales, espacios privados y giras internacionales.",
    secondary:
      "No somos una agencia clásica. Trabajamos en equipos pequeños, con A&R activo, contratos legibles, y tarifas claras. Todo lo que hacemos pasa por un sistema operativo propio — más rápido, más transparente.",
  },

  primaveraPro: {
    year: "2026",
    subtitle: "Programa oficial — Mygloven en Primavera Pro",
    date: "04 → 06 JUNIO · BARCELONA",
    body: "Tres jornadas de showcase de roster propio y reuniones con promotores internacionales. Pasaremos por los paneles de circuito ibérico y curaremos un programa nocturno en Razzmatazz.",
  },

  cta: {
    title: "Hablemos.",
    subtitle: "Booking, prensa, partnerships. Lo más probable es que respondamos hoy.",
  },

  contact: {
    channels: [
      { l: "BOOKING", v: "booking@mygloven.com", k: "booking" },
      { l: "PRENSA", v: "press@mygloven.com", k: "press" },
      { l: "PARTNERSHIPS", v: "partners@mygloven.com", k: "partners" },
      { l: "GENERAL", v: "hola@mygloven.com", k: "general" },
    ],
    studios: [
      { c: "BARCELONA", a: "C/ Pere IV 314\n08020 BCN" },
      { c: "MADRID", a: "C/ Doctor Fourquet 8\n28012 MAD" },
      { c: "LISBOA", a: "Rua Maria Pia 45\n1350 LIS" },
    ],
  },

  team: [
    { name: "Marta Vidal", role: "Founder · Booking", num: "001" },
    { name: "Pau Ros", role: "A&R Director", num: "002" },
    { name: "Aina Comas", role: "Producción", num: "003" },
    { name: "Bruno López", role: "Operaciones", num: "004" },
  ],
} as const;

export type Site = typeof SITE;
