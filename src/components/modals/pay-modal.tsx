import { ReactNode, useEffect, useState } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
import ImageLazy from "../UI/lazy-image";
import { formatCurrencry, formatTimer } from "../../utils/helper";
import { set } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import authAxios from "../../utils/auth-axios";

type Props = {
  username: any;
  totalPrice: any;
  orderID: any;
  show: boolean;
  handleClose: () => void;
};

const PaymentModal = ({
  show,
  handleClose,
  username,
  totalPrice,
  orderID,
}: Props) => {
  const SECOND_DEFAULT = 300;
  const BANK_ID = import.meta.env.VITE_BANK_ID;
  const ACCOUNT_NO = import.meta.env.VITE_ACCOUNT_NO;
  const QRPay: string = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-qr_only.png?amount=${totalPrice}&addInfo=${orderID}&accountName=${username}`;
  const [second, setSecond] = useState<number>(SECOND_DEFAULT);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (show) {
      interval = setInterval(() => {
        setSecond((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            handleClose();
            return 0;
          }
          if (prev % 5 === 0) {
            checkPayment(orderID);
          }
          return prev - 1;
        });
      }, 1000);
      setSecond(SECOND_DEFAULT);
    }
    return () => clearInterval(interval);
  }, [show, handleClose]);

  async function checkPayment(orderID: string) {
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbzo50TSjLebcBLJ14_jA3jUzLrfYgd1Hv8PTxTotgE92oFu6rpTOIWctZI97bLbWd7ttw/exec"
      );
      const { data } = await res.json();
      const paymentStatus = data.find((item: any) =>
        item["Mô tả"].includes(orderID)
      );
      if (paymentStatus) {
        authAxios.put(`/orders/${orderID}`).then((res) => {
          handleClose();
          toast.success("you have been paid successfully🙂");
          navigate("/");
        });
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Body>
        <Container>
          <ImageLazy imageUrl={QRPay} className="qr__image" />
          <h3 className="text__center" style={{ marginTop: "20px" }}>
            Mã QR thanh toán tự động
          </h3>
          <div className="text__center">
            (Xác nhận tự động - Thường không quá 3')
          </div>
          <div className="pay__info">{`Số tiền: ${formatCurrencry(
            totalPrice
          )}`}</div>
          <div className="pay__info">{`Nội dung (bắt buộc): ${orderID}`}</div>
          <div className="pay__info">{`Người hưởng thụ: NGUYEN HUY DUNG`}</div>
          <div className="line" />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="pay__info">Đang chờ thanh toán</div>
            <div className="pay__info">{formatTimer(second)}</div>
          </div>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;
