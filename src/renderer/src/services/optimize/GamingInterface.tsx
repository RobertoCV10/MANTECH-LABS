// src/renderer/src/components/GamingInterface.tsx
import { useState, useEffect, useMemo } from 'react'
import { useThemeMode } from '../../theme/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { useNotify } from '../../hooks/useNotify'

import {
  Box, Typography, Button, Alert, Skeleton, alpha, Stack, 
  Tooltip, FormControl, Select, MenuItem, IconButton,
} from '@mui/material'
import {
  Rocket, ShieldCheck, Gauge, BellOff, Gamepad2, Zap, ZapOff, Activity,
  Shield, Plus, Edit2, Trash2
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { RestoreDialog } from './gaming/RestoreDialog'
import { NewPresetDialog } from './gaming/NewPresetDialog'
import { EditPresetDialog } from './gaming/EditPresetDialog'

// Asumimos que estos tipos están definidos globalmente o importados en tu entorno
// type GamingConfig = { ... }
// type MaxStatus = { ... }
// type GamingPreset = { ... }
// type GamingResult = { ... }

type UIState = 'loading' | 'idle' | 'active' | 'applying' | 'restoring'

const ERROR_COLOR = '#ff4444'

const getFeatureMeta = (t: (key: string) => string) => ({
  ultraPower: {
    icon: Gauge,
    label: t('gaming.ultraPower.label'),
    short: t('gaming.ultraPower.label'), // Usamos el label real en lugar del acrónimo "hacker"
    desc: t('gaming.ultraPower.desc'),
    tooltip: t('gaming.ultraPower.tooltip')
  },
  disableWinTelemetry: {
    icon: ShieldCheck,
    label: t('gaming.disableWinTelemetry.label'),
    short: t('gaming.disableWinTelemetry.label'),
    desc: t('gaming.disableWinTelemetry.desc'),
    tooltip: t('gaming.disableWinTelemetry.tooltip')
  },
  silenceNotifications: {
    icon: BellOff,
    label: t('gaming.silenceNotifications.label'),
    short: t('gaming.silenceNotifications.label'),
    desc: t('gaming.silenceNotifications.desc'),
    tooltip: t('gaming.silenceNotifications.tooltip')
  },
  gameMode: {
    icon: Gamepad2,
    label: t('gaming.gameMode.label'),
    short: t('gaming.gameMode.label'),
    desc: t('gaming.gameMode.desc'),
    tooltip: t('gaming.gameMode.tooltip')
  }
}) satisfies Record<keyof GamingConfig, {
  icon: LucideIcon
  label: string
  short: string
  desc: string
  tooltip: string
}>

// 1. Redesigned Module Toggle (Modern Fluent Card)
const ModuleToggle = ({
  featureKey, value, onChange, disabled, applied, hasError, accent, meta
}: {
  featureKey: keyof GamingConfig; value: boolean; onChange: (key: keyof GamingConfig) => void
  disabled: boolean; applied?: boolean; hasError?: boolean; accent: string; meta: any
}) => {
  const { colors, mode } = useThemeMode()
  const Icon = meta.icon
  const statusColor = hasError ? ERROR_COLOR : value ? accent : colors.textMuted

  return (
    <Tooltip title={meta.tooltip} placement="top" arrow>
      <Box
        onClick={() => !disabled && onChange(featureKey)}
        sx={{
          flex: '1 1 150px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          p: 1.5, // Espaciado reducido para acomodarse mejor
          borderRadius: '8px',
          cursor: disabled ? 'default' : 'pointer',
          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
          border: `1px solid ${colors.surfaceBorder}`,
          transition: 'all 0.2s ease',
          
          '&:hover': !disabled ? {
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderColor: value ? accent : alpha(colors.textMuted, 0.4),
          } : {},

          ...(value && {
            borderColor: alpha(accent, 0.4),
            bgcolor: alpha(accent, 0.02),
          }),
          
          ...(applied && !hasError && {
            borderColor: accent,
            boxShadow: `0 4px 12px ${alpha(accent, 0.1)}`,
          }),
          
          ...(hasError && {
            borderColor: alpha(ERROR_COLOR, 0.5),
            bgcolor: alpha(ERROR_COLOR, 0.05),
          })
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Icon size={18} color={statusColor} style={{ opacity: value ? 1 : 0.5 }} />
          
          {/* Fluent-style Custom Switch */}
          <Box sx={{
            width: 32, height: 16, borderRadius: '10px',
            bgcolor: value ? statusColor : alpha(colors.textMuted, 0.2),
            position: 'relative',
            transition: 'background-color 0.2s',
            display: 'flex', alignItems: 'center',
            opacity: disabled ? 0.5 : 1
          }}>
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: value ? (mode === 'dark' ? '#000' : '#fff') : colors.textSubtle,
              position: 'absolute',
              left: value ? '18px' : '4px',
              transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }} />
          </Box>
        </Stack>

        <Box>
          <Typography sx={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: mode === 'dark' ? '#fff' : '#000',
            mb: 0.5
          }}>
            {meta.short}
          </Typography>
          <Typography sx={{ 
            fontSize: '0.7rem', 
            color: colors.textMuted, 
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {meta.desc}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

export const GamingInterface = () => {
  const { mode, colors } = useThemeMode()
  const { t } = useLanguage()
  const ACCENT = colors.green
  const notify = useNotify()

  const [uiState, setUiState] = useState<UIState>('loading')
  const [config, setConfig] = useState<GamingConfig>({
    ultraPower: true,
    disableWinTelemetry: true,
    silenceNotifications: false,
    gameMode: true
  })
  const [status, setStatus] = useState<MaxStatus | null>(null)
  const [appliedConfig, setAppliedConfig] = useState<Partial<GamingConfig>>({})
  const [errors, setErrors] = useState<GamingResult['errors']>([])

  const [presets, setPresets] = useState<GamingPreset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [showNewPresetDialog, setShowNewPresetDialog] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  
  const [editingPreset, setEditingPreset] = useState<GamingPreset | null>(null)
  const [editPresetName, setEditPresetName] = useState('')
  const [editPresetConfig, setEditPresetConfig] = useState<GamingConfig>({
    ultraPower: true,
    disableWinTelemetry: true,
    silenceNotifications: false,
    gameMode: true
  })

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)

  useEffect(() => {
    if (!window.api?.maxGetStatus) {
      setUiState('idle')
      return
    }

    let cancelled = false

    const init = async () => {
      try {
        const response = await window.api.maxGetStatus()
        if (cancelled) return
        if (!response.success) throw new Error(response.error || 'Failed to get status')
        
        const s: MaxStatus = response.data
        setStatus(s)

        if (s.gamingModeActive && s.lastGamingConfig) {
          setConfig(s.lastGamingConfig)
          setAppliedConfig(s.lastGamingConfig)
          setUiState('active')
        } else if (s.lastGamingConfig) {
          setConfig(s.lastGamingConfig)
          setUiState('idle')
        } else {
          setUiState('idle')
        }
      } catch (e) {
        if (!cancelled) setUiState('idle')
      }
    }

    init()

    const loadPresets = async () => {
      try {
        const response = await window.api.maxGetPresets()
        if (response.success) setPresets(response.data || [])
      } catch (e) {}
    }
    loadPresets()

    const unsubBackup = window.api.onMaxBackupCreated?.((data) => {
      notify.info(t('gaming.backup_created') + ` (${new Date(data.createdAt).toLocaleDateString()})`)
    })

    return () => { cancelled = true; unsubBackup?.() }
  }, [])

  const handleToggle = (key: keyof GamingConfig) => {
    if (uiState !== 'idle' && uiState !== 'loading') return
    
    setConfig((prev) => {
      const newConfig = { ...prev, [key]: !prev[key] }
      const matchingPreset = presets.find(p => JSON.stringify(p.config) === JSON.stringify(newConfig))
      setSelectedPresetId(matchingPreset ? matchingPreset.id : null)
      return newConfig
    })
  }

  const handleSelectPreset = (preset: GamingPreset) => {
    if (uiState !== 'idle') return
    setConfig(preset.config)
    setSelectedPresetId(preset.id)
  }

  const handleCreatePreset = async () => {
    if (!newPresetName.trim() || presets.length >= 3) return
    try {
      const response = await window.api.maxAddPreset({ name: newPresetName.trim(), config })
      if (response.success) {
        setPresets([...presets, response.data])
        setSelectedPresetId(response.data.id)
        setShowNewPresetDialog(false)
        setNewPresetName('')
        notify.success(t('gaming.preset_created'))
      }
    } catch (e) {
      notify.error(t('gaming.error_creating_preset'))
    }
  }

  const handleDeletePreset = async (id: string) => {
    try {
      const response = await window.api.maxDeletePreset(id)
      if (response.success) {
        setPresets(presets.filter(p => p.id !== id))
        if (selectedPresetId === id) setSelectedPresetId(null)
        notify.success(t('gaming.preset_deleted'))
      }
    } catch (e) {
      notify.error(t('gaming.error_deleting_preset'))
    }
  }

  const handleOpenEditPreset = (preset: GamingPreset) => {
    setEditingPreset(preset)
    setEditPresetName(preset.name)
    setEditPresetConfig(preset.config)
  }

  const handleSaveEditPreset = async () => {
    if (!editingPreset || !editPresetName.trim()) return
    try {
      const response = await window.api.maxUpdatePreset({
        id: editingPreset.id,
        name: editPresetName.trim(),
        config: editPresetConfig
      })
      if (response.success) {
        setPresets(presets.map(p => p.id === editingPreset.id ? response.data : p))
        setEditingPreset(null)
        notify.success(t('gaming.preset_updated'))
      }
    } catch (e) {
      notify.error(t('gaming.error_updating_preset'))
    }
  }

  const handleApply = async () => {
    if (!Object.values(config).some(Boolean)) return
    setUiState('applying')
    setErrors([])
    try {
      const response = await window.api.maxApply(config)
      if (response.success) {
        const result = response.data
        setAppliedConfig(result.applied)
        setErrors(result.errors)
        setUiState('active')
        if (result.errors?.length > 0) {
          notify.warning(t('gaming.activated_with_warnings'))
        } else {
          notify.success(t('gaming.activated_success'))
        }
      } else {
        setErrors([])
        setUiState('idle')
        notify.error(t('gaming.activate_error'))
      }
    } catch (e) {
      setUiState('idle')
      notify.error(t('gaming.apply_error'))
    }
  }

  const handleDeactivate = async () => {
    setUiState('applying')
    try {
      const response = await window.api.maxRestore()
      if (!response.success) {
        setUiState('active')
        notify.error(response.error || t('gaming.deactivate_error'))
        return
      }
      setAppliedConfig({})
      setErrors([])
      setUiState('idle')
      notify.info(t('gaming.deactivated'))
    } catch (e) {
      setUiState('active')
      notify.error(t('gaming.deactivate_error'))
    }
  }

  const handleRestoreConfirm = async () => {
    setRestoreDialogOpen(false)
    setUiState('restoring')
    try {
      const response = await window.api.maxRestore()
      if (response.success) {
        const fresh = await window.api.maxGetStatus()
        if (fresh.success) setStatus(fresh.data)
        setAppliedConfig({})
        setErrors([])
        setConfig({
          ultraPower: false,
          disableWinTelemetry: false,
          silenceNotifications: false,
          gameMode: false
        })
        setUiState('idle')
        notify.success(t('gaming.restored_success'))
      } else {
        setUiState('active')
        notify.error(response.error || t('gaming.restore_error'))
      }
    } catch (e) {
      setUiState('active')
      notify.error(t('gaming.restore_error'))
    }
  }

  const featureMeta = getFeatureMeta(t)
  const isToggleDisabled = uiState !== 'idle'
  const isApplying = uiState === 'applying' || uiState === 'restoring'
  const isActive = uiState === 'active'

  const activeCount = useMemo(() => Object.values(config).filter(Boolean).length, [config])
  const wasApplied = (key: keyof GamingConfig) => appliedConfig[key] !== undefined
  const hasError = (key: keyof GamingConfig) => errors.some((e) => e.feature === key)

  // Selector rediseñado
  const presetSelectStyle = {
    height: 36,
    fontSize: '0.85rem',
    color: mode === 'dark' ? '#fff' : '#000',
    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: '6px',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
  }

  if (uiState === 'loading') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800 }}>
        <Skeleton variant="rounded" height={64} sx={{ bgcolor: colors.surfaceBorder, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={40} sx={{ bgcolor: colors.surfaceBorder, borderRadius: 1.5 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ bgcolor: colors.surfaceBorder, borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 800, width: '100%' }}>
      
      {/* 2. Diagnostic Header Rediseñado */}
      <Box sx={{ 
        p: 2, 
        borderRadius: '10px', 
        bgcolor: isActive ? alpha(ACCENT, 0.1) : mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${isActive ? alpha(ACCENT, 0.3) : colors.surfaceBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36,
            bgcolor: isActive ? ACCENT : alpha(colors.textMuted, 0.1), 
            borderRadius: '8px',
            color: isActive ? (mode === 'dark' ? '#000' : '#fff') : colors.textMuted
          }}>
            <Rocket size={18} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: mode === 'dark' ? '#fff' : '#000' }}>
              {t('gaming.title')}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.textMuted }}>
              {isActive ? t('gaming.status.status_active') : t('gaming.status.status_idle')}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <Activity size={16} color={isActive ? ACCENT : colors.textMuted} />
           <Typography sx={{ 
             fontSize: '0.8rem', 
             fontWeight: 500, 
             color: isActive ? ACCENT : colors.textMuted 
           }}>
             {isActive ? 'Optimized' : 'Standby'}
           </Typography>
        </Box>
      </Box>

      {/* 3. Preset Selection Hub Limpio */}
      {!isActive && uiState === 'idle' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              displayEmpty
              value={selectedPresetId || ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '__new__') {
                  setShowNewPresetDialog(true)
                } else {
                  const preset = presets.find(p => p.id === val)
                  if (preset) handleSelectPreset(preset)
                }
              }}
              sx={presetSelectStyle}
            >
              <MenuItem value="" disabled sx={{ fontSize: '0.85rem' }}>
                {t('gaming.select_preset')}
              </MenuItem>
              {presets.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.85rem' }}>
                  {p.name}
                </MenuItem>
              ))}
              <MenuItem value="__new__" sx={{ color: ACCENT, fontSize: '0.85rem', fontWeight: 600, mt: 0.5 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Plus size={14} /> {t('gaming.create_preset')}
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Botones de Acción Rápida (Solo visibles si hay un preset seleccionado) */}
          {selectedPresetId && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={t('gaming.edit_preset.description')} arrow placement="top">
                <IconButton 
                  size="small"
                  onClick={() => {
                    const preset = presets.find(p => p.id === selectedPresetId)
                    if (preset) handleOpenEditPreset(preset)
                  }}
                  sx={{ 
                    color: colors.textMuted,
                    borderRadius: '6px',
                    '&:hover': { color: mode === 'dark' ? '#fff' : '#000', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } 
                  }}
                >
                  <Edit2 size={16} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('gaming.delete_preset')} arrow placement="top">
                <IconButton 
                  size="small"
                  onClick={() => handleDeletePreset(selectedPresetId)}
                  sx={{ 
                    color: colors.textMuted,
                    borderRadius: '6px',
                    '&:hover': { color: ERROR_COLOR, bgcolor: alpha(ERROR_COLOR, 0.1) } 
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>
      )}

      {/* 4. The Module Matrix (Adaptado para espacio reducido) */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 1.5 
      }}>
        {(Object.keys(featureMeta) as (keyof GamingConfig)[]).map((key) => (
          <ModuleToggle
            key={key}
            featureKey={key}
            value={config[key]}
            onChange={handleToggle}
            disabled={isToggleDisabled}
            applied={isActive && wasApplied(key)}
            hasError={hasError(key)}
            accent={ACCENT}
            meta={featureMeta[key]}
          />
        ))}
      </Box>

      {/* 5. Action Hub Estilo Nativo */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={isActive ? handleDeactivate : handleApply}
          disabled={isApplying || (!isActive && activeCount === 0)}
          startIcon={isApplying ? <Activity className="animate-spin" size={16} /> : (isActive ? <ZapOff size={16} /> : <Zap size={16} />)}
          sx={{
            py: 1,
            borderRadius: '6px',
            bgcolor: isActive ? alpha(colors.textMuted, 0.1) : ACCENT,
            color: isActive ? (mode === 'dark' ? '#fff' : '#000') : (mode === 'dark' ? '#000' : '#fff'),
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: isActive ? alpha(colors.textMuted, 0.2) : ACCENT,
              filter: isActive ? 'none' : 'brightness(1.1)',
            },
            '&.Mui-disabled': {
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
            }
          }}
        >
          {isActive ? t('gaming.deactivate_button') : t('gaming.apply_button')}
        </Button>

        <Button
          variant="outlined"
          onClick={() => setRestoreDialogOpen(true)}
          disabled={!status?.hasBackup || isApplying}
          startIcon={<Shield size={16} />}
          sx={{
            minWidth: 'fit-content',
            px: 2,
            color: colors.textMuted,
            borderColor: colors.surfaceBorder,
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '6px',
            '&:hover': { 
              color: ERROR_COLOR,
              borderColor: alpha(ERROR_COLOR, 0.5),
              bgcolor: alpha(ERROR_COLOR, 0.05)
            }
          }}
        >
          {t('gaming.restore_button')}
        </Button>
      </Stack>

      <RestoreDialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        onConfirm={handleRestoreConfirm}
      />

      <NewPresetDialog
        open={showNewPresetDialog}
        onClose={() => { setShowNewPresetDialog(false); setNewPresetName('') }}
        onConfirm={() => {
          handleCreatePreset()
          setShowNewPresetDialog(false)
        }}
        presetName={newPresetName}
        onNameChange={setNewPresetName}
        config={config}
        presetsCount={presets.length}
      />

      <EditPresetDialog
        open={!!editingPreset}
        onClose={() => { setEditingPreset(null); setEditPresetName('') }}
        onConfirm={handleSaveEditPreset}
        presetName={editPresetName}
        onNameChange={setEditPresetName}
        config={editPresetConfig}
        onConfigChange={(key, value) => setEditPresetConfig(prev => ({ ...prev, [key]: value }))}
      />
    </Box>
  )
}