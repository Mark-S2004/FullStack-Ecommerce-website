import { HttpException } from '@exceptions/HttpException';
import productModel from '@models/products.model';
import { Product } from '@interfaces/products.interface';
import { CreateProductDto } from '@dtos/products.dto';

class ProductService {
  public products = productModel;

  public async findAllProduct(category?: string): Promise<Product[]> {
    const query = category ? { category: category } : {};
    const products: Product[] = await this.products.find(query);
    return products;
  }

  public async searchProducts(searchTerm: string): Promise<Product[]> {
    // Create a case-insensitive regex search
    const regex = new RegExp(searchTerm, 'i');
    const products: Product[] = await this.products.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    });
    return products;
  }

  public async getAllCategories(): Promise<string[]> {
    // Get distinct categories from products
    const categories: string[] = await this.products.distinct('category');
    return categories.filter(cat => cat && cat.trim() !== '');
  }

  public async findProductByName(productName: string): Promise<Product> {
    const findProduct: Product = await this.products.findOne({ name: productName });
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");

    return findProduct;
  }

  public async createProduct(productData: CreateProductDto): Promise<Product> {
    const findProduct: Product = await this.products.findOne({ name: productData.name });
    if (findProduct) throw new HttpException(409, `This name ${productData.name} already exists`);

    // Set originalPrice if not already set (e.g., by discount logic)
    const dataToCreate: any = { ...productData };
    if (typeof dataToCreate.originalPrice === 'undefined') {
      dataToCreate.originalPrice = productData.price;
    }
    if (typeof dataToCreate.discountPercentage === 'undefined') {
        dataToCreate.discountPercentage = 0;
    }

    const createProductData: Product = await this.products.create(dataToCreate);
    return createProductData;
  }

  public async updateProduct(productName: string, productData: CreateProductDto): Promise<Product> {
    if (productData.name !== productName) {
      const findProductWithNewName: Product = await this.products.findOne({ name: productData.name });
      if (findProductWithNewName && findProductWithNewName.name !== productName) {
        throw new HttpException(409, `Product name ${productData.name} already exists`);
      }
    }

    // When updating, ensure originalPrice is handled correctly if price is changed directly
    // For simplicity, we assume direct price updates might reset discount implicitly
    // or admin uses discount functions.
    const updateData: any = { ...productData };
    
    // Ensure category is never missing or empty
    if (!updateData.category || updateData.category.trim() === '') {
      updateData.category = 'Uncategorized';
      console.log(`Setting default category 'Uncategorized' for product ${productName}`);
    }
    
    if (productData.price !== undefined && (productData.discountPercentage === undefined || productData.discountPercentage === 0)) {
        // If price is changed and no discount, assume it's the new base price
        updateData.originalPrice = productData.price;
        updateData.discountPercentage = 0;
    }

    const updateProductByName: Product = await this.products.findOneAndUpdate({ name: productName }, { $set: updateData }, { new: true });
    if (!updateProductByName) throw new HttpException(409, "Product doesn't exist");
    return updateProductByName;
  }

  public async deleteProduct(productName: string): Promise<Product> {
    const deleteProductByName: Product = await this.products.findOneAndDelete({ name: productName });
    if (!deleteProductByName) throw new HttpException(409, "Product doesn't exist");

    return deleteProductByName;
  }

  public async addReview(productName: string, userId: string, reviewData: { rating: number; comment: string }): Promise<Product> {
    const product = await this.findProductByName(productName);
    if (!product) throw new HttpException(404, 'Product not found');

    const alreadyReviewed = product.reviews.some(review => review.user.toString() === userId.toString());
    if (alreadyReviewed) {
      throw new HttpException(400, 'You have already reviewed this product');
    }

    const review = {
      user: userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    product.reviewCount = product.reviews.length;
    product.totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);

    await product.save();
    return product;
  }

  // Simple review deletion by Admin
  public async deleteReview(productName: string, reviewId: string): Promise<Product> {
    const product = await this.findProductByName(productName);
    if (!product) throw new HttpException(404, 'Product not found');

    const reviewIndex = product.reviews.findIndex(review => review._id.toString() === reviewId);
    if (reviewIndex === -1) {
      throw new HttpException(404, 'Review not found on this product');
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);

    // Recalculate review count and total rating
    product.reviewCount = product.reviews.length;
    product.totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);

    await product.save();
    return product;
  }

  // --- Discount Methods (Admin only) ---
  public async applyDiscount(productName: string, discountPercentage: number): Promise<Product> {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new HttpException(400, 'Discount percentage must be between 0 and 100');
    }
    const product = await this.findProductByName(productName);
    if (!product) throw new HttpException(404, 'Product not found');

    // Ensure originalPrice is set, if not, use current price
    if (typeof product.originalPrice !== 'number' || product.originalPrice <= 0) {
        product.originalPrice = product.price;
    }

    product.discountPercentage = discountPercentage;
    product.price = product.originalPrice * (1 - discountPercentage / 100);

    await product.save();
    return product;
  }

  public async removeDiscount(productName: string): Promise<Product> {
    const product = await this.findProductByName(productName);
    if (!product) throw new HttpException(404, 'Product not found');

    if (typeof product.originalPrice === 'number' && product.originalPrice > 0) {
      product.price = product.originalPrice;
    }
    // Else, if originalPrice is not set, we can't revert. Price remains as is.
    // This scenario should ideally be prevented by setting originalPrice on product creation/update.

    product.discountPercentage = 0;

    await product.save();
    return product;
  }
}

export default ProductService; 