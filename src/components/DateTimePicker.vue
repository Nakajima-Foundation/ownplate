<template>
  <div class="relative">
    <input
      type="text"
      :value="formattedDate"
      @click="openCalendar"
      readonly
      class="w-full cursor-pointer rounded border border-gray-300 p-2 dark:bg-black dark:border-gray-600 dark:text-white"
      :placeholder="placeholder"
    />
    <div
      v-if="isCalendarOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeCalendar"
      @keydown.esc="closeCalendar"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="w-full max-w-xs rounded-lg bg-white p-4 shadow-lg">
        <div class="mb-4 flex items-center justify-between">
          <button @click="prevMonth" class="rounded-full p-2 hover:bg-gray-100">
            &lt;
          </button>
          <div class="text-lg font-semibold">{{ monthName }} {{ year }}</div>
          <button @click="nextMonth" class="rounded-full p-2 hover:bg-gray-100">
            &gt;
          </button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
          <div
            v-for="day in daysOfWeek"
            :key="day"
            class="text-sm font-medium text-gray-500"
          >
            {{ $t(day) }}
          </div>
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            @click="selectDate(day)"
            :class="[
              'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full',
              { 'bg-blue-500 text-white hover:bg-blue-600': isSelected(day) },
              { 'text-gray-400': !isSameMonth(day) },
              { 'hover:bg-gray-200': !isSelected(day) },
              { 'ring-2 ring-blue-500': isToday(day) && !isSelected(day) },
            ]"
          >
            {{ day.getDate() }}
          </div>
        </div>
        <div class="mt-4 flex items-center justify-center space-x-2">
          <input
            type="number"
            v-model="hours"
            min="0"
            max="23"
            class="w-16 rounded border border-gray-300 p-1 text-center dark:bg-black dark:border-gray-600 dark:text-white"
          />
          <span>:</span>
          <input
            type="number"
            v-model="minutes"
            min="0"
            max="59"
            class="w-16 rounded border border-gray-300 p-1 text-center dark:bg-black dark:border-gray-600 dark:text-white"
          />
        </div>
        <div class="mt-4 flex justify-center">
          <button
            @click="closeCalendar"
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {{ t("shopInfo.temporaryClosureOkay") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import moment from "moment";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: Date | null;
  placeholder: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: Date): void }>();

const { t } = useI18n();

const isCalendarOpen = ref(false);
const currentMonth = ref(
  moment(props.modelValue ? props.modelValue : new Date()),
);
const hours = ref(props.modelValue ? moment(props.modelValue).hour() : 0);
const minutes = ref(props.modelValue ? moment(props.modelValue).minute() : 0);

watch(
  () => props.modelValue,
  (newDate) => {
    if (newDate) {
      currentMonth.value = moment(newDate);
      hours.value = moment(newDate).hour();
      minutes.value = moment(newDate).minute();
    }
  },
);

const formattedDate = computed(() => {
  return props.modelValue
    ? moment(props.modelValue).format("YYYY/MM/DD HH:mm")
    : "";
});

const year = currentMonth.value.year();
const monthName = currentMonth.value.format("MMMM");

const daysOfWeek = computed(() => {
  return [
    "week.shortest.sunday",
    "week.shortest.monday",
    "week.shortest.tuesday",
    "week.shortest.wednesday",
    "week.shortest.thursday",
    "week.shortest.friday",
    "week.shortest.saturday",
  ];
});

const calendarDays = computed(() => {
  const monthStart = currentMonth.value.clone().startOf("month");
  const calendarGridStart = monthStart.clone().startOf("week");
  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(calendarGridStart.clone().add(i, "days").toDate());
  }
  return days;
});

const openCalendar = () => {
  isCalendarOpen.value = true;
};

const closeCalendar = () => {
  isCalendarOpen.value = false;
};

const isSelected = (day: Date) => {
  return props.modelValue && moment(day).isSame(props.modelValue, "day");
};

const isSameMonth = (day: Date) => {
  return moment(day).isSame(currentMonth.value, "month");
};

const selectDate = (day: Date) => {
  // Add validation if min/max date props are implemented
  if (props.minDate && day < props.minDate) return;
  if (props.maxDate && day > props.maxDate) return;

  const newDate = moment(day).hour(hours.value).minute(minutes.value).toDate();
  emit("update:modelValue", newDate);
};

watch([hours, minutes], () => {
  if (props.modelValue) {
    const newDate = moment(props.modelValue)
      .hour(hours.value)
      .minute(minutes.value)
      .toDate();
    emit("update:modelValue", newDate);
  }
});

const prevMonth = () => {
  currentMonth.value = currentMonth.value.clone().subtract(1, "month");
};

const nextMonth = () => {
  currentMonth.value = currentMonth.value.clone().add(1, "month");
};

const isToday = (day: Date) => {
  return moment(day).isSame(moment(), "day");
};
</script>
