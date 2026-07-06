import { toast } from "sonner"

export { toast }

export const useToast = () => {
  return {
    toast: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warning,
    dismiss: toast.dismiss,
  }
}
