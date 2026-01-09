import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>
  ){}
  
  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = new Transaction()
    transaction.total = createTransactionDto.total
    await this.transactionRepository.save(transaction)

    for(const contents of createTransactionDto.contents) {
      const product = await this.productRepository.findOneBy({id: contents.productId})
      if (!product) {
        throw new BadRequestException(`Producto con id ${contents.productId} no encontrado`)
      }
      if (contents.quantity > product.inventory) {
        throw new BadRequestException(`El artículo ${product.name} excede la cantidad disponible`)
      }
      product.inventory -= contents.quantity
      await this.productRepository.save(product)
      const txContent = this.transactionContentRepository.create({ ...contents })
      txContent.transaction = transaction
      txContent.product = product
      await this.transactionContentRepository.save(txContent)
    }
    
    return "Venta almacenada con Éxito"
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
