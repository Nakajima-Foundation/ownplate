export const nameOfOrder = (order) => {
  return (order && order.number != undefined) ?
    "#" + `00${order.number}`.slice(-3) : "";
};

export const regexOptionPrice = /\(\+[0-9\.]+\)/
export const optionPrice = (option) => {
  const match = option.match(regexOptionPrice);
  if (match) {
    return Number(match[0].slice(1, -1))
  }
  return 0;
}

export const formatOption = (option, localize) => {
  const match = option.match(regexOptionPrice);
  if (match) {
    const price = Number(match[0].slice(1, -1));
    return (
      option.slice(0, match.index) + "(+" + localize(price) + ")"
    );
  }
  return option;
}

export const halfCharactors = (str) => {
  return str.replace(/[（）＋ーＡ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  });
}

