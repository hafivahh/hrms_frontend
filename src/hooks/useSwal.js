import Swal from "sweetalert2";

export default function useSwal() {
  const showAlert = (
    title,
    icon,
    text = "",
    showCancel = false,
    timer = null,
    confirmText = null,
    cancelText = "Cancel"
  ) => {
    const showButtons = !timer;

    // Tentukan default tombol berdasarkan jenis alert
    let defaultConfirmText = "Submit";

    if (icon === "info" || icon === "error" || icon === "warning") {
      defaultConfirmText = "OKE";
    }

    return Swal.fire({
      title,
      text: timer ? "" : text,
      icon,

      showCancelButton: showCancel && showButtons,
      showConfirmButton: showButtons,

      confirmButtonText: confirmText || defaultConfirmText,
      cancelButtonText: cancelText,

      reverseButtons: false,
      confirmButtonColor: "#3085d6",

      timer: timer || undefined,
      timerProgressBar: !!timer,
    });
  };

  return { showAlert };
}