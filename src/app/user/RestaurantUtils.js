export const restaurant2AreaObj = (restaurants) => {
  return restaurants.reduce((tmp, doc) => {
    const data = doc.data();
    data.id = doc.id;
    if (!tmp[data.state]) {
      tmp[data.state] = [];
    }
    tmp[data.state].push(data);
    return tmp;
  }, {});
};

export const sortRestaurantObj = (restaurantsObj) => {
  return Object.keys(restaurantsObj).map((key) => {
    restaurantsObj[key].sort((a, b) => {
      return a.restaurantName > b.restaurantName ? 1 : -1;
    });
  });
};
