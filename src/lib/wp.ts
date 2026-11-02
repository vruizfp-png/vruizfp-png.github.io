// src/lib/wp.ts
const API = import.meta.env.PUBLIC_WP_API_URL;

// 1. Tipos de la respuesta cruda de WordPress
interface WpRendered {
  rendered: string;
}

interface WpMedia {
  source_url: string;
  alt_text: string;
}

interface WpPostRaw {
  id: number;
  slug: string;
  date: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  acf?: {
    origen?: string;
    notas_cata?: string;
    nivel_tueste?: string;
    precio?: number;
  };
  _embedded?: {
    'wp:featuredmedia'?: WpMedia[];
  };
}

// 2. Tipos limpios con los que trabajará Astro
export interface Cafe {
  id: number;
  slug: string;
  titulo: string;
  descripcionHtml: string;
  origen: string;
  notasCata: string;
  nivelTueste: string;
  precio: number;
  imagen: string | null;
  imagenAlt: string;
}

export interface Post {
  id: number;
  slug: string;
  fecha: string;
  titulo: string;
  contenidoHtml: string;
  extractoHtml: string;
  imagen: string | null;
  imagenAlt: string;
}

// 3. Mapeadores de datos crudos a tipos limpios
function mapCafe(raw: WpPostRaw): Cafe {
  const media = raw._embedded?.['wp:featuredmedia']?.[0];
  return {
    id: raw.id,
    slug: raw.slug,
    titulo: raw.title.rendered,
    descripcionHtml: raw.content.rendered,
    origen: raw.acf?.origen ?? 'Origen de Especialidad',
    notasCata: raw.acf?.notas_cata ?? '',
    nivelTueste: raw.acf?.nivel_tueste ?? 'Medio',
    precio: Number(raw.acf?.precio ?? 0),
    imagen: media?.source_url ?? null,
    imagenAlt: media?.alt_text ?? raw.title.rendered,
  };
}

function mapPost(raw: WpPostRaw): Post {
  const media = raw._embedded?.['wp:featuredmedia']?.[0];
  const fechaFormatted = new Date(raw.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    id: raw.id,
    slug: raw.slug,
    fecha: fechaFormatted,
    titulo: raw.title.rendered,
    contenidoHtml: raw.content.rendered,
    extractoHtml: raw.excerpt.rendered,
    imagen: media?.source_url ?? null,
    imagenAlt: media?.alt_text ?? raw.title.rendered,
  };
}

// 4. Funciones exportadas de consulta
export async function getCafes(): Promise<Cafe[]> {
  // Consulta los posts pertenecientes a la categoría de Cafés (ID 4)
  const res = await fetch(`${API}/wp/v2/posts?categories=4&_embed&per_page=100`);
  if (!res.ok) {
    throw new Error(`Error al pedir los cafés a WordPress: ${res.status} ${res.statusText}`); } const data: WpPostRaw[] = await res.json(); return data.map(mapCafe); }  export async function getPosts(): Promise<Post[]> { const res = await fetch(`${API}/wp/v2/posts?_embed&per_page=100`);
  if (!res.ok) {
    throw new Error(`Error al pedir las entradas a WordPress: ${res.status}${res.statusText}`);
  }
  const data: WpPostRaw[] = await res.json();
  return data.map(mapPost);
}