export class CreateCustomerDto {
  nama: string;
  telepon?: string;
  email?: string;
}

export class UpdateCustomerDto {
  nama?: string;
  telepon?: string;
  email?: string;
}