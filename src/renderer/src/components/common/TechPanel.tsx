// src/renderer/src/components/common/TechPanel.tsx
import { Box, styled } from '@mui/material';

export const TechPanel = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0f0f0f 0%, #050505 100%)' 
    : '#fff',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.1)'}`,
  borderRadius: '2px', // Bordes afilados, nada de curvas suaves
  padding: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  // El chaflán (corte) industrial en la esquina inferior derecha
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '12px',
    height: '12px',
    background: theme.palette.mode === 'dark' ? '#0a0a0a' : '#eef0f2',
    clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
  }
}));