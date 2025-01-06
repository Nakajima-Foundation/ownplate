declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}

declare module "*.md";
