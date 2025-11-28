const getIcon = (url: string) => {
  const icon = document.createElement("img");
  icon.src = url;
  icon.style.width = "32px";
  icon.style.height = "32px";
  return icon;
};

export const getShopIcon = () => {
  return getIcon("http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png");
};

export const getCustomerIcon = () => {
  return getIcon("http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png");
};
