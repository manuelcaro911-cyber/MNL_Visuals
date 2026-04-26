
import { Material, Drawing } from './types';

export const ABOUT_ME_TEXT = `Hola, soy Manuel Caro, también conocido como MNL_Visuals. Mi pasión por el arte comenzó desde muy temprana edad, explorando diversas técnicas y estilos que me han llevado a perfeccionar mi habilidad en el dibujo realista and la ilustración digital.

StudioVisuals nace como un espacio dedicado no solo a mostrar mis obras, sino también a compartir el conocimiento acumulado durante años de práctica. Creo firmemente que el arte es un lenguaje universal que permite conectar con las emociones de los demás de una manera única. Mi enfoque se centra en la atención al detalle, la profundidad de las sombras y la vibrancia de los colores, buscando siempre transmitir una historia en cada trazo.`;

export const MATERIALS: Material[] = [
  { name: "Lápices Graduados (H-6B)", category: 'Basics', type: 'Lápiz', description: "Kit esencial para sombreados iniciales y bocetos." },
  { name: "Goma Moldeable", category: 'Basics', type: 'Lápiz', description: "Ideal para sacar luces sin dañar el papel." },
  { name: "Sacapuntas de Metal", category: 'Basics', type: 'Lápiz', description: "Mantiene puntas finas para detalles precisos." },
  { name: "Colores de Madera Escolares", category: 'Basics', type: 'Colores', description: "Perfectos para practicar mezclas básicas." },
  { name: "Difuminos de Papel", category: 'Intermedios', type: 'Lápiz', description: "Para transiciones suaves en sombras extensas." },
  { name: "Lápiz de Grafito Puro", category: 'Intermedios', type: 'Lápiz', description: "Cubre áreas oscuras con mayor intensidad." },
  { name: "Marcadores a Base de Alcohol", category: 'Intermedios', type: 'Colores', description: "Capas base fluidas para acabados profesionales." },
  { name: "Lápices de Grafito 9B-12B", category: 'Avanzados', type: 'Lápiz', description: "Negros profundos y texturas complejas." },
  // Fixed typo: 'Avanvados' corrected to 'Avanzados'
  { name: "Papel Bristol Smooth", category: 'Avanzados', type: 'Lápiz', description: "Superficie de alto rendimiento para realismo." },
  // Fixed typo: 'Avanvados' corrected to 'Avanzados'
  { name: "Lápices Policromos", category: 'Avanzados', type: 'Colores', description: "Pigmentos de alta calidad resistentes a la luz." },
];

export const INITIAL_DRAWINGS: Drawing[] = [
  // Fixed: Changed property names from camelCase to snake_case to match Drawing interface in types.ts
  { id: '1', author: 'Manuel Caro', image_url: "https://images.unsplash.com/photo-1544273677-277914c9ad4a?auto=format&fit=crop&w=800&q=80", description: "Estudio de sombras inicial.", timestamp: Date.now() },
  { id: '2', author: 'Manuel Caro', image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80", description: "Retrato realista.", timestamp: Date.now() },
  { id: '3', author: 'Manuel Caro', image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80", description: "Exploración de texturas.", timestamp: Date.now() },
  { id: '4', author: 'Manuel Caro', image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80", description: "Composición abstracta.", timestamp: Date.now() },
  { id: '5', author: 'Manuel Caro', image_url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80", description: "Práctica de anatomía.", timestamp: Date.now() },
  { id: '6', author: 'Manuel Caro', image_url: "https://images.unsplash.com/photo-1576016770956-debb63d92058?auto=format&fit=crop&w=800&q=80", description: "Paisaje minimalista.", timestamp: Date.now() },
];
