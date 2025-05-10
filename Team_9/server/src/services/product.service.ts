import { HttpException } from '@exceptions/HttpException';
import productModel from '@models/products.model';
import { Product } from '@interfaces/products.interface';
import { CreateProductDto } from '@dtos/products.dto';
import { Service } from 'typedi';
@Service()
class ProductService {
  public products = productModel;

  public async findAllProduct(category?: string, searchTerm?: string): Promise<Product[]> {
    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
    }
    const products: Product[] = await this.products.find(query);
    return products;
  }

  public async findProductByName(productName: string): Promise<Product> {
    const findProduct: Product = await this.products.findOne({ name: productName });
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");

    return findProduct;
  }

  public async findProductById(productId: string): Promise<Product> {
    try {
      const findProduct: Product = await this.products.findById(productId);
      if (!findProduct) throw new HttpException(404, "Product doesn't exist");
      return findProduct;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new HttpException(400, "Invalid product ID format");
      }
      throw error;
    }
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

  public async getUniqueCategories(): Promise<string[]> {
    const categories: string[] = await this.products.distinct('category');
    // Filter out null, undefined, or empty/whitespace-only strings
    return categories.filter(category => category && category.trim() !== '').sort();
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

    // --- BEGIN DIAGNOSTIC LOG ---
    console.log('[Service/addReview] About to save product. Product ID:', product._id, 'Type:', typeof product._id);
    console.log('[Service/addReview] Product object (partial):', { name: product.name, category: product.category, _id: product._id });
    // --- END DIAGNOSTIC LOG ---

    await product.save();
    return product;
  }

  // Add review by product ID instead of name
  public async addReviewById(productId: string, userId: string, reviewData: { rating: number; comment: string }): Promise<Product> {
    try {
      console.log('[DEBUG] addReviewById called with:', { productId, userId });
      
      // Validate input
      if (!productId || !userId) {
        throw new HttpException(400, "Product ID and user ID are required");
      }
      
      // Find the product by ID
      const product = await this.products.findById(productId);
      if (!product) {
        console.log('[DEBUG] Product not found for ID:', productId);
        throw new HttpException(404, "Product not found");
      }
      
      console.log('[DEBUG] Product found:', product.name, 'ID:', product._id);
      
      // Check if user already reviewed this product
      const alreadyReviewed = product.reviews && product.reviews.some(review => 
        review.user && review.user.toString() === userId.toString()
      );
      
      if (alreadyReviewed) {
        console.log('[DEBUG] User already reviewed this product');
        throw new HttpException(400, "You have already reviewed this product");
      }
      
      // Create the review object
      const review = {
        user: userId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date()
      };
      
      // Initialize reviews array if it doesn't exist
      if (!product.reviews) {
        product.reviews = [];
      }
      
      // Add the review
      product.reviews.push(review);
      
      // Update review stats
      product.reviewCount = product.reviews.length;
      product.totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      
      // Save the updated product
      await product.save();
      console.log('[DEBUG] Product updated with review');
      
      return product;
    } catch (error) {
      console.error('[DEBUG] Error in addReviewById:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Error adding review: ${error.message}`);
    }
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