import CryptoJS from "crypto-js";
import { useCallback } from "react";

const useEncrypt = () => {
  const secretKeyBase64 = "ZWRlYmEzMzI4ZWM2YzFhM2JkODc1YjU2YmIxMjJlM2M=";
  const secretKey = CryptoJS.enc.Base64.parse(secretKeyBase64);

  const encrypt = useCallback(
    (data) => {
      if (!data) throw new Error("Data to encrypt cannot be empty.");
      const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      const safe_encrypt = encrypted.toString().replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return safe_encrypt.toString();
    },
    [secretKey]
  );

  const decrypt = useCallback(
    (data) => {
      if (!data) throw new Error("Data to decrypt cannot be empty.");
      // kembalikan karakter yang di-replace saat encrypt
      const restored = data.replace(/-/g, '+').replace(/_/g, '/');
      const decrypted = CryptoJS.AES.decrypt(restored, secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    },
    [secretKey]
  );

  return { encrypt, decrypt };
};

export default useEncrypt; 