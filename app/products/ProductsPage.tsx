"use client"
import { useState, type FC } from "react";
import { Plus, Package, Eye, Edit2, Trash2, Check } from "lucide-react";
import { Image as ImgIcon } from "lucide-react";

import { C }               from "../../constants/colors";
import { mockProducts }    from "../../constants/mockData";
import { card, btn, inp }  from "../../styles/shared";
import { Modal, FormField } from "../../components/ui";

const ProductsPage: FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("CNG Kits");
  const [activeProduct,  setActiveProduct]  = useState<string | null>(null);
  const [modal,          setModal]          = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Category sidebar */}
        <div style={{ ...card(), padding: 0, width: 220, flexShrink: 0, overflow: "hidden", alignSelf: "flex-start" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, fontWeight: 600, color: C.t, fontSize: 14 }}>Categories</div>
          {Object.entries(mockProducts).map(([cat, { icon }]) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                width:       "100%",
                display:     "flex",
                alignItems:  "center",
                gap:         10,
                padding:     "12px 16px",
                border:      "none",
                cursor:      "pointer",
                fontFamily:  "inherit",
                background:  activeCategory === cat ? C.pXLight : "transparent",
                color:       activeCategory === cat ? C.p : C.t,
                fontSize:    13,
                fontWeight:  activeCategory === cat ? 600 : 400,
                borderLeft:  activeCategory === cat ? `3px solid ${C.p}` : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>{cat}
            </button>
          ))}
          <div style={{ padding: 12 }}>
            <button style={{ ...btn("ghost"), width: "100%", justifyContent: "center", fontSize: 13 }}><Plus size={14} />Add Category</button>
          </div>
        </div>

        {/* Products area */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 15 }}>{activeCategory}</div>
            <button style={btn()} onClick={() => setModal(true)}><Plus size={14} />Add Product</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {mockProducts[activeCategory]?.items.map((item) => (
              <div key={item} style={{ ...card(), padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => setActiveProduct(item)}>
                <div style={{ height: 90, background: `linear-gradient(135deg, ${C.p}15, ${C.p}30)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={30} color={C.p} />
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, color: C.t, fontSize: 13, marginBottom: 4 }}>{item}</div>
                  <div style={{ fontSize: 12, color: C.tm, marginBottom: 10 }}>3 components · 2 variants</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setActiveProduct(item); }}><Eye size={12} />View</button>
                    <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12 }}><Edit2 size={12} />Edit</button>
                    <button style={{ ...btn("ghost"), padding: "4px 8px", color: C.red }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product detail modal */}
      {activeProduct && (
        <Modal open={!!activeProduct} title={activeProduct} onClose={() => setActiveProduct(null)} width={560}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {["GFI", "Tartarini", "BRC"].map((b) => (
              <div key={b} style={{ flex: 1, border: `1px solid ${C.bd}`, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>⚙️</div>
                <div style={{ fontWeight: 600, color: C.t, fontSize: 13 }}>{b}</div>
                <div style={{ fontSize: 11, color: C.tm }}>2 models</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.bg, borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 600, color: C.t, fontSize: 13, marginBottom: 10 }}>Components</div>
            {["Reducer", "Injector Rail", "ECU", "Filler Valve"].map((comp) => (
              <div key={comp} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bd}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: C.white, border: `1px solid ${C.bd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>🔩</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.t }}>{comp}</div>
                  <div style={{ fontSize: 11, color: C.tm }}>Click to add description</div>
                </div>
                <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12 }}><Edit2 size={12} /></button>
              </div>
            ))}
            <button style={{ ...btn("ghost"), marginTop: 10, fontSize: 12 }}><Plus size={12} />Add Component</button>
          </div>
        </Modal>
      )}

      {/* Add product modal */}
      <Modal open={modal} title="Add New Product" onClose={() => setModal(false)}>
        <FormField label="Product Name"><input style={inp()} placeholder="e.g. EZ Blue Kit" /></FormField>
        <FormField label="Category">
          <select style={inp()}>{Object.keys(mockProducts).map((k) => <option key={k}>{k}</option>)}</select>
        </FormField>
        <FormField label="Description"><textarea style={{ ...inp(), height: 80, resize: "vertical" }} placeholder="Product description..." /></FormField>
        <FormField label="Product Image">
          <div style={{ border: `2px dashed ${C.bd}`, borderRadius: 12, padding: "20px 0", textAlign: "center", color: C.tm, fontSize: 13 }}>
            <ImgIcon size={22} style={{ margin: "0 auto 8px" }} /><br />Upload product image
          </div>
        </FormField>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btn("ghost")} onClick={() => setModal(false)}>Cancel</button>
          <button style={btn()}        onClick={() => setModal(false)}><Check size={14} />Add Product</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;
