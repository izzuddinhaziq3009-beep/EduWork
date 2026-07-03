import { create } from 'zustand'

interface TourState {
  run: boolean
  startTour: () => void
  stopTour:  () => void
}

export const useTourStore = create<TourState>((set) => ({
  run:       false,
  startTour: () => set({ run: true  }),
  stopTour:  () => set({ run: false }),
}))
