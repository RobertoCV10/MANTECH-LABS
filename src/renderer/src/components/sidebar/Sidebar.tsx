//src/renderer/src/components/sidebar/Sidebar.tsx
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useThemeMode } from '../../theme/ThemeContext';
import { useSidebarItems, SIDEBAR_WIDTH } from './sidebarConfig';
import type { SidebarProps } from './Sidebar.types';

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const { mode, colors } = useThemeMode();
  const menuItems = useSidebarItems();

  return (
    <Drawer
  variant="permanent"
  sx={{
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
      width: SIDEBAR_WIDTH,
      boxSizing: 'border-box',
      background: colors.sidebarBg,
      borderRight: `1px solid ${colors.sidebarBorder}`,
      display: 'flex',
      flexDirection: 'column',        // ← permite flex-grow al final
    },
  }}
>
  {/* HEADER */}
  <Box sx={{ px: 2, pt: 3, pb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: colors.cyan, lineHeight: 1.2 }}>
      MANTECH <span style={{ color: mode === 'dark' ? colors.textMuted : colors.textMuted, fontWeight: 300 }}>LABS</span>
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.55, display: 'block', mt: 1, fontSize: '0.65rem', fontWeight: 400 }}>
      v0.8.0 — BETA Access
    </Typography>
    <Box sx={{ mt: 2, height: '1px', background: colors.cyanBorder }} />
  </Box>

  {/* ITEMS PRINCIPALES */}
  <List sx={{ px: 1, mt: 1, flexGrow: 1 }}>
    {menuItems.filter(i => i.id !== 'settings').map((item) => (
      <ListItem key={item.id} disablePadding sx={{ mb: 0 }}>
        <ListItemButton
          selected={currentTab === item.id}
          onClick={() => onTabChange(item.id)}
          sx={{
            borderRadius: 1,
            py: 1,
            px: 2,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&.Mui-selected': {
              bgcolor: 'transparent',
              background: colors.cyanDim,
              '&::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: '20%',
                height: '60%',
                width: 2,
                borderRadius: '2px 0 0 2px',
                background: colors.cyan,
              },
              '& .MuiListItemIcon-root': { color: colors.cyan },
              '& .MuiListItemText-primary': { color: colors.textMuted }
            },
            '&:hover': {
              bgcolor: colors.sidebarHover,
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
            },
            '&.Mui-selected:hover': {
              background: colors.cyanDim,
            }
          }}
        >
          <ListItemIcon sx={{
            minWidth: 40,
            color: currentTab === item.id ? colors.cyan : colors.textMuted,
            transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.82rem',
              fontWeight: currentTab === item.id ? 600 : 400,
              letterSpacing: 0.25,
              color: currentTab === item.id 
                ? colors.textMuted 
                : colors.textSubtle,
              //transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </ListItemButton>
      </ListItem>
    ))}
  </List>

  {/* SETTINGS — fijo al fondo */}
  <Box sx={{ px: 1, pb: 2 }}>
    <Box sx={{ mb: 2, height: '1px', background: colors.surfaceBorder }} />
    {menuItems.filter(i => i.id === 'settings').map((item) => (
      <ListItem key={item.id} disablePadding>
        <ListItemButton
          selected={currentTab === item.id}
          onClick={() => onTabChange(item.id)}
          sx={{
            borderRadius: 1,
            py: 1,
            px: 2,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&.Mui-selected': {
              bgcolor: 'transparent',
              background: colors.cyanDim,
              '&::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: '20%',
                height: '60%',
                width: 2,
                borderRadius: '2px 0 0 2px',
                background: colors.cyan,
              },
              '& .MuiListItemIcon-root': { color: colors.cyan },
            },
            '&:hover': { 
              bgcolor: colors.sidebarHover,
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
            },
          }}
        >
          <ListItemIcon sx={{
            minWidth: 40,
            color: currentTab === item.id ? colors.cyan : colors.textSubtle,
            transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.82rem',
              fontWeight: 400,
              color: currentTab === item.id 
                ? colors.textMuted 
                : colors.textSubtle,
            }}
          />
        </ListItemButton>
      </ListItem>
    ))}
  </Box>
</Drawer>
  );
}