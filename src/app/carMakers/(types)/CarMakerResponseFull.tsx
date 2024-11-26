export interface CarMakerResponseFull {
  id: number;
  name: string;
  logo: string;
  carModels: {
    id: number;
    name: string;
    carGenerations: {
      id: number;
      name: string;
    }[];
  }[];
}
