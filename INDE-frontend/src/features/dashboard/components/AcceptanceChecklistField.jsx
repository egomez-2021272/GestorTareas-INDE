import React from "react";

const parseChecklistItems = (value = "") =>
  String(value || "")
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const checked = /^\[(x|X|✓|✔)\]/.test(item);
      const label = item.replace(/^\[(?:x|X|✓|✔|\s)\]\s*/, "").trim();
      return { label, checked };
    })
    .filter((item) => item.label)
    .map((item, index) => ({
      id: `criterion-${index}-${item.label}`,
      ...item,
    }));

const serializeChecklistItems = (items = []) =>
  items
    .filter((item) => item && (String(item.label || "").trim() || item.checked))
    .map(
      (item) =>
        `${item.checked ? "[x]" : "[ ]"} ${String(item.label || "").trim()}`,
    )
    .filter((text) => text && text !== "[ ] ")
    .join("\n");

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `criterion-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const AcceptanceChecklistField = ({
  value = "",
  onChange,
  disabled = false,
  label = "Criterios de aceptación",
  maxItems = 6,
}) => {
  const [items, setItems] = React.useState(() => {
    const parsed = parseChecklistItems(value);
    return parsed.length > 0
      ? parsed
      : [{ id: makeId(), label: "", checked: false }];
  });

  React.useEffect(() => {
    const nextItems = parseChecklistItems(value);
    setItems((current) => {
      const normalized =
        nextItems.length > 0
          ? nextItems
          : [{ id: makeId(), label: "", checked: false }];
      const same =
        normalized.length === current.length &&
        normalized.every((item, index) => {
          const currentItem = current[index];
          return (
            currentItem &&
            currentItem.label === item.label &&
            currentItem.checked === item.checked
          );
        });

      return same ? current : normalized;
    });
  }, [value]);

  const commitItems = (nextItems) => {
    const cleaned = nextItems
      .map((item) => ({
        id: item.id || makeId(),
        label: String(item.label || "").trim(),
        checked: Boolean(item.checked),
      }))
      .filter((item) => item.label || item.checked);

    const finalItems =
      cleaned.length > 0
        ? cleaned
        : [{ id: makeId(), label: "", checked: false }];
    setItems(finalItems);
    onChange?.(serializeChecklistItems(finalItems));
  };

  const handleAdd = () => {
    if (disabled || items.length >= maxItems) return;
    commitItems([...items, { id: makeId(), label: "", checked: false }]);
  };

  const handleItemChange = (index, patch) => {
    if (disabled) return;
    commitItems(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const handleRemove = (index) => {
    if (disabled) return;
    const nextItems = items.filter((_, i) => i !== index);
    commitItems(
      nextItems.length > 0
        ? nextItems
        : [{ id: makeId(), label: "", checked: false }],
    );
  };

  return (
    <div>
      <label className="text-[10px] font-bold text-[#94a3b8] block mb-1 uppercase tracking-wider">
        {label}
      </label>

      <div className="space-y-2 bg-[#12141a] border border-[#333a47] rounded-lg p-3">
        {items.map((item, index) => (
          <div
            key={item.id || `${index}-criterion`}
            className="flex items-center gap-2 min-w-0"
          >
            <input
              type="checkbox"
              checked={Boolean(item.checked)}
              disabled={disabled}
              onChange={(e) =>
                handleItemChange(index, { checked: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded border-[#333a47] bg-[#20242d] shrink-0 disabled:opacity-60"
            />

            <input
              type="text"
              value={item.label || ""}
              disabled={disabled}
              onChange={(e) =>
                handleItemChange(index, { label: e.target.value })
              }
              placeholder="Agregar criterio"
              className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder:text-[#64748b] focus:outline-none disabled:opacity-60"
            />

            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-[#94a3b8] hover:text-white text-sm shrink-0"
                aria-label="Eliminar criterio"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {!disabled && items.length < maxItems && (
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 text-[10px] uppercase tracking-wider text-[#0aa5b5] hover:text-[#22c1d3]"
          >
            + Añadir criterio
          </button>
        )}
      </div>
    </div>
  );
};
