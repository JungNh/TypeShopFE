import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Image,
  ListGroup,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import DefaultLayout from "../../components/layouts/default-layout";
import Loader from "../../components/UI/loader";
import { useAppDispatch, useAppSelector } from "../../redux";
import {
  getOrderById,
  updateOrderStatus,
} from "../../redux/orders/order-details";
import { formatCurrencry } from "../../utils/helper";
import Stripe from "react-stripe-checkout";
import authAxios from "../../utils/auth-axios";
import toast from "react-hot-toast";
import { setError } from "../../utils/error";
import ImageLazy from "../../components/UI/lazy-image";
import BlueButton from "../../components/UI/blue-button";
import PaymentModal from "../../components/modals/pay-modal";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { LiaShippingFastSolid } from "react-icons/lia";
import { IoFileTrayStackedOutline } from "react-icons/io5";
import { IoDownloadOutline } from "react-icons/io5";
import publicAxios from "../../utils/public-axios";
import RedButton from "../../components/UI/red-button";
import { STEPS_ORDER } from "../../constans";

const OrderDetails = () => {
  const { order, loading } = useAppSelector((state) => state.orderDetail);
  const { user } = useAppSelector((state) => state.userDetails);
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [showPay, setShowPay] = useState(false);
  const { address, city, phone } = order?.shippingAddress || {};

  const iconSteps = [
    <HiOutlineNewspaper style={{ width: 30, height: 30 }} />,
    <IoDownloadOutline style={{ width: 30, height: 30 }} />,
    <LiaShippingFastSolid style={{ width: 30, height: 30 }} />,
    <IoFileTrayStackedOutline style={{ width: 30, height: 30 }} />,
  ];

  const itemsPrice: number | undefined = order?.cartItems.reduce(
    (acc, item) => acc + item.qty * item.price_sale,
    0
  );
  const navigate = useNavigate();

  const taxPrice = itemsPrice ? itemsPrice * 0.1 : 0;

  const shippingPrice = itemsPrice ? (itemsPrice >= 200 ? 0 : 30) : 0;

  const totalPrice = itemsPrice && itemsPrice + taxPrice + shippingPrice;

  const handlePayment = (token: any) => {
    authAxios
      .post("/orders/stripe", {
        token: token.id,
        amount: order?.totalPrice,
      })
      .then((res) => {
        authAxios.put(`/orders/${order?._id}`).then((res) => {
          toast.success("you have been paid successfully🙂");
          navigate("/");
        });
      })
      .catch((error) => toast.error(setError(error)));
  };
  const tokenHandler = (token: any) => {
    handlePayment(token);
  };

  useEffect(() => {
    dispatch(getOrderById(id));
  }, [dispatch, id]);

  const updateStatus = async (data: any) => {
    authAxios
      .post(`/orders/${order?._id}`, data)
      .then((res) => {
        dispatch(updateOrderStatus(res));
        toast.success(`Order has beend ${res.data.status}`);
      })
      .catch((err) => toast.error(setError(err)));
  };

  const getProgress = useCallback(() => {
    switch (order?.status) {
      case "order":
        return 0;
      case "shipping":
        return 1;
      case "delivered":
        return 2;
      case "received":
        return 3;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  }, [order?.status]);

  return (
    <DefaultLayout title="order payment">
      <Container>
        <PaymentModal
          username={user?.name}
          totalPrice={totalPrice}
          orderID={order?._id}
          show={showPay}
          handleClose={() => setShowPay(false)}
        />
        <h2 className="mb-2">Đơn hàng</h2>

        {loading ? (
          <Loader />
        ) : (
          <Row>
            <Col md={8} className="mb-sm-3 mb-2">
              <h4 className="mt-5">Tình trạng đơn hàng:</h4>
              {order?.status == "cancelled" && (
                <h3
                  className="mt-5"
                  style={{ color: "#e03a3c", marginLeft: "10px" }}
                >
                  Đơn hàng đã bị huỷ
                </h3>
              )}
              <div
                className="mb-5 mt-10 "
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
                    <div className="d-flex flex-column align-items-center" key={index}>
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
                        }}
                      >
                        {icon}
                      </div>
                      <div
                        style={{
                          color: getProgress() >= index ? "#007acc" : "#ccc",
                        }}
                        key={index}
                      >
                        {STEPS_ORDER[index]}
                      </div>
                    </div>
                  ))}
                </div>
                <ProgressBar
                  now={getProgress() * 33}
                  style={{
                    width: "90%",
                    alignSelf: "center",
                    marginBottom: 40,
                  }}
                />
              </div>
              <Card style={{ marginTop: "70px" }}>
                <Card.Body>
                  <h4>Sản phẩm</h4>
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

                          <Col>
                            {formatCurrencry(item.price_sale * item.qty)}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
              <h4 className="mt-5 mb-5">Thông tin giao hàng</h4>
              <div className="d-flex gap-2">
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
                  <span>{user?.name}</span>
                  <span>
                    {address}, {city}
                  </span>
                  <span>{phone}</span>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <h2 className="text-center">Thông tin thanh toán</h2>
                  <ListGroup variant="flush">
                    <ListGroup.Item as="h2">
                      Tổng số (
                      {order?.cartItems.reduce(
                        (acc, item) => acc + item.qty,
                        0
                      )}
                      ) sản phẩm
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
                      {order?.status === "order" ? (
                        <>
                          {!order?.isPaid ? (
                            <BlueButton
                              onClick={() => setShowPay(true)}
                              className="w-full"
                            >
                              Thanh toán
                            </BlueButton>
                          ) : (
                            <div
                              className="w-full"
                              style={{
                                backgroundColor: "#008cdd",
                                color: "#fff",
                                padding: "10px",
                                borderRadius: "5px",
                                textAlign: "center",
                              }}
                            >
                              Đã thanh toán
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className="w-full"
                          style={{
                            backgroundColor: order?.isPaid
                              ? "#008cdd"
                              : "#e03a3c",
                            color: "#fff",
                            padding: "10px",
                            borderRadius: "5px",
                            textAlign: "center",
                            fontSize: "16px",
                          }}
                        >
                          {order?.isPaid
                            ? "Đã thanh toán"
                            : "Thanh toán khi nhận hàng"}
                        </div>
                      )}
                      {(order?.status == "order" ||
                        order?.status == "shipping") && (
                        <RedButton
                          onClick={() => updateStatus({ status: "cancelled" })}
                          disabled={order?.status !== "order"}
                          className="w-full mt-5"
                        >
                          Huỷ đơn hàng
                        </RedButton>
                      )}

                      {order?.status == "delivered" && (
                        <BlueButton
                          onClick={() => {
                            updateStatus({
                              ...order,
                              isPaid: true,
                              status: "received",
                            });
                          }}
                          className="w-full mt-5"
                        >
                          Xác nhận đã nhận hàng
                        </BlueButton>
                      )}
                    </ListGroup.Item>
                    {/* <Stripe
                          currency="USD"
                          description={`Total Price ${formatCurrencry(
                            order?.totalPrice
                          )}`}
                          name="Type Shop"
                          image="/LogoMakr-6Tit9e.png"
                          stripeKey={import.meta.env.VITE_API_STRIPE}
                          token={tokenHandler}
                        /> */}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </DefaultLayout>
  );
};

export default OrderDetails;
