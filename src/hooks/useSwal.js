import Swal from "sweetalert2";

export default function useSwal() {
  const showAlert = (
    title,
    icon,
    text = "",
    showCancel = false,
    timer = null
  ) => {
    const showButtons = timer ? false : true;

    return Swal.fire({
      title,
      text: timer ? "" : text, 
      icon,
      showCancelButton: showCancel && showButtons,
      showConfirmButton: showButtons,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      timer: timer || undefined,
      timerProgressBar: timer ? true : false,
    }).then((result) => {
      return result.isConfirmed;
    });
  };

  return { showAlert };
}
