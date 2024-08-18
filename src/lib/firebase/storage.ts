import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export const uploadFile = (file: File, path: string): Promise<string> => {
  return new Promise((resolve, rejected) => {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (err) => {
        rejected(err);
      },
      () => {
        // const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        //resolve(downloadURL);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          resolve(downloadURL);
        });
      },
    );
  });
};
