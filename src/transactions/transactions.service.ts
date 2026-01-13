import { Between, FindManyOptions, Repository } from 'typeorm';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns'
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
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

    await this.productRepository.manager.transaction(async (transactionEntityManager) => {
      
      const transaction = new Transaction()
      transaction.total = createTransactionDto.contents.reduce( (total, item) => total + (item.quantity * item.price) , 0 )
  
      for(const contents of createTransactionDto.contents) {
        const product = await transactionEntityManager.findOneBy( Product, {id: contents.productId} )
        if (!product) {
          throw new BadRequestException(`Producto con id ${contents.productId} no encontrado`)
        }
        if (contents.quantity > product.inventory) {
          throw new BadRequestException(`El artículo ${product.name} excede la cantidad disponible`)
        }
        product.inventory -= contents.quantity

        const transactionContent = new TransactionContents()
        transactionContent.price = contents.price
        transactionContent.product = product
        transactionContent.quantity = contents.quantity
        transactionContent.transaction = transaction

        await transactionEntityManager.save(transaction)
        await transactionEntityManager.save(transactionContent)
      }
    })
    
    return "Venta almacenada con Éxito";
  }

  findAll(transactionDate?: string) {
    const options : FindManyOptions<Transaction> = {
      relations: {
        contents: true
      }
    }
    if(transactionDate) {
      const date = parseISO(transactionDate)
      if(!isValid(date)) {
        throw new BadRequestException('Fecha no válida')
      }
      const start = startOfDay(date)
      const end = endOfDay(date)
      options.where = {
        transactionDate: Between(start, end)
      }
    }
    return this.transactionRepository.find(options)
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
