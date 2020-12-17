export const nameOfOrder = (order) => {
  return (order && order.number != undefined) ?
    "#" + `00${order.number}`.slice(-3) : "";
};

export const regexOptionPrice = /\(((\+|\-|＋|ー|−)[0-9\.]+)\)/;

export const optionPrice = (option) => {
  const match = option.match(regexOptionPrice);
  if (match) {
    return convPrice(match[1]);
  }
  return 0;
};

export const formatOption = (option, localize) => {
  const match = option.match(regexOptionPrice);
  if (match) {
    const price = convPrice(match[1]);
    return (
      option.slice(0, match.index) + "(" + (price > 0 ? "+" : "" ) +localize(price) + ")"
    );
  }
  return option;
}
export const convPrice = (priceStr) => {
  return Number(priceStr.replace(/ー|−/g, '-').replace(/＋/g, '+'));
};

export const halfCharactors = (str) => {
  return str.replace(/[（）Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  });
}

