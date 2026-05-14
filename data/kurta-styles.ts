export interface KurtaStyle {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'fusion' | 'wedding' | 'casual';
  description: string;
  promptKeywords: string;
  icon: string;
}

export const KURTA_STYLES: KurtaStyle[] = [
  { id: 'straight-cut', name: 'Straight Cut Kurta', category: 'classic', description: 'Classic straight silhouette with side slits — most universal', promptKeywords: 'straight-cut kurta with side slits, clean lines, falls to knee length', icon: '📐' },
  { id: 'a-line', name: 'A-Line Kurta', category: 'classic', description: 'Flares gently from waist downward, relaxed fit', promptKeywords: 'A-line kurta that flares from waist, relaxed comfortable fit', icon: '🔺' },
  { id: 'pathani', name: 'Pathani Kurta', category: 'classic', description: 'Loose, rugged Afghan-origin cut — masculine bold look', promptKeywords: 'Pathani kurta, loose fit, rugged masculine style, side pockets', icon: '⚔️' },
  { id: 'angrakha', name: 'Angrakha Kurta', category: 'classic', description: 'Overlapping panels tied at side — Mughal royal vibe', promptKeywords: 'Angrakha kurta with overlapping front panels tied with strings, royal Mughal style', icon: '👑' },
  { id: 'anarkali', name: 'Anarkali Kurta', category: 'classic', description: 'Flared floor-length — regal wedding-heavy style', promptKeywords: 'Anarkali kurta, heavily flared from waist, floor-length, regal silhouette', icon: '💫' },
  { id: 'short-kurta', name: 'Short Kurta', category: 'modern', description: 'Hits above knee/hip — pairs with jeans or chinos', promptKeywords: 'short kurta hitting above the knee, modern casual length', icon: '✂️' },
  { id: 'asymmetric', name: 'Asymmetric Kurta', category: 'modern', description: 'Uneven hemline — modern party-ready statement', promptKeywords: 'asymmetric kurta with uneven diagonal hemline, modern fashion-forward cut', icon: '📊' },
  { id: 'high-low', name: 'High-Low Kurta', category: 'modern', description: 'Short front, long back — contemporary edge', promptKeywords: 'high-low kurta shorter in front longer at back, contemporary stylish cut', icon: '📈' },
  { id: 'slim-fit', name: 'Slim-Fit Kurta', category: 'modern', description: 'Tailored close to body — sharp contemporary silhouette', promptKeywords: 'slim-fit tailored kurta, close to body, sharp modern silhouette', icon: '👔' },
  { id: 'front-open', name: 'Front-Open Kurta', category: 'modern', description: 'Button-down or zipper opening — modern casual', promptKeywords: 'front-open button-down kurta, shirt-style opening, modern casual', icon: '🔘' },
  { id: 'indo-western', name: 'Indo-Western Kurta', category: 'fusion', description: 'Fusion of kurta + Western tailoring elements', promptKeywords: 'Indo-Western fusion kurta blending Indian and Western tailoring, contemporary', icon: '🌐' },
  { id: 'cape-kurta', name: 'Cape Kurta', category: 'fusion', description: 'Attached cape layer — dramatic evening wear', promptKeywords: 'kurta with attached flowing cape layer, dramatic fashion-forward evening wear', icon: '🦸' },
  { id: 'draped-cowl', name: 'Draped / Cowl Kurta', category: 'fusion', description: 'Fabric draped like shawl across body — fashion-forward', promptKeywords: 'draped cowl kurta with fabric draped across shoulder like shawl, avant-garde', icon: '🎭' },
  { id: 'jeans-kurta', name: 'Jeans Kurta', category: 'fusion', description: 'Short kurta designed specifically for denim pairing', promptKeywords: 'casual short kurta designed to pair with denim jeans, relaxed fusion style', icon: '👖' },
  { id: 'sherwani-style', name: 'Sherwani-Style Kurta', category: 'wedding', description: 'Long coat-like over kurta — weddings & receptions', promptKeywords: 'sherwani-style long kurta like a coat, heavily embroidered, wedding grandeur', icon: '🤵' },
  { id: 'kurta-jacket-set', name: 'Kurta + Nehru Jacket Set', category: 'wedding', description: 'Kurta with Nehru jacket layering — sophisticated formal', promptKeywords: 'kurta with Nehru jacket layered on top, structured collar jacket, formal elegant', icon: '🧥' },
  { id: 'jodhpuri-set', name: 'Jodhpuri Set', category: 'wedding', description: 'Structured Rajasthani-inspired formal bandhgala set', promptKeywords: 'Jodhpuri bandhgala kurta set, structured Rajasthani-inspired, formal royal', icon: '🏰' },
  { id: 'patiyala-set', name: 'Patiyala Kurta Set', category: 'wedding', description: 'Kurta + Patiyala pants + dupatta — haldi/mehendi staple', promptKeywords: 'kurta with Patiyala salwar pants and dupatta, festive vibrant wedding function', icon: '🎊' },
];
