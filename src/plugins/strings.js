export const nameOfOrder = (order) => {
  return (order && order.number != undefined) ?
    "#"+`00${order.number}`.slice(-3) : "";
};