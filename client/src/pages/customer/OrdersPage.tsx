import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import Loader from "@components/common/Loader"

const OrdersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axios.get("/api/orders/customer", {
        withCredentials: true,
      })
      return data
    },
  })

  if (isLoading) return <Loader />

  return <pre>{JSON.stringify(data.data, null, 2)}</pre>
}

export default OrdersPage
