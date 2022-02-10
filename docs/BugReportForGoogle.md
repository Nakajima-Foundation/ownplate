# SMSの文字化けなどの調査

ログの保存期間の問題で、３日以内に調査をする必要がある。
事象が発生したらすぐに以下を集めて共有する。

- ユーザの電話番号
  - Customer Phone number: 080-xxxx-xxxx
- 事象発生時の正確な時間(分まで)
  - Timestamp of tests from the past 3 days:
  - Format yyyy-MM-dd'T'HH:mm, <TIME_ZONE>.
  - 2021-10-14T18:12+09:00  (JST)
- 国コード(通常は日本)
  - Country code : +81  (JP)
- 国
  - Country Japan  
- キャリア
  - Carrier  NTT Docomo
- OS
  - Android or iOS
- 送信元のSMS
  - SMS from 050-xxxx-xxxx

- 問題発生時の文字化けをしている画面のスクショ
  - Additionally, I will need a screenshot of the garbled message, and a screenshot of the expected result. 

- その番号にテストでSMSを送信可能か？
  - Can we send test SMSs to the phone numbers you have given us?

- テストに付き合うことは可能か？
  - Do you/your client have access to these devices and can check for received msgs, or send msgs from them?


