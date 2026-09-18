/**
 * components/ui/Modal.tsx
 * Confirmation dialog with backdrop overlay.
 */
'use client'

import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ModalProps {
  open:        boolean
  onClose:     () => void
  onConfirm:   () => void
  title:       string
  description: string
  confirmText?: string
  variant?:    'danger' | 'primary'
  loading?:    boolean
}

export function Modal({
  open, onClose, onConfirm, title, description,
  confirmText = 'Confirmar', variant = 'danger', loading = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-2xl">
        <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant={variant}
          size="md"
          onClick={onConfirm}
          isLoading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </dialog>
  )
}
