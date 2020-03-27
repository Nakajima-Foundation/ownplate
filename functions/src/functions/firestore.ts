import * as constant from '../common/constant';

export const orderCreate = async (db, snapshot, context) => {
  // const { restaurantId, orderId } = context.params;
  const original_data = snapshot.data()
  // todo validate order data
  if (!original_data || !original_data.status || original_data.status !== constant.order_status.new_order) {
    return ;
  }

  // todo calculate price.
  const sub_total = 2000;
  const tax = 200;
  const total = sub_total+ tax;

  // todo create stripe payment request
  snapshot.ref.update({
    status: constant.order_status.validation_ok,

    sub_total,
    tax,
    total
  });
}
