/* Small shared UI pieces used across panel pages. */
export function PageHead({ title, sub, children }) {
  return (
    <div className="view-head">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      <div className="spacer" />
      {children}
    </div>
  );
}

export function Kpi({ tone = "teal", label, value, unit, icon }) {
  return (
    <div className={"card kpi " + tone}>
      {icon && <div className="kicon">{icon}</div>}
      <div className="klabel">{label}</div>
      <div className="kval num">
        {value}
        {unit && <small>{unit}</small>}
      </div>
    </div>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Modal({ title, onClose, children, max }) {
  return (
    <div className="overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={max ? { maxWidth: max } : undefined}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
