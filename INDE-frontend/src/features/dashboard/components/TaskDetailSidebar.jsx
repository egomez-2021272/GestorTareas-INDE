import React from "react";

export const TaskDetailSidebar = ({
  editForm,
  tags,
  canEdit = false,
  onTagChange,
}) => {
  const selectedTags = (editForm?.tagIds || [])
    .map((tagId) => tags?.find((tag) => tag.id === tagId))
    .filter(Boolean);

  return (
    <aside className="border-l border-[#333a47] bg-[#171d27] p-3">
      <div className="pb-3 border-b border-[#333a47] mb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Detalles
        </h4>
      </div>

      <div className="space-y-3 text-xs text-[#dfe7f5]">
        <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
            Tema
          </p>
          <p>{editForm?.theme || "Sin tema"}</p>
        </div>

        <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
            Épica
          </p>
          <p>{editForm?.epic || "Sin épica"}</p>
        </div>

        <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
            Historia
          </p>
          <p>{editForm?.userStories || "Sin historia"}</p>
        </div>

        <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
            Etiquetas
          </p>
          {canEdit ? (
            <div className="space-y-2">
              {tags?.map((tag) => {
                const isSelected = (editForm?.tagIds || []).includes(tag.id);

                return (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 text-[10px] text-[#e2e8f0] cursor-pointer select-none rounded px-1 py-0.5 hover:bg-[#2a2f3a]"
                  >
                    <input
                      type="radio"
                      name="detail-task-tag"
                      checked={Boolean(isSelected)}
                      onChange={() => onTagChange?.(tag.id)}
                      className="h-3 w-3 text-[#0aa5b5] bg-[#2a2f3a] border-[#333a47] focus:ring-0"
                    />
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: `${tag.color}18`,
                        color: tag.color,
                        borderColor: `${tag.color}40`,
                      }}
                    >
                      {tag.name}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-[#94a3b8]">Sin etiquetas</span>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[#333a47] bg-[#20242d] p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
            Asignados
          </p>
          <p>{editForm?.assignedToNames?.join(", ") || "Sin asignar"}</p>
        </div>
      </div>
    </aside>
  );
};
