import { useForm } from 'react-hook-form';

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  imageUrl: string;
  stock: number;
};

const ProductForm = ({
  onSubmit,
  initialData = {},
}: {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
}) => {
  const { register, handleSubmit } = useForm<ProductFormData>({ defaultValues: initialData });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      <textarea {...register('description')} placeholder="Description" />
      <input type="number" {...register('price')} placeholder="Price" />
      <input {...register('category')} placeholder="Category" />
      <input {...register('gender')} placeholder="Gender" />
      <input {...register('imageUrl')} placeholder="Image URL" />
      <input type="number" {...register('stock')} placeholder="Stock" />
      <button type="submit">Save</button>
    </form>
  );
};

export default ProductForm;
