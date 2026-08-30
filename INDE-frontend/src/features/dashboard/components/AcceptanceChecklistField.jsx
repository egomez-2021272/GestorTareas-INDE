import React from "react";

const parseChecklistItems = (value = "") =>
  String(value || "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const checked = /^\[(x|X|✓|✔)\]/.test(line);
      const label = line.replace(/^\[(?:x|X|✓|✔|\s)\]\s*/, "").trim();
      return { label, checked };
    })
    .filter((item) => item.label)
    .map((item, index) => ({
      id: `criterion-${index}-${item.label}`,
      ...item,
    }));

const serializeChecklistItems = (items = []) =>
  items
    .map((item) => {
      const label = String(item?.label ?? "").trim();
      if (!label && !item?.checked) return null;
      return `${item?.checked ? "[x]" : "[ ]"} ${label}`;
    })
    .filter(Boolean)
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
    const sanitized = nextItems.map((item) => ({
      ...item,
      id: item.id || makeId(),
      label: String(item.label ?? ""),
      checked: Boolean(item.checked),
    }));

    // Mantén items vacíos en el estado local para que el usuario pueda escribir
    setItems(sanitized);

    // Solo serializa items no-vacíos para el onChange del padre
    onChange?.(serializeChecklistItems(sanitized));
  };

  const handleAdd = () => {
    if (disabled || items.length >= maxItems) return;
    commitItems([...items, { id: makeId(), label: "", checked: false }]);
  };

  const handleItemChange = (index, patch) => {
    if (disabled) return;
    const nextItems = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    commitItems(nextItems);
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
