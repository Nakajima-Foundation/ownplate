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
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  startOfMonth,
  format,
  addMonths,
  subMonths,
  startOfWeek,
  addDays,
  eachDayOfInterval,
  isToday,
  setHours,
  setMinutes,
} from "date-fns";

const props = defineProps<{ modelValue: Date | null; placeholder: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: Date): void }>();

const isCalendarOpen = ref(false);
const currentMonth = ref(
  props.modelValue ? new Date(props.modelValue) : new Date(),
);
const hours = ref(props.modelValue ? props.modelValue.getHours() : 0);
const minutes = ref(props.modelValue ? props.modelValue.getMinutes() : 0);

watch(
  () => props.modelValue,
  (newDate) => {
    if (newDate) {
      currentMonth.value = new Date(newDate);
      hours.value = newDate.getHours();
      minutes.value = newDate.getMinutes();
    }
  },
);

const formattedDate = computed(() => {
  return props.modelValue ? format(props.modelValue, "yyyy/MM/dd HH:mm") : "";
});

const year = computed(() => currentMonth.value.getFullYear());
const monthName = computed(() => format(currentMonth.value, "MMMM"));

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value);
  const calendarGridStart = startOfWeek(monthStart);
  const calendarGridEnd = addDays(calendarGridStart, 41); // 6 weeks for a consistent grid height
  return eachDayOfInterval({ start: calendarGridStart, end: calendarGridEnd });
});

const openCalendar = () => {
  isCalendarOpen.value = true;
};

const closeCalendar = () => {
  isCalendarOpen.value = false;
};

const isSelected = (day: Date) => {
  return (
    props.modelValue &&
    format(day, "yyyy-MM-dd") === format(props.modelValue, "yyyy-MM-dd")
  );
};

const isSameMonth = (day: Date) => {
  return day.getMonth() === currentMonth.value.getMonth();
};

const selectDate = (day: Date) => {
  const newDate = setMinutes(setHours(day, hours.value), minutes.value);
  emit("update:modelValue", newDate);
};

watch([hours, minutes], () => {
  if (props.modelValue) {
    const newDate = setMinutes(
      setHours(props.modelValue, hours.value),
      minutes.value,
    );
    emit("update:modelValue", newDate);
  }
});

const prevMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1);
};

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1);
};
</script>
