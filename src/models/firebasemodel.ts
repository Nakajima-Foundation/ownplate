import { QueryDocumentSnapshot, DocumentSnapshot } from "firebase/firestore";

export default class FirebaseModel<T> {
  model: QueryDocumentSnapshot | DocumentSnapshot<T>;
  data: T;
  id: string;
  path: string;

  constructor(_model: QueryDocumentSnapshot | DocumentSnapshot<T>) {
    this.data = _model.data() as T;
    this.model = _model;

    this.id = _model.id;
    this.path = this.model.ref.path;
  }
}
