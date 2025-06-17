import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, ListGroup, ProgressBar, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux";
import authAxios from "../../../utils/auth-axios";
import toast from "react-hot-toast";
import { setError } from "../../../utils/error";
import {
  getOrderById,
  updateOrderStatus,
} from "../../../redux/orders/order-details";
import Loader from "../../../components/UI/loader";
import ImageLazy from "../../../components/UI/lazy-image";
import { formatCurrencry, getLabelOption } from "../../../utils/helper";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { LiaShippingFastSolid } from "react-icons/lia";
import { IoFileTrayStackedOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";
import { STEPS_ORDER } from "../../../constans";
import BlueButton from "../../../components/UI/blue-button";

const OrderDetailAdmin = () => {
  const { order, loading } = useAppSelector((state) => state.orderDetail);
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const steps = ["Order", "Shipping", "Delivered", "Received"];
  const [step, setStep] = useState(order?.status);

  const iconSteps = [
    <HiOutlineNewspaper style={{ width: 30, height: 30 }} />,
    <IoDownloadOutline style={{ width: 30, height: 30 }} />,
    <LiaShippingFastSolid style={{ width: 30, height: 30 }} />,
    <IoFileTrayStackedOutline style={{ width: 30, height: 30 }} />,
  ];

  const getProgress = useCallback(() => {
    switch (order?.status) {
      case "cancelled":
        return -1; // Cancelled orders have no progress
      case "order":
        return 0;
      case "shipping":
        return 1;
      case "delivered":
        return 2;
      case "received":
        return 3;
      default:
        return 0;
    }
  }, [order?.status]);

  const itemsPrice: number | undefined = order?.cartItems.reduce(
    (acc, item) => acc + item.qty * item.price_sale,
    0
  );
  const navigate = useNavigate();
  const { nameCus, address, city, phone } = order?.shippingAddress || {};

  const taxPrice = itemsPrice ? itemsPrice * 0.1 : 0;

  const shippingPrice = itemsPrice ? (itemsPrice >= 200 ? 0 : 30) : 0;

  const totalPrice = itemsPrice && itemsPrice + taxPrice + shippingPrice;

  const updateStatus = async (data: any) => {
    if (window.confirm("Bạn chắc chắn muốn chuyển trạng thái đơn hàng?")) {
      authAxios
        .post(`/orders/${data?._id}`, data)
        .then((res) => {
          dispatch(updateOrderStatus(res));
          toast.success(`Order has beend ${res.data.status}`);
        })
        .catch((err) => toast.error(setError(err)));
    }
  };

  useEffect(() => {
    dispatch(getOrderById(id));
  }, [dispatch, id]);

  return (
    <>
      <h3 className="mt-5 mb-5">
        <span>Đơn hàng: {order?._id}</span>
      </h3>
      {loading ? (
        <Loader />
      ) : (
        <Row>
          <Col md={8} className="mb-sm-3 mb-2">
            <h4 className="mt-5 mb-5">
              <span>Tình trạng đơn hàng: </span>
            </h4>
            {order?.status == "cancelled" && (
              <h3
                className="mt-5"
                style={{ color: "#e03a3c", marginLeft: "10px" }}
              >
                Đơn hàng đã bị huỷ
              </h3>
            )}
            <div
              className="mb-20 mt-10"
              style={{
                width: "80%",
                margin: "auto",
                display: "block",
                justifyItems: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  top: "-18px",
                }}
              >
                {iconSteps.map((icon, index) => (
                  <div
                    className="d-flex flex-column align-items-center"
                    key={`${index}`}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        color: getProgress() >= index ? "#007acc" : "#ccc",
                        cursor: "pointer",
                      }}
                      // onClick={() => {
                      //   if (steps[index].toLowerCase() == step) return;
                      //   setStep(
                      //     steps[index].toLowerCase() as
                      //       | "order"
                      //       | "shipping"
                      //       | "delivered"
                      //       | "received"
                      //   );
                      //   updateStatus({ status: steps[index].toLowerCase() });
                      // }}
                    >
                      {icon}
                    </div>
                    <div
                      style={{
                        color: getProgress() >= index ? "#007acc" : "#ccc",
                      }}
                    >
                      {STEPS_ORDER[index]}
                    </div>
                  </div>
                ))}
              </div>
              <ProgressBar
                now={getProgress() * 33}
                style={{ width: "95%", alignSelf: "center", marginBottom: 40 }}
              />
            </div>
            <Card>
              <Card.Body>
                <h4>Order Summery</h4>
                <ListGroup variant="flush">
                  {order?.cartItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="d-flex align-items-center">
                        <Col md={2}>
                          <ImageLazy
                            imageUrl={item.image}
                            style={{ objectFit: "contain" }}
                            className="avatar rounded-5 h-16 w-16"
                          />
                        </Col>
                        <Col md={6} className="d-none d-lg-block">
                          {item.name}
                        </Col>
                        <Col>{item?.qty}</Col>

                        <Col>{formatCurrencry(item.price_sale * item.qty)}</Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
            <h4 className="mt-5 mb-5">Thông tin giao hàng</h4>
            <div className="d-flex gap- ms-5">
              <div
                style={{
                  width: "20%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span className="fw-bold">Tên người nhận:</span>
                <span className="fw-bold">Địa chỉ:</span>
                <span className="fw-bold">Số điện thoại:</span>
              </div>
              <div
                style={{
                  width: "80%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>{nameCus}</span>
                <span>
                  {address}, {city}
                </span>
                <span>{phone}</span>
              </div>
            </div>
            <Button
              className="w-full mt-5"
              style={{
                backgroundColor: "green",
                color: "#fff",
                padding: "10px",
                borderRadius: "5px",
                textAlign: "center",
                cursor: "pointer",
              }}
              disabled={order?.status == "cancelled" || order?.status == "received"}
              variant="outline-none"
              onClick={() => {
                if (order?.status == "cancelled") return;
                updateStatus({
                  ...order,
                  isPaid: order?.status == "delivered" ? true : order?.isPaid,
                  status:
                    order?.status == "order"
                      ? "shipping"
                      : order?.status == "shipping"
                      ? "delivered"
                      : "received",
                });
              }}
            >
              Chuyển trạng thái
            </Button>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <h2 className="text-center">Total</h2>
                <ListGroup variant="flush">
                  <ListGroup.Item as="h2">
                    SubTotal (
                    {order?.cartItems.reduce((acc, item) => acc + item.qty, 0)})
                    item
                  </ListGroup.Item>
                  <ListGroup.Item className=" d-flex justify-content-between align-items-center">
                    <span>Total Price :</span>
                    <span>
                      {formatCurrencry(
                        order?.cartItems.reduce(
                          (acc, item) => acc + item.price_sale * item.qty,
                          0
                        )
                      )}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className=" d-flex justify-content-between align-items-center">
                    <span>Tax Price</span>
                    <span>{formatCurrencry(taxPrice)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className=" d-flex justify-content-between align-items-center">
                    <span>Shipping Price</span>
                    <span>{formatCurrencry(shippingPrice)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h5 className=" d-flex justify-content-between align-items-center">
                      <span>Total Price</span>
                      <span>{formatCurrencry(totalPrice)}</span>
                    </h5>
                  </ListGroup.Item>
                  <ListGroup.Item className="stripe__container">
                    <div
                      className="w-full"
                      style={{
                        backgroundColor: order?.isPaid ? "#008cdd" : "#e03a3c",
                        color: "#fff",
                        padding: "10px",
                        borderRadius: "5px",
                        textAlign: "center",
                      }}
                    >
                      {order?.isPaid
                        ? "Đã thanh toán"
                        : "Thanh toán khi nhận hàng"}
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrderDetailAdmin;
