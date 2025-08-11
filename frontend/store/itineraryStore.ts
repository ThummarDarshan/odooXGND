import { create } from "zustand";
import { Stop } from "@/types/itinerary";

type ItineraryState = {
  stops: Stop[];
  setStops: (stops: Stop[]) => void;
};

export const useItineraryStore = create<ItineraryState>((set) => ({
  stops: [],
  setStops: (stops) => set({ stops }),
}));
