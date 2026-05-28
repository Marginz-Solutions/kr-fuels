import { FormField, Modal } from '@/components/ui'
import { btn, inp } from '@/styles/shared'
import { Check, Loader2 } from 'lucide-react'
import React from 'react'
import { FAQFormDraft } from '../FAQPage'
import { C } from '@/constants/colors'
import { Faq } from '@/types/dust'

type AddModalProps = {
    modal: boolean,
    setModal: (val: boolean) => void,
    editing: Faq| null,
    saving: boolean,
    form: FAQFormDraft,
    setForm: React.Dispatch<React.SetStateAction<FAQFormDraft>>
    formError: string | null,
    save: () => void
}

const AddModal = (props: AddModalProps) => {
    const { editing, form, modal, saving, setForm, formError, setModal,save } = props
    return (
        <div>
            <Modal open={modal} title={editing ? "Edit FAQ" : "Add FAQ"} onClose={() => !saving && setModal(false)}>
                <FormField label="Question">
                    <input
                        style={inp()}
                        value={form.question}
                        onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                        placeholder="Enter the question"
                        disabled={saving}
                    />
                </FormField>

                <FormField label="Answer / URL">
                    <textarea
                        style={{ ...inp(), height: 100, resize: "vertical" }}
                        value={form.answer}
                        onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                        placeholder={form.isLink ? "https://..." : "Enter the answer"}
                        disabled={saving}
                    />
                </FormField>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <input
                        type="checkbox"
                        id="isLink"
                        checked={form.isLink}
                        onChange={(e) => setForm((p) => ({ ...p, isLink: e.target.checked }))}
                        disabled={saving}
                    />
                    <label htmlFor="isLink" style={{ fontSize: 13, color: C.t, cursor: "pointer" }}>
                        This FAQ links to an external URL
                    </label>
                </div>

                {formError && (
                    <div style={{ fontSize: 12, color: C.red, marginBottom: 12, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
                        {formError}
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button style={btn("ghost")} onClick={() => setModal(false)} disabled={saving}>
                        Cancel
                    </button>
                    <button style={{ ...btn(), opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
                        {saving
                            ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                            : <Check size={14} />
                        }
                        {editing ? "Update" : "Add"} FAQ
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default AddModal