export interface Context {
  auth: {
    uid: string;
    token: {
      phone_number: string;
      parentUid: string;
      email: string;
      admin: boolean;
    };
  };
}
