import Vue, { VNode } from "vue";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | undefined;
  }

  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Element extends VNode {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
