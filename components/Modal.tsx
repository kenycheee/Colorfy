"use client";

import '../app/css/modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  palette: any | null; // palette full object
}

export default function Modal({ open, onClose, palette }: ModalProps) {
  if (!open || !palette) return null;

  const colors = palette.colors || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* ===================== TV COPY ===================== */}
        <div className="tv">
          <div className="tv-inner">
            <div className="bars">
              <div className="bar" style={{ background: colors[0] }} />
              <div className="bar" style={{ background: colors[1] }} />
              <div className="bar" style={{ background: colors[2] }} />
              <div className="bar" style={{ background: colors[3] }} />
              <div className="bar" style={{ background: colors[4] }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
