import { create } from 'zustand';

type Location = {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  street: string;
};

type Suggestion = {
  label: string;
  value: Location;
};

type LocationStore = {
  suggestions: Suggestion[];
  selectedLocation: Location | null;
  fetchSuggestions: (query: string) => Promise<void>;
  setSelectedLocation: (location: Location) => void;
  clearSuggestions: () => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
  suggestions: [],
  selectedLocation: null,

  fetchSuggestions: async (query: string) => {
    if (query.length < 3) {
      set({ suggestions: [] });
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5&countrycodes=by&accept-language=ru`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (your.email@example.com)'
      }
    });
    const data = await response.json();

    const suggestions = Array.isArray(data)
      ? data.map((item: any) => ({
          label: item.display_name,
          value: {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city: item.address?.city || item.address?.town || '',
            country: item.address?.country || '',
            street: item.address?.road || '',
          },
        }))
      : [];

    set({ suggestions });
  },

  setSelectedLocation: (location: Location) => set({ selectedLocation: location }),
  clearSuggestions: () => set({ suggestions: [] }),
}));
