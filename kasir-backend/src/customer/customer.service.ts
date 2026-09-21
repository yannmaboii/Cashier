import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto.js';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  findAll() {
    return this.customerRepository.find();
  }

  findOne(id: number) {
    return this.customerRepository.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.customerRepository.findOneBy({ email });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.customerRepository.update(id, updateCustomerDto);
  }

  async updateByEmail(email: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findOneBy({ email });
    if (!customer) return null;
    return this.customerRepository.update(customer.id, updateCustomerDto);
  }

  async updateFotoByEmail(email: string, fotoPath: string) {
    const customer = await this.customerRepository.findOneBy({ email });
    if (!customer) return null;
    return this.customerRepository.update(customer.id, { foto: fotoPath });
  }

  remove(id: number) {
    return this.customerRepository.delete(id);
  }
}