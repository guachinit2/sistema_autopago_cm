import type { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div role="dialog">
      {title && <h2>{title}</h2>}
      {children}
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}
