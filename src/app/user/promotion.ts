import {
  ref,
  watch,
} from "@vue/composition-api";


import {
  getDocs,
  query,
  collection,
  where,
  documentId,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase9";

export const usePromitions = (mode: string, id: string, user: any) => {
  const promotions = ref<any[]>([]);

  (async () => {
    const path = (mode === "mo") ?  `/groups/${id}/promotions` :  `restaurants/${id}/promotions`;

    const p: any[] = [];
    await Promise.all([
      getDocs(
        query(
          collection(db, `/groups/${id}/promotions`),
          where("enable", "==", true),
          where("hasTerm", "==", false),
        )
      ).then((ret1) => {
        const res = ret1.docs.map(a => a.data());
        res.map(a => p.push(a));
      }),
      getDocs(
        query(
          collection(db, `/groups/${id}/promotions`),
          where("enable", "==", true),
          where("hasTerm", "==", true),
          // where("termFrom", ">=", Timestamp.now()),
          where("termTo", ">", Timestamp.now()),
        )
      ).then((ret1) => {
        const res = ret1.docs.map(a => a.data()).filter((a) => {
          return a.termFrom.toDate() < new Date();
        });
        res.map(a => p.push(a));
      })
    ]);
    promotions.value = p;

  })();

  const promotionUsed = ref<{[key: string]: any}>({});
  watch([user, promotions], async () => {
    if (user.value && promotions.value.length > 0) {
      const keys: string[] = [];
      const values: string[] = [];
      promotions.value.map(a => {
        console.log(a.promotionId);
        if (["discount", "onetimeCoupon"].includes(a.type)) {
          keys.push(a.promotionId);
        } else {
          values.push(a.promotionId);
        }
      });
      const path = `users/${user.value.uid}/promotions`;
      const used: {[key: string]: any} = {};
      await Promise.all([
        keys.length > 0 ?
          getDocs(
            query(
              collection(db, path),
              where(documentId(), "in", keys)
            )
          ).then(a => {
            a.docs.map((b) => {
              used[b.id] = b.data();
            });
          }) :
          new Promise((r) => r(1)),
        //
        values.length > 0 ?
          getDocs(
            query(
              collection(db, path),
              where("promotionId", "in", values)
            )
          ).then(a => {
            a.docs.map((b) => {
              used[b.id] = b.data();
            });
          }) :
          new Promise((r) => r(1))
      ])

      promotionUsed.value = used;

    }
  });
  
  
  return {
    promotions,
    promotionUsed,
  };
  
};
