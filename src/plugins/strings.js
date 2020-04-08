export const nameOfOrder = (order) => {
  return "#"+`00${order.number}`.slice(-3);
};