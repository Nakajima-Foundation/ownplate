import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const uploadFile = (file: File, path: string) => {
  return new Promise((resolve, rejected) => {
    let storage = getStorage();
    let storageRef = ref(storage, path);
    let uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (err) => {
        rejected(err);
      },
      async () => {
        // const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        //resolve(downloadURL);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          resolve(downloadURL); 
        });
      }
    );
  });
};
