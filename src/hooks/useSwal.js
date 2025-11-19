import { useEffect, useState } from "react"
import Swal from "sweetalert2";

export default function useSwal() {
  const showAlert = (title, icon, text, showCancel = false) => {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: showCancel,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      return result.isConfirmed; // return true / false
    });
  };

  return { showAlert };
}
