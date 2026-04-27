// src/renderer/src/theme/index.ts
import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

export const createTechTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary:    { main: '#ff7722' },   // Your professional orange
            secondary:  { main: '#f50057' },
            background: { 
              default: '#070707', // Slightly deeper black for contrast
              paper: '#121212'    // Card background
            },
            text:       { primary: '#f0f0f0', secondary: '#a0a0a0' },
          }
        : {
            primary:    { main: '#1565c0' },
            secondary:  { main: '#d81b60' },
            background: { default: '#f3f3f3', paper: '#ffffff' },
            text:       { primary: '#1a1a1a', secondary: '#5f6368' },
            divider:    'rgba(0,0,0,0.06)',
          }),
    },
    typography: {
      // Using Segoe UI Variable for a more modern Windows 11 feel
      fontFamily: '"Segoe UI Variable Text", "Segoe UI", "Roboto", "Helvetica", sans-serif',
      h5: { fontWeight: 600, letterSpacing: '0.2px' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 8, // Standard Windows 11 curve
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            boxShadow: 'none', // Flat enterprise design
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            color: '#fff', // Ensure white text on orange buttons
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.08)',
          }
        }
      }
    }
  })