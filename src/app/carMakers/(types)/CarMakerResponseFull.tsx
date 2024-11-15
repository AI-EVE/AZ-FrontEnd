export interface CarMakerResponseFull {
  id: number;
  name: string;
  logoUrl: string;
  carModels: {
    id: number;
    name: string;
    carGenerations: {
      id: number;
      name: string;
    }[];
  }[];
}
