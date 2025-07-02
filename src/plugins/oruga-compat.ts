import { App, defineComponent, h, computed } from "vue";

export default {
  install(app: App) {
    app.component(
      "o-button",
      defineComponent({
        name: "OButton",
        props: { disabled: Boolean },
        emits: ["click"],
        setup(props, { slots, emit, attrs }) {
          const handle = (e: Event) => emit("click", e);
          return () =>
            h(
              "button",
              {
                ...attrs,
                disabled: props.disabled,
                onClick: handle,
                class: attrs.class,
              },
              slots.default && slots.default(),
            );
        },
      }),
    );

    app.component(
      "o-checkbox",
      defineComponent({
        name: "OCheckbox",
        props: { modelValue: Boolean },
        emits: ["update:modelValue"],
        setup(props, { emit, slots, attrs }) {
          const onChange = (e: Event) =>
            emit("update:modelValue", (e.target as HTMLInputElement).checked);
          return () =>
            h("label", { class: attrs.class }, [
              h("input", {
                type: "checkbox",
                checked: props.modelValue,
                onChange,
                class: "mr-2",
              }),
              slots.default && slots.default(),
            ]);
        },
      }),
    );

    app.component(
      "o-input",
      defineComponent({
        name: "OInput",
        props: { modelValue: [String, Number] },
        emits: ["update:modelValue"],
        setup(props, { emit, attrs }) {
          const onInput = (e: Event) =>
            emit("update:modelValue", (e.target as HTMLInputElement).value);
          return () =>
            h("input", {
              ...attrs,
              value: props.modelValue,
              onInput,
              class: "border rounded px-2 py-1 w-full",
            });
        },
      }),
    );

    app.component(
      "o-select",
      defineComponent({
        name: "OSelect",
        props: { modelValue: [String, Number] },
        emits: ["update:modelValue"],
        setup(props, { emit, slots, attrs }) {
          const onChange = (e: Event) =>
            emit("update:modelValue", (e.target as HTMLSelectElement).value);
          return () =>
            h(
              "select",
              {
                ...attrs,
                value: props.modelValue,
                onChange,
                class: "border rounded px-2 py-1 w-full",
              },
              slots.default && slots.default(),
            );
        },
      }),
    );

    app.component(
      "o-radio",
      defineComponent({
        name: "ORadio",
        props: {
          modelValue: [String, Number, Boolean],
          value: [String, Number, Boolean],
        },
        emits: ["update:modelValue"],
        setup(props, { emit, slots, attrs }) {
          const onChange = () => emit("update:modelValue", props.value);
          const checked = computed(() => props.modelValue === props.value);
          return () =>
            h("label", { class: attrs.class }, [
              h("input", {
                type: "radio",
                checked: checked.value,
                onChange,
                class: "mr-2",
              }),
              slots.default && slots.default(),
            ]);
        },
      }),
    );

    app.component(
      "o-icon",
      defineComponent({
        name: "OIcon",
        props: {
          icon: String,
          pack: String,
          spin: Boolean,
          customSize: String,
        },
        setup(props, { attrs }) {
          const classes = computed(() => [
            props.pack || "fas",
            `fa-${props.icon}`,
            props.spin ? "animate-spin" : "",
            props.customSize,
            attrs.class,
          ]);
          return () => h("i", { class: classes.value });
        },
      }),
    );

    app.component(
      "o-loading",
      defineComponent({
        name: "OLoading",
        props: {
          active: Boolean,
          isFullPage: { type: Boolean, default: true },
          canCancel: Boolean,
        },
        emits: ["close"],
        setup(props, { emit, slots, attrs }) {
          const close = () => props.canCancel && emit("close");
          return () =>
            props.active
              ? h(
                  "div",
                  {
                    class: [
                      props.isFullPage ? "fixed" : "absolute",
                      "inset-0 flex items-center justify-center bg-black bg-opacity-25",
                      attrs.class,
                    ],
                    onClick: close,
                  },
                  h("i", {
                    class: "fas fa-circle-notch fa-spin text-4xl text-white",
                  }),
                )
              : null;
        },
      }),
    );

    app.component(
      "o-modal",
      defineComponent({
        name: "OModal",
        props: { active: Boolean, width: String, modelValue: Boolean },
        emits: ["update:active", "close"],
        setup(props, { slots, emit, attrs }) {
          const isActive = computed(() => props.active ?? props.modelValue);
          const close = () => {
            emit("update:active", false);
            emit("close");
          };
          return () =>
            isActive.value
              ? h(
                  "div",
                  {
                    class: [
                      "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
                      attrs.class,
                    ],
                    onClick: (e: Event) => {
                      if (e.target === e.currentTarget) close();
                    },
                  },
                  h(
                    "div",
                    {
                      style: { width: props.width || "auto" },
                      class: "bg-white rounded shadow p-2",
                    },
                    slots.default && slots.default(),
                  ),
                )
              : null;
        },
      }),
    );

    app.component(
      "o-sidebar",
      defineComponent({
        name: "OSidebar",
        props: { active: Boolean },
        emits: ["update:active"],
        setup(props, { slots, emit, attrs }) {
          const close = () => emit("update:active", false);
          return () =>
            props.active
              ? h("div", { class: "fixed inset-0 z-40 flex", onClick: close }, [
                  h(
                    "div",
                    {
                      class: [
                        "bg-white shadow w-64 h-full overflow-y-auto",
                        attrs.class,
                      ],
                      onClick: (e: Event) => e.stopPropagation(),
                    },
                    slots.default && slots.default(),
                  ),
                  h("div", { class: "flex-1 bg-black bg-opacity-30" }),
                ])
              : null;
        },
      }),
    );

    app.component(
      "o-field",
      defineComponent({
        name: "OField",
        setup(_, { slots, attrs }) {
          return () =>
            h("div", { class: attrs.class }, slots.default && slots.default());
        },
      }),
    );

    app.component(
      "o-datepicker",
      defineComponent({
        name: "ODatepicker",
        props: { modelValue: String },
        emits: ["update:modelValue"],
        setup(props, { emit, attrs }) {
          const onInput = (e: Event) =>
            emit("update:modelValue", (e.target as HTMLInputElement).value);
          return () =>
            h("input", {
              type: "date",
              value: props.modelValue,
              onInput,
              ...attrs,
              class: "border rounded px-2 py-1",
            });
        },
      }),
    );

    app.component(
      "o-datetimepicker",
      defineComponent({
        name: "ODatetimepicker",
        props: { modelValue: String },
        emits: ["update:modelValue"],
        setup(props, { emit, attrs }) {
          const onInput = (e: Event) =>
            emit("update:modelValue", (e.target as HTMLInputElement).value);
          return () =>
            h("input", {
              type: "datetime-local",
              value: props.modelValue,
              onInput,
              ...attrs,
              class: "border rounded px-2 py-1",
            });
        },
      }),
    );
  },
};
