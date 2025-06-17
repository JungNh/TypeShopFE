import { useEffect, useState } from "react";
import { Button, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { GrChapterNext } from "react-icons/gr";
import Loader from "../../../components/UI/loader";
import TableContainer from "../../../components/UI/table-contrainer";
import { useAppDispatch, useAppSelector } from "../../../redux";
import { getOrdersList } from "../../../redux/orders/slice-list";
import authAxios from "../../../utils/auth-axios";
import { setError } from "../../../utils/error";
import {
  formatCurrencry,
  getDate,
  getLabelOption,
} from "../../../utils/helper";
import { Link } from "react-router-dom";
import { GrView } from "react-icons/gr";
import { updateOrderStatus } from "../../../redux/orders/order-details";
import { STATUS_ORDER } from "../../../constans";

function OrdersTable() {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.orders);
  const [refresh, setRefresh] = useState<boolean>(false);
  const cols = [
    "Order_id",
    "Name",
    "Phone",
    "TotalPrice",
    "Address",
    "Paid",
    "Status",
    "Created At",
    "Options",
  ];

  const updateStatus = async (data: any) => {
    if (window.confirm("Bạn chắc chắn muốn chuyển trạng thái đơn hàng?")) {
      authAxios
        .post(`/orders/${data?._id}`, data)
        .then((res) => {
          dispatch(updateOrderStatus(res));
          toast.success(`Order has beend ${res.data.status}`);
          setRefresh((prev) => (prev = !prev));
        })
        .catch((err) => toast.error(setError(err)));
    }
  };

  const onDelete = (id: string | number) => {
    if (window.confirm(`Bạn chắc chắn muốn xoá đơn hàng ${id}?`)) {
      authAxios
        .delete(`/orders/${id}`)
        .then((res) => {
          toast.success(res.data);
          setRefresh((prev) => (prev = !prev));
        })
        .catch((e) => toast.error(setError(e)));
    }
  };

  useEffect(() => {
    dispatch(getOrdersList());
  }, [dispatch, refresh]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Row className="py-3">
          <h3 className="d-flex justify-content-between align-items-center">
            <span>Orders List</span>
          </h3>
          <TableContainer cols={cols}>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.shippingAddress.nameCus}</td>
                <td>{order.shippingAddress.phone}</td>
                <td>{formatCurrencry(order?.totalPrice)}</td>
                <td>{order?.shippingAddress?.address}</td>
                <td>
                  {order.isPaid ? (
                    <FaCheck color="green" />
                  ) : (
                    <FaTimes color="red" />
                  )}
                </td>
                <td
                  style={{
                    color:
                      order.status == "cancelled"
                        ? "#d10000"
                        : order.status == "order"
                        ? "purple"
                        : order.status == "shipping"
                        ? "orange"
                        : order?.status == "delivered"
                        ? "blue"
                        : "green",
                  }}
                >
                  {getLabelOption(STATUS_ORDER, order?.status)}
                </td>
                <td>{getDate(order?.createdAt)}</td>
                <td>
                  <Link
                    to={`/dashboard/order/${order._id}`}
                    className="btn btn-sm btn-secondary  me-2"
                  >
                    <GrView />
                  </Link>
                  <Button
                    onClick={() => {
                      updateStatus({
                        ...order,
                        isPaid:
                          order.status == "delivered"
                            ? true
                            : order.isPaid,
                        status:
                          order.status == "order"
                            ? "shipping"
                            : order.status == "shipping"
                            ? "delivered"
                            : "received",
                      });
                    }}
                    size="sm"
                    disabled={order.status == "received" || order.status == "cancelled"}
                    className="me-2"
                  >
                    <GrChapterNext />
                  </Button>
                  <Button
                    onClick={() => onDelete(order._id)}
                    variant="danger"
                    size="sm"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </TableContainer>
        </Row>
      )}
    </>
  );
}

export default OrdersTable;
