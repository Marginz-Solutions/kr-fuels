import { Modal } from '@/components/ui'
import { C } from '@/constants/colors'
import { btn } from '@/styles/shared'
import { Faq } from '@/types/dust'
import { AlertTriangle, Trash2 } from 'lucide-react'


type DeleteModalProps = {
    confirmDelete: Faq | null,
    setConfirmDelete: (val: Faq | null)=> void,
    confirmAndDelete:()=> void
}

const DeleteModal = (props: DeleteModalProps) => {
    const {confirmDelete,setConfirmDelete,confirmAndDelete}= props
  return (
    <div>
        <Modal
        open={!!confirmDelete}
        title="Delete FAQ"
        onClose={() => setConfirmDelete(null)}
      >
        {/* Warning icon + message */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0 20px" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={22} color={C.red} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.t, marginBottom: 6 }}>
              Are you sure?
            </div>
            <div style={{ fontSize: 13, color: C.tm, maxWidth: 320, lineHeight: 1.5 }}>
              This will permanently delete the FAQ:
            </div>
            <div style={{
              fontSize: 13, color: C.t, fontWeight: 500,
              marginTop: 8, padding: "8px 12px",
              background: C.bg ?? "#f9fafb",
              border: `1px solid ${C.bd}`,
              borderRadius: 8,
              maxWidth: 320,
              wordBreak: "break-word",
            }}>
              "{confirmDelete?.question}"
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setConfirmDelete(null)}>
            Cancel
          </button>
          <button
            style={{ ...btn(), background: C.red, borderColor: C.red }}
            onClick={confirmAndDelete}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default DeleteModal