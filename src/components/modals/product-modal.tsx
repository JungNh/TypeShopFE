import { Button, Col, Form, Row } from "react-bootstrap";
import ModalContainer from "../UI/modal-container";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import authAxios from "../../utils/auth-axios";
import toast from "react-hot-toast";
import { setError } from "../../utils/error";
import { ChangeEvent, useState } from "react";
import { baseUrl } from "../../utils/helper";

type Props = {
  show: boolean;
  handleClose: () => void;
  setRefresh: any;
};

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

const ProductModal = ({ show, handleClose, setRefresh }: Props) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(),
    category: Yup.string().required(),
    brand: Yup.string().required(),
    price: Yup.number().required(),
    description: Yup.string().required(),
    qty: Yup.number().required(),
    price_sale: Yup.number().required(),
  });
  const [image, setImage] = useState<string>("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];

      let formData = new FormData();

      formData.append("image", file);

      authAxios.post("/uploads/image", formData).then((res) => {
        if (res.data) {
          setImage(`${baseUrl}${res.data}`);
        }
      });
    }
  };

  const onSubmit = (data: FormValues) => {
    const price = watch("price");
    const price_sale = watch("price_sale");
    if (price_sale !== undefined && price_sale > price) {
      toast.error("Price sale must be less than price");
      return;
    }
    authAxios
      .post("/products", { ...data, image })
      .then((res) => {
        toast.success("Product has beend created");
        setRefresh((prev: any) => (prev = !prev));
        handleClose();
      })
      .catch((err) => toast.error(setError(err)));
  };

  return (
    <ModalContainer title="Add Product" handleClose={handleClose} show={show}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="doe"
            {...register("name")}
            className={errors.name?.message && "is-invalid"}
          />
          <p className="invalid-feedback">{errors.name?.message}</p>
        </Form.Group>
        <Form.Group>
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            placeholder="Gtx 1660 super"
            name="image"
            onChange={onChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Brand</Form.Label>
          <Form.Control
            type="text"
            placeholder="Msi"
            {...register("brand")}
            className={errors.brand?.message && "is-invalid"}
          />
          <p className="invalid-feedback">{errors.brand?.message}</p>
        </Form.Group>
        <Form.Group>
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            placeholder="Graphics"
            {...register("category")}
            className={errors.category?.message && "is-invalid"}
          />
          <p className="invalid-feedback">{errors.category?.message}</p>
        </Form.Group>

        <Form.Group>
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            placeholder="0"
            {...register("qty")}
            className={errors.qty?.message && "is-invalid"}
          />
        </Form.Group>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="200.00"
                {...register("price")}
                className={errors.price?.message && "is-invalid"}
                onChange={(e) => {
                  setValue("price_sale", parseFloat(e.target.value));
                }}
              />
              <p className="invalid-feedback">{errors.price?.message}</p>
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Price Sale</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                {...register("price_sale")}
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
            {...register("description")}
            className={errors.description?.message && "is-invalid"}
          />
          <p className="invalid-feedback">{errors.description?.message}</p>
        </Form.Group>
        <Button
          style={{ backgroundColor: "#e03a3c", color: "#fff" }}
          variant="outline-none"
          type="submit"
          className="mt-3 w-full text-white"
        >
          Ajouter
        </Button>
      </Form>
    </ModalContainer>
  );
};

export default ProductModal;
