#!/bin/sh 

cp src/config/constant.ts functions/src/common/constant.ts
cp src/utils/phoneutil.ts functions/src/common/phoneutil.ts
cp src/utils/commonUtils.ts functions/src/utils/commonUtils.ts
cp src/models/RestaurantInfo.ts functions/src/models/RestaurantInfo.ts
cp src/models/menu.ts functions/src/models/menu.ts
cp src/models/customer.ts functions/src/models/customer.ts
cp src/models/orderInfoData.ts functions/src/models/orderInfoData.ts
cp src/models/functionTypes.ts functions/src/models/functionTypes.ts
cp src/models/orderTypes.ts functions/src/models/orderTypes.ts
cp src/models/promotionTypes.ts functions/src/models/promotionTypes.ts
# Note: common.ts is NOT copied - it has different import paths for Vue vs Functions

