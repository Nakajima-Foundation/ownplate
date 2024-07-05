import Vue, { VNode } from "vue";

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | undefined;
  }

  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
