import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAppSelector } from "../../../redux";
import { useNavigate, useParams } from "react-router-dom";
import authAxios from "../../../utils/auth-axios";
import toast from "react-hot-toast";
import { setError } from "../../../utils/error";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";

type FormValues = {
  name: string;
  image: string;
  category: string;
  brand: string;
  price: number;
  description: string;
  qty?: number;
  price_sale?: number;
};
const ProductUpdate = () => {
  const { products } = useAppSelector((state) => state.productFilter);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p._id === id);
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(),
    image: Yup.string().required(),
    category: Yup.string().required(),
    brand: Yup.string().required(),
    price: Yup.number().required(),
    description: Yup.string().required(),
    qty: Yup.number().required(),
    price_sale: Yup.number().required(),
  });
  console.log(product);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...product, // load dữ liệu ban đầu
    },
  });

  useEffect(() => {
    if (product) {
      setImageUrl(product.image || "");
    }
  }, [product]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "shopmilk");
    setLoading(true);
    try {
      const res: any = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_ID
        }/image/upload`,
        formData
      );
      if (res.status == 200) setImageUrl(res.data.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // const priceSaleTouchedRef = useRef(false);

  // useEffect(() => {
  //   if (!priceSaleTouchedRef.current) {
  //     setValue("price_sale", price);
  //   }
  // }, [price, setValue]);

  const onSubmit = (data: FormValues) => {
    const price = watch("price");
    const price_sale = watch("price_sale");
    if (price_sale !== undefined && price_sale > price) {
      toast.error("Price sale must be less than price");
      return;
    }
    authAxios
      .put(`/products/${product?._id}`, { ...data, image: imageUrl })
      .then((res) => {
        toast.success("Product has beend updated");
        navigate("/dashboard/product-list");
      })
      .catch((err) => toast.error(setError(err)));
  };

  return (
    <>
      <Row className=" justify-content-center py-6">
        <Col lg={5} md={6}>
          <Card>
            <h1 className="text-center text-primary my-3">Update Product</h1>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="product name"
                    {...register("name", {
                      value: product?.name,
                    })}
                    className={errors.name?.message && "is-invalid"}
                  />
                  <p className="invalid-feedback">{errors.name?.message}</p>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Image</Form.Label>
                  {/* <Form.Control
                    type="text"
                    placeholder="image url"
                    {...register("image", {
                      value: product?.image,
                    })}
                    className={errors.image?.message && "is-invalid"}
                  /> */}
                  <p className="invalid-feedback">{errors.image?.message}</p>
                </Form.Group>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ cursor: "pointer" }}
                  />
                  <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#e03a3c",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Đang tải..." : "Upload"}
                  </button>
                  {imageUrl && (
                    <div style={{ marginTop: "1rem" }}>
                      <p>Link ảnh:</p>
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          maxWidth: "100%",
                          wordBreak: "break-word",
                        }}
                      >
                        {imageUrl}
                      </a>
                      <br />
                      <img
                        src={imageUrl}
                        alt="Uploaded"
                        style={{ maxWidth: "300px" }}
                      />
                    </div>
                  )}
                </div>
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="doe"
                    {...register("brand", {
                      value: product?.brand,
                    })}
                    className={errors.brand?.message && "is-invalid"}
                  />
                  <p className="invalid-feedback">{errors.brand?.message}</p>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="doe"
                    {...register("category", {
                      value: product?.category,
                    })}
                    className={errors.category?.message && "is-invalid"}
                  />
                  <p className="invalid-feedback">{errors.category?.message}</p>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    {...register("qty", {
                      value: product?.qty,
                    })}
                    className={errors.qty?.message && "is-invalid"}
                  />
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Price</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="200"
                        {...register("price", {
                          value: product?.price,
                        })}
                        className={errors.price?.message && "is-invalid"}
                        onChange={(e) => {
                          setValue("price_sale", parseFloat(e.target.value));
                        }}
                      />
                      <p className="invalid-feedback">
                        {errors.price?.message}
                      </p>
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group>
                      <Form.Label>Price Sale</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="0"
                        {...register("price_sale", {
                          value: product?.price_sale,
                        })}
                        className={errors.price_sale?.message && "is-invalid"}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as={"textarea"}
                    rows={3}
                    placeholder="description"
                    {...register("description", {
                      value: product?.description,
                    })}
                    className={errors.description?.message && "is-invalid"}
                  />
                  <p className="invalid-feedback">
                    {errors.description?.message}
                  </p>
                </Form.Group>
                <Button type="submit" className="mt-3 w-full text-white">
                  Ajouter
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductUpdate;
