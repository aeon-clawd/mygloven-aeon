export type EstadoEspacio = "borrador" | "activo" | "pausado" | "eliminado";
export type EstadoArtista = "borrador" | "activo" | "pausado" | "eliminado";
export type TipoVenue =
  | "sala"
  | "rooftop"
  | "restaurante"
  | "hotel"
  | "aire_libre"
  | "local_privado"
  | "otro";
export type UnidadPrecio = "hora" | "evento" | "dia";

export interface VenueImage {
  url: string;
  tag: "principal" | "base_space_studio" | "evento_montado" | "detalle" | "exterior" | "zona";
  label?: string;
  order: number;
}

export interface ArtistImage {
  url: string;
  tag: "principal" | "press" | "live" | "detalle" | "otro";
  label?: string;
  order: number;
}

export interface VenueAnnex {
  id: string;
  venue_id: string;
  nombre: string;
  config_de_pie: number | null;
  config_sentado: number | null;
  metros_cuadrados: number | null;
  tipo_espacio: "interior" | "exterior" | "mixto" | null;
  tipos_evento: string[];
  images: VenueImage[];
  precio_desde: number | null;
  precio_hasta: number | null;
  unidad_precio: UnidadPrecio;
  orden: number;
}

export interface Venue {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  descripcion_corta: string | null;
  ciudad: string | null;
  pais: string | null;
  barrio: string | null;
  direccion: string | null;
  mostrar_direccion: boolean;
  tipo: TipoVenue | null;
  subtipo: string | null;
  exterior: boolean | null;
  rider: boolean | null;
  licencia_musica: boolean | null;
  equipo_sonido: string | null;
  precio_desde: number | null;
  precio_hasta: number | null;
  unidad_precio: UnidadPrecio;
  images: VenueImage[];
  logo_url: string | null;
  tags: string[] | null;
  telefono: string | null;
  email: string | null;
  web: string | null;
  instagram: string | null;
  verificado: boolean;
  estado: EstadoEspacio;
  horario_general: string | null;
  geo: { lat: number; lng: number } | null;
  coordenadas: { lat: number; lng: number } | null;
  annexes?: VenueAnnex[];
}

export interface Artista {
  id: string;
  nombre: string;
  slug: string;
  bio: string | null;
  descripcion_corta: string | null;
  genero_musical: string | null;
  instagram: string | null;
  spotify: string | null;
  soundcloud: string | null;
  youtube: string | null;
  web: string | null;
  linktree: string | null;
  rrss: string | null;
  telefono: string | null;
  email: string | null;
  tags: string[] | null;
  verificado: boolean;
  rider: string | null;
  avatar_url: string | null;
  images: ArtistImage[];
  estado: EstadoArtista;
}
