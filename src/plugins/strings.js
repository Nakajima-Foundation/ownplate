export const nameOfOrder = (order) => {
  return (order && order.number != undefined) ?
    "#" + `00${order.number}`.slice(-3) : "";
};

const regex = /\([0-9\.]+\)/
export const optionPrice = (option) => {
  const match = option.match(regex);
  if (match) {
    return Number(match[0].slice(1, -1))
  }
  return 0;
}
