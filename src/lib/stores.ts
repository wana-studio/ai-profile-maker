import { create } from "zustand";
import type { FaceProfile, GeneratedPhoto, Style } from "@/lib/db/schema";

// Subscription store
interface SubscriptionState {
  tier: "free" | "pro";
  generationsRemaining: number;
  generationsThisMonth: number;
  isLoading: boolean;
  setTier: (tier: "free" | "pro") => void;
  setGenerationsRemaining: (count: number) => void;
  setGenerationsThisMonth: (count: number) => void;
  decrementGenerations: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  tier: "free",
  generationsRemaining: 5,
  generationsThisMonth: 0,
  isLoading: true,
  setTier: (tier) => set({ tier }),
  setGenerationsRemaining: (count) => set({ generationsRemaining: count }),
  setGenerationsThisMonth: (count) => set({ generationsThisMonth: count }),
  decrementGenerations: () =>
    set((state) => ({
      generationsRemaining: Math.max(0, state.generationsRemaining - 1),
      generationsThisMonth: state.generationsThisMonth + 1,
    })),
}));

// Face profiles store
interface FaceProfilesState {
  profiles: FaceProfile[];
  selectedProfile: FaceProfile | null;
  isLoading: boolean;
  setProfiles: (profiles: FaceProfile[]) => void;
  addProfile: (profile: FaceProfile) => void;
  removeProfile: (id: string) => void;
  selectProfile: (profile: FaceProfile | null) => void;
}

export const useFaceProfilesStore = create<FaceProfilesState>((set) => ({
  profiles: [],
  selectedProfile: null,
  isLoading: true,
  setProfiles: (profiles) => set({ profiles, isLoading: false }),
  addProfile: (profile) =>
    set((state) => ({ profiles: [...state.profiles, profile] })),
  removeProfile: (id) =>
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
    })),
  selectProfile: (profile) => set({ selectedProfile: profile }),
}));

// Create flow store
export type RealismLevel = "natural" | "enhanced" | "hot" | "glowup";

interface CreateFlowState {
  step: number;
  selectedFaceProfile: FaceProfile | null;
  selectedStyle: Style | null;
  energyLevel: number;
  realismLevel: RealismLevel;
  options: {
    changeOutfit: boolean;
    changeHairstyle: boolean;
    addGlasses: boolean;
    addBeard: boolean;
    hairStyle: string | null;
  };
  isGenerating: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setSelectedFaceProfile: (profile: FaceProfile | null) => void;
  setSelectedStyle: (style: Style | null) => void;
  setEnergyLevel: (level: number) => void;
  setRealismLevel: (level: RealismLevel) => void;
  setOption: (
    key: keyof CreateFlowState["options"],
    value: boolean | string | null
  ) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useCreateFlowStore = create<CreateFlowState>((set) => ({
  step: 1,
  selectedFaceProfile: null,
  selectedStyle: null,
  energyLevel: 50,
  realismLevel: "natural",
  selectedHairstyle: null,
  options: {
    changeOutfit: false,
    changeHairstyle: false,
    addGlasses: false,
    addBeard: false,
    hairStyle: null,
  },
  isGenerating: false,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(4, state.step + 1) })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  reset: () =>
    set({
      step: 1,
      selectedFaceProfile: null,
      selectedStyle: null,
      energyLevel: 50,
      realismLevel: "natural",
      options: {
        changeOutfit: false,
        changeHairstyle: false,
        addGlasses: false,
        addBeard: false,
        hairStyle: null,
      },
      isGenerating: false,
    }),
  setSelectedFaceProfile: (profile) => set({ selectedFaceProfile: profile }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setEnergyLevel: (level) => set({ energyLevel: level }),
  setRealismLevel: (level) => set({ realismLevel: level }),
  setOption: (key, value) =>
    set((state) => ({
      options: { ...state.options, [key]: value },
    })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

// Gallery store
type Category =
  | "work"
  | "dating"
  | "social"
  | "anonymous"
  | "creative"
  | "travel";

interface GalleryState {
  photos: GeneratedPhoto[];
  selectedCategory: Category | "all";
  isLoading: boolean;
  setPhotos: (photos: GeneratedPhoto[]) => void;
  addPhoto: (photo: GeneratedPhoto) => void;
  updatePhoto: (id: string, updates: Partial<GeneratedPhoto>) => void;
  removePhoto: (id: string) => void;
  setSelectedCategory: (category: Category | "all") => void;
  toggleFavorite: (id: string) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  photos: [],
  selectedCategory: "all",
  isLoading: true,
  setPhotos: (photos) => set({ photos, isLoading: false }),
  addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
  updatePhoto: (id, updates) =>
    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
    })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleFavorite: (id) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      ),
    })),
}));

// Modal store
interface ModalState {
  isSubscriptionModalOpen: boolean;
  isEnhancementModalOpen: boolean;
  isSignInModalOpen: boolean;
  selectedPhotoForEnhancement: GeneratedPhoto | null;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  openEnhancementModal: (photo: GeneratedPhoto) => void;
  closeEnhancementModal: () => void;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isSubscriptionModalOpen: false,
  isEnhancementModalOpen: false,
  isSignInModalOpen: false,
  selectedPhotoForEnhancement: null,
  openSubscriptionModal: () => set({ isSubscriptionModalOpen: true }),
  closeSubscriptionModal: () => set({ isSubscriptionModalOpen: false }),
  openEnhancementModal: (photo) =>
    set({
      isEnhancementModalOpen: true,
      selectedPhotoForEnhancement: photo,
    }),
  closeEnhancementModal: () =>
    set({
      isEnhancementModalOpen: false,
      selectedPhotoForEnhancement: null,
    }),
  openSignInModal: () => set({ isSignInModalOpen: true }),
  closeSignInModal: () => set({ isSignInModalOpen: false }),
}));
