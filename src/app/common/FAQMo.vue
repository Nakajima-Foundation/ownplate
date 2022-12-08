<template>
  <div>
    <!-- Back To Top Button-->
    <a href="#top" v-if="showCursor">
      <div
        class="visible fixed right-4 bottom-4 z-10 inline-flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-op-teal bg-teal-50 pb-2 shadow-lg sm:invisible"
      >
        <i class="material-icons -mb-1 text-2xl text-op-teal">
          keyboard_arrow_up
        </i>
        <div class="text-xs font-bold text-op-teal">
          {{ $t("button.backToTop") }}
        </div>
      </div>
    </a>

    <div class="mx-6 mt-6 lg:mx-auto lg:max-w-2xl">
      <!-- Title -->
      <div class="mt-6 text-xl font-bold text-black text-opacity-30">
        <a name="top">ご利用について</a>
      </div>
      <div v-for="(faq, k) in faqList" :key="k">
        <div class="mt-4 text-sm font-bold text-op-teal">
          <a :name="`index_` + k"></a>
          <a :href="`#faq_` + k"> ・ {{ faq.q }} </a>
        </div>
      </div>

      <div class="mt-6 rounded-lg bg-white px-4 py-2 shadow" ref="faq_box">
        <div v-for="(faq, k) in faqList" :key="'base_' + k" class="mb-6">
          <div class="mt-4 mb-2 font-bold">
            <a :name="`faq_` + k">
              {{ faq.q }}
            </a>
          </div>
          <div
            v-for="(answer, k) in faq.answers"
            :key="'answer_' + k"
            class="mt-3 text-sm leading-relaxed"
          >
            {{ answer }}
          </div>
          <div
            v-for="(type1, i) in faq.type1"
            :key="'type1_' + i"
            class="mt-3 -ml-2 text-sm leading-relaxed"
          >
            {{ type1 }}
          </div>
          <ul
            class="mt-3 ml-4 list-outside list-disc text-sm leading-relaxed"
          >
            <li
              v-for="(answer1, h) in faq.answers1"
              :key="'answer_' + h"
              >
              {{ answer1 }}
            </li>
          </ul>
          <div
            v-for="(type2, g) in faq.type2"
            :key="'type2_' + g"
            class="mt-3 -ml-2 text-sm leading-relaxed"
          >
            {{ type2 }}
          </div>
          <ul
            class="mt-3 ml-4 list-outside list-disc text-sm leading-relaxed"
          >
            <li
              v-for="(answer2, f) in faq.answers2"
              :key="'answer2_' + f"
              >
              {{ answer2 }}
            </li>
          </ul>
          <div class="mt-3">
            <div
              v-for="(note, e) in faq.notes"
              :key="'note2_' + e"
              class="mt-3 text-xs leading-relaxed text-black text-opacity-50"
            >
              {{ note }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  onMounted,
  onUnmounted,
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";

export default defineComponent({
  setup(_, ctx) {
    const faqList = [
      {
        q: "ご利用の流れについて",
        answers: [
          "店舗一覧から受け取り店舗を選択後、商品を選択し「お会計」のボタンを押します。本人確認のために携帯電話のSMS（ショートメッセージサービス）を利用した認証が必要となります。",
          "携帯電話を入力いただき、送信を押していただくとSMS（ショートメッセージサービス）にて「確認コード」が送信されます。",
          "確認コードをサイト内にて入力いただくことで受け渡し希望時刻の選択やお支払方法が選択でき、注文が完了します。",
        ],
      },
      {
        q: "各種サービスについて",
        answers: ["ネット注文サービスでは以下のサービスをご利用いただけます。"],
        type1: ["【本日受け取る】"],
        answers1: [
          "お店の在庫にあるものを最短1時間後にお受け取りいただけます。",
          "当日の午前0時から午後9時までの間でご注文を承ります。",
          "店舗での受け渡し時間帯は当日の午前10時から午後10時まで30分単位でご指定いただけます。",
        ],
        type2: ["【お取り寄せする】"],
        answers2: ["お店の在庫にないものを最短3日後にお受け取りいただけます。"],
      },
      {
        q: "受け渡し希望時刻(受け取り希望時刻)について",
        type1: ["【本日受け取る、の場合】"],
        answers1: [
          "最短1時間後より日時のご指定が可能です。",
          "また、店舗での受け渡し時間帯は午前10時から午後10時まで30分単位でご指定いただけます。",
        ],
        type2: ["【お取り寄せする、の場合】"],
        answers2: [
          "3日後より日時のご指定が可能です。",
          "また、店舗での受け渡し時間帯は午前10時から午後10時まで30分単位でご指定いただけます。",
        ],
      },
      {
        q: "販売価格/店舗で開催のキャンペーンについて",
        answers: [
          "販売されている価格はネット注文サービスの価格となり、店頭価格と異なる場合がございます。",
        ],
        notes: [
          "※「事前決済（クレジットカード）でのお支払い」にてご注文されている場合は、店舗で実施しているキャンペーン等の対象外となります。",
        ],
      },
      {
        q: "お取扱商品について",
        type1: ["【本日受け取る、の場合】"],
        answers1: [
          "お店の在庫にあるものを最短1時間後にお受け取りいただけます。",
        ],
        type2: ["【お取り寄せする、の場合】"],
        answers2: ["お店に在庫がない商品もお取り寄せによるご注文が可能です。"],
      },
      {
        q: "お支払い方法について",
        answers: [
          "「事前決済（クレジットカード）でのお支払い」もしくは「受取時に店舗でのお支払い」",
        ],
        notes: [
          "※「事前決済（クレジットカード）でのお支払い」でのご注文に関して、カード決済の処理が正しく完了しなかった場合は、「受取時に店舗でのお支払い」に変更させていただきます。",
          "その際には「決済処理が正しく完了できなかったためカード決済を取り消しました。代金は受け取り時に店舗でお支払いください。」というSMS(ショートメッセージサービス）が配信されます。",
          "※CVC(セキュリティーコード)とは？",
          "Visa, MasterCard, JCB, Diners Club, DISCOVER：カードのうら面の右端3ケタ",
          "American Express：カードのおもて面の4ケタ",
        ],
      },
      {
        q: "ご注文商品のお受け取りについて",
        answers: [
          "お客様が指定した受け取り店舗、指定の日時に合わせてご注文商品の受け渡し準備をします。",
          "ご来店時に、事前に配信された携帯電話のSMS（ショートメッセージサービス）通知画面をご提示ください。また、SMS（ショートメッセージサービス）の画面を提示できない場合はスタッフより、注文番号と電話番号の下４桁を伺わせていただきます。",
          "ご来店前にご用意いただきますようお願い致します。",
          "また、店舗までの交通費など移動に関わる費用などは、ご負担下さい。",
        ],
      },
      {
        q: "ご注文のキャンセルについて",
        type1: ["【事前決済の場合】"],
        answers1: [
          "お客様宛に「受付済み」のSMS通知が配信されるまでは、「注文履歴」よりご注文のキャンセルが可能です。",
          "「受付済み」のSMS通知が配信された以降は、ご注文のキャンセルはできません。",
          "「受付済み」のSMS通知が配信された注文であっても、売り切れ・過度の注文の集中・注文受付時のエラー・その他、店舗側の都合によりキャンセルさせていただく場合がございます。",
        ],
        type2: ["【店頭払いの場合】"],
        answers2: [
          "お客様宛に「受け渡し準備完了」のSMS通知が配信されるまでは、「注文履歴」よりご注文のキャンセルが可能です。",
          "「受け渡し準備完了」のSMS通知が配信された以降は、ご注文のキャンセルはできません。",
          "「受付済み」のSMS通知が配信された注文であっても、売り切れ・過度の注文の集中・注文受付時のエラー・その他、店舗側の都合によりキャンセルさせていただく場合がございます。",
          "「受け渡し準備完了」の表示から2時間を経過した場合には、店舗側でご注文をキャンセルさせていただく場合がございます。「事前決済（クレジットカード）でのお支払い」で注文されている場合、「ご注文された商品代金相当額」をお支払いいただく必要がございます。",
          "ご注文いただいた商品の内、販売終了などの都合によりご用意ができない商品があった場合は店舗よりご注文のキャンセルをさせていただく場合がございます。",
          "その場合、ご登録いただきました電話番号にSMS（ショートメッセージサービスにて「お客様ご自身にてキャンセルされたか、商品のご用意ができなかった為、ご注文がキャンセルされました。」というメッセージが配信されます。",
        ],
      },
      {
        q: "ご注文商品の返品について",
        answers: [
          "お客様のご都合による返品は行っておりません。商品の間違いや汚破損があった際には、商品の交換または返金の対応をさせていただきます。受け取り店舗へお問い合わせください。",
        ],
      },
    ];

    const listener = () => {
      try {
        currentY.value = window.scrollY;
      } catch (e) {
        console.log(e);
      }
    };
    onMounted(() => {
      window.addEventListener("scroll", listener);
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", listener);
    });

    const currentY = ref(0);
    const showCursor = computed(() => {
      if (ctx.refs.faq_box) {
        const box = ctx.refs.faq_box.getBoundingClientRect();
        const top = window.pageYOffset + box.top;
        return top < currentY.value;
      }
      console.log(currentY.value); // don't touch this line
      return false;
    });

    return {
      faqList,
      showCursor,
    };
  },
});
</script>
