"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleGroupHidden,
  moveGroup,
  movePersonToGroup,
  moveMultiplePeopleToGroup,
  togglePersonHidden,
  deletePerson,
  createPerson,
  updatePerson,
  getAllPeople,
  getDeletedPeople,
  restorePerson,
} from "./actions";

type PersonData = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  room: string | null;
  role: string | null;
  designation: string | null;
  origin: string;
  isHidden: boolean;
  sortOrder: number;
  groupId: number | null;
};

type GroupData = {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
  isHidden: boolean;
  children?: GroupData[];
  people?: PersonData[];
};

export default function CatalogoPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [allPeople, setAllPeople] = useState<(PersonData & { group: { id: number; name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [editingPerson, setEditingPerson] = useState<number | null>(null);
  const [showNewGroup, setShowNewGroup] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewPerson, setShowNewPerson] = useState<number | null>(null);
  const [newPerson, setNewPerson] = useState({ name: "", email: "", phone: "", room: "", role: "", designation: "" });
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const [selectedPeople, setSelectedPeople] = useState<Set<number>>(new Set());
  const [personSearch, setPersonSearch] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [deletedPeople, setDeletedPeople] = useState<(PersonData & { group: { id: number; name: string } | null })[]>([]);
  const [showDeletedPanel, setShowDeletedPanel] = useState(false);
  const [showGroupMoveModal, setShowGroupMoveModal] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [g, p] = await Promise.all([getGroups(), getAllPeople()]);
    setGroups(g as unknown as GroupData[]);
    setAllPeople(p as (PersonData & { group: { id: number; name: string } | null })[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredPeople = allPeople.filter((p) =>
    p.name.toLowerCase().includes(personSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(personSearch.toLowerCase()) ||
    p.phone?.includes(personSearch) ||
    p.room?.includes(personSearch) ||
    p.role?.toLowerCase().includes(personSearch.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelectedPeople((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedPeople(new Set(filteredPeople.map((p) => p.id)));
  };

  const clearSelection = () => setSelectedPeople(new Set());

  const handleBatchMove = async (targetGroupId: number | null) => {
    const ids = Array.from(selectedPeople);
    await moveMultiplePeopleToGroup(ids, targetGroupId);
    clearSelection();
    setShowMoveModal(false);
    loadData();
  };

  const loadDeletedPeople = async () => {
    const dp = await getDeletedPeople();
    setDeletedPeople(dp as (PersonData & { group: { id: number; name: string } | null })[]);
  };

  const handleRestorePerson = async (id: number) => {
    await restorePerson(id);
    await loadDeletedPeople();
    loadData();
  };

  const handleMoveGroup = async (groupId: number, targetGroupId: number | null) => {
    await moveGroup(groupId, targetGroupId);
    setShowGroupMoveModal(null);
    loadData();
  };

  const handleCreateGroup = async (parentId: number | null) => {
    if (!newGroupName.trim()) return;
    const fd = new FormData();
    fd.append("name", newGroupName);
    if (parentId) fd.append("parentId", String(parentId));
    await createGroup(fd);
    setNewGroupName("");
    setShowNewGroup(null);
    loadData();
  };

  const handleUpdateGroup = async (id: number, name: string) => {
    if (!name.trim()) return;
    const fd = new FormData();
    fd.append("name", name);
    await updateGroup(id, fd);
    setEditingGroup(null);
    loadData();
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Excluir este grupo? As pessoas nao serao excluidas.")) return;
    await deleteGroup(id);
    loadData();
  };

  const handleCreatePerson = async (groupId: number | null) => {
    if (!newPerson.name.trim()) return;
    const fd = new FormData();
    Object.entries(newPerson).forEach(([k, v]) => fd.append(k, v));
    if (groupId) fd.append("groupId", String(groupId));
    await createPerson(fd);
    setNewPerson({ name: "", email: "", phone: "", room: "", role: "", designation: "" });
    setShowNewPerson(null);
    loadData();
  };

  const handleUpdatePerson = async (id: number, formData: FormData) => {
    await updatePerson(id, formData);
    setEditingPerson(null);
    loadData();
  };

  const handleDeletePerson = async (id: number) => {
    if (!confirm("Excluir esta pessoa?")) return;
    await deletePerson(id);
    loadData();
  };

  const handleDragStartPerson = (e: React.DragEvent, personId: number) => {
    e.dataTransfer.setData("type", "person");
    e.dataTransfer.setData("personId", String(personId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartGroup = (e: React.DragEvent, groupId: number) => {
    e.dataTransfer.setData("type", "group");
    e.dataTransfer.setData("groupId", String(groupId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(targetId);
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = async (e: React.DragEvent, targetGroupId: number | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    const type = e.dataTransfer.getData("type");

    if (type === "person") {
      const personId = parseInt(e.dataTransfer.getData("personId"), 10);
      if (selectedPeople.has(personId) && selectedPeople.size > 1) {
        await moveMultiplePeopleToGroup(Array.from(selectedPeople), targetGroupId);
        clearSelection();
      } else {
        await movePersonToGroup(personId, targetGroupId);
      }
    } else if (type === "group") {
      const draggedGroupId = parseInt(e.dataTransfer.getData("groupId"), 10);
      if (draggedGroupId !== targetGroupId) {
        await moveGroup(draggedGroupId, targetGroupId);
      }
    }
    loadData();
  };

  const ungroupedPeople = allPeople.filter((p) => !p.group);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Carregando...</div></div>;
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Organizacao do Catalogo</h1>
        <button onClick={() => { loadDeletedPeople(); setShowDeletedPanel(!showDeletedPanel); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${showDeletedPanel ? "bg-red-700 text-white hover:bg-red-800" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
          Pessoas Excluidas
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4 shrink-0">
        Arraste pessoas entre grupos. Grupos podem ser aninhados criando subgrupos.
      </p>

      {selectedPeople.size > 0 && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 shrink-0 flex items-center gap-4">
          <span className="font-medium">
            {selectedPeople.size} pessoa{selectedPeople.size !== 1 ? "s" : ""} selecionada{selectedPeople.size !== 1 ? "s" : ""}
          </span>
          <button onClick={() => setShowMoveModal(true)}
            className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-50 text-sm">
            Mover para...
          </button>
          <button onClick={clearSelection} className="text-blue-200 hover:text-white ml-auto text-sm">
            Limpar selecao
          </button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Grupos</h2>
            <button onClick={() => { setShowNewGroup(0); setNewGroupName(""); }}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
              + Novo Grupo
            </button>
          </div>

          {showNewGroup === 0 && (
            <NewGroupForm value={newGroupName} onChange={setNewGroupName}
              onCreate={() => handleCreateGroup(null)} onCancel={() => setShowNewGroup(null)} />
          )}

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div onDragOver={(e) => handleDragOver(e, "root")} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, null)}
              className={`border-2 border-dashed rounded-lg p-4 transition-colors ${dropTarget === "root" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Pessoas sem grupo</div>
              {ungroupedPeople.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhuma pessoa sem grupo</p>
              ) : (
                <div className="space-y-1">
                  {ungroupedPeople.map((person) => (
                    <PersonCard key={person.id} person={person} editing={editingPerson === person.id}
                      selected={selectedPeople.has(person.id)}
                      onToggleSelect={() => toggleSelect(person.id)}
                      onDragStart={(e) => handleDragStartPerson(e, person.id)}
                      onEdit={() => setEditingPerson(person.id)}
                      onToggleHidden={() => togglePersonHidden(person.id).then(loadData)}
                      onDelete={() => handleDeletePerson(person.id)}
                      onUpdate={(id, fd) => handleUpdatePerson(id, fd)}
                      onCancelEdit={() => setEditingPerson(null)} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {groups.map((group) => (
              <GroupCard key={group.id} group={group} editingGroup={editingGroup} editingPerson={editingPerson}
                dropTarget={dropTarget} newGroup={showNewGroup} newGroupName={newGroupName}
                selectedPeople={selectedPeople}
                onDragStartGroup={(e) => handleDragStartGroup(e, group.id)}
                onDragOver={(e) => handleDragOver(e, `group-${group.id}`)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group.id)}
                onSetDropTarget={setDropTarget}
                onDragStartPerson={handleDragStartPerson}
                onEditGroup={() => setEditingGroup(group.id)}
                onUpdateGroup={(name) => handleUpdateGroup(group.id, name)}
                onCancelEditGroup={() => setEditingGroup(null)}
                onToggleGroupHidden={() => toggleGroupHidden(group.id).then(loadData)}
                onDeleteGroup={() => handleDeleteGroup(group.id)}
                onMoveGroup={(id) => setShowGroupMoveModal(id)}
                onShowNewSubGroup={(id) => { setShowNewGroup(id); setNewGroupName(""); }}
                onNewGroupNameChange={setNewGroupName}
                onCreateSubGroup={(parentId) => handleCreateGroup(parentId)}
                onCancelNewGroup={() => setShowNewGroup(null)}
                onEditPerson={(id) => setEditingPerson(id)}
                onCancelEditPerson={() => setEditingPerson(null)}
                onUpdatePerson={handleUpdatePerson}
                onTogglePersonHidden={(id) => togglePersonHidden(id).then(loadData)}
                onDeletePerson={(id) => handleDeletePerson(id)}
                onToggleSelectPerson={toggleSelect} />
            ))}
          </div>

          {groups.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              Nenhum grupo criado. Clique em &quot;+ Novo Grupo&quot; para comecar.
            </div>
          )}
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Todas as Pessoas</h2>
          </div>
          <div className="shrink-0 mb-3">
            <input type="text" placeholder="Buscar por nome, email, telefone, sala, funcao..."
              value={personSearch} onChange={(e) => setPersonSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={selectAllVisible}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800">
              Selecionar todas as {filteredPeople.length} visiveis
            </button>
          </div>
          <button onClick={() => { setShowNewPerson(-1); setNewPerson({ name: "", email: "", phone: "", room: "", role: "", designation: "" }); }}
            className="w-full bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors mb-4 shrink-0">
            + Nova Pessoa
          </button>
          {showNewPerson === -1 && (
            <PersonForm person={newPerson} onChange={setNewPerson} onSubmit={() => handleCreatePerson(null)}
              onCancel={() => setShowNewPerson(null)} />
          )}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} person={person} editing={editingPerson === person.id}
                selected={selectedPeople.has(person.id)}
                onToggleSelect={() => toggleSelect(person.id)}
                onDragStart={(e) => handleDragStartPerson(e, person.id)}
                onEdit={() => setEditingPerson(person.id)}
                onToggleHidden={() => togglePersonHidden(person.id).then(loadData)}
                onDelete={() => handleDeletePerson(person.id)}
                onUpdate={(id, fd) => handleUpdatePerson(id, fd)}
                onCancelEdit={() => setEditingPerson(null)} />
            ))}
          </div>
          {filteredPeople.length === 0 && allPeople.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500 text-sm">
              Nenhuma pessoa encontrada para &quot;{personSearch}&quot;
            </div>
          )}
          {allPeople.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500 text-sm">
              Nenhuma pessoa cadastrada. Importe dados via sincronizacao.
            </div>
          )}
        </div>
      </div>

      {showDeletedPanel && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 shrink-0 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-900">
              Pessoas Excluidas ({deletedPeople.length})
            </h3>
            <button onClick={() => setShowDeletedPanel(false)} className="text-red-400 hover:text-red-600 text-sm">Fechar</button>
          </div>
          {deletedPeople.length === 0 ? (
            <p className="text-sm text-red-400 italic">Nenhuma pessoa excluida</p>
          ) : (
            <div className="space-y-1">
              {deletedPeople.map((person) => (
                <div key={person.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-100 bg-white">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{person.name}</span>
                      {person.origin === "API" && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">API</span>}
                      {person.origin === "MANUAL" && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Local</span>}
                      {person.group && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{person.group.name}</span>}
                    </div>
                    {person.email && <div className="text-xs text-gray-400 truncate">{person.email}</div>}
                  </div>
                  <button onClick={() => handleRestorePerson(person.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 shrink-0">
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showMoveModal && (
        <BatchMoveModal groups={groups} selectedCount={selectedPeople.size}
          onMove={handleBatchMove} onClose={() => setShowMoveModal(false)} />
      )}

      {showGroupMoveModal !== null && (
        <GroupMoveModal groups={groups} groupId={showGroupMoveModal}
          onMove={handleMoveGroup} onClose={() => setShowGroupMoveModal(null)} />
      )}
    </div>
  );
}

function BatchMoveModal({ groups, selectedCount, onMove, onClose }: {
  groups: GroupData[]; selectedCount: number;
  onMove: (groupId: number | null) => void; onClose: () => void;
}) {
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">
          Mover {selectedCount} pessoa{selectedCount !== 1 ? "s" : ""} para:
        </h3>

        <div className="space-y-1">
          <label className={`flex items-center gap-2 p-2 rounded cursor-pointer ${targetGroupId === null ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-100"}`}>
            <input type="radio" name="target" checked={targetGroupId === null}
              onChange={() => setTargetGroupId(null)} className="accent-blue-600" />
            <span className="text-sm">Sem grupo</span>
          </label>

          {groups.map((group) => (
            <GroupRadioItem key={group.id} group={group} level={0}
              targetGroupId={targetGroupId} onSelect={setTargetGroupId} />
          ))}
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={() => onMove(targetGroupId)}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">
            Mover
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupRadioItem({ group, level, targetGroupId, onSelect }: {
  group: GroupData; level: number; targetGroupId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (group.children ?? []).length > 0;

  return (
    <div>
      <label className={`flex items-center gap-2 p-2 rounded cursor-pointer ${targetGroupId === group.id ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-100"}`}
        style={{ paddingLeft: `${(level * 16) + 8}px` }}>
        {hasChildren ? (
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
            className="text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center shrink-0">
            {expanded ? "\u25BC" : "\u25B6"}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <input type="radio" name="target" checked={targetGroupId === group.id}
          onChange={() => onSelect(group.id)} className="accent-blue-600" />
        <span className={`text-sm ${group.isHidden ? "text-gray-400 line-through" : ""}`}>{group.name}</span>
      </label>
      {expanded && hasChildren && (
        <div>
          {group.children!.map((child) => (
            <GroupRadioItem key={child.id} group={child} level={level + 1}
              targetGroupId={targetGroupId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function collectDescendantIds(group: GroupData): number[] {
  const ids: number[] = [];
  for (const child of group.children ?? []) {
    ids.push(child.id);
    ids.push(...collectDescendantIds(child));
  }
  return ids;
}

function GroupMoveModal({ groups, groupId, onMove, onClose }: {
  groups: GroupData[]; groupId: number;
  onMove: (groupId: number, targetGroupId: number | null) => void; onClose: () => void;
}) {
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

  const excludedIds = new Set<number>([groupId]);
  for (const g of groups) {
    if (g.id === groupId) {
      for (const id of collectDescendantIds(g)) excludedIds.add(id);
    }
  }

  const filteredGroups = groups.filter((g) => !excludedIds.has(g.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Mover grupo para:</h3>

        <div className="space-y-1">
          <label className={`flex items-center gap-2 p-2 rounded cursor-pointer ${targetGroupId === null ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-100"}`}>
            <input type="radio" name="target" checked={targetGroupId === null}
              onChange={() => setTargetGroupId(null)} className="accent-blue-600" />
            <span className="text-sm font-medium">Raiz</span>
          </label>

          {filteredGroups.map((group) => (
            <GroupRadioItem key={group.id} group={group} level={0}
              targetGroupId={targetGroupId} onSelect={setTargetGroupId} />
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <p className="text-sm text-gray-400 italic py-2">Nenhum grupo disponivel como destino</p>
        )}

        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={() => onMove(groupId, targetGroupId)}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">
            Mover
          </button>
        </div>
      </div>
    </div>
  );
}

function NewGroupForm({ value, onChange, onCreate, onCancel }: {
  value: string; onChange: (v: string) => void; onCreate: () => void; onCancel: () => void;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
      <input autoFocus value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onCreate()}
        placeholder="Nome do grupo"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      <button onClick={onCreate} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">Criar</button>
      <button onClick={onCancel} className="text-gray-500 px-3 py-2 text-sm hover:text-gray-700">Cancelar</button>
    </div>
  );
}

function GroupCard({ group, editingGroup, editingPerson, dropTarget, newGroup, newGroupName, selectedPeople, onDragStartGroup, onDragOver, onDragLeave, onDrop, onSetDropTarget, onDragStartPerson, onEditGroup, onUpdateGroup, onCancelEditGroup, onToggleGroupHidden, onDeleteGroup, onMoveGroup, onShowNewSubGroup, onNewGroupNameChange, onCreateSubGroup, onCancelNewGroup, onEditPerson, onCancelEditPerson, onUpdatePerson, onTogglePersonHidden, onDeletePerson, onToggleSelectPerson }: {
  group: GroupData; editingGroup: number | null; editingPerson: number | null; dropTarget: string | null;
  newGroup: number | null; newGroupName: string; selectedPeople: Set<number>;
  onDragStartGroup: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void; onDrop: (e: React.DragEvent) => void; onSetDropTarget: (id: string | null) => void;
  onDragStartPerson: (e: React.DragEvent, id: number) => void;
  onEditGroup: () => void; onUpdateGroup: (name: string) => void; onCancelEditGroup: () => void;
  onToggleGroupHidden: () => void; onDeleteGroup: () => void; onMoveGroup: (groupId: number) => void;
  onShowNewSubGroup: (id: number) => void; onNewGroupNameChange: (v: string) => void;
  onCreateSubGroup: (parentId: number) => void; onCancelNewGroup: () => void;
  onEditPerson: (id: number) => void; onCancelEditPerson: () => void;
  onUpdatePerson: (id: number, fd: FormData) => void; onTogglePersonHidden: (id: number) => void;
  onDeletePerson: (id: number) => void; onToggleSelectPerson: (id: number) => void;
}) {
  const isDrop = dropTarget === `group-${group.id}`;

  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className={`bg-white rounded-xl shadow-sm border transition-colors ${isDrop ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div draggable onDragStart={onDragStartGroup} className="cursor-grab text-gray-400 hover:text-gray-600" title="Arrastar grupo">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
        </div>
        {editingGroup === group.id ? (
          <EditGroupForm name={group.name} onSave={onUpdateGroup} onCancel={onCancelEditGroup} />
        ) : (
          <>
            <h3 className={`font-semibold text-gray-900 flex-1 ${group.isHidden ? "text-gray-400 line-through" : ""}`}>
              {group.name}
            </h3>
            <span className="text-xs text-gray-400">{(group.people ?? []).length} pessoa(s)</span>
            <button onClick={onEditGroup} className="text-gray-400 hover:text-blue-600 text-sm">Editar</button>
            <button onClick={onToggleGroupHidden} className="text-gray-400 hover:text-yellow-600 text-sm">{group.isHidden ? "Mostrar" : "Ocultar"}</button>
            <button onClick={() => onShowNewSubGroup(group.id)} className="text-gray-400 hover:text-green-600 text-sm">+Sub</button>
            <button onClick={() => onMoveGroup(group.id)} className="text-gray-400 hover:text-purple-600 text-sm">Mover</button>
            <button onClick={onDeleteGroup} className="text-gray-400 hover:text-red-600 text-sm">Excluir</button>
          </>
        )}
      </div>

      {newGroup === group.id && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <NewGroupForm value={newGroupName} onChange={onNewGroupNameChange}
            onCreate={() => onCreateSubGroup(group.id)} onCancel={onCancelNewGroup} />
        </div>
      )}

      <div className="px-4 py-2 space-y-1">
        {(group.people ?? []).length === 0 && (group.children ?? []).length === 0 && (
          <p className="text-sm text-gray-400 italic py-2">Arraste pessoas para este grupo</p>
        )}
        {(group.people ?? []).map((person) => (
          <PersonCard key={person.id} person={person} editing={editingPerson === person.id}
            selected={selectedPeople.has(person.id)}
            onToggleSelect={() => onToggleSelectPerson(person.id)}
            onDragStart={(e) => onDragStartPerson(e, person.id)}
            onEdit={() => onEditPerson(person.id)}
            onToggleHidden={() => onTogglePersonHidden(person.id)}
            onDelete={() => onDeletePerson(person.id)}
            onUpdate={(id, fd) => onUpdatePerson(id, fd)}
            onCancelEdit={onCancelEditPerson} />
        ))}
      </div>

      {(group.children ?? []).length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {(group.children ?? []).map((child) => (
            <GroupCard key={child.id} group={child} editingGroup={editingGroup} editingPerson={editingPerson}
              dropTarget={dropTarget} newGroup={newGroup} newGroupName={newGroupName}
              selectedPeople={selectedPeople}
              onDragStartGroup={(e) => onDragStartGroup(e)}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onSetDropTarget(`group-${child.id}`); }}
              onDragLeave={onDragLeave}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e); }}
              onSetDropTarget={onSetDropTarget}
              onDragStartPerson={onDragStartPerson}
              onEditGroup={onEditGroup}
              onUpdateGroup={onUpdateGroup}
              onCancelEditGroup={onCancelEditGroup}
              onToggleGroupHidden={onToggleGroupHidden}
              onDeleteGroup={onDeleteGroup}
              onMoveGroup={onMoveGroup}
              onShowNewSubGroup={onShowNewSubGroup}
              onNewGroupNameChange={onNewGroupNameChange}
              onCreateSubGroup={onCreateSubGroup}
              onCancelNewGroup={onCancelNewGroup}
              onEditPerson={onEditPerson}
              onCancelEditPerson={onCancelEditPerson}
              onUpdatePerson={onUpdatePerson}
              onTogglePersonHidden={onTogglePersonHidden}
              onDeletePerson={onDeletePerson}
              onToggleSelectPerson={onToggleSelectPerson} />
          ))}
        </div>
      )}
    </div>
  );
}

function EditGroupForm({ name, onSave, onCancel }: { name: string; onSave: (name: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(name);
  return (
    <div className="flex gap-2 w-full">
      <input autoFocus value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSave(value)}
        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />
      <button onClick={() => onSave(value)} className="text-green-600 text-sm font-semibold">Salvar</button>
      <button onClick={onCancel} className="text-gray-500 text-sm">Cancelar</button>
    </div>
  );
}

function PersonCard({ person, editing, selected, onToggleSelect, onDragStart, onEdit, onToggleHidden, onDelete, onUpdate, onCancelEdit }: {
  person: PersonData & { group?: { id: number; name: string } | null };
  editing: boolean; selected: boolean; onToggleSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onEdit: () => void; onToggleHidden: () => void; onDelete: () => void;
  onUpdate: (id: number, fd: FormData) => void; onCancelEdit: () => void;
}) {
  if (editing) {
    return <EditPersonForm person={person} onSave={onUpdate} onCancel={onCancelEdit} />;
  }

  return (
    <div draggable onDragStart={onDragStart}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-grab group ${person.isHidden ? "opacity-50" : ""} ${selected ? "bg-blue-50 border-blue-300" : ""}`}>
      <input type="checkbox" checked={selected} onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 accent-blue-500 shrink-0 cursor-pointer" />
      <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${person.isHidden ? "text-gray-400 line-through" : "text-gray-900"}`}>{person.name}</span>
          {person.origin === "API" && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">API</span>}
          {person.origin === "MANUAL" && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Local</span>}
        </div>
        {person.email && <div className="text-xs text-gray-400 truncate">{person.email}</div>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-gray-400 hover:text-blue-600 text-xs">Editar</button>
        <button onClick={(e) => { e.stopPropagation(); onToggleHidden(); }} className="text-gray-400 hover:text-yellow-600 text-xs">{person.isHidden ? "Mostrar" : "Ocultar"}</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-400 hover:text-red-600 text-xs">Excluir</button>
      </div>
    </div>
  );
}

function EditPersonForm({ person, onSave, onCancel }: {
  person: PersonData; onSave: (id: number, fd: FormData) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(person.name);
  const [email, setEmail] = useState(person.email ?? "");
  const [phone, setPhone] = useState(person.phone ?? "");
  const [room, setRoom] = useState(person.room ?? "");
  const [role, setRole] = useState(person.role ?? "");
  const [designation, setDesignation] = useState(person.designation ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("room", room);
    fd.append("role", role);
    fd.append("designation", designation);
    onSave(person.id, fd);
  };

  return (
    <div className="bg-white border border-blue-300 rounded-lg p-3 space-y-2">
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome"
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="px-2 py-1 border border-gray-300 rounded text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone"
          className="px-2 py-1 border border-gray-300 rounded text-sm" />
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Sala"
          className="px-2 py-1 border border-gray-300 rounded text-sm" />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Funcao"
          className="px-2 py-1 border border-gray-300 rounded text-sm" />
      </div>
      <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Designacao"
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-800">Salvar</button>
        <button onClick={onCancel} className="text-gray-500 px-3 py-1 text-sm hover:text-gray-700">Cancelar</button>
      </div>
    </div>
  );
}

function PersonForm({ person, onChange, onSubmit, onCancel }: {
  person: { name: string; email: string; phone: string; room: string; role: string; designation: string };
  onChange: (p: { name: string; email: string; phone: string; room: string; role: string; designation: string }) => void;
  onSubmit: () => void; onCancel: () => void;
}) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
      <input autoFocus value={person.name} onChange={(e) => onChange({ ...person, name: e.target.value })}
        placeholder="Nome *" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input value={person.email} onChange={(e) => onChange({ ...person, email: e.target.value })}
          placeholder="Email" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <input value={person.phone} onChange={(e) => onChange({ ...person, phone: e.target.value })}
          placeholder="Telefone" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <input value={person.room} onChange={(e) => onChange({ ...person, room: e.target.value })}
          placeholder="Sala" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <input value={person.role} onChange={(e) => onChange({ ...person, role: e.target.value })}
          placeholder="Funcao" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      <input value={person.designation} onChange={(e) => onChange({ ...person, designation: e.target.value })}
        placeholder="Designacao" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      <div className="flex gap-2">
        <button onClick={onSubmit} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800">Criar</button>
        <button onClick={onCancel} className="text-gray-500 px-3 py-2 text-sm hover:text-gray-700">Cancelar</button>
      </div>
    </div>
  );
}
