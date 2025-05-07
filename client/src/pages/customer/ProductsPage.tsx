import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import Loader from "@components/common/Loader"

const ProductsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get("/api/products")
      return data
    },
  })

  if (isLoading) return <Loader />

  return <pre>{JSON.stringify(data.data, null, 2)}</pre>
}

export default ProductsPage
