export interface SeriesResponse {
  id: number;
  name: string;
  nameKo: string | null;
}

export interface PokemonSetResponse {
  id: number;
  setId: string;
  name: string;
  nameKo: string | null;
  seriesId: number | null;
}
