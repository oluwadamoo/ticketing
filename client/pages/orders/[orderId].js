import { useEffect, useState } from "react";
import useRequest from "../../hooks/useRequest";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: "api/orders",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (order) => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();

      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }
  return (
    <div>
      {timeLeft} seconds until order expires
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={
          "pk_test_51HzCR7LGboCoR3mfiE9GzeLEyJrf4q4KzdP5zBKyu5LMoan4MURbOtXsj2LVDoZQUiSAsciNBYkZBiZZZ5dEgMQU00XNe03b3Q"
        }
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default OrderShow;
