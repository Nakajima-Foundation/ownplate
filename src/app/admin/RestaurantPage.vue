<template>
  <div>
    <div v-if="notFound == null"></div>
    <!-- Never show before load restaurant data -->
    <div v-else>
      <!-- Edit Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24 m-t-24">
            <!-- Nav Bar -->
            <div class="level">
              <!-- Back Button and Restaurant Profile -->
              <div class="level-left flex-1"></div>
              <!-- Notification Settings -->
              <div class="level-right">
                <notification-index :shopInfo="shopInfo" />
              </div>
            </div>

            <!-- Cancel and Save Button -->
            <div class="align-center m-t-24">
              <!-- Cancel Button -->
              <b-button
                class="b-reset op-button-small tertiary m-r-16"
                style="min-width: 128px;"
                tag="nuxt-link"
                :to="`/admin/restaurants/`"
              >
                <span class="p-l-24 p-r-24">{{ $t("button.cancel") }}</span>
              </b-button>

              <!-- Save Button -->
              <b-button
                class="b-reset op-button-small primary"
                style="min-width: 128px;"
                :disabled="submitting"
                @click="submitRestaurant"
              >
                <span class="c-onprimary p-l-24 p-r-24">
                  {{
                    $t(
                      submitting
                        ? "editCommon.saving"
                        : shopInfo.publicFlag
                        ? "editCommon.save"
                        : "editCommon.saveDraft"
                    )
                  }}
                </span>
              </b-button>
            </div>

            <!-- Public Checkbox -->
            <div
              class="m-t-24 align-center bg-form p-l-16 p-r-16 p-t-16 p-b-16 rounded-lg"
            >
              <b-checkbox
                v-model="shopInfo.publicFlag"
                :disabled="hasError"
                :type="!shopInfo.publicFlag ? 'is-danger' : ''"
              >
                <span class="t-subtitle1">{{ $t("shopInfo.public") }}</span>
              </b-checkbox>
              <!-- Messages -->
              <div class="m-t-4">
                <div v-if="shopInfo.publicFlag" class="t-subtitle2">
                  {{ $t("editRestaurant.publishDescription") }}
                </div>
                <div
                  v-if="!shopInfo.publicFlag"
                  class="t-subtitle2 c-status-red"
                >
                  {{ $t("editRestaurant.draftDescription") }}
                </div>
                <div v-if="hasError" class="t-subtitle2 c-status-red">
                  {{ $t("editRestaurant.draftWarning") }}
                </div>
              </div>
            </div>

            <!-- Required Note -->
            <div class="t-subtitle2 c-status-red m-t-24">
              * {{ $t("editRestaurant.required") }}
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <!-- Edit Body Area 1 -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Restaurant Name -->
            <div class="m-t-16">
              <text-form
                v-model="shopInfo.restaurantName"
                titleKey="shopInfo.name"
                placeholder="editRestaurant.enterRestaurantName"
                :error="errors['restaurantName']"
                :maxlength="50"
              />
            </div>

            <!-- Owner Name -->
            <div>
              <text-form
                v-model="shopInfo.ownerName"
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
                <div class="cols">
                  <div class="flex-1">
                    <text-form
                      :error="errors['zip']"
                      v-model="shopInfo.zip"
                      titleKey="shopInfo.zip"
                      placeholder="editRestaurant.enterZip"
                      :maxlength="10"
                    />
                  </div>
                  <div class="p-l-16">
                    <state :errors="errors" v-model="shopInfo.state" />
                  </div>
                </div>
                <!-- City -->
                <text-form
                  :error="errors['city']"
                  v-model="shopInfo.city"
                  titleKey="shopInfo.city"
                  placeholder="editRestaurant.enterCity"
                  :maxlength="15"
                />
                <!-- Street -->
                <text-form
                  :error="errors['streetAddress']"
                  v-model="shopInfo.streetAddress"
                  titleKey="shopInfo.streetAddress"
                  placeholder="editRestaurant.enterStreetAddress"
                  :maxlength="30"
                />
              </template>

              <!-- Other -->
              <template v-else>
                <!-- Street -->
                <text-form
                  :error="errors['streetAddress']"
                  v-model="shopInfo.streetAddress"
                  titleKey="shopInfo.streetAddress"
                  placeholder="editRestaurant.enterStreetAddress"
                  :maxlength="30"
                />
                <!-- City -->
                <text-form
                  :error="errors['city']"
                  v-model="shopInfo.city"
                  titleKey="shopInfo.city"
                  placeholder="editRestaurant.enterCity"
                  :maxlength="15"
                />
                <!-- State and Zip -->
                <div class="cols">
                  <div class="p-r-16">
                    <state :errors="errors" v-model="shopInfo.state" />
                  </div>
                  <div class="flex-1">
                    <text-form
                      :error="errors['zip']"
                      v-model="shopInfo.zip"
                      titleKey="shopInfo.zip"
                      placeholder="editRestaurant.enterZip"
                      :maxlength="10"
                    />
                  </div>
                </div>
              </template>
            </div>

            <!-- Map -->
            <div>
              <div class="align-center">
                <b-button
                  class="b-reset op-button-small primary"
                  @click="updateAndUpdateMap"
                >
                  <span class="c-onprimary p-l-24 p-r-24">
                    {{ $t("editRestaurant.updateMap") }}
                  </span>
                </b-button>
              </div>
              <div class="align-center t-subtitle2 c-status-red m-t-8">
                {{ $t("editRestaurant.updateMapDescription") }}
              </div>
              <div class="m-t-16">
                <GMap
                  ref="gMap"
                  :center="{ lat: 44.933076, lng: 15.629058 }"
                  :options="{ fullscreenControl: false }"
                  :zoom="18"
                  @loaded="hello"
                ></GMap>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Phone -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("shopInfo.phonenumber") }}
                <span class="c-status-red">*</span>
              </div>
              <div>
                <phone-entry
                  :currentNumber="shopInfo.phoneNumber"
                  :placeholder="$t('editRestaurant.enterPhone')"
                  @change="handlePhoneChange"
                />
              </div>
            </div>

            <!-- Profile Photo -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editRestaurant.profilePhoto") }}
                <span class="c-status-red">*</span>
              </div>
              <div
                class="cols"
                v-bind:class="{
                  'no-photo': errors['restProfilePhoto'].length !== 0
                }"
              >
                <!-- Current Photo -->
                <div v-if="restProfilePhoto" class="p-r-16">
                  <div>
                    <img
                      class="w-32 h-32 rounded cover"
                      :src="restProfilePhoto"
                    />
                  </div>
                  <div class="align-center t-caption">
                    {{ $t("editCommon.current") }}
                  </div>
                </div>
                <!-- New Photo -->
                <div class="flex-1">
                  <croppa
                    :width="128"
                    :height="128"
                    :prevent-white-space="true"
                    :zoom-speed="5"
                    :accept="'image/jpeg'"
                    :placeholder="$t('editCommon.clickAndUpload')"
                    :placeholder-font-size="13"
                    :disable-drag-to-move="true"
                    :disable-scroll-to-zoom="true"
                    :disable-rotation="true"
                    initial-position="center"
                    :canvas-color="'gainsboro'"
                    :show-remove-button="true"
                    @file-choose="handleProfileImage"
                    @file-type-mismatch="handleProfileImageRemove"
                    @image-remove="handleProfileImageRemove"
                  ></croppa>
                  <div class="align-center t-caption w-32">
                    {{ $t("editCommon.new") }}
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="t-body2 c-text-black-medium p-l-8 p-r-8 m-t-8">
                {{ $t("editCommon.clickAndUploadDetail") }}
              </div>
            </div>

            <!-- Cover Photo -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editRestaurant.coverPhoto") }}
              </div>
              <div>
                <div v-if="restCoverPhoto" class="p-b-8">
                  <div>
                    <img
                      class="h-32 rounded cover"
                      :src="restCoverPhoto"
                      style="width: 272px;"
                    />
                  </div>
                  <div class="align-center t-caption" style="width: 272px;">
                    {{ $t("editCommon.current") }}
                  </div>
                </div>
                <div class="cols">
                  <div>
                    <croppa
                      :width="272"
                      :height="128"
                      :prevent-white-space="true"
                      :zoom-speed="5"
                      :accept="'image/jpeg'"
                      :placeholder="$t('editCommon.clickAndUpload')"
                      :placeholder-font-size="13"
                      :disable-drag-to-move="true"
                      :disable-scroll-to-zoom="true"
                      :disable-rotation="true"
                      initial-position="center"
                      :canvas-color="'gainsboro'"
                      :show-remove-button="true"
                      @file-choose="handleCoverImage"
                      @file-type-mismatch="handleCoverImageRemove"
                      @image-remove="handleCoverImageRemove"
                    ></croppa>
                    <div class="align-center t-caption" style="width: 272px;">
                      {{ $t("editCommon.new") }}
                    </div>
                  </div>
                </div>
                <div class="t-body2 c-text-black-medium p-l-8 p-r-8 m-t-8">
                  {{ $t("editCommon.clickAndUploadDetail") }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <!-- Devider -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <hr class="devider m-t-24 m-b-0" />
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <!-- Edit Body Area 2 -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- URL -->
            <div class="m-t-16">
              <text-form
                v-model="shopInfo.url"
                :error="errors['url']"
                titleKey="shopInfo.website"
                placeholder="editRestaurant.enterWebsite"
                :maxlength="100"
                :required="false"
              />
            </div>

            <!-- Description -->
            <div>
              <text-form
                v-model="shopInfo.introduction"
                type="textarea"
                :required="false"
                :maxlength="300"
                titleKey="editRestaurant.introduction"
                placeholder="editRestaurant.enterIntroduction"
                :error="errors['introduction']"
              />
            </div>

            <!-- Order Notice -->
            <div>
              <text-form
                v-model="shopInfo.orderNotice"
                type="textarea"
                :required="false"
                :maxlength="300"
                titleKey="editRestaurant.orderNotice"
                placeholder="editRestaurant.enterOrderNotice"
                :error="errors['orderNotice']"
              />
            </div>

            <!-- Thank you Message -->
            <div>
              <text-form
                v-model="shopInfo.orderThanks"
                type="textarea"
                :required="false"
                :maxlength="300"
                titleKey="editRestaurant.orderThanks"
                placeholder="editRestaurant.enterOrderThanks"
                :error="errors['orderThanks']"
              />
            </div>

            <!-- LINE URL -->
            <div>
              <text-form
                v-model="shopInfo.lineUrl"
                :error="errors['lineUrl']"
                titleKey="shopInfo.lineUrl"
                placeholder="editRestaurant.enterLineUrl"
                :maxlength="100"
                :required="false"
              />
            </div>

            <!-- Instagram URL -->
            <div>
              <text-form
                v-model="shopInfo.instagramUrl"
                :error="errors['instagramUrl']"
                titleKey="shopInfo.instagramUrl"
                placeholder="editRestaurant.enterInstagramUrl"
                :maxlength="100"
                :required="false"
              />
            </div>

            <!-- Tax -->
            <div>
              <!-- Tax Input Required -->
              <div v-if="requireTaxInput">
                <div class="cols">
                  <div class="m-r-16">
                    <div class="t-subtitle2 c-text-black-medium p-b-8">
                      {{ $t("editRestaurant.foodTax") }}
                    </div>
                    <b-field
                      class="is-inline-flex"
                      style="align-items: center;"
                      :type="
                        errors['foodTax'].length > 0
                          ? 'is-danger'
                          : 'is-success'
                      "
                    >
                      <b-input
                        v-model="shopInfo.foodTax"
                        placeholder="8.2"
                        type="text"
                        maxlength="5"
                        class="w-24"
                      />
                      <div class="m-l-8">%</div>
                    </b-field>
                  </div>
                  <div>
                    <div class="t-subtitle2 c-text-black-medium p-b-8">
                      {{ $t("editRestaurant.alcoholTax") }}
                    </div>
                    <b-field
                      class="is-inline-flex"
                      style="align-items: center;"
                      :type="
                        errors['alcoholTax'].length > 0
                          ? 'is-danger'
                          : 'is-success'
                      "
                    >
                      <b-input
                        v-model="shopInfo.alcoholTax"
                        placeholder="10.2"
                        type="text"
                        maxlength="5"
                        class="w-24"
                      />
                      <div class="m-l-8">%</div>
                    </b-field>
                  </div>
                </div>
              </div>

              <!-- Tax Input Not Required -->
              <div v-if="!requireTaxInput">
                <div>
                  <div class="t-subtitle2 c-text-black-medium p-b-8">
                    {{ $t("editRestaurant.tax") }}
                  </div>
                  <div class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-8">
                    <div
                      v-for="taxItem in taxRates"
                      class="p-b-8 t-body1 c-text-black-high"
                    >
                      {{ $t("editMenu." + taxRateKeys[taxItem]) }}
                      {{ shopInfo[taxItem + "Tax"] }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tax Display -->
              <div v-if="requireTaxPriceDisplay" class="m-t-16">
                <div class="t-subtitle2 c-text-black-medium p-b-8">
                  {{ $t("editRestaurant.taxPriceDisplay") }}
                </div>
                <div
                  class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 t-body1 c-text-black-high"
                >
                  <div>
                    <b-checkbox v-model="shopInfo.inclusiveTax">
                      {{ $t("editRestaurant.taxIncluded") }}
                    </b-checkbox>
                  </div>
                  <div class="m-t-8">
                    {{ $tc("tax.taxExample", examplePriceI18n) }} -
                    <Price :shopInfo="shopInfo" :menu="sampleMenu" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Time to Pickup -->
            <div v-if="requireTaxPriceDisplay" class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editRestaurant.timeToPickup") }}
              </div>
              <div
                class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 t-body1 c-text-black-high"
              >
                <!-- Preparation Time -->
                <div class="m-r-16">
                  <div class="p-b-4">
                    {{ $t("editRestaurant.preparationTime") }}
                  </div>
                  <b-field
                    class="cols"
                    style="align-items: center;"
                    :type="
                      errors['pickUpMinimumCookTime'].length > 0
                        ? 'is-danger'
                        : 'is-success'
                    "
                  >
                    <b-input
                      v-model.number="shopInfo.pickUpMinimumCookTime"
                      placeholder="10"
                      type="text"
                      class="w-24"
                    />
                    <div class="m-l-8">
                      {{ $t("editRestaurant.minutes") }} -
                      {{ $t("editRestaurant.withinFiveDays") }}
                    </div>
                  </b-field>
                </div>
                <div class="m-t-8">
                  <b-radio
                    v-for="choice in minimumCookTimeChoices"
                    v-model="shopInfo.pickUpMinimumCookTime"
                    :native-value="choice.value"
                    :key="choice.value"
                    >{{ $t(choice.messageKey) }}</b-radio
                  >
                </div>

                <!-- The Day Before -->
                <div class="m-t-8">
                  <div class="p-b-4">
                    {{ $t("editRestaurant.reservationTheDayBefore") }}
                  </div>
                  <b-field
                    class="is-inline-flex"
                    style="align-items: center;"
                    :type="
                      errors['pickUpDaysInAdvance'].length > 0
                        ? 'is-danger'
                        : 'is-success'
                    "
                  >
                    <b-select v-model.number="shopInfo.pickUpDaysInAdvance">
                      <option
                        v-for="(day, index) in reservationTheDayBefore"
                        :key="index"
                        :value="day.value"
                        >{{ $t(day.messageKey) }}</option
                      >
                    </b-select>
                  </b-field>
                </div>
              </div>
            </div>

            <!-- Phone Call -->
            <div v-if="region === 'JP'" class="m-t-16">
              <a id="phoneCall" />
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editRestaurant.phoneCall") }}
              </div>
              <div
                class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 t-body1 c-text-black-high"
              >
                <b-checkbox v-model="shopInfo.phoneCall">
                  {{ $t("editRestaurant.phoneCallDescription") }}
                </b-checkbox>
                <div class="t-caption c-text-black-medium p-t-8">
                  {{ $t("editRestaurant.phoneCallNotice") }}
                </div>
              </div>
            </div>
            <!-- End of Phone Call -->

            <!-- Order Memo from Takeout Customer -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium p-b-8">
                {{ $t("editRestaurant.acceptUserMessage") }}
              </div>
              <div
                class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 t-body1 c-text-black-high"
              >
                <b-checkbox v-model="shopInfo.acceptUserMessage">
                  {{ $t("editRestaurant.acceptUserMessageDescription") }}
                </b-checkbox>
                <div class="t-caption c-text-black-medium p-t-8">
                  {{ $t("editRestaurant.acceptUserMessageNotice") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Hours -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium">
                {{ $t("shopInfo.hours") }}
              </div>
              <div class="t-subtitle2 c-status-red">
                {{ $t("editRestaurant.businessHourDescription") }}
              </div>
              <div
                v-for="(day, index) in days"
                :key="index"
                class="bg-form rounded-lg m-t-8 p-l-16 p-r-16 p-t-16 p-b-16"
              >
                <div class="cols flex-center">
                  <!-- Enable/Disable Day -->
                  <div class="flex-1">
                    <b-checkbox v-model="shopInfo.businessDay[index]">
                      {{ $t("week.short." + day) }}
                    </b-checkbox>
                  </div>

                  <!-- Copy Previous Day -->
                  <div class="op-button-text" @click="copyPreviousDay(index)">
                    <i class="material-icons c-primary s-18">content_copy</i>
                    <span>{{
                      $t(
                        index === "1"
                          ? "editRestaurant.copySunDay"
                          : "editRestaurant.copyPreviousDay"
                      )
                    }}</span>
                  </div>
                </div>
                <div class="m-t-8">
                  <hours-input
                    v-model="shopInfo.openTimes[index][0]"
                    :type="
                      errors['time'][index][0].length > 0
                        ? 'is-danger'
                        : 'is-success'
                    "
                    :disabled="!shopInfo.businessDay[index]"
                  ></hours-input>
                </div>
                <div class="m-t-8">
                  <div class="t-caption p-b-4">
                    {{ $t("editRestaurant.businessHourOption") }}
                  </div>
                  <hours-input
                    v-model="shopInfo.openTimes[index][1]"
                    :type="
                      errors['time'][index][1].length > 0
                        ? 'is-danger'
                        : 'is-success'
                    "
                    :disabled="!shopInfo.businessDay[index]"
                  ></hours-input>
                </div>
              </div>
            </div>
          </div>
          <div class="m-l-24 m-r-24">
            <!-- Hours -->
            <div class="m-t-16">
              <div class="t-subtitle2 c-text-black-medium">
                {{ $t("shopInfo.temporaryClosure") }}
              </div>
              <div class="bg-form rounded-lg m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
                <b-field>
                  <b-datepicker
                    v-model="newTemporaryClosure"
                    ref="datepicker"
                    :min-date="new Date()"
                    :max-date="maxDate"
                    expanded
                    placeholder="Select a date"
                  >
                  </b-datepicker>
                  <b-button
                    @click="$refs.datepicker.toggle()"
                    icon-left="calendar-today"
                    type="is-primary"
                  />
                  <b-button
                    @click="addNewTemporaryClosure"
                    icon-left="plus"
                    style="margin-left: 2px"
                    type="is-primary"
                  />
                </b-field>
                <div
                  v-for="(day, key) in shopInfo.temporaryClosure || []"
                  style="margin-buttom: 2px; display: table;"
                >
                  <template v-if="day.getTime() > now.getTime()">
                    <span style="display: table-cell; vertical-align: middle;">
                      {{ moment(day).format("YYYY/MM/DD") }}
                      {{
                        $t(
                          "week.short." +
                            days[Number(moment(day).format("e")) || 7]
                        )
                      }}
                    </span>
                    <b-button
                      @click="deleteTemporaryClosure(key)"
                      class="b-reset op-button-pill h-10 bg-status-red-bg m-l-8"
                    >
                      <i class="material-icons c-status-red s-18 p-l-8 p-r-8"
                        >delete</i
                      >
                    </b-button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <!-- Edit Footer Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24 m-t-24">
            <!-- Public Checkbox -->
            <div
              class="m-t-24 align-center bg-form p-l-16 p-r-16 p-t-16 p-b-16 rounded-lg"
            >
              <b-checkbox
                v-model="shopInfo.publicFlag"
                :disabled="hasError"
                :type="!shopInfo.publicFlag ? 'is-danger' : ''"
              >
                <span class="t-subtitle1">{{ $t("shopInfo.public") }}</span>
              </b-checkbox>
              <!-- Messages -->
              <div class="m-t-4">
                <div v-if="shopInfo.publicFlag" class="t-subtitle2">
                  {{ $t("editRestaurant.publishDescription") }}
                </div>
                <div
                  v-if="!shopInfo.publicFlag"
                  class="t-subtitle2 c-status-red"
                >
                  {{ $t("editRestaurant.draftDescription") }}
                </div>
                <div v-if="hasError" class="t-subtitle2 c-status-red">
                  {{ $t("editRestaurant.draftWarning") }}
                </div>
              </div>
            </div>

            <!-- Cancel and Save Button -->
            <div class="align-center m-t-24">
              <!-- Cancel Button -->
              <b-button
                class="b-reset op-button-small tertiary m-r-16"
                style="min-width: 128px;"
                tag="nuxt-link"
                :to="`/admin/restaurants/`"
              >
                <span class="p-l-24 p-r-24">{{ $t("button.cancel") }}</span>
              </b-button>

              <!-- Save Button -->
              <b-button
                class="b-reset op-button-small primary"
                style="min-width: 128px;"
                :disabled="submitting"
                @click="submitRestaurant"
              >
                <span class="c-onprimary p-l-24 p-r-24">
                  {{
                    $t(
                      submitting
                        ? "editCommon.saving"
                        : shopInfo.publicFlag
                        ? "editCommon.save"
                        : "editCommon.saveDraft"
                    )
                  }}
                </span>
              </b-button>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { db, storage, firestore } from "~/plugins/firebase.js";

import * as API from "~/plugins/api";
import BackButton from "~/components/BackButton";
import NotFound from "~/components/NotFound";
import PhoneEntry from "~/components/PhoneEntry";
import Price from "~/components/Price";
import { ownPlateConfig } from "@/config/project";

import HoursInput from "./inputComponents/HoursInput";
import TextForm from "./inputComponents/TextForm";
import State from "./inputComponents/State";

import NotificationIndex from "./Notifications/Index";

import {
  taxRates,
  daysOfWeek,
  reservationTheDayBefore,
  minimumCookTimeChoices
} from "~/plugins/constant.js";

export default {
  name: "Order",
  components: {
    HoursInput,
    TextForm,
    State,
    BackButton,
    NotificationIndex,
    NotFound,
    PhoneEntry,
    Price
  },

  data() {
    const maxDate = new Date();
    const now = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    return {
      reservationTheDayBefore,
      minimumCookTimeChoices,
      taxRates: taxRates,
      taxRateKeys: [],

      examplePriceI18n: this.$n(1000, "currency"),
      sampleMenu: { price: 1000, tax: "food" },
      requireTaxInput: false,
      requireTaxPriceDisplay: false,

      defaultTax: {},
      disabled: false, // ??
      filteredItems: [], // ??
      test: null,
      shopInfo: {
        restaurantName: "",
        ownerName: "",
        streetAddress: "",
        city: "",
        state: "",
        zip: "",
        location: {},
        place_id: null,
        phoneNumber: "",
        url: "",
        lineUrl: "",
        instagramUrl: "",
        introduction: "",
        orderNotice: "",
        orderThanks: "",
        phoneCall: false,
        acceptUserMessage: false,
        foodTax: 0,
        alcoholTax: 0,
        inclusiveTax: false,
        openTimes: {
          1: [], // mon
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
          7: []
        },
        businessDay: {
          1: true, // mon
          2: true,
          3: true,
          4: true,
          5: true,
          6: true,
          7: true
        },
        pickUpMinimumCookTime: 25,
        pickUpDaysInAdvance: 3,
        images: {},
        publicFlag: false,
        temporaryClosure: []
      },
      region: ownPlateConfig.region,
      maplocation: {},
      place_id: null,
      markers: [],
      days: daysOfWeek,
      errorsPhone: [],
      notFound: null,
      submitting: false,
      files: {},
      newTemporaryClosure: null,
      maxDate,
      now,
      updateFirstCall: true
    };
  },
  async created() {
    this.taxRateKeys = this.regionalSetting["taxRateKeys"];
    this.requireTaxInput = this.regionalSetting.requireTaxInput;
    this.requireTaxPriceDisplay = this.regionalSetting.requireTaxPriceDisplay;
    this.defaultTax = this.regionalSetting.defaultTax;

    this.checkAdminPermission();

    // never use onSnapshot here.
    const restaurant = await db.doc(`restaurants/${this.restaurantId()}`).get();

    if (!restaurant.exists) {
      this.notFound = true;
      return;
    }
    const restaurant_data = restaurant.data();
    if (restaurant_data.uid !== this.uid) {
      this.notFound = true;
      return;
    }
    this.shopInfo = Object.assign({}, this.shopInfo, restaurant_data);
    if (this.defaultTax) {
      this.shopInfo = Object.assign({}, this.shopInfo, this.defaultTax);
    }
    if (this.shopInfo.temporaryClosure) {
      this.shopInfo.temporaryClosure = this.shopInfo.temporaryClosure.map(
        day => {
          return day.toDate();
        }
      );
    }

    this.notFound = false;
  },
  mounted() {
    this.hello();
  },
  updated() {
    if (this.updateFirstCall) {
      if (window.location.hash) {
        document.getElementById(window.location.hash.slice(1)).scrollIntoView();
      }
      this.updateFirstCall = false;
    }
  },
  computed: {
    restProfilePhoto() {
      return (
        (this.shopInfo?.images?.profile?.resizedImages || {})["600"] ||
        this.shopInfo.restProfilePhoto
      );
    },
    restCoverPhoto() {
      return (
        (this.shopInfo?.images?.cover?.resizedImages || {})["600"] ||
        this.shopInfo.restCoverPhoto
      );
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    errors() {
      console.log(this.shopInfo);
      const err = {};
      [
        "restaurantName",
        "ownerName",
        "streetAddress",
        "city",
        "state",
        "zip",
        "phoneNumber",
        "pickUpMinimumCookTime",
        "pickUpDaysInAdvance"
      ].forEach(name => {
        err[name] = [];
        if (this.shopInfo[name] === "") {
          err[name].push("validationError." + name + ".empty");
        }
      });
      ["introduction", "orderNotice", "orderThanks"].forEach(name => {
        err[name] = [];
      });
      // validate pickUpMinimumCookTime
      if (!Number.isInteger(this.shopInfo["pickUpMinimumCookTime"])) {
        err["pickUpMinimumCookTime"].push(
          "validationError." + name + ".notNumbery"
        );
      } else {
        if (this.shopInfo["pickUpMinimumCookTime"] > 24 * 60 * 6) {
          err["pickUpMinimumCookTime"].push(
            "validationError." + name + ".tooMuch"
          );
        }
        if (this.shopInfo["pickUpMinimumCookTime"] < 0) {
          err["pickUpMinimumCookTime"].push(
            "validationError." + name + ".negative"
          );
        }
      }
      if (
        !reservationTheDayBefore.some(
          day => day.value === this.shopInfo["pickUpDaysInAdvance"]
        )
      ) {
        err["pickUpDaysInAdvance"].push("validationError." + name + ".invalid");
      }

      if (this.requireTaxInput) {
        ["foodTax", "alcoholTax"].forEach(name => {
          err[name] = [];
          if (this.shopInfo[name] === "") {
            err[name].push("validationError." + name + ".empty");
          }
          if (this.shopInfo[name] !== "") {
            if (isNaN(this.shopInfo[name])) {
              err[name].push("validationError." + name + ".invalidNumber");
            }
          }
        });
      }

      const ex = new RegExp("^(https?)://[^\\s]+$");
      err["url"] =
        this.shopInfo.url && !ex.test(this.shopInfo.url)
          ? ["validationError.url.invalidUrl"]
          : [];
      err["lineUrl"] =
        this.shopInfo.lineUrl && !ex.test(this.shopInfo.lineUrl)
          ? ["validationError.lineUrl.invalidUrl"]
          : [];
      err["instagramUrl"] =
        this.shopInfo.instagramUrl && !ex.test(this.shopInfo.instagramUrl)
          ? ["validationError.instagramUrl.invalidUrl"]
          : [];

      err["time"] = {};
      Object.keys(daysOfWeek).forEach(key => {
        err["time"][key] = [];
        [0, 1].forEach(key2 => {
          err["time"][key].push([]);
          if (this.shopInfo.businessDay[key]) {
            if (
              this.shopInfo.openTimes[key] &&
              this.shopInfo.openTimes[key][key2]
            ) {
              const data = this.shopInfo.openTimes[key][key2];
              if (this.isNull(data.start) ^ this.isNull(data.end)) {
                err["time"][key][key2].push("validationError.oneInEmpty");
              }
              if (!this.isNull(data.start) && !this.isNull(data.end)) {
                if (data.start > data.end) {
                  err["time"][key][key2].push(
                    "validationError.validBusinessTime"
                  );
                }
              }
            } else {
              if (key2 === 0) {
                err["time"][key][key2].push("validationError.noSelect");
              }
            }
          }
        });
      });
      err["phoneNumber"] = this.errorsPhone;

      // image
      err["restProfilePhoto"] = [];
      if (
        this.isNull(this.files["profile"]) &&
        this.isNull(this.shopInfo.restProfilePhoto)
      ) {
        err["restProfilePhoto"].push("validationError.restProfilePhoto.empty");
      }
      // todo more validate
      return err;
    },
    hasError() {
      const num = this.countObj(this.errors);
      return num > 0;
    },
    isSetLocation() {
      return Object.keys(this.shopInfo.location).length !== 0;
    }
  },
  watch: {
    notFound: function() {
      if (this.notFound === false) {
        this.hello();
      }
    },
    hasError: function() {
      // this.shopInfo.publicFlag = !this.hasError;
    },
    files: function() {
      console.log(this.files);
    }
  },
  methods: {
    isFuture(day) {
      return new Date().getTime() < day.getTime();
    },
    isNewTemporaryClosure(day) {
      const func = elem => {
        return elem.getTime() === day.getTime();
      };
      return !this.shopInfo.temporaryClosure.some(func);
    },
    deleteTemporaryClosure(key) {
      this.shopInfo.temporaryClosure = this.shopInfo.temporaryClosure.filter(
        (v, n) => n !== key
      );
    },
    addNewTemporaryClosure() {
      if (
        !this.isNull(this.newTemporaryClosure) &&
        this.isNewTemporaryClosure(this.newTemporaryClosure) &&
        this.isFuture(this.newTemporaryClosure)
      ) {
        this.shopInfo.temporaryClosure.push(this.newTemporaryClosure);
        this.shopInfo.temporaryClosure.sort((a, b) => {
          return a.getTime() > b.getTime() ? 1 : -1;
        });
      }
      this.newTemporaryClosure = null;
    },
    copyPreviousDay(index) {
      const prevIndex = index === "1" ? 7 : index - 1;
      this.shopInfo.businessDay[index] = this.shopInfo.businessDay[prevIndex];
      this.shopInfo.openTimes[index] = this.shopInfo.openTimes[prevIndex].map(
        a => {
          return { ...a };
        }
      );
    },
    handleProfileImage(e) {
      const newFile = Object.assign({}, this.files);
      newFile["profile"] = e;
      this.files = newFile;
    },
    handleCoverImage(e) {
      const newFile = Object.assign({}, this.files);
      newFile["cover"] = e;
      this.files = newFile;
    },
    handleProfileImageRemove(e) {
      const newFile = Object.assign({}, this.files);
      newFile["profile"] = null;
      this.files = newFile;
    },
    handleCoverImageRemove(e) {
      const newFile = Object.assign({}, this.files);
      newFile["cover"] = null;
      this.files = newFile;
    },
    handlePhoneChange(payload) {
      //console.log(payload)
      this.shopInfo.phoneNumber = payload.phoneNumber;
      this.shopInfo.countryCode = payload.countryCode;
      this.errorsPhone = payload.errors;
    },
    hello() {
      if (this.shopInfo && this.shopInfo.location) {
        this.setCurrentLocation(this.shopInfo.location);
      }
    },
    async submitRestaurant() {
      this.submitting = true;
      const restaurantId = this.restaurantId();
      try {
        if (this.files["profile"]) {
          const path = `/images/restaurants/${restaurantId}/${this.uid}/profile.jpg`;
          this.shopInfo.restProfilePhoto = await this.uploadFile(
            this.files["profile"],
            path
          );
          this.shopInfo.images.profile = {
            original: this.shopInfo.restProfilePhoto,
            resizedImages: {}
          };
        }

        if (this.files["cover"]) {
          const path = `/images/restaurants/${restaurantId}/${this.uid}/cover.jpg`;
          this.shopInfo.restCoverPhoto = await this.uploadFile(
            this.files["cover"],
            path
          );
          this.shopInfo.images.cover = {
            original: this.shopInfo.restCoverPhoto,
            resizedImages: {}
          };
        }
        const restaurantData = {
          restProfilePhoto: this.shopInfo.restProfilePhoto,
          restCoverPhoto: this.shopInfo.restCoverPhoto,
          restaurantName: this.shopInfo.restaurantName,
          ownerName: this.shopInfo.ownerName,
          streetAddress: this.shopInfo.streetAddress,
          images: {
            cover: this.shopInfo?.images?.cover || {},
            profile: this.shopInfo?.images?.profile || {}
          },
          city: this.shopInfo.city,
          state: this.shopInfo.state,
          zip: this.shopInfo.zip,
          location: this.shopInfo.location,
          place_id: this.shopInfo.place_id,
          phoneNumber: this.shopInfo.phoneNumber,
          phoneCall: this.shopInfo.phoneCall,
          acceptUserMessage: this.shopInfo.acceptUserMessage,
          countryCode: this.shopInfo.countryCode,
          url: this.shopInfo.url,
          lineUrl: this.shopInfo.lineUrl,
          instagramUrl: this.shopInfo.instagramUrl,
          introduction: this.shopInfo.introduction,
          orderNotice: this.shopInfo.orderNotice,
          orderThanks: this.shopInfo.orderThanks,
          pickUpMinimumCookTime: this.shopInfo.pickUpMinimumCookTime,
          pickUpDaysInAdvance: this.shopInfo.pickUpDaysInAdvance,
          foodTax: Number(this.shopInfo.foodTax),
          alcoholTax: Number(this.shopInfo.alcoholTax),
          openTimes: Object.keys(this.shopInfo.openTimes).reduce((tmp, key) => {
            tmp[key] = this.shopInfo.openTimes[key]
              .filter(el => {
                return el !== null && el?.end !== null && el?.start !== null;
              })
              .sort((a, b) => {
                return a.start < b.start ? -1 : 1;
              });
            return tmp;
          }, {}),
          businessDay: this.shopInfo.businessDay,
          temporaryClosure: this.shopInfo.temporaryClosure,
          uid: this.shopInfo.uid,
          publicFlag: this.shopInfo.publicFlag,
          inclusiveTax: this.shopInfo.inclusiveTax,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          createdAt:
            this.shopInfo.createdAt || firestore.FieldValue.serverTimestamp()
        };
        await this.updateRestaurantData(restaurantData);

        this.$router.push({
          path: `/admin/restaurants/`
        });
      } catch (error) {
        this.submitting = false;
        this.$store.commit("setErrorMessage", {
          code: "restaurant.save",
          error
        });
      }
    },
    async updateAndUpdateMap() {
      await this.updateMap();
      this.setLocation();
    },
    async updateMap() {
      // https://gitlab.com/broj42/nuxt-gmaps#readme
      // https://codesandbox.io/s/6j6zw48l83
      const keyword = [
        this.shopInfo.restaurantName,
        this.shopInfo.streetAddress,
        this.shopInfo.city,
        this.shopInfo.state
      ].join(",");

      const res = await API.google_geocode(keyword);
      if (res && res[0] && res[0].geometry) {
        this.setCurrentLocation(res[0].geometry.location);
        this.place_id = res[0].place_id;
      }
    },
    setCurrentLocation(location) {
      if (
        this.$refs.gMap &&
        this.$refs.gMap.map &&
        location &&
        location.lat &&
        location.lng
      ) {
        this.$refs.gMap.map.setCenter(location);
        this.removeAllMarker();
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.lng),
          title: "hello",
          map: this.$refs.gMap.map
        });
        this.markers.push(marker);
        this.maplocation = location;
      }
    },
    setLocation() {
      if (this.maplocation) {
        this.shopInfo.location = this.maplocation;
        this.shopInfo.place_id = this.place_id;
      }
    },
    removeAllMarker() {
      if (this.markers && this.markers.length > 0) {
        this.markers.map(marker => {
          marker.setMap(null);
        });
        this.markers = [];
      }
    },
    async updateRestaurantData(restaurantData) {
      const cleanData = this.cleanObject(restaurantData);
      await db.doc(`restaurants/${this.restaurantId()}`).update(cleanData);
    }
  }
};
</script>

<style lang="scss" scoped>
.no-photo {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ca513e;
}
</style>
