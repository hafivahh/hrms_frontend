import Swal from "sweetalert2";

export default function useSwal() {
  const showAlert = (
    title,
    icon,
    text = "",
    showCancel = false,
    timer = null,
    confirmText = "Submit",
    cancelText = "Cancel"
  ) => {
    const showButtons = !timer;

    return Swal.fire({
      title,
      text: timer ? "" : text,
      icon,
      
      showCancelButton: showCancel && showButtons,
      showConfirmButton: showButtons,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: false,
      confirmButtonColor: "#3085d6",
      timer: timer || undefined,
      timerProgressBar: !!timer,
    });
  };

  return { showAlert };
}