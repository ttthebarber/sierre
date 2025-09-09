export type OrderRow = {
  id: string
  shop: string
  created_at: string
  closed_at: string | null
  currency: string | null
  subtotal_price: number | null
  total_price: number | null
  total_tax: number | null
  total_discounts: number | null
  financial_status: string | null
  fulfillment_status: string | null
  customer_id: string | null
  customer_email: string | null
}

export type OrderItemRow = {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  title: string | null
  sku: string | null
  quantity: number
  price: number | null
}


