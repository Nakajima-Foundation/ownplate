

# ユーザの操作

1.  menuページで注文
   - dbにデータを追加
     - -> timeCreated(操作した時間)
   - orderCreated(functions)をcall

2.  オーダー画面で確認 (注文済み)
   - orderPlace(functions)をcall
     - -> orderPlacedAt (操作した時間)
   - ユーザの受け取り希望時間の指定
     - -> timePlaced
     - -> timePickupForQuery 

a. オーダーキャンセル
   - orderCustomerCanceledAt(操作した時間)
   - timeCanceled

# お店の操作
3. 受付済みに変更
   - orderUpdate(functions)をcall
     - -> orderAcceptedAt (操作した時間)
   - 受け渡し時間変更可能
     - -> timeEstimated (お店が指定してtimeEstimated or timePlaced)
     - -> timePickupForQuery (同上)
4. 受け渡し準備完了
   - orderUpdate(functions)をcall
     - -> timeConfirmed(操作した時間)
5. 受け渡し完了
   - orderUpdate(functions)をcall
     - -> transactionCompletedAt(操作した時間)

a. オーダーキャンセル
   - orderRestaurantCanceledAt(操作した時間)
   - timeCanceled

b. クレカ決済キャンセル
   - orderRestaurantPaymentCanceledAt(操作した時間)