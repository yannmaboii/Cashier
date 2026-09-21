export class CreateCustomerDto {
  nama: string;
  telepon?: string;
  email?: string;
  alamat?: string;
}

export class UpdateCustomerDto {
  nama?: string;
  telepon?: string;
  email?: string;
  alamat?: string;
}