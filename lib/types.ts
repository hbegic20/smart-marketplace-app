export type Coordinates = {
  lat: number;
  lng: number;
};

export type Place = {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  businessStatus?: string;
  types?: string[];
  distanceKm?: number;
};

export type RankedPlace = Place & {
  score: number;
  badges: string[];
  why: string;
};

export type RankingInput = {
  intent: string;
  userLocation: Coordinates;
  places: Place[];
};

export type AskAgentRequest = {
  question: string;
  intent: string;
  userLocation: Coordinates;
  rankedPlaces: RankedPlace[];
};
