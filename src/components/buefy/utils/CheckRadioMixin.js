export default {
    emits: ['update:modelValue'],
    props: {
        modelValue: [String, Number, Boolean, Function, Object, Array],
        nativeValue: [String, Number, Boolean, Function, Object, Array],
        type: String,
        disabled: Boolean,
        required: Boolean,
        name: String,
        size: String
    },
    data() {
        return {
            newValue: this.modelValue
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.newValue
            },
            set(value) {
                this.newValue = value
                this.$emit('update:modelValue', value)
            }
        }
    },
    watch: {
        /**
        * When v-model change, set internal value.
        */
        modelValue(value) {
            this.newValue = value
        }
    },
    methods: {
        focus() {
            // MacOS FireFox and Safari do not focus when clicked
            this.$refs.input.focus()
        }
    }
}
