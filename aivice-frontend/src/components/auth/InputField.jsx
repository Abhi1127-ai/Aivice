export default function InputField({ label, type = "text", name, value, onChange, placeholder, required = false, icon }) {
    return (
        <div style={{ marginBottom: 18 }}>
            {label && (
                <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#374151", marginBottom:6 }}>
                    {label}
                </label>
            )}
            <div style={{ position:"relative" }}>
                {icon && (
                    <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", fontSize:16 }}>
            {icon}
          </span>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    style={{
                        width:"100%", height:44, paddingLeft: icon ? 38 : 14, paddingRight:14,
                        border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, color:"#111827",
                        background:"#F9FAFB", outline:"none", transition:"border-color 0.15s",
                        fontFamily:"'Inter', sans-serif",
                    }}
                    onFocus={e => e.target.style.borderColor = "#10B981"}
                    onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                />
            </div>
        </div>
    );
}
