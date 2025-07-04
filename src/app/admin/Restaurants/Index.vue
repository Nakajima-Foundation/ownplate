<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>

    <!-- Never show before load restaurant data -->
    <div v-else>
      <!-- Header -->
      <div class="mx-6 mt-4 lg:flex lg:items-center">
        <div class="flex-1"></div>
        <!-- Notifications -->
        <div class="mt-4 shrink-0 text-right lg:mt-0">
          <notification-index :shopInfo="editShopInfo" />
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="mt-4 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <router-link
          :to="`/admin/restaurants/#restaurant_` + editShopInfo.restaurantId"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black/5 px-6"
          >
            <span class="text-base font-bold text-black/60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </router-link>

        <!-- Save Button -->
        <t-button
          @click="saveRestaurant"
          :isDisabled="submitting || disableSave"
          class="h-12 px-8 font-bold text-white"
        >
          {{
            $t(
              submitting
                ? "editCommon.saving"
                : editShopInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft",
            )
          }}
        </t-button>
      </div>

      <!-- Publish Status -->
      <div class="mx-6 mt-2 rounded-lg bg-black/5 p-4 text-center">
        <o-checkbox
          v-model="editShopInfo.publicFlag"
          :disabled="hasError"
          :variant="!editShopInfo.publicFlag ? 'danger' : ''"
        >
          <div class="font-bold">{{ $t("shopInfo.public") }}</div>
        </o-checkbox>

        <div class="mt-1 text-sm font-bold">
          <div v-if="editShopInfo.publicFlag">
            {{ $t("editRestaurant.publishDescription") }}
          </div>
          <div v-if="!editShopInfo.publicFlag" class="text-red-700">
            {{ $t("editRestaurant.draftDescription") }}
          </div>
          <div v-if="hasError" class="text-red-700">
            {{ $t("editRestaurant.draftWarning") }}
          </div>
        </div>
      </div>

      <!-- Required Note -->
      <div class="mx-6 mt-2 text-sm font-bold text-red-700">
        * {{ $t("editRestaurant.required") }}
      </div>

      <!-- Settings 1 -->
      <div class="mx-6 mt-2 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <!-- Restaurant Name -->
          <div>
            <text-form
              v-model="editShopInfo.restaurantName"
              titleKey="shopInfo.name"
              placeholder="editRestaurant.enterRestaurantName"
              :error="errors['restaurantName']"
              :maxlength="50"
            />
          </div>

          <!-- Owner Name -->
          <div class="mt-4">
            <text-form
              v-model="editShopInfo.ownerName"
              titleKey="shopInfo.ownerName"
              placeholder="editRestaurant.enterOwnerName"
              :error="errors['ownerName']"
              :maxlength="50"
            />
          </div>

          <!-- Restaurant Address -->
          <!-- Zip and State -->
          <div class="mt-4 flex">
            <div class="flex-1">
              <text-form
                :error="errors['zip']"
                v-model="editShopInfo.zip"
                titleKey="shopInfo.zip"
                placeholder="editRestaurant.enterZip"
                :maxlength="10"
              />
            </div>
            <div class="pl-4">
              <state :errors="errors" v-model="editShopInfo.state" />
            </div>
          </div>
          <!-- City -->
          <div class="mt-4">
            <text-form
              :error="errors['city']"
              v-model="editShopInfo.city"
              titleKey="shopInfo.city"
              placeholder="editRestaurant.enterCity"
              :maxlength="15"
            />
          </div>
          <!-- Street -->
          <div class="mt-4">
            <text-form
              :error="errors['streetAddress']"
              v-model="editShopInfo.streetAddress"
              titleKey="shopInfo.streetAddress"
              placeholder="editRestaurant.enterStreetAddress"
              :maxlength="30"
            />
          </div>

          <!-- Map -->
          <div
            class="mt-4"
            :class="
              !(editShopInfo.location && editShopInfo.location.lat) ||
              !maplocation
                ? 'border-2 border-red-700'
                : ''
            "
          >
            <div class="mt-2 p-2 text-sm font-bold">
              {{ $t("editRestaurant.setupMap") }}
            </div>
            <div class="text-center">
              <a
                @click="updateAndUpdateMap"
                class="inline-flex h-12 items-center rounded-full bg-op-teal px-6 shadow-sm"
                ><div class="text-base font-bold text-white">
                  {{ $t("editRestaurant.searchMap") }}
                </div></a
              >
            </div>
            <div v-if="searchResults.length > 0">
              <div class="mt-4">
                <select v-model="selectedResult">
                  <option
                    v-for="(result, key) in searchResults"
                    :value="key"
                    :key="key"
                  >
                    {{ result.formatted_address }}
                  </option>
                </select>
              </div>
            </div>
            <div v-else class="mt-3 text-center text-sm">
              {{ $t("editRestaurant.enterAddress") }}
            </div>

            <div class="mt-2 text-center text-sm font-bold text-red-700">
              {{ $t("editRestaurant.updateMapDescription") }}
            </div>

            <div class="mt-4 border-red-700">
              <div
                ref="gMap"
                style="
                  width: 100%;
                  height: 280px;
                  position: relative;
                  overflow: hidden;
                "
              />
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="mt-2 lg:mt-0">
          <!-- Phone -->
          <div>
            <div
              class="pb-2 text-sm font-bold cursor-pointer"
              @click="openTips('phonenumber')"
            >
              {{ $t("shopInfo.phonenumber") }}
              <i class="material-icons">
                <span class="text-sm">help</span>
              </i>
              <span class="text-red-700">*</span>
            </div>
            <div>
              <phone-entry
                :currentNumber="editShopInfo.phoneNumber"
                :placeholder="$t('editRestaurant.enterPhone')"
                @change="handlePhoneChange"
              />
            </div>
          </div>

          <!-- Profile Photo -->
          <div>
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.profilePhoto") }}
              <span class="text-red-700">*</span>
            </div>
            <div
              class="flex"
              :class="{
                'rounded-sm border border-red-700 p-2':
                  errors['restProfilePhoto'].length !== 0,
              }"
            >
              <!-- Current Photo -->
              <div v-if="restProfilePhoto" class="mr-4">
                <div>
                  <img
                    class="object-cover"
                    :src="restProfilePhoto"
                    style="width: 128px; height: 128px"
                  />
                </div>
                <div class="mt-1 text-center text-xs">
                  {{ $t("editCommon.current") }}
                </div>
              </div>

              <!-- New Photo -->
              <div class="flex-1">
                <ImageUpload
                  @handler="handleProfileImage"
                  :preview="previewProfile"
                  style="width: 128px; height: 128px"
                />
                <div class="mt-1 w-32 text-center text-xs">
                  {{ $t("editCommon.new") }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="pt-2 text-sm text-black/60">
              {{ $t("editCommon.clickAndUploadDetail") }}
            </div>
          </div>

          <!-- Cover Photo -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.coverPhoto") }}
              <span class="text-red-700">*</span>
            </div>
            <div
              class="flex"
              :class="{
                'rounded-sm border border-red-700 p-2':
                  errors['restCoverPhoto'].length !== 0,
              }"
            >
              <!-- Current Photo -->
              <div v-if="restCoverPhoto">
                <div>
                  <img
                    class="rounded-sm object-cover"
                    :src="restCoverPhoto"
                    style="width: 272px; height: 128px"
                  />
                </div>
                <div class="mt-1 text-center text-xs" style="width: 272px">
                  {{ $t("editCommon.current") }}
                </div>
              </div>

              <!-- New Photo -->

              <div class="ml-4">
                <ImageUpload
                  @handler="handleCoverImage"
                  :preview="previewCover"
                  style="width: 272px; height: 128px"
                />
                <div class="mt-1 text-center text-xs" style="width: 272px">
                  {{ $t("editCommon.new") }}
                </div>
              </div>
            </div>
            <!-- Description -->
            <div class="pt-2 text-sm text-black/60">
              {{ $t("editCommon.clickAndUploadDetail") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Settings 2 -->
      <div
        class="mx-6 mt-2 grid grid-cols-1 border-t-2 border-solid border-black/10 pt-6 lg:grid-cols-2 lg:gap-x-12"
      >
        <!-- Left -->
        <div>
          <!-- Enable Pre Line -->
          <div class="mt-4 mb-4">
            <a id="preline" />
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.enablePrelineTitle") }}
            </div>
            <div class="rounded-lg bg-black/5 p-4">
              <o-checkbox v-model="editShopInfo.enablePreline">
                <div class="text-sm font-bold">
                  {{ $t("editRestaurant.enablePrelineDescription") }}
                </div>
              </o-checkbox>
            </div>
          </div>

          <!-- Description -->
          <div class="mt-4">
            <text-form
              v-model="editShopInfo.introduction"
              type="textarea"
              :required="false"
              :maxlength="1200"
              titleKey="editRestaurant.introduction"
              placeholder="editRestaurant.enterIntroduction"
              :error="errors['introduction']"
            />
          </div>

          <div class="rounded-lg border bg-white p-2 mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.orderConfirmViewConfig") }}
            </div>

            <!-- Order Notice -->
            <div class="mt-4">
              <text-form
                v-model="editShopInfo.orderNotice"
                type="textarea"
                :required="false"
                :maxlength="1200"
                titleKey="editRestaurant.orderNotice"
                placeholder="editRestaurant.enterOrderNotice"
                :error="errors['orderNotice']"
              />
            </div>

            <!-- Order Memo from Takeout Customer -->
            <div class="mt-4">
              <div class="pb-2 text-sm font-bold">
                {{ $t("editRestaurant.acceptUserMessage") }}
              </div>
              <div class="rounded-lg bg-black/5 p-4">
                <o-checkbox v-model="editShopInfo.acceptUserMessage">
                  <div class="text-sm font-bold">
                    {{ $t("editRestaurant.acceptUserMessageDescription") }}
                  </div>
                </o-checkbox>
                <div class="pt-2 text-xs">
                  {{ $t("editRestaurant.acceptUserMessageNotice") }}
                </div>
              </div>
            </div>
          </div>
          <!-- Thank you Message -->
          <div class="mt-4">
            <text-form
              v-model="editShopInfo.orderThanks"
              type="textarea"
              :required="false"
              :maxlength="1200"
              titleKey="editRestaurant.orderThanks"
              placeholder="editRestaurant.enterOrderThanks"
              :error="errors['orderThanks']"
            />
          </div>

          <div class="rounded-lg border bg-white p-2 mt-4">
            <!-- URL -->
            <div>
              <text-form
                v-model="editShopInfo.url"
                :error="errors['url']"
                titleKey="shopInfo.website"
                placeholder="editRestaurant.enterWebsite"
                :maxlength="100"
                :required="false"
              />
            </div>

            <!-- LINE URL -->
            <div class="mt-4">
              <text-form
                v-model="editShopInfo.lineUrl"
                :error="errors['lineUrl']"
                titleKey="shopInfo.lineUrl"
                placeholder="editRestaurant.enterLineUrl"
                :maxlength="100"
                :required="false"
              />
            </div>

            <!-- Instagram URL -->
            <div class="mt-4">
              <text-form
                v-model="editShopInfo.instagramUrl"
                :error="errors['instagramUrl']"
                titleKey="shopInfo.instagramUrl"
                placeholder="editRestaurant.enterInstagramUrl"
                :maxlength="100"
                :required="false"
              />
            </div>

            <!-- UberEats URL -->
            <div class="mt-4">
              <text-form
                v-model="editShopInfo.uberEatsUrl"
                :error="errors['uberEatsUrl']"
                titleKey="shopInfo.uberEatsUrl"
                placeholder="editRestaurant.enterUberEatsUrl"
                :maxlength="100"
                :required="false"
              />
            </div>
          </div>

          <!-- Tax -->
          <div>
            <!-- Tax Input Required -->
            <div v-if="requireTaxInput">
              <div class="mt-4 flex">
                <div>
                  <div class="pb-2 text-sm font-bold">
                    {{ $t("editRestaurant.foodTax") }}
                  </div>
                  <o-field
                    class="inline-flex items-center"
                    :variant="
                      errors['foodTax'].length > 0 ? 'danger' : 'success'
                    "
                  >
                    <o-input
                      v-model="editShopInfo.foodTax"
                      placeholder="8.2"
                      type="text"
                      maxlength="5"
                      class="w-24"
                    />
                    <div class="ml-2">%</div>
                  </o-field>
                </div>

                <div class="ml-4">
                  <div class="pb-2 text-sm font-bold">
                    {{ $t("editRestaurant.alcoholTax") }}
                  </div>
                  <o-field
                    class="inline-flex items-center"
                    :variant="
                      errors['alcoholTax'].length > 0 ? 'danger' : 'success'
                    "
                  >
                    <o-input
                      v-model="editShopInfo.alcoholTax"
                      placeholder="10.2"
                      type="text"
                      maxlength="5"
                      class="w-24"
                    />
                    <div class="ml-2">%</div>
                  </o-field>
                </div>
              </div>
            </div>

            <!-- Tax Input Not Required -->
            <div v-if="!requireTaxInput">
              <div class="mt-4">
                <div class="pb-2 text-sm font-bold">
                  {{ $t("editRestaurant.tax") }}
                </div>
                <div
                  class="grid grid-cols-1 space-y-2 rounded-lg bg-black/5 p-4"
                >
                  <div
                    v-for="(taxItem, k) in taxRates"
                    class="text-base"
                    :key="k"
                  >
                    {{ $t("editMenu." + taxRateKeys[taxItem]) }}
                    {{ editShopInfo[taxItem + "Tax"] }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Tax Display -->
            <div v-if="requireTaxPriceDisplay" class="mt-4">
              <div class="pb-2 text-sm font-bold">
                {{ $t("editRestaurant.taxPriceDisplay") }}
              </div>
              <div class="rounded-lg bg-black/5 p-4">
                <div>
                  <o-checkbox v-model="editShopInfo.inclusiveTax">
                    <div class="font-bold">
                      {{ $t("editRestaurant.taxIncluded") }}
                    </div>
                  </o-checkbox>
                </div>
                <div class="mt-2">
                  <div
                    v-if="region === 'JP'"
                    class="mb-2 text-xs font-bold text-red-700"
                  >
                    {{ $t("editRestaurant.taxPriceDisplayJp") }}
                  </div>
                  <div>
                    {{
                      $t("tax.taxExample", { count: $n(1000, "currency") }, 0)
                    }}
                  </div>
                  <div>
                    <b
                      ><Price
                        :shopInfo="editShopInfo"
                        :menu="{ price: 1000, tax: 'food' }"
                      />
                    </b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Time to Pickup -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.timeToPickup") }}
            </div>

            <div class="rounded-lg bg-black/5 p-4">
              <!-- Preparation Time -->
              <div>
                <div class="mb-1">
                  <b>{{ $t("editRestaurant.preparationTime") }}</b>
                  <span class="text-xs"
                    >({{
                      $t("editRestaurant.preparationTimeDescription")
                    }})</span
                  >
                </div>

                <o-field
                  class="flex items-center"
                  :variant="
                    errors['pickUpMinimumCookTime'].length > 0
                      ? 'danger'
                      : 'success'
                  "
                >
                  <o-input
                    v-model.number="editShopInfo.pickUpMinimumCookTime"
                    placeholder="10"
                    type="text"
                    class="w-24"
                  />
                  <div class="ml-2">
                    {{ $t("editRestaurant.minutes") }}
                    <span class="text-xs"
                      >({{ $t("editRestaurant.withinFiveDays") }})</span
                    >
                  </div>
                </o-field>

                <div class="mt-2">
                  <o-radio
                    v-for="choice in minimumCookTimeChoices"
                    v-model="editShopInfo.pickUpMinimumCookTime"
                    :native-value="choice.value"
                    :key="choice.value"
                    >{{ $t(choice.messageKey) }}</o-radio
                  >
                </div>
              </div>

              <!-- The Day Before -->
              <div class="mt-2">
                <div class="mb-1">
                  <b>{{ $t("editRestaurant.reservationTheDayBefore") }}</b>
                  <span class="text-xs">
                    ({{
                      $t("editRestaurant.reservationTheDayBeforeDescription")
                    }})</span
                  >
                </div>
                <o-field
                  class="flex items-center"
                  :variant="
                    errors['pickUpDaysInAdvance'].length > 0
                      ? 'danger'
                      : 'success'
                  "
                >
                  <o-select v-model.number="editShopInfo.pickUpDaysInAdvance">
                    <option
                      v-for="(day, index) in reservationTheDayBefore"
                      :key="index"
                      :value="day.value"
                    >
                      {{ $t(day.messageKey) }}
                    </option>
                  </o-select>
                </o-field>
              </div>
            </div>
          </div>

          <!-- personalInfo -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold cursor-pointer">
              {{ $t("editRestaurant.personalInfo") }}
            </div>
            <div class="rounded-lg bg-black/5 p-4">
              <div
                v-for="(personalInfoSaveMethod, k) in personalInfoSaveMethods"
                :key="k"
              >
                <o-radio
                  v-model="editShopInfo.personalInfo"
                  :native-value="personalInfoSaveMethod.key"
                  :variant="personalInfoSaveMethod.key"
                >
                  {{
                    $t(
                      "editRestaurant.personalInfoSaveMethodChoices." +
                        personalInfoSaveMethod.key,
                    )
                  }}
                </o-radio>
              </div>
            </div>
          </div>
          <!-- Payment methods -->
          <div class="mt-4">
            <div
              class="pb-2 text-sm font-bold cursor-pointer"
              @click="openTips('paymentMethods')"
            >
              {{ $t("editRestaurant.paymentMethods") }}
              <i class="material-icons">
                <span class="text-sm">help</span>
              </i>
            </div>

            <div class="rounded-lg bg-black/5 p-4">
              <!-- Preparation Time -->
              <div v-for="(paymentMethod, k) in paymentMethods" :key="k">
                <o-checkbox
                  v-model="
                    (editShopInfo.paymentMethods || {})[paymentMethod.key]
                  "
                >
                  <div class="text-sm font-bold">
                    {{
                      $t(
                        "editRestaurant.paymentMethodChoices." +
                          paymentMethod.key,
                      )
                    }}
                  </div>
                </o-checkbox>
              </div>
            </div>
          </div>

          <!-- Delivery Config -->
          <div v-if="region === 'JP'" class="mt-4">
            <a id="deliveryConfig" />
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.deliveryConfigTitle") }}
            </div>
            <div class="rounded-lg bg-black/5 p-4">
              <div class="text-lg font-bold text-op-teal">
                <router-link
                  :to="`/admin/restaurants/${restaurantId}/delivery`"
                  >{{ $t("editRestaurant.deliveryConfigLink") }}</router-link
                >
              </div>
              <div class="pt-2 text-xs">
                {{ $t("editRestaurant.deliveryDescription") }}
                <a
                  href="https://docs.omochikaeri.com/manuals/delivery.pdf"
                  target="_blank"
                >
                  <span class="font-bold text-op-teal">
                    {{ $t("menu.deliveryManualLink") }}
                  </span>
                </a>
              </div>
            </div>
          </div>

          <!-- Printer Config -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.printerConfigTitle") }}
            </div>
            <div class="rounded-lg bg-black/5 p-4">
              <o-checkbox v-model="editShopInfo.enablePrinter">
                <div class="text-sm font-bold">
                  {{ $t("editRestaurant.enablePrinter") }}
                </div>
              </o-checkbox>
              <div class="pt-2 text-xs">
                {{ $t("editRestaurant.printerDescription") }}
                <a
                  href="https://docs.omochikaeri.com/manuals/printer.pdf"
                  target="_blank"
                  class="inline-flex"
                >
                  <span class="font-bold text-op-teal">
                    {{ $t("menu.printerManualLink") }}
                  </span>
                </a>
              </div>
              <div class="text-xs">
                {{ $t("editRestaurant.printerDescription2") }}
              </div>
              <div class="text-xs pt-2">
                <router-link
                  class="inline-flex"
                  :to="`/admin/restaurants/${restaurantId}/printer`"
                >
                  <span class="font-bold text-op-teal">
                    {{ $t("editRestaurant.printerDescriptionConfig") }}
                  </span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- notification -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.notificationConfig") }}
            </div>
            <!-- Email Notification -->
            <div class="mt-2 ml-8">
              <a id="emailNotification" />
              <div class="pb-2 text-sm font-bold">
                {{ $t("editRestaurant.emailNotificationTitle") }}
              </div>
              <div class="rounded-lg bg-black/5 p-4">
                <o-checkbox v-model="editShopInfo.emailNotification">
                  <div class="text-sm font-bold">
                    {{ $t("editRestaurant.emailNotificationDescription") }}
                  </div>
                </o-checkbox>
                <div class="pt-2 text-xs">
                  {{ $t("editRestaurant.emailNotificationNotice") }}
                </div>
              </div>
            </div>

            <!-- Phone Call -->
            <div class="mt-4 ml-8">
              <a id="phoneCall" />
              <div class="pb-2 text-sm font-bold">
                {{ $t("editRestaurant.phoneCall") }}
              </div>
              <div class="rounded-lg bg-black/5 p-4">
                <o-checkbox v-model="editShopInfo.phoneCall">
                  <div class="text-sm font-bold">
                    {{ $t("editRestaurant.phoneCallDescription") }}
                  </div>
                </o-checkbox>
                <div class="pt-2 text-xs">
                  {{ $t("editRestaurant.phoneCallNotice") }}
                </div>
              </div>
            </div>

            <!-- Line -->
            <div class="mt-4 ml-8">
              <a id="phoneCall" />
              <div class="pb-2 text-sm font-bold">
                {{ $t("editRestaurant.lineNotification") }}
              </div>
              <div class="rounded-lg bg-black/5 p-4">
                <router-link
                  :to="`/admin/restaurants/${restaurantId}/linelist`"
                >
                  <span class="text-sm font-bold text-op-teal">
                    {{ $t("editRestaurant.moveToLineConfig") }}
                  </span>
                </router-link>
              </div>
            </div>
          </div>
          <!-- end of notification -->
        </div>

        <!-- Right -->

        <div class="rounded-lg border bg-white p-2 mt-4">
          <div class="pb-2 text-sm font-bold">
            {{ $t("editRestaurant.openDaysConfig") }}
          </div>
          <div class="rounded-lg bg-black/5 p-4">
            <div>
              <o-checkbox v-model="editShopInfo.enableLunchDinner">
                <span class="text-base font-bold">
                  {{ $t("editRestaurant.lunchOrDinnerToggle") }}
                </span>
              </o-checkbox>
            </div>
            <div class="text-sm">
              {{ $t("editRestaurant.lunchOrDinnerNotice") }}
            </div>
          </div>
          <!-- Hours -->
          <div class="mt-4 lg:mt-0">
            <div class="pb-2 text-sm font-bold">
              {{ $t("shopInfo.hours") }} <span class="text-red-700">*</span>
            </div>
            <div>
              <div class="text-sm font-bold text-red-700">
                {{ $t("editRestaurant.businessHourDescription") }}
              </div>

              <div class="mt-2 space-y-2">
                <div
                  v-for="(day, index) in days"
                  :key="index"
                  class="rounded-lg bg-black/5 p-4"
                >
                  <!-- Enable/Disable Day and Copy Previous Day -->
                  <div class="flex items-center">
                    <div class="flex-1">
                      <o-checkbox v-model="editShopInfo.businessDay[index]">
                        <div class="text-base font-bold">
                          {{ $t("week.short." + day) }}
                        </div>
                      </o-checkbox>
                    </div>

                    <div>
                      <a
                        @click="copyPreviousDay(index)"
                        class="cursor-pointer inline-flex items-center justify-center"
                      >
                        <i class="material-icons mr-2 text-lg text-op-teal">
                          content_copy
                        </i>
                        <div class="text-sm font-bold text-op-teal">
                          {{
                            $t(
                              index === "1"
                                ? "editRestaurant.copySunDay"
                                : "editRestaurant.copyPreviousDay",
                            )
                          }}
                        </div>
                      </a>
                    </div>
                  </div>

                  <!-- Main Hours -->
                  <div class="mt-2">
                    <div class="flex">
                      <hours-input
                        v-model="editShopInfo.openTimes[index][0]"
                        :variant="
                          errors['time'][index][0].length > 0
                            ? 'danger'
                            : 'success'
                        "
                        :disabled="!editShopInfo.businessDay[index]"
                      ></hours-input>
                      <div
                        class="flex-item my-auto ml-2 font-bold"
                        v-if="editShopInfo.enableLunchDinner"
                      >
                        :{{ $t("shopInfo.lunch") }}
                      </div>
                    </div>
                  </div>

                  <!-- Another Hours -->
                  <div class="mt-2">
                    <div class="mb-1 text-xs">
                      {{ $t("editRestaurant.businessHourOption") }}
                    </div>
                    <div class="flex">
                      <hours-input
                        v-model="editShopInfo.openTimes[index][1]"
                        :variant="
                          errors['time'][index][1].length > 0
                            ? 'danger'
                            : 'success'
                        "
                        :disabled="!editShopInfo.businessDay[index]"
                      ></hours-input>
                      <div
                        class="flex-item my-auto ml-2 font-bold"
                        v-if="editShopInfo.enableLunchDinner"
                      >
                        :{{ $t("shopInfo.dinner") }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Last order time -->
            <div class="mt-4">
              <div class="pb-2 text-sm font-bold">
                {{ $t("editRestaurant.lastOrderTime.title") }}
              </div>
              <div class="text-xs">
                {{ $t("editRestaurant.lastOrderTime.notes1") }}
              </div>
              <div class="text-xs">
                {{ $t("editRestaurant.lastOrderTime.notes2") }}
              </div>
              <div class="mt-2">
                <hour-input
                  v-model="editShopInfo.lastOrderTime"
                  variant="success"
                  :disabled="false"
                ></hour-input>
              </div>
            </div>

            <!-- Temporary Closure -->
            <div class="mt-4">
              <div class="pb-2 text-sm font-bold">
                {{ $t("shopInfo.temporaryClosure") }}
              </div>

              <div class="rounded-lg bg-black/5 p-4 pb-2">
                <div class="mb-2 text-sm font-bold text-black/40">
                  {{ $t("shopInfo.temporaryClosureDescription") }}
                </div>

                <!-- Date Picker -->
                <o-field>
                  <o-datepicker
                    class="w-full"
                    icon="calendar-today"
                    v-model="newTemporaryClosure"
                    ref="datepicker"
                    :min-date="now"
                    :max-date="maxDate"
                    expanded
                    :placeholder="$t('shopInfo.temporaryClosureSelect')"
                  >
                  </o-datepicker>

                  <o-button @click="addNewTemporaryClosure" class="b-reset-tw">
                    <div
                      class="inline-flex h-9 items-center justify-center rounded-r bg-black/5 px-4"
                    >
                      <i class="material-icons mr-2 text-lg text-op-teal"
                        >add</i
                      >
                      <div class="text-sm font-bold text-op-teal">
                        {{ $t("shopInfo.temporaryClosureAdd") }}
                      </div>
                    </div>
                  </o-button>
                </o-field>

                <!-- Saved Closure Days -->
                <div class="mb-2 grid grid-cols-1 space-y-2">
                  <template
                    v-for="(day, key) in editShopInfo.temporaryClosure || []"
                  >
                    <template v-if="day.getTime() >= now">
                      <div
                        :key="key"
                        class="flex items-center rounded-sm bg-white/50 px-2"
                      >
                        <div class="flex-1 p-2">
                          {{ moment(day).format("YYYY/MM/DD") }}
                          {{
                            $t(
                              "week.short." +
                                days[Number(moment(day).format("e")) || 7],
                            )
                          }}
                        </div>
                        <div>
                          <a
                            @click="deleteTemporaryClosure(key)"
                            class="inline-flex p-2"
                            ><i class="material-icons text-lg text-red-700"
                              >delete</i
                            ></a
                          >
                        </div>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Publish Status -->
      <div class="mx-6 mt-2 rounded-lg bg-black/5 p-4 text-center">
        <o-checkbox
          v-model="editShopInfo.publicFlag"
          :disabled="hasError"
          :variant="!editShopInfo.publicFlag ? 'danger' : ''"
        >
          <div class="font-bold">{{ $t("shopInfo.public") }}</div>
        </o-checkbox>

        <div class="mt-1 text-sm font-bold">
          <div v-if="editShopInfo.publicFlag">
            {{ $t("editRestaurant.publishDescription") }}
          </div>
          <div v-if="!editShopInfo.publicFlag" class="text-red-700">
            {{ $t("editRestaurant.draftDescription") }}
          </div>
          <div v-if="hasError" class="text-red-700">
            {{ $t("editRestaurant.draftWarning") }}
          </div>
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="mt-4 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <router-link
          :to="`/admin/restaurants/#restaurant_` + editShopInfo.restaurantId"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black/5 px-6"
          >
            <span class="text-base font-bold text-black/60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </router-link>

        <!-- Save Button -->
        <t-button
          @click="saveRestaurant"
          :isDisabled="submitting || disableSave"
          class="h12 px-8 font-bold text-white"
        >
          {{
            $t(
              submitting
                ? "editCommon.saving"
                : editShopInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft",
            )
          }}
        </t-button>
      </div>

      <!-- Copy -->
      <div class="mt-4 text-center">
        <o-button
          @click="confirmCopy"
          :disabled="submitting"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-op-teal"> queue </i>
            <span class="text-sm font-bold text-op-teal">{{
              $t(submitting ? "editCommon.saving" : "editCommon.copy")
            }}</span>
          </div>
        </o-button>
      </div>

      <!-- QRCode -->
      <div class="mx-6 mt-4 rounded-lg bg-black/5 p-4 text-center">
        <QRCode :shopInfo="shopInfo" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUpdated,
  PropType,
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc } from "firebase/firestore";

import { google_geocode } from "@/lib/google/api";
import { ownPlateConfig, GMAPId } from "@/config/project";

import NotFound from "@/components/NotFound.vue";
import PhoneEntry from "@/components/PhoneEntry.vue";
import Price from "@/components/Price.vue";

import HoursInput from "@/app/admin/inputComponents/HoursInput.vue";
import HourInput from "@/app/admin/inputComponents/HourInput2.vue";
import TextForm from "@/app/admin/inputComponents/TextForm.vue";
import State from "@/app/admin/inputComponents/State.vue";
import NotificationIndex from "@/app/admin/Notifications/Index.vue";

import QRCode from "@/app/admin/Restaurants/QRCode.vue";

import ImageUpload from "@/components/ImageUpload.vue";

import { checkShopOwner } from "@/utils/userPermission";

import {
  getEditShopInfo,
  shopInfoValidator,
  copyRestaurant,
} from "@/utils/admin/RestaurantPageUtils";
import {
  cleanObject,
  isNull,
  countObj,
  regionalSetting,
  useAdminUids,
  notFoundResponse,
  num2time,
  useRestaurantId,
  defaultTitle,
} from "@/utils/utils";
import { uploadFile } from "@/lib/firebase/storage";

import {
  taxRates,
  daysOfWeek,
  reservationTheDayBefore,
  minimumCookTimeChoices,
  personalInfoSaveMethods,
  paymentMethods,
  GOOGLE_MAP_DEFAULT_CENTER,
} from "@/config/constant";

import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import moment from "moment";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  name: "RestaurantPage",
  components: {
    HoursInput,
    HourInput,
    TextForm,
    State,
    NotificationIndex,
    QRCode,
    NotFound,
    PhoneEntry,
    Price,
    ImageUpload,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();

    const restaurantId = useRestaurantId();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const now = moment().subtract(1, "days").toDate();
    const taxRateKeys = regionalSetting["taxRateKeys"];
    const region = ownPlateConfig.region;

    const requireTaxInput = regionalSetting.requireTaxInput;
    const requireTaxPriceDisplay = regionalSetting.requireTaxPriceDisplay;

    const notFound = ref<boolean | null>(null);
    const gMap = ref();
    let mapObj: google.maps.Map | null = null;

    // internal ref;
    const maplocation = ref({});
    const place_id = ref<string | null>(null);
    // const markers = ref([]);
    const markers: any[] = []; // for google map
    const errorsPhone = ref<string[]>([]);
    const files = ref<{ [key: string]: File }>({});
    const updateFirstCall = ref(true);

    // external ref
    const submitting = ref(false);
    const newTemporaryClosure = ref<Date | null>(null);
    const searchResults = ref<{ place_id: string; geometry: any }[]>([]);
    const selectedResult = ref(0);

    const editShopInfo = reactive(props.shopInfo);

    useHead({
      title: props.shopInfo.restaurantName
        ? [
            "Admin Restaurant",
            props.shopInfo.restaurantName,
            defaultTitle,
          ].join(" / ")
        : defaultTitle,
    });

    // only owner
    const { uid } = useAdminUids();
    if (!checkShopOwner(props.shopInfo, uid.value)) {
      return notFoundResponse;
    }
    notFound.value = false;

    if (props.shopInfo.location) {
      maplocation.value = props.shopInfo.location;
      place_id.value = props.shopInfo.place_id;
    }

    onUpdated(() => {
      if (updateFirstCall.value) {
        if (window.location.hash) {
          document
            ?.getElementById(window.location.hash.slice(1))
            ?.scrollIntoView();
        }
        updateFirstCall.value = false;
      }
    });

    const restProfilePhoto = computed(() => {
      return (
        (editShopInfo?.images?.profile?.resizedImages || {})["600"] ||
        editShopInfo.restProfilePhoto
      );
    });
    const restCoverPhoto = computed(() => {
      return (
        (editShopInfo?.images?.cover?.resizedImages || {})["600"] ||
        editShopInfo.restCoverPhoto
      );
    });
    const errors = computed(() => {
      return shopInfoValidator(
        editShopInfo,
        requireTaxInput,
        errorsPhone.value,
        files.value["profile"],
        files.value["cover"],
      );
    });
    const hasError = computed(() => {
      const num = countObj(errors.value);
      return num > 0;
    });

    const setLocation = () => {
      if (maplocation.value) {
        editShopInfo.location = maplocation.value;
        editShopInfo.place_id = place_id.value as string;
      }
    };
    watch(notFound, () => {
      if (notFound.value === false) {
        setLocation();
      }
    });
    const removeAllMarker = () => {
      if (markers && markers.length > 0) {
        markers.forEach((marker) => {
          marker.setMap(null);
        });
        markers.splice(0);
      }
    };
    const setCurrentLocation = (
      location: { lat?: number; lng?: number },
      move = true,
    ) => {
      if (location && location.lat && location.lng) {
        if (move) {
          mapObj.setCenter(location);
        }
        removeAllMarker();
        markers.push(
          new google.maps.marker.AdvancedMarkerElement({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: mapObj,
          }),
        );
        maplocation.value = location;
      }
    };

    watch(selectedResult, () => {
      const res = searchResults.value[selectedResult.value];
      setCurrentLocation(res.geometry.location);
      place_id.value = res.place_id;
      setLocation();
    });

    const isFuture = (day: Date) => {
      return now.getTime() < day.getTime();
    };
    const isNewTemporaryClosure = (day: Date) => {
      const func = (elem: Date) => {
        return elem.getTime() === day.getTime();
      };
      return !editShopInfo.temporaryClosure.some(func);
    };
    const deleteTemporaryClosure = (key: number) => {
      editShopInfo.temporaryClosure = editShopInfo.temporaryClosure.filter(
        (v, n) => n !== key,
      );
    };
    const addNewTemporaryClosure = () => {
      if (
        !isNull(newTemporaryClosure.value) &&
        isNewTemporaryClosure(newTemporaryClosure.value as Date) &&
        isFuture(newTemporaryClosure.value as Date)
      ) {
        editShopInfo.temporaryClosure.push(newTemporaryClosure.value);
        editShopInfo.temporaryClosure.sort((a, b) => {
          return a.getTime() > b.getTime() ? 1 : -1;
        });
      }
      // newTemporaryClosure.value = null;
    };
    const copyPreviousDay = (index: string) => {
      const prevIndex = index === "1" ? 7 : Number(index) - 1;
      editShopInfo.businessDay[index] = editShopInfo.businessDay[prevIndex];
      editShopInfo.openTimes[index] = editShopInfo.openTimes[prevIndex].map(
        (a) => {
          return { ...a };
        },
      );
    };
    const previewProfile = ref<string | null>(null);
    const handleProfileImage = (file: File) => {
      const newFile = Object.assign({}, files.value);
      previewProfile.value = URL.createObjectURL(file);

      newFile["profile"] = file;
      files.value = newFile;
    };
    const previewCover = ref<string | null>(null);
    const handleCoverImage = (file: File) => {
      const newFile = Object.assign({}, files.value);
      previewCover.value = URL.createObjectURL(file);

      newFile["cover"] = file;
      files.value = newFile;
    };
    const handlePhoneChange = (payload: {
      phoneNumber: string;
      countryCode: string;
      errors: string[];
    }) => {
      //console.log(payload)
      editShopInfo.phoneNumber = payload.phoneNumber;
      editShopInfo.countryCode = payload.countryCode;
      errorsPhone.value = payload.errors;
    };

    const gmapClick = (arg: any) => {
      setCurrentLocation(
        { lat: arg.latLng.lat(), lng: arg.latLng.lng() },
        false,
      );
      // place_id.value = null;
      setLocation();
    };
    const setDefaultLocation = () => {
      if (typeof google === "undefined" || !gMap.value) return;

      mapObj = new google.maps.Map(gMap.value, {
        center: GOOGLE_MAP_DEFAULT_CENTER,
        zoom: 18,
        mapId: GMAPId || undefined,
        fullscreenControl: false,
      });

      mapObj.addListener("click", (e: google.maps.MapMouseEvent) => {
        gmapClick(e);
      });

      if (editShopInfo && editShopInfo.location) {
        setCurrentLocation(editShopInfo.location);
      }
    };

    onMounted(() => {
      setDefaultLocation();
    });
    const copyRestaurantFunc = async () => {
      try {
        const id = await copyRestaurant(
          editShopInfo,
          uid.value,
          restaurantId.value,
        );
        router.push({
          path: `/admin/restaurants/${id}`,
        });
        setTimeout(() => {
          location.reload();
        }, 200);
      } catch (error) {
        store.commit("setErrorMessage", {
          code: "restaurant.save",
          error,
        });
      }
    };
    const confirmCopy = () => {
      store.commit("setAlert", {
        code: "editCommon.copyAlert",
        callback: () => {
          copyRestaurantFunc();
        },
      });
    };
    const updateRestaurantData = async (restaurantData: any) => {
      const cleanData = cleanObject(restaurantData);
      if (!cleanData.lastOrderTime) {
        cleanData.lastOrderTime = null;
      }
      await updateDoc(doc(db, `restaurants/${restaurantId.value}`), cleanData);
    };
    const saveRestaurant = async () => {
      submitting.value = true;
      const newData = { ...editShopInfo };
      try {
        if (files.value["profile"]) {
          const path = `/images/restaurants/${restaurantId.value}/${uid.value}/profile.jpg`;
          const profImage = await uploadFile(files.value["profile"], path);
          newData.restProfilePhoto = profImage;
          newData.images.profile = {
            original: profImage,
            resizedImages: {},
          };
        }

        if (files.value["cover"]) {
          const path = `/images/restaurants/${restaurantId.value}/${uid.value}/cover.jpg`;
          const coverImage = await uploadFile(files.value["cover"], path);
          newData.restCoverPhoto = coverImage;
          newData.images.cover = {
            original: coverImage,
            resizedImages: {},
          };
        }
        const restaurantData = getEditShopInfo(newData);
        await updateRestaurantData(restaurantData);

        router.push(`/admin/restaurants/#restaurant_` + restaurantId.value);
      } catch (error) {
        submitting.value = false;
        store.commit("setErrorMessage", {
          code: "restaurant.save",
          error,
        });
      }
    };
    const updateMap = async () => {
      // https://gitlab.com/broj42/nuxt-gmaps#readme
      // https://codesandbox.io/s/6j6zw48l83
      const keyword = [
        editShopInfo.restaurantName,
        editShopInfo.streetAddress,
        editShopInfo.city,
        editShopInfo.state,
      ].join(",");

      const res = await google_geocode(keyword);
      if (res && res[0] && res[0].geometry) {
        searchResults.value = res;
        setCurrentLocation(res[0].geometry.location);
        place_id.value = res[0].place_id;
      }
    };
    const updateAndUpdateMap = async () => {
      await updateMap();
      setLocation();
    };

    const disableSave = computed(() => {
      return hasError.value && editShopInfo.publicFlag;
    });

    const openTips = (key: string) => {
      store.commit("setTips", {
        key,
      });
    };

    return {
      maxDate,
      now,
      reservationTheDayBefore,
      minimumCookTimeChoices,
      taxRates,
      taxRateKeys,
      region,

      editShopInfo,

      requireTaxInput,
      requireTaxPriceDisplay,

      days: daysOfWeek,

      // ref
      maplocation,

      notFound,
      submitting,
      newTemporaryClosure,
      searchResults,
      selectedResult,

      restProfilePhoto,
      restCoverPhoto,
      errors,
      hasError,

      deleteTemporaryClosure,
      addNewTemporaryClosure,

      copyPreviousDay,

      handleProfileImage,
      handleCoverImage,
      previewProfile,
      previewCover,
      handlePhoneChange,

      num2time,
      moment,

      setDefaultLocation,
      gmapClick,
      gMap,

      personalInfoSaveMethods,
      paymentMethods,
      openTips,
      restaurantId,

      confirmCopy,
      saveRestaurant,
      updateAndUpdateMap,

      disableSave,
    };
  },
});
</script>
