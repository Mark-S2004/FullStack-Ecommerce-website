import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';

interface Product {
  _id: string;
  imageUrl: string;
  name: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card sx={{ maxWidth: 345, margin: 'auto', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
      <CardActionArea component={Link} to={`/customer/products/${product._id}`}>
        <CardMedia
          component="img"
          height="140"
          image={product.imageUrl}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${product.price.toFixed(2)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard; 