export class CekOngkirDto {
  origin: number;
  destination: number;
  weight: number;
  courier: string;
  price?: 'lowest' | 'highest';
}