/* Site copy — hardcoded para v2 (briefing PDF).
 * Marca: my'G — myglobalvenue · "asistente de producción inteligente".
 * Tono: directo, sin relleno, tú, frases cortas.
 */

export const SITE = {
  brand: "my'G",
  brandFull: "myglobalvenue",
  brandSuffix: "asistente de producción inteligente",
  contactEmail: "info@mygloven.com",
  instagram: "https://www.instagram.com/mygloven/",
  instagramHandle: "@mygloven",

  hero: {
    hashtag: "#mygloven",
    activeLabel: "lanzamiento privado · Primavera Pro '26",
    title: "Esto es con lo único que no podemos ayudarte.",
    subtitle: "Elige el color.",
    cta: { label: "Conoce a tu asistente", href: "#como-funciona", cursor: "asistente →" },
  },

  comoFunciona: {
    eyebrow: "— Cómo funciona",
    title: "Cómo funciona",
    steps: [
      {
        num: "01",
        title: "Define tu evento",
        body:
          "Cuéntanos qué quieres hacer —tipo de evento, ciudad, público o idea inicial— y my'G empieza a construir contigo la producción desde el primer momento. No es solo una búsqueda: es el punto de partida de un evento real.",
      },
      {
        num: "02",
        title: "Recibe una propuesta completa",
        body:
          "my'G combina su selección curada de espacios, artistas y proveedores con asistencia inteligente para proponerte opciones concretas, viables y adaptadas a tu evento. Desde venues únicos hasta necesidades técnicas: todo conectado en una misma propuesta.",
      },
      {
        num: "03",
        title: "Activa tu plan y produce tu evento",
        body:
          "Elige el plan que mejor se adapte a tu proyecto y desbloquea herramientas para producir tu evento de forma eficiente. Desde contacto directo con todos los agentes hasta funcionalidades como my'G Space Studio, que te ayuda a organizar, visualizar y coordinar toda la producción en un solo lugar.",
      },
    ],
    cta: { label: "Ver planes", href: "/planes", cursor: "planes →" },
  },

  espacios: {
    eyebrow: "— Red curada",
    title: "Espacios",
    subtitle: "Espacios seleccionados para producir tu evento.",
    body:
      "Una selección curada de los mejores venues en Madrid y Barcelona. Solo trabajamos con espacios que conocemos, que tienen personalidad y que están preparados para la producción.",
    cta: { label: "Ver todos los espacios", href: "/espacios", cursor: "espacios →" },
  },

  artistas: {
    eyebrow: "— Talento curado",
    title: "Artistas",
    subtitle: "Talento curado para hacer memorable tu evento.",
    ctaMore: { label: "Ver más artistas", href: "/artistas", cursor: "artistas →" },
    ctaJoin: { label: "¿Eres artista? Regístrate", href: "/contacto", cursor: "unirme →" },
  },

  agency: {
    eyebrow: "— Servicio integral",
    title: "my'G agency",
    subtitle: "Producimos tu evento de principio a fin.",
    body:
      "Creamos y producimos eventos de principio a fin. Desde la localización del espacio hasta la producción técnica, logística, coordinación de proveedores o catering. Un servicio 360° para que solo tengas que imaginar el evento.",
    servicios: [
      "Búsqueda y gestión del espacio",
      "Producción técnica",
      "Coordinación de proveedores",
      "Catering",
      "Logística y coordinación en el día",
      "Comunicación y contenido del evento",
    ],
    cta: { label: "Cuéntanos tu evento", href: "/contacto", cursor: "cuéntanos →" },
    ctaTitle: "¿Tienes un evento en mente?",
    ctaBody: "Cuéntanos la idea y te preparamos una propuesta.",
  },

  about: {
    eyebrow: "— Sobre my'G",
    title: "Sobre my'G",
    body:
      "mygloven nace con la misión de facilitar la organización de eventos conectando espacios, artistas, proveedores y promotores en una misma plataforma. Estamos desarrollando herramientas inteligentes con IA que conectan espacios, artistas y proveedores en propuestas adaptadas a cada evento, simplificando toda la producción. Nuestro objetivo es crear un punto de encuentro donde se integren proyectos y recursos para eventos, reuniendo todo lo necesario en un solo lugar.",
    card: {
      eyebrow: "— Proyecto seleccionado",
      title: "Primavera Pro '26",
      meta: "Ideas Showroom · Barcelona · 3-5 Junio 2026",
      cta: { label: "Ver Ideas Showroom", href: "https://www.primaverapro.net/", cursor: "showroom →" },
    },
  },

  planesCTA: {
    eyebrow: "— Produce tu evento",
    title: "Planes — Tu evento, tu ritmo",
    body:
      "Elige cómo quieres producir tu evento con my'G. Cada plan desbloquea propuestas, conexiones y herramientas para simplificar toda la producción.",
    cta: { label: "Ver planes", href: "/planes", cursor: "planes →" },
  },

  spaceStudioTeaser: {
    eyebrow: "— Próximamente",
    title: "my'G Space Studio",
    body:
      "Diseña y visualiza tu evento antes de que suceda. Una herramienta con IA que genera renders, sugiere configuraciones y te ayuda a planificar de forma visual.",
    cta: { label: "Saber más", href: "/space-studio", cursor: "space studio →" },
  },

  ctaFinal: {
    title: "¿Listo para producir tu evento?",
    body: "Describe tu idea y my'G construye contigo una propuesta real.",
    cta: { label: "Contactar", href: "/contacto", cursor: "contactar →" },
  },

  marquee: [
    "my'G — myglobalvenue",
    "Asistente de producción inteligente",
    "Barcelona · Madrid",
    "Primavera Pro '26 · 3-5 Junio",
    "Lanzamiento privado",
  ],

  proveedores: {
    eyebrow: "— Próximamente",
    title: "Proveedores",
    subtitle: "Los mejores profesionales para que tu evento funcione.",
    body:
      "Estamos abriendo la red de proveedores. Pronto podrás darte de alta y conectar con productores que necesitan tus servicios.",
    categorias: [
      "Producción técnica",
      "Catering",
      "Fotografía y vídeo",
      "Decoración",
      "Seguridad",
      "Transporte",
      "Otros",
    ],
    ctaTitle: "¿Eres proveedor de eventos?",
    ctaBody: "Súmate a la plataforma y conecta con productores que necesitan tus servicios.",
    cta: { label: "Abrir solicitud", href: "/contacto?type=proveedor", cursor: "registrarme →" },
  },

  spaceStudio: {
    eyebrow: "— Próximamente",
    title: "my'G Space Studio",
    subtitle: "Diseña y visualiza tu evento antes de que suceda.",
    body:
      "Una herramienta con IA que genera renders, sugiere configuraciones y te ayuda a planificar de forma visual. Sube una foto del espacio, describe cómo quieres que quede, y my'G te muestra cómo quedaría montado el evento. Antes de hablar con un solo proveedor. Antes de firmar nada.",
    pasos: [
      { num: "01", t: "Sube la foto del espacio" },
      { num: "02", t: "Describe cómo quieres que quede" },
      { num: "03", t: "La IA genera la visualización y sugiere proveedores" },
    ],
    ctaTitle: "Sé de los primeros en probarlo.",
    ctaBody: "Space Studio está en beta. Apúntate para acceder antes que nadie.",
    cta: { label: "Quiero acceso anticipado", href: "/contacto?type=space-studio", cursor: "acceso →" },
  },

  planes: {
    eyebrow: "— Produce tu evento",
    title: "Planes — Tu evento, tu ritmo",
    body:
      "Elige cómo quieres producir tu evento con my'G. Cada plan desbloquea propuestas, conexiones y herramientas para simplificar toda la producción.",
    items: [
      {
        num: "01",
        name: "Free",
        price: "0 €",
        period: "/mes",
        para: "Para descubrir my'G",
        features: [
          "Catálogo de espacios, artistas y proveedores",
          "Búsqueda básica",
          "1 propuesta al mes",
        ],
        cta: { label: "Empezar gratis", href: "/contacto?plan=free", cursor: "empezar →" },
        primary: false,
      },
      {
        num: "02",
        name: "Starter",
        price: "19 €",
        period: "/mes",
        para: "Para empezar a producir",
        features: [
          "Todo lo de Free",
          "5 propuestas al mes",
          "Contacto directo con espacios y proveedores",
          "Asistencia IA para construir tu evento",
        ],
        cta: { label: "Empezar con Starter", href: "/contacto?plan=starter", cursor: "starter →" },
        primary: false,
      },
      {
        num: "03",
        name: "Pro",
        price: "49 €",
        period: "/mes",
        para: "Para productores activos",
        features: [
          "Todo lo de Starter",
          "Propuestas ilimitadas",
          "Acceso a my'G Space Studio",
          "Contacto con todos los agentes",
        ],
        cta: { label: "Empezar con Pro", href: "/contacto?plan=pro", cursor: "pro →" },
        primary: true,
      },
      {
        num: "04",
        name: "Agency",
        price: "A medida",
        period: "",
        para: "Para producciones complejas",
        features: [
          "Servicio completo my'G agency",
          "Producción integral",
          "Equipo dedicado",
          "Presupuesto a medida",
        ],
        cta: { label: "Hablar con el equipo", href: "/contacto?plan=agency", cursor: "hablar →" },
        primary: false,
      },
    ],
    ctaTitle: "¿No sabes qué plan elegir?",
    ctaBody: "Cuéntanos tu evento y te recomendamos la mejor opción.",
    cta: { label: "Contactar", href: "/contacto", cursor: "contactar →" },
  },

  contacto: {
    eyebrow: "— Hablemos",
    title: "Hablemos.",
    subtitle: "Cuéntanos tu evento o lo que necesitas. Te respondemos en menos de 24 horas.",
    formCta: "Enviar",
    receivedTitle: "Recibido.",
    receivedBody: "Te respondemos en menos de 24 horas.",
  },

  footer: {
    copyright: "© 2026 mygloven",
    poweredBy: "Powered by Aeon Infinitive",
    poweredByUrl: "https://aeoninfinitive.com",
  },
} as const;

export type Site = typeof SITE;
