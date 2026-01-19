import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Category } from "../categories/entities/category.entity";
import { Product } from "../products/entities/product.entity";
import { categories } from "./data/categories";
import { products } from "./data/products";

@Injectable()
export class SeederService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        private readonly dataSource: DataSource
    ) {}

    async seed() {
        await this.dataSource.query(`
            TRUNCATE TABLE
            transaction_contents,
            product,
            category
            RESTART IDENTITY
            CASCADE
        `)

        const savedCategories =
            await this.categoryRepository.save(categories)

        for (const seedProduct of products) {
            const category = savedCategories.find(
                c => c.id === seedProduct.categoryId
            )

            if (!category) {
                throw new Error(
                    `Category with id ${seedProduct.categoryId} not found`
                )
            }

            await this.productRepository.save({
                name: seedProduct.name,
                image: seedProduct.image,
                price: seedProduct.price,
                inventory: seedProduct.inventory,
                category
            })
        }
    }
}