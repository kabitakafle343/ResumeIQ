// utils/toast.ts
import toast from "react-hot-toast";

export const showToast = (
  message: string,
  type: "success" | "error" = "success",
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right" = "top-right"
) => {
  toast[type](message, {
    position,
  });
};