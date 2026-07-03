import { useCallback, useEffect } from 'react'
import { Joyride, EVENTS, STATUS } from 'react-joyride'
import type { EventData } from 'react-joyride'
import { useAuthStore } from '@/stores/authStore'
import { useTourStore } from '@/stores/tourStore'
import { markOnboarded } from '@/services/profileService'
import { tourStepsForRole } from './tourSteps'

// Design-system colours matched to index.css :root tokens
const PRIMARY  = '#4F46E5'
const INK      = '#0F172A'
const MUTED    = '#475569'
const OVERLAY  = 'rgba(15, 23, 42, 0.45)'

export function OnboardingTour() {
  const { user, profile, role } = useAuthStore()
  const { run, startTour, stopTour } = useTourStore()

  // Auto-start once for first-time users (onboarded flag is false after migration)
  useEffect(() => {
    if (user && profile && !profile.onboarded && !run) {
      startTour()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.onboarded])

  const handleEvent = useCallback(async (data: EventData) => {
    // TOUR_END fires once when the tour finishes (Done) or is skipped
    if (data.type === EVENTS.TOUR_END) {
      stopTour()
      // Only persist the first time — replays skip this
      if (user && !profile?.onboarded) {
        try {
          await markOnboarded(user.id)
          useAuthStore.setState(s => ({
            profile: s.profile ? { ...s.profile, onboarded: true } : s.profile,
          }))
        } catch {
          // Non-critical — worst case is the tour re-shows on next hard reload
        }
      }
    }
  }, [user?.id, profile?.onboarded, stopTour])

  if (!role || !user) return null

  const steps = tourStepsForRole(role)

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      locale={{
        back:  'Back',
        close: 'Close',
        last:  'Done',
        next:  'Next →',
        skip:  'Skip tour',
      }}
      options={{
        primaryColor:        PRIMARY,
        backgroundColor:     '#ffffff',
        textColor:           INK,
        overlayColor:        OVERLAY,
        zIndex:              10000,
        skipBeacon:          true,
        showProgress:        true,
        buttons:             ['back', 'close', 'primary', 'skip'],
        spotlightRadius:     12,
        overlayClickAction:  false,
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          boxShadow:    '0 8px 32px rgba(0,0,0,0.12)',
          padding:      '20px 24px',
          fontFamily:   'inherit',
        },
        tooltipTitle: {
          fontSize:     15,
          fontWeight:   700,
          marginBottom: 4,
          color:        INK,
        },
        tooltipContent: {
          fontSize:   13.5,
          padding:    '4px 0 0',
          color:      MUTED,
          lineHeight: '1.55',
        },
        buttonPrimary: {
          borderRadius: 10,
          fontSize:     13,
          fontWeight:   600,
          padding:      '7px 16px',
        },
        buttonBack: {
          borderRadius: 10,
          fontSize:     13,
          fontWeight:   500,
          color:        MUTED,
          marginRight:  8,
        },
        buttonSkip: {
          borderRadius: 10,
          fontSize:     13,
          color:        '#94a3b8',
        },
      }}
      onEvent={handleEvent}
    />
  )
}
