import { Product } from "../components/product-card";

export interface Ordertypes {
  _id: string;
  user: string;
  shippingAddress: {
    nameCus?: string;
    address: string;
    city: string;
    phone: string;
    country: string;
  };
  cartItems: Product[];
  totalPrice: number;
  isPaid: boolean;
  createdAt: Date;
  status: "order" | "shipping" | "delivered" | "received" | "cancelled";
}

export type ReviewTypes = {
  _id: string;
  createdAt: Date;
  rating: number;
  comment: string;
  name: string;
  user: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
};

export type AddressTypes = {
  nameCus?: string;
  address: string;
  city: string;
  phone: string;
  country: string;
};
