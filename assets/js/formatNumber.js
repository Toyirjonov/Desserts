const formatNumber = (price, discount = 0) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price - (price / 100) * discount);
};

export default formatNumber;
