// import axios from "axios"
import api from '../../lib/axios'
import { useQuery } from "@tanstack/react-query"
import Loader from "@components/common/Loader"

const OrdersPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      // const { data } = await axios.get("/api/orders", {
      //   withCredentials: true,
      // })
      const { data } = await api.get("/orders")
      return data
    },
  })

  if (isLoading) return <Loader />
  if (error) return <pre>Error fetching orders: {JSON.stringify(error, null, 2)}</pre>

  return <pre>{data ? JSON.stringify(data.data, null, 2) : 'No order data'}</pre>
}

export default OrdersPage
