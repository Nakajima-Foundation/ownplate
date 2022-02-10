// import fetch from 'node-fetch';
import * as apiUtils from "./apiUtils";

class SmaregiApi {
  stacks: string[];
  scopes: string;
  access_token: string | null;
  contractId: string;
  clientId: string;
  clientSecret: string;

  constructor(config) {
    this.stacks = [];
    this.scopes = config.scopes;
    this.access_token = null;
    this.contractId = config.contractId;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    apiUtils.updateHost(config.hostName || "api.smaregi.dev");
    apiUtils.updateAuthHost(config.authHostName || "id.smaregi.dev");
  }
  initApi(name) {
    this.stacks = [name];
    return this;
  }
  stackParam(params) {
    this.stacks = this.stacks.concat(params);
  }

  // api base
  coupons() {
    this.initApi("coupons");
    return this;
  }
  stores() {
    this.initApi("stores");
    return this;
  }
  products() {
    this.initApi("products");
    return this;
  }
  stock() {
    this.initApi("stock");
    return this;
  }
  categories() {
    this.initApi("categories");
    return this;
  }
  // coupons
  id(value) {
    this.stackParam([value]);
    return this;
  }
  storeProducts() {
    this.stackParam(["products"]);
    return this;
  }
  type(value) {
    this.stackParam(["type", value]);
    return this;
  }
  // api calld
  get() {
    return this.stacks.join("/");
  }
  async list(params: any = {}) {
    const path = this.stacks.join("/");
    const json = await apiUtils.get_func(this.contractId, path, this.access_token, params);
    return json;
  }
  async create(data) {
    const path = this.stacks.join("/");
    const json = await apiUtils.post_func(this.contractId, path, this.access_token, data);
    return json;
  }
  async update(data) {
    const path = this.stacks.join("/");
    const json = await apiUtils.patch_func(this.contractId, path, this.access_token, data);
    return json;
  }
  async delete(data = {}) {
    const path = this.stacks.join("/");
    const json = await apiUtils.delete_func(this.contractId, path, this.access_token, data);
    return json;
  }
  setAccessToken(token: string) {
    this.access_token = token;
  }
  async auth() {
    const body = await apiUtils.authentication(this.clientId, this.clientSecret, this.contractId, this.scopes);
    this.access_token = body.access_token;
  }
}

export default SmaregiApi;
