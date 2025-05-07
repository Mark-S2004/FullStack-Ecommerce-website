import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import Loader from "@components/common/Loader"

const CartPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await axios.get("/api/cart", {
        withCredentials: true,
      })
      return data
    },
  })

  if (isLoading) return <Loader />

  return <pre>{JSON.stringify(data.data, null, 2)}</pre>
}

export default CartPage
