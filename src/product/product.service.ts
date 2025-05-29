import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class ProductService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
  ) {
    this.logger = winstonLogger.child({
      service: 'ProductService',
    });
  }

  async findAll(): Promise<Product[]> {
    try {
      this.logger.info('Fetching all products');
      const cachedProducts =
        await this.cacheManager.get<Product[]>('all_products');
      if (cachedProducts) {
        this.logger.info('Products found in cache');
        return cachedProducts;
      }

      const products = await this.productRepository.find();
      await this.cacheManager.set('all_products', products, 60);
      this.logger.info('Products found in database');
      return products;
    } catch (error) {
      this.logger.error('Error fetching products:', error);
      throw new BadRequestException('Error fetching products');
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      this.logger.info(`Fetching product with id ${id}`);
      const cacheKey = `product_${id}`;
      const cachedProduct = await this.cacheManager.get<Product>(cacheKey);
      if (cachedProduct) {
        this.logger.info(`Product with id ${id} found in cache`);
        return cachedProduct;
      }

      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        this.logger.info(`Product with id ${id} not found`);
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      await this.cacheManager.set(cacheKey, product, 60);
      this.logger.info(`Product with id ${id} found in database`);
      return product;
    } catch (error) {
      this.logger.error(`Error fetching product with id ${id}:`, error);
      throw new BadRequestException(`Error fetching product with id ${id}`);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      this.logger.info('Creating new product');
      const product = this.productRepository.create(createProductDto);
      const savedProduct = await this.productRepository.save(product);
      // Update both individual product cache and all products cache
      await this.cacheManager.del('all_products');
      await this.cacheManager.set(
        `product_${savedProduct.id}`,
        savedProduct,
        60,
      );
      this.logger.info('Product created successfully');
      return savedProduct;
    } catch (error) {
      this.logger.error('Error creating product:', error);
      throw new BadRequestException('Error creating product');
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      this.logger.info(`Updating product with id ${id}`);
      const existingProduct = await this.findOne(id);
      if (!existingProduct) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      await this.productRepository.update(id, updateProductDto);
      const updatedProduct = await this.findOne(id);
      // Update both caches
      await this.cacheManager.del('all_products');
      await this.cacheManager.set(`product_${id}`, updatedProduct, 60);
      this.logger.info(`Product with id ${id} updated successfully`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Error updating product with id ${id}:`, error);
      throw new BadRequestException(`Error updating product with id ${id}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.info(`Deleting product with id ${id}`);
      const product = await this.findOne(id);
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      await this.productRepository.delete(id);
      await this.cacheManager.del('all_products');
      await this.cacheManager.del(`product_${id}`);
      this.logger.info(`Product with id ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting product with id ${id}:`, error);
      throw new BadRequestException(`Error deleting product with id ${id}`);
    }
  }
}
