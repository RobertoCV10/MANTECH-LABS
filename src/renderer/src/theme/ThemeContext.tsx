//src/renderer/src/theme/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type ThemeMode = 'dark' | 'light'

export interface ThemeColors {
  // Acentos principales
  cyan:          string
  cyanDim:       string
  cyanBorder:    string
  green:         string
  greenDim:      string
  greenBorder:   string
  purple:        string
  red:           string
  orange:        string
  // Superficies genéricas
  surface:       string
  surfaceBorder: string
  // Sidebar
  sidebarBg:     string
  sidebarBorder: string
  sidebarHover:  string
  sidebarSelected: string
  // Texto
  textMuted:     string
  textSubtle:    string
}

interface ThemeContextType {
  mode:        ThemeMode
  toggleTheme: () => void
  colors:      ThemeColors
}

const darkColors: ThemeColors = {
  // Acentos con "Luminancia Controlada"
  // He mantenido tu naranja pero optimizando sus variantes para que "brillen"
  cyan:           '#ff7722', 
  cyanDim:        'rgba(255, 119, 34, 0.06)',
  cyanBorder:     'rgba(255, 119, 34, 0.20)', 
  
  green:          '#4ade80',
  greenDim:       'rgba(74, 222, 128, 0.05)',
  greenBorder:    'rgba(74, 222, 128, 0.15)',
  
  purple:         '#a78bfa', // Un tono un poco más pastel para que no se pierda en el negro
  red:            '#f87171', // Rojo un poco más suave para evitar vibración visual
  orange:         '#c74e03',
  
  // SUPERFICIES (El secreto del Look Obsidian)
  // En lugar de opacidad pura, usamos colores sólidos muy oscuros para evitar que se 
  // mezclen los colores de fondo con el contenido.
  surface:        '#111112', // Gris obsidiana para las cards
  surfaceBorder:  'rgba(255, 255, 255, 0.06)', // Bordes tipo "hilo de luz"
  
  // SIDEBAR (Profundidad absoluta)
  sidebarBg:      '#080809', // No es negro puro, es "Deep Charcoal"
  sidebarBorder:  'rgba(255, 255, 255, 0.04)',
  sidebarHover:   'rgba(255, 255, 255, 0.03)',
  sidebarSelected: 'rgba(255, 119, 34, 0.08)', 
  
  // TEXTO (Jerarquía de lectura)
  textMuted:      '#ececed', // Blanco "off-white" para títulos (más suave que el puro)
  textSubtle:     '#94a3b8', // Gris azulado para descripciones (estilo VS Code/Linear)
}

const lightColors: ThemeColors = {
  // Un azul más vibrante (tipo Microsoft/Fluent)
  cyan:            '#0067C0', 
  cyanDim:         '#E5F1FB', // Fondo sutil para botones secundarios
  cyanBorder:      '#CCE4F7', 
  
  // Semántica clara
  green:           '#107C10', // Verde estándar de "Success"
  greenDim:        '#DFF6DD',
  greenBorder:     '#B1E5C1',
  
  purple:          '#5C2D91',
  red:             '#D13438', // Rojo de alerta (no tan oscuro, más "señal")
  orange:          '#CA5010', // Naranja que se diferencia bien del rojo
  
  // Superficies
  surface:         '#FFFFFF',
  surfaceBorder:   '#EDEBE9',
  
  // Sidebar (Limpieza total)
  sidebarBg:       '#F3F2F1',
  sidebarBorder:   '#E1DFDD',
  sidebarHover:    '#EDEBE9',
  sidebarSelected: '#FFFFFF', // El ítem seleccionado "flota" sobre el fondo
  
  // TEXTO (Aquí estaba el fallo principal)
  textMuted:       '#323130', // Gris muy oscuro (Para descripciones y párrafos)
  textSubtle:      '#605E5C', // Gris medio (Para etiquetas secundarias, no menos de esto)
}

const ThemeContext = createContext<ThemeContextType>({
  mode:        'dark',
  toggleTheme: () => {},
  colors:      darkColors,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    (localStorage.getItem('themeMode') as ThemeMode) ?? 'dark'
  )

  useEffect(() => {
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const toggleTheme = () => setMode(prev => prev === 'dark' ? 'light' : 'dark')
  const colors = mode === 'dark' ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeMode = () => useContext(ThemeContext)