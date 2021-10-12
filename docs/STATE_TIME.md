

# ユーザの操作

1.  menuページで注文
   - dbにデータを追加
     - -> timeCreated
   - wasOrderCreated2(functions)をcall

2.  オーダー画面で確認 (注文済み)
   - orderPlace(functions)をcall
     - -> orderPlacedAt
   - ユーザの受け取り希望時間の指定
     - -> timePlaced

# お店の操作
3. 受付済みに変更
   - orderUpdate(functions)をcall
     - -> orderAcceptedAt
   - 受け渡し時間変更可能
     - -> timeEstimated
4. 受け渡し準備完了
   - orderUpdate(functions)をcall
     - -> timeConfirmed
5. 受け渡し完了
   - orderUpdate(functions)をcall
     - -> transactionCompletedAt
