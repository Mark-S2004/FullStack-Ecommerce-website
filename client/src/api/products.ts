import axios from 'axios';

const API_URL = '/api/products';

export const fetchProducts = async (search: string, category: string, gender: string) => {
  const response = await axios.get(API_URL, {
    params: { search, category, gender },
  });
  return response.data.data;
};

export const getProductById = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
}; 