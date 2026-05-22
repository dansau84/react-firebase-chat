import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
// Apuntamos correctamente al archivo firebase.js que exporta storage
import { storage } from "./firebase"; 

const upload = async (file) => {
  if (!file) return ""; // Retorna un string vacío si el usuario no subió imagen

  const date = new Date().getTime(); // Usar milisegundos evita errores en la ruta de Firebase
  const storageRef = ref(storage, `images/${date}_${file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        reject("something went wrong! " + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;