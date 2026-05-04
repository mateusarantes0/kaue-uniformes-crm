import { create } from 'zustand'
import { EntityType } from '../types'

interface NavStore {
  entity: EntityType
  setEntity: (e: EntityType) => void
}

export const useNavStore = create<NavStore>()((set) => ({
  entity: 'orcamento',
  setEntity: (entity) => set({ entity }),
}))
