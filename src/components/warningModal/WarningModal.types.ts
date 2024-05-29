export interface ConfirmModalProps {
  onConfirm: () => void;
  onSecondary: () => void;
  onClose: () => void;
  open: boolean;
  content?: JSX.Element;
  title?: string;
  actionText?: string;
  secondaryActionText?: string;
  size?: "large" | "small" | "fullscreen" | "mini" | "tiny" | undefined;
  closeIcon?: boolean;
  closeOnEscape?: boolean;
  closeOnDimmerClick?: boolean;
}
