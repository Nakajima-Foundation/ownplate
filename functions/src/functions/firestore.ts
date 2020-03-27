export const orderCreate = async (db, snapshot, context) => {
  // const { restaurantId, orderId } = context.params;

  // todo validate order data

  // todo create stripe payment request

  snapshot.ref.update({status: 200});
}
