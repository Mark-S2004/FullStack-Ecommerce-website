import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Define the Order type
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
};

// Mock API function - replace with actual API call
const fetchOrders = async (): Promise<Order[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data
  return [
    {
      id: 'ORD-001',
      date: '2023-05-15',
      status: 'delivered' as OrderStatus,
      total: 156.99,
      items: [
        { id: 'P1', name: 'Running Shoes', price: 89.99, quantity: 1 },
        { id: 'P2', name: 'Sports T-Shirt', price: 34.99, quantity: 2 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2023-06-22',
      status: 'processing' as OrderStatus,
      total: 75.99,
      items: [
        { id: 'P3', name: 'Yoga Mat', price: 45.99, quantity: 1 },
        { id: 'P4', name: 'Water Bottle', price: 15.00, quantity: 2 }
      ]
    }
  ];
};

const statusColors: Record<OrderStatus, "warning" | "info" | "success" | "error"> = {
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error'
};

// Row component to handle expansion
const OrderRow = ({ order }: { order: Order }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {order.id}
        </TableCell>
        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
        <TableCell>
          <Chip 
            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
            color={statusColors[order.status]}
            size="small"
          />
        </TableCell>
        <TableCell align="right">${order.total.toFixed(2)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Order Items
              </Typography>
              <Table size="small" aria-label="items">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}><strong>Total</strong></TableCell>
                    <TableCell align="right">
                      <strong>${order.total.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OrdersPage = () => {
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading orders. Please try again.
      </Typography>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box textAlign="center" my={4}>
        <Typography variant="h6">
          You haven't placed any orders yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order: Order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrdersPage; 