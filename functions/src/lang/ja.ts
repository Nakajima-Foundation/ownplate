export const resource = {
  translation: {
    hello: "今日は、世界。",
    option: "オプション",
    card_payment: "カード払い",
    payment_in_store: "現地払い",
    msg_order_accepted: "ありがとうございます。ご注文は受理されました。調理完了の予定時刻は{{time}}です。",
    msg_ec_order_accepted: "ありがとうございます。ご注文は受理されました。",
    msg_cooking_completed: "ご注文の準備ができました。ピックアップが可能です。",
    msg_ec_cooking_completed: "商品の発送準備ができました。",
    msg_order_canceled: "あなたの注文はキャンセルされました。",
    msg_stripe_payment_canceled: "カード決済失敗したため、カード払いが取り消されました。現地にてお支払いしてください。",
    msg_order_placed: "注文が入りました",
    msg_order_updated: "注文内容が変更されました",
    msg_order_canceled_by_user: "注文がキャンセルされました",
  },
};
const suffix1 = "{{restaurantName}}注文番号:{{orderNumber}}";
const suffix2 = "注文金額:{{price}}円";

export const resource_mo = {

  translation: {
    hello: "今日は、世界。",
    option: "オプション",
    card_payment: "カード払い",
    payment_in_store: "現地払い",
    msg_ec_order_accepted: "ありがとうございます。ご注文は受理されました。",
    msg_ec_cooking_completed: "商品の発送準備ができました。",
    msg_order_placed: "注文が入りました",
    msg_order_accepted: "ご注文の受付が完了しました。受け渡し予定時刻は{{time}}です。"+ suffix1 + suffix2, // mo
    msg_cooking_completed: "ご注文商品の準備ができました。受け渡し予定時刻は{{time}}です。" + suffix1 + suffix2,  // mo
    msg_order_canceled: "商品のご用意ができなかった為、ご注文がキャンセルされました。" + suffix1, // mo
    msg_stripe_payment_canceled: "決済処理が正しく完了できなかったため、カード決済を取り消しました。代金は受け取り時に店舗でお支払いください。" + suffix1, // mo
    msg_order_updated: "注文内容が変更されました。" + suffix1, //
    msg_order_canceled_by_user: "お客様ご自身にてキャンセルされたか、商品のご用意ができなかった為、ご注文がキャンセルされました。" + suffix1, // mo
  },
};
