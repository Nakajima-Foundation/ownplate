export const nameOfOrder = (order) => {
  return order && order.number &&
    "#"+`00${order.number}`.slice(-3);
};