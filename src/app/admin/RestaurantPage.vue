<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>

    <!-- Never show before load restaurant data -->
    <div v-else>
      <!-- Header -->
      <div class="mx-6 mt-6 lg:flex lg:items-center">
        <div class="flex-1"></div>

        <!-- Notifications -->
        <div class="mt-4 flex-shrink-0 text-right lg:mt-0">
          <notification-index :shopInfo="editShopInfo" />
        </div>
      </div>

      <!-- Save and Cancel -->
      <div class="mt-6 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <router-link
          :to="`/admin/restaurants/#restaurant_` + editShopInfo.restaurantId"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
          >
            <span class="text-base font-bold text-black text-opacity-60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </router-link>

        <!-- Save Button -->
        <o-button
          @click="saveRestaurant"
          :disabled="submitting || disableSave"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-base font-bold text-white">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : editShopInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
              )
            }}</span>
          </div>
        </o-button>
      </div>

      <!-- Publish Status -->
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
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
      <div class="mx-6 mt-6 text-sm font-bold text-red-700">
        * {{ $t("editRestaurant.required") }}
      </div>

      <!-- Settings 1 -->
      <div class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <!-- Restaurant Name -->
          <div>
            <text-form
              v-model="editShopInfo.restaurantName"
              :titleKey="isInMo ? 'mobileOrder.shopInfoName' : 'shopInfo.name'"
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
          <div>
            <!-- Japan Format -->
            <template v-if="region === 'JP'">
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
            </template>

            <!-- Other -->
            <template v-else>
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
              <!-- State and Zip -->
              <div class="mt-4 flex">
                <div class="pr-4">
                  <state :errors="errors" v-model="editShopInfo.state" />
                </div>
                <div class="flex-1">
                  <text-form
                    :error="errors['zip']"
                    v-model="editShopInfo.zip"
                    titleKey="shopInfo.zip"
                    placeholder="editRestaurant.enterZip"
                    :maxlength="10"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Map -->
          <div
            class="mt-4"
            :class="
              !(editShopInfo.location && editShopInfo.location.lat) || !maplocation
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
                class="inline-flex h-12 items-center rounded-full bg-op-teal px-6 shadow"
                ><div class="text-base font-bold text-white">
                  {{ $t("editRestaurant.searchMap") }}
                </div></a
              >
            </div>
            <div v-if="searchResults.length > 0">
              <div class="mt-4">
                <o-select v-model="selectedResult">
                  <option
                    v-for="(result, key) in searchResults"
                    :value="key"
                    :key="key"
                  >
                    {{ result.formatted_address }}
                  </option>
                </o-select>
              </div>
            </div>
            <div v-else class="mt-3 text-center text-sm">
              {{ $t("editRestaurant.enterAddress") }}
            </div>

            <div class="mt-2 text-center text-sm font-bold text-red-700">
              {{
                $t(
                  isInMo
                    ? "mobileOrder.updateMapDescription"
                    : "editRestaurant.updateMapDescription"
                )
              }}
            </div>

            <div class="mt-4 border-red-700">
              <GMapMap
                ref="gMap"
                :center="{ lat: 44.933076, lng: 15.629058 }"
                :options="{ fullscreenControl: false }"
                :zoom="18"
                style="
                  width: 100%;
                  height: 280px;
                  position: relative;
                  overflow: hidden;
                "
                @loaded="setDefaultLocation"
                @click="gmapClick"
              ></GMapMap>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="mt-6 lg:mt-0">
          <!-- Phone -->
          <div>
            <div
              class="pb-2 text-sm font-bold"
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
                'rounded border border-red-700 p-2':
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
            <div class="pt-2 text-sm text-black text-opacity-60">
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
                'rounded border border-red-700 p-2':
                  errors['restCoverPhoto'].length !== 0,
              }"
            >
              <!-- Current Photo -->
              <div v-if="restCoverPhoto">
                <div>
                  <img
                    class="rounded object-cover"
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
            <div class="pt-2 text-sm text-black text-opacity-60">
              {{ $t("editCommon.clickAndUploadDetail") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Settings 2 -->
      <div
        class="mx-6 mt-6 grid grid-cols-1 border-t-2 border-solid border-black border-opacity-10 pt-6 lg:grid-cols-2 lg:gap-x-12"
      >
        <!-- Left -->
        <div>
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

          <!-- Enable Pre Line -->
          <div class="mt-4 mb-4">
            <a id="preline" />
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.enablePrelineTitle") }}
            </div>
            <div class="rounded-lg bg-black bg-opacity-5 p-4">
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
              :maxlength="300"
              titleKey="editRestaurant.introduction"
              placeholder="editRestaurant.enterIntroduction"
              :error="errors['introduction']"
            />
          </div>

          <!-- Order Notice -->
          <div class="mt-4">
            <text-form
              v-model="editShopInfo.orderNotice"
              type="textarea"
              :required="false"
              :maxlength="300"
              titleKey="editRestaurant.orderNotice"
              placeholder="editRestaurant.enterOrderNotice"
              :error="errors['orderNotice']"
            />
          </div>

          <!-- Thank you Message -->
          <div class="mt-4">
            <text-form
              v-model="editShopInfo.orderThanks"
              type="textarea"
              :required="false"
              :maxlength="300"
              titleKey="editRestaurant.orderThanks"
              placeholder="editRestaurant.enterOrderThanks"
              :error="errors['orderThanks']"
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
                  class="grid grid-cols-1 space-y-2 rounded-lg bg-black bg-opacity-5 p-4"
                >
                  <div v-for="taxItem in taxRates" class="text-base">
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
              <div class="rounded-lg bg-black bg-opacity-5 p-4">
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
                    {{ $t("tax.taxExample", {count: $n(1000, "currency")}, 0)}}
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
              {{
                $t(
                  isInMo
                    ? "mobileOrder.timeToPickup"
                    : "editRestaurant.timeToPickup"
                )
              }}
            </div>

            <div class="rounded-lg bg-black bg-opacity-5 p-4">
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

          <!-- Payment methods -->
          <div class="mt-4">
            <div
              class="pb-2 text-sm font-bold"
              @click="openTips('paymentMethods')"
            >
              {{ $t("editRestaurant.paymentMethods") }}
              <i class="material-icons">
                <span class="text-sm">help</span>
              </i>
            </div>

            <div class="rounded-lg bg-black bg-opacity-5 p-4">
              <!-- Preparation Time -->
              <div v-for="(paymentMethod, k) in paymentMethods" :key="k">
                <o-checkbox
                  v-model="(editShopInfo.paymentMethods || {})[paymentMethod.key]"
                >
                  <div class="text-sm font-bold">
                    {{
                      $t(
                        "editRestaurant.paymentMethodChoices." +
                          paymentMethod.key
                      )
                    }}
                  </div>
                </o-checkbox>
              </div>
            </div>
          </div>

          <!-- Time to Mo Pickup -->
          <template v-if="moPickup">
            <div class="mt-4" v-if="isInMo">
              <div class="pb-2 text-sm font-bold">
                {{ $t("mobileOrder.timeToMoPickup") }}
              </div>

              <div class="rounded-lg bg-black bg-opacity-5 p-4">
                <!-- Preparation Time -->
                <div>
                  <div class="mb-1">
                    {{ $t("editRestaurant.preparationTime") }}
                  </div>

                  <div class="ml-2">
                    {{ editShopInfo.moPickUpMinimumCookTime }}
                    {{ $t("editRestaurant.minutes") }}
                  </div>
                </div>

                <!-- The Day Before -->
                <div class="mt-2">
                  <div class="mb-1">
                    {{ $t("editRestaurant.reservationTheDayBefore") }}
                  </div>
                  {{ editShopInfo.moPickUpDaysInAdvance }}
                  {{ $t("mobileOrder.reservationTheDaysBefore") }}
                </div>
              </div>
            </div>
          </template>

          <!-- mo Hours -->
          <div class="mt-4" v-if="isInMo && moPickup && editShopInfo.moBusinessDay">
            <div class="pb-2 text-sm font-bold">
              {{ $t("mobileOrder.pickupHours") }}
            </div>

            <div
              class="grid grid-cols-1 space-y-2 rounded-lg bg-black bg-opacity-5 p-4"
            >
              <div v-for="(day, index) in days" :key="index">
                <!-- Enable/Disable Day and Copy Previous Day -->
                <div class="flex items-center">
                  <div class="flex-1">
                    <div class="text-base font-bold">
                      {{ $t("week.short." + day) }}
                      {{
                        $t(
                          editShopInfo.moBusinessDay[index]
                            ? "admin.open"
                            : "admin.closed"
                        )
                      }}
                    </div>
                  </div>
                </div>

                <!-- Main Hours -->
                <div class="mt-2">
                  <span
                    :class="
                      editShopInfo.moBusinessDay[index]
                        ? ''
                        : 'font-bold text-red-600'
                    "
                  >
                    {{ num2time(editShopInfo.moOpenTimes[index][0].start) }} -
                    {{ num2time(editShopInfo.moOpenTimes[index][0].end) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Config -->
          <div v-if="region === 'JP'" class="mt-4">
            <a id="deliveryConfig" />
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.deliveryConfigTitle") }}
            </div>
            <div class="rounded-lg bg-black bg-opacity-5 p-4">
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
                  class="text-xs font-bold text-op-teal"
                  @click="handleClose()"
                >
                  {{ $t("menu.deliveryManualLink") }}
                </a>
              </div>
            </div>
          </div>

          <!-- Printer Config -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.printerConfigTitle") }}
            </div>
            <div class="rounded-lg bg-black bg-opacity-5 p-4">
              <o-checkbox v-model="editShopInfo.enablePrinter">
                <div class="text-sm font-bold">
                  {{ $t("editRestaurant.elablePrinter") }}
                </div>
              </o-checkbox>
              <div class="pt-2 text-xs">
                {{ $t("editRestaurant.printerDescription") }}
                <a
                  href="https://docs.omochikaeri.com/manuals/printer.pdf"
                  target="_blank"
                  class="inline-flex text-xs font-bold text-op-teal"
                  @click="handleClose()"
                >
                  {{ $t("menu.printerManualLink") }}
                </a>
              </div>
            </div>
          </div>

          <!-- Email Notification -->
          <div v-if="region === 'JP'" class="mt-4">
            <a id="emailNotification" />
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.emailNotificationTitle") }}
            </div>
            <div class="rounded-lg bg-black bg-opacity-5 p-4">
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
          <div v-if="region === 'JP'" class="mt-4">
            <a id="phoneCall" />
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.phoneCall") }}
            </div>
            <div class="rounded-lg bg-black bg-opacity-5 p-4">
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

          <!-- Order Memo from Takeout Customer -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("editRestaurant.acceptUserMessage") }}
            </div>
            <div class="rounded-lg bg-black bg-opacity-5 p-4">
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

        <!-- Right -->
        <div>
          <!-- Hours -->
          <div class="mt-4 lg:mt-0">
            <div class="pb-2 text-sm font-bold">
              {{ $t("shopInfo.hours") }} <span class="text-red-700">*</span>
            </div>
            <div class="text-sm font-bold text-red-700">
              {{ $t("editRestaurant.businessHourDescription") }}
            </div>

            <div class="mt-2 grid grid-cols-1 space-y-2">
              <div
                v-for="(day, index) in days"
                :key="index"
                class="rounded-lg bg-black bg-opacity-5 p-4"
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
                      class="inline-flex items-center justify-center"
                    >
                      <i class="material-icons mr-2 text-lg text-op-teal">
                        content_copy
                      </i>
                      <div class="text-sm font-bold text-op-teal">
                        {{
                          $t(
                            index === "1"
                              ? "editRestaurant.copySunDay"
                              : "editRestaurant.copyPreviousDay"
                          )
                        }}
                      </div>
                    </a>
                  </div>
                </div>

                <!-- Main Hours -->
                <div class="mt-2">
                  <hours-input
                    v-model="editShopInfo.openTimes[index][0]"
                    :variant="
                      errors['time'][index][0].length > 0 ? 'danger' : 'success'
                    "
                    :disabled="!editShopInfo.businessDay[index]"
                  ></hours-input>
                </div>

                <!-- Another Hours -->
                <div class="mt-2">
                  <div class="mb-1 text-xs">
                    {{ $t("editRestaurant.businessHourOption") }}
                  </div>
                  <hours-input
                    v-model="editShopInfo.openTimes[index][1]"
                    :variant="
                      errors['time'][index][1].length > 0 ? 'danger' : 'success'
                    "
                    :disabled="!editShopInfo.businessDay[index]"
                  ></hours-input>
                </div>
              </div>
            </div>
          </div>

          <!-- Temporary Closure -->
          <div class="mt-4">
            <div class="pb-2 text-sm font-bold">
              {{ $t("shopInfo.temporaryClosure") }}
            </div>

            <div class="rounded-lg bg-black bg-opacity-5 p-4 pb-2">
              <div class="mb-2 text-sm font-bold text-black text-opacity-40">
                {{ $t("shopInfo.temporaryClosureDescription") }}
              </div>

              <!-- Date Picker -->
              <o-field>
                <o-datepicker
                  class="w-full"
                  icon="calendar-today"
                  v-model="newTemporaryClosure"
                  ref="datepicker"
                  :min-date="new Date()"
                  :max-date="maxDate"
                  expanded
                  :placeholder="$t('shopInfo.temporaryClosureSelect')"
                >
                </o-datepicker>

                <o-button @click="addNewTemporaryClosure" class="b-reset-tw">
                  <div
                    class="inline-flex h-9 items-center justify-center rounded-r bg-black bg-opacity-5 px-4"
                  >
                    <i class="material-icons mr-2 text-lg text-op-teal">add</i>
                    <div class="text-sm font-bold text-op-teal">
                      {{ $t("shopInfo.temporaryClosureAdd") }}
                    </div>
                  </div>
                </o-button>
              </o-field>

              <!-- Saved Closure Days -->
              <div class="mb-2 grid grid-cols-1 space-y-2">
                <template v-for="(day, key) in editShopInfo.temporaryClosure || []">
                  <template v-if="day.getTime() > now.getTime()">
                    <div
                      class="flex items-center rounded bg-white bg-opacity-50 px-2"
                    >
                      <div class="flex-1 p-2">
                        {{ moment(day).format("YYYY/MM/DD") }}
                        {{
                          $t(
                            "week.short." +
                              days[Number(moment(day).format("e")) || 7]
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

      <!-- Publish Status -->
      <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
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
      <div class="mt-6 flex justify-center space-x-4">
        <!-- Cancel Button -->
        <router-link
          :to="`/admin/restaurants/#restaurant_` + editShopInfo.restaurantId"
        >
          <div
            class="inline-flex h-12 items-center rounded-full bg-black bg-opacity-5 px-6"
          >
            <span class="text-base font-bold text-black text-opacity-60">{{
              $t("button.cancel")
            }}</span>
          </div>
        </router-link>

        <!-- Save Button -->
        <o-button
          @click="saveRestaurant"
          :disabled="submitting || disableSave"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-12 items-center justify-center rounded-full bg-op-teal px-6 shadow"
            style="min-width: 8rem"
          >
            <span class="text-base font-bold text-white">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : editShopInfo.publicFlag
                  ? "editCommon.save"
                  : "editCommon.saveDraft"
              )
            }}</span>
          </div>
        </o-button>
      </div>

      <!-- Copy -->
      <div class="mt-6 text-center">
        <o-button
          @click="confirmCopy"
          :disabled="submitting"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons mr-2 text-lg text-op-teal"> queue </i>
            <span class="text-sm font-bold text-op-teal">{{
              $t(
                submitting
                  ? "editCommon.saving"
                  : isInMo
                  ? "mobileOrder.copy"
                  : "editCommon.copy"
              )
            }}</span>
          </div>
        </o-button>
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
  onUnmounted,
  onMounted,
  onUpdated,
  PropType,
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc, getDoc } from "firebase/firestore";

import { google_geocode } from "@/lib/google/api";
import { ownPlateConfig, moPickup } from "@/config/project";

import BackButton from "@/components/BackButton.vue";
import NotFound from "@/components/NotFound.vue";
import PhoneEntry from "@/components/PhoneEntry.vue";
import Price from "@/components/Price.vue";

import HoursInput from "@/app/admin/inputComponents/HoursInput.vue";
import TextForm from "@/app/admin/inputComponents/TextForm.vue";
import State from "@/app/admin/inputComponents/State.vue";
import NotificationIndex from "@/app/admin/Notifications/Index.vue";

import ImageUpload from "@/components/ImageUpload.vue";

import { checkShopOwner } from "@/utils/userPermission";

import {
  getEditShopInfo,
  defaultShopInfo,
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
} from "@/utils/utils";
import { uploadFile } from "@/lib/firebase/storage";

import {
  taxRates,
  daysOfWeek,
  reservationTheDayBefore,
  minimumCookTimeChoices,
  paymentMethods,
} from "@/config/constant";

import { useStore } from "vuex";
import { useRouter } from "vue-router";
import moment from "moment";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  name: "RestaurantPage",
  components: {
    HoursInput,
    TextForm,
    State,
    BackButton,
    NotificationIndex,
    NotFound,
    PhoneEntry,
    Price,
    ImageUpload,
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Restaurant",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();

    const restaurantId = useRestaurantId();
    const maxDate = new Date();
    const now = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const taxRateKeys = regionalSetting["taxRateKeys"];
    const region = ownPlateConfig.region;

    const requireTaxInput = regionalSetting.requireTaxInput;
    const requireTaxPriceDisplay = regionalSetting.requireTaxPriceDisplay;

    const notFound = ref<boolean | null>(null);
    const gMap = ref();
    const mapObj = ref();
    
    // internal ref;
    const maplocation = ref({});
    const place_id = ref<string | null>(null);
    // const markers = ref([]);
    const markers: any[] = []; // for google map
    const errorsPhone = ref<string[]>([]);
    const files = ref<{[key: string]: File}>({});
    const updateFirstCall = ref(true);

    // external ref
    const submitting = ref(false);
    const newTemporaryClosure = ref<Date | null>(null);
    const searchResults = ref<{place_id: string, geometry: any}[]>([]);
    const selectedResult = ref(0);

    const editShopInfo = reactive(props.shopInfo);
    
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
          // @ts-ignore
          document
            .getElementById(window.location.hash.slice(1))
            .scrollIntoView();
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
        files.value["cover"]
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
        markers.map((marker) => {
          marker.setMap(null);
        });
        markers.splice(0);
      }
    };
    const setCurrentLocation = async (location: {lat?: number, lng?: number}, move = true) => {
      if (
        location &&
        location.lat &&
        location.lng
      ) {
        if (move) {
          mapObj.value.setCenter(location);
        }
        removeAllMarker();
        markers.push(new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.lng),
          title: "hello",
          map: mapObj.value,
        }));
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
      return new Date().getTime() < day.getTime();
    };
    const isNewTemporaryClosure = (day: Date) => {
      const func = (elem: Date) => {
        return elem.getTime() === day.getTime();
      };
      return !editShopInfo.temporaryClosure.some(func);
    };
    const deleteTemporaryClosure = (key: number) => {
      editShopInfo.temporaryClosure = editShopInfo.temporaryClosure.filter(
        (v, n) => n !== key
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
        }
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
      phoneNumber: string,
      countryCode: string,
      errors: string[],
    }) => {
      //console.log(payload)
      editShopInfo.phoneNumber = payload.phoneNumber;
      editShopInfo.countryCode = payload.countryCode;
      errorsPhone.value = payload.errors;
    };
    const setDefaultLocation = async () => {
      // gMap.value &&
      // gMap.value.$mapPromise &&
      mapObj.value = await gMap.value.$mapPromise;

      if (editShopInfo && editShopInfo.location) {
        setCurrentLocation(editShopInfo.location);
      }
    };
    onMounted(() => {
      setDefaultLocation();
    });
    const gmapClick = (arg: any) => {
      setCurrentLocation(
        { lat: arg.latLng.lat(), lng: arg.latLng.lng() },
        false
      );
      // place_id.value = null;
      setLocation();
    };
    const copyRestaurantFunc = async () => {
      try {
        const id = await copyRestaurant(
          editShopInfo,
          uid.value,
          restaurantId.value
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
    const confirmCopy = async () => {
      store.commit("setAlert", {
        code: props.isInMo ? "mobileOrder.copyAlert" : "editCommon.copyAlert",
        callback: async () => {
          copyRestaurantFunc();
        },
      });
    };
    const updateRestaurantData = async (restaurantData: any) => {
      const cleanData = cleanObject(restaurantData);
      await updateDoc(
        doc(db, `restaurants/${restaurantId.value}`),
        cleanData
      );
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
      
      paymentMethods,
      openTips,
      restaurantId,

      confirmCopy,
      saveRestaurant,
      updateAndUpdateMap,

      disableSave,

      moPickup,
    };
  },
});
</script>
