import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatCurrencry } from "../utils/helper";
import { ReviewTypes } from "../utils/interfaces";
import ImageLazy from "./UI/lazy-image";

export type Product = {
  _id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  description: string;
  qty: number;
  createdAt: Date;
  reviews: ReviewTypes[];
  price_sale: number;
};

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  return (
    <Card
      className="my-3 p-3 rounded"
      style={{
        height: "320px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {product.price !== product.price_sale && (
        <div className="discount-badge">{`Giảm ${Math.round(
          ((product.price - product.price_sale) / product.price) * 100
        )}%`}</div>
      )}
      <Link to={`/products/${product._id}`}>
        <ImageLazy
          imageUrl={product.image}
          style={{
            height: "200px",
            width: "250px",
            objectFit: "contain",
          }}
        />

        <Card.Body style={{ textAlign: "center" }}>
          <Card.Title className="mb-4">
            <span className="fs-2">{product.name}</span>
            <br />
            {product.price !== product.price_sale && (
              <span
                className="text-muted "
                style={{ textDecoration: "line-through" }}
              >
                {formatCurrencry(product.price)}
              </span>
            )}
            <span style={{ color: "#d10000" }}>
              {` ${formatCurrencry(product.price_sale)}`}
            </span>
          </Card.Title>
        </Card.Body>
      </Link>
    </Card>
  );
};

export default ProductCard;
