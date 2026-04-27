//src/renderer/src/views/OptimizerView.tsx
import { useState } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { useThemeMode } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Cpu, Trash2, Rocket, LayoutGrid } from 'lucide-react';
import { RamInterface } from '../services/optimize/RamInterface';
import { TempInterface } from '../services/optimize/TempInterface';
import { GamingInterface } from '../services/optimize/GamingInterface';

export const OptimizeView = () => {
  const { mode, colors } = useThemeMode();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('ram');

  const tools = [
    { id: 'ram', title: t('optimizer.tools.ram.title'), details: t('optimizer.tools.ram.details'), icon: Cpu },
    { id: 'temp', title: t('optimizer.tools.temp.title'), details: t('optimizer.tools.temp.details'), icon: Trash2 },
    { id: 'game', title: t('optimizer.tools.game.title'), details: t('optimizer.tools.game.details'), icon: Rocket },
  ];

  const active = tools.find(t => t.id === activeTab)!;
  const ActiveIcon = active.icon;

  const renderInterface = (id: string) => {
    switch (id) {
      case 'ram':  return <RamInterface />;
      case 'temp': return <TempInterface />;
      case 'game': return <GamingInterface />;
      default:     return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3, 
      height: '100%',
      width: '100%',
      // Animation for content entry
      animation: 'fadeIn 0.4s ease-out' 
    }}>
      
      {/* HEADER SECTION: Full Width */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', px: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LayoutGrid size={14} color={colors.cyan} style={{ opacity: 0.8 }} />
            <Typography sx={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1.5,
              color: colors.textMuted, textTransform: 'uppercase'
            }}>
              {t('optimizer.title')}
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: mode === 'dark' ? '#fff' : '#000', fontSize: '1.75rem' }}>
            System <span style={{ color: colors.cyan }}>Optimization</span>
          </Typography>
        </Box>

        {/* TABS PILL: Refined for Windows 11 style */}
        <Box sx={{
          display: 'inline-flex', p: 0.5, borderRadius: '12px',
          bgcolor: '#bebebe1f', border: `1px solid ${colors.surfaceBorder}`,
        }}>
          {tools.map((tool) => {
            const isActive = activeTab === tool.id;
            const Icon = tool.icon;
            return (
              <Box
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1,
                  borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: isActive ? colors.surface : 'transparent',
                  color: isActive ? colors.cyan : colors.textSubtle,
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  '&:hover': { color: colors.cyan, bgcolor: !isActive ? 'rgba(255,255,255,0.03)' : colors.surface }
                }}
              >
                <Icon size={16} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }}>
                  {tool.title}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* MAIN CONTENT AREA: Expands to full height/width */}
      <Paper sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        bgcolor: colors.sidebarBg, // Matching sidebar for "App-within-App" feel
        border: `1px solid ${colors.surfaceBorder}`,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Detail Header Strip */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'start', 
          gap: 2,
          background: `linear-gradient(180deg, ${colors.surface} 0%, transparent 100%)`
        }}>
          <Box sx={{
            p: 1.5, borderRadius: 2,
            bgcolor: `${colors.cyan}10`,
            border: `1px solid ${colors.cyan}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${colors.cyan}05`
          }}>
            <ActiveIcon size={24} color={colors.cyan} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.orange, lineHeight: 1.2, mb: 0.5 }}>
              {active.title}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: colors.textMuted, maxWidth: '800px', opacity: 0.8 }}>
              {active.details}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mx: 3, borderColor: colors.surfaceBorder }} />

        {/* TOOL INTERFACE CONTAINER: Where the specific RAM/Temp/Game UI lives */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          overflowY: 'auto',
          // Styled scrollbar for Windows aesthetic
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: colors.surfaceBorder, borderRadius: '10px' }
        }}>
          {renderInterface(activeTab)}
        </Box>
      </Paper>
    </Box>
  );
};