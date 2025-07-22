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
            {{ day }}
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import moment from "moment";

const props = defineProps<{ modelValue: Date | null; placeholder: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: Date): void }>();

const isCalendarOpen = ref(false);
const currentMonth = ref(
  moment(props.modelValue ? props.modelValue : new Date()),
);

watch(
  () => props.modelValue,
  (newDate) => {
    if (newDate) {
      currentMonth.value = moment(newDate);
    }
  },
);

const formattedDate = computed(() => {
  return props.modelValue ? moment(props.modelValue).format("YYYY/MM/DD") : "";
});

const year = computed(() => currentMonth.value.year());
const monthName = computed(() => currentMonth.value.format("MMMM"));

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const calendarDays = computed(() => {
  const monthStart = currentMonth.value.clone().startOf("month");
  const calendarGridStart = monthStart.clone().startOf("week");
  const days = [];
  for (let i = 0; i <= 41; i++) {
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
  emit("update:modelValue", day);
  closeCalendar();
};

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
