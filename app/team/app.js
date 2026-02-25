const $ = (id) => document.getElementById(id);

const state = {
  teams: [],
  members: [],
  tasks: [],
  activeTeamId: null,
};

function toast(msg, ok=true){
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + (ok ? "good" : "bad");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>{ t.className="toast"; }, 2600);
}

async function api(action, payload = {}) {
  const body = new URLSearchParams({ action, ...payload });
  const res = await fetch("api.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await res.json().catch(()=>({ok:false, error:"Bad JSON"}));
  if (!res.ok || !data.ok) throw new Error(data.error || "API error");
  return data;
}

function setTeamOptions(){
  const sel = $("teamSelect");
  sel.innerHTML = "";
  for(const t of state.teams){
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  }
  if (!state.activeTeamId && state.teams[0]) state.activeTeamId = Number(state.teams[0].id);
  sel.value = state.activeTeamId ?? "";
}

function getTeamMembers(teamId){
  return state.members.filter(m => Number(m.team_id) === Number(teamId));
}

function setAssigneeOptions(){
  const sel = $("assigneeSelect");
  sel.innerHTML = "";

  const none = document.createElement("option");
  none.value = "0";
  none.textContent = "Nincs kiosztva";
  sel.appendChild(none);

  const mem = getTeamMembers(state.activeTeamId);
  for(const m of mem){
    const opt = document.createElement("option");
    opt.value = m.user_id;
    opt.textContent = `${m.name} (${m.email})`;
    sel.appendChild(opt);
  }
  sel.value = "0";
}

function renderMembers(){
  const list = $("membersList");
  const mem = getTeamMembers(state.activeTeamId);
  $("membersCount").textContent = String(mem.length);
  list.innerHTML = "";

  if (!mem.length){
    list.innerHTML = `<div class="muted">Nincs tag.</div>`;
    return;
  }

  for(const m of mem){
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div>
        <div><strong>${escapeHtml(m.name)}</strong> <span class="muted">(${escapeHtml(m.email)})</span></div>
        <div class="meta">Role: ${escapeHtml(m.role)}</div>
      </div>
      <span class="badge ${m.role === "owner" ? "done" : ""}">${escapeHtml(m.role)}</span>
    `;
    list.appendChild(el);
  }
}

function statusBadge(status){
  if (status === "open") return `<span class="badge warn">open</span>`;
  if (status === "in_progress") return `<span class="badge">in_progress</span>`;
  return `<span class="badge done">done</span>`;
}

function renderTasks(){
  const list = $("tasksList");
  const tasks = state.tasks.filter(t => Number(t.team_id) === Number(state.activeTeamId));
  $("tasksCount").textContent = String(tasks.length);
  list.innerHTML = "";

  if (!tasks.length){
    list.innerHTML = `<div class="muted">Nincs feladat.</div>`;
    return;
  }

  for(const t of tasks){
    const el = document.createElement("div");
    el.className = "item";

    const assigned = t.assigned_name ? escapeHtml(t.assigned_name) : "—";
    const due = t.due_date ? escapeHtml(t.due_date) : "—";

    el.innerHTML = `
      <div style="min-width:0">
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <strong>${escapeHtml(t.title)}</strong>
          ${statusBadge(t.status)}
        </div>
        <div class="meta">
          Assigned: ${assigned} · Due: ${due} · By: ${escapeHtml(t.created_by_name)}
        </div>
        ${t.description ? `<div class="meta">${escapeHtml(t.description)}</div>` : ""}
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <select class="input" data-task="${t.id}" style="width:160px;">
          <option value="open" ${t.status==="open" ? "selected":""}>open</option>
          <option value="in_progress" ${t.status==="in_progress" ? "selected":""}>in_progress</option>
          <option value="done" ${t.status==="done" ? "selected":""}>done</option>
        </select>
      </div>
    `;
    list.appendChild(el);
  }

  // status change handlers
  list.querySelectorAll("select[data-task]").forEach(sel => {
    sel.addEventListener("change", async (e) => {
      const taskId = Number(e.target.getAttribute("data-task"));
      const status = e.target.value;
      try{
        await api("set_task_status", { task_id: String(taskId), status });
        toast("Státusz frissítve ✔");
        await load();
      }catch(err){
        toast(err.message, false);
      }
    });
  });
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function load(){
  const data = await api("bootstrap");
  state.teams = data.teams || [];
  state.members = data.members || [];
  state.tasks = data.tasks || [];

  if (!state.teams.length){
    state.activeTeamId = null;
    $("teamSelect").innerHTML = `<option value="">Nincs csapat</option>`;
    $("membersList").innerHTML = `<div class="muted">Nincs csapat. Hozz létre egyet.</div>`;
    $("tasksList").innerHTML = `<div class="muted">Nincs csapat. Hozz létre egyet.</div>`;
    $("membersCount").textContent = "0";
    $("tasksCount").textContent = "0";
    return;
  }

  // keep active team if still exists
  const exists = state.teams.some(t => Number(t.id) === Number(state.activeTeamId));
  if (!exists) state.activeTeamId = Number(state.teams[0].id);

  setTeamOptions();
  setAssigneeOptions();
  renderMembers();
  renderTasks();
}

$("createTeamBtn").addEventListener("click", async () => {
  const name = $("teamName").value.trim();
  if (!name) return toast("Írj be csapatnevet.", false);

  try{
    await api("create_team", { name });
    $("teamName").value = "";
    toast("Csapat létrehozva ✔");
    await load();
  }catch(err){
    toast(err.message, false);
  }
});

$("addMemberBtn").addEventListener("click", async () => {
  const email = $("memberEmail").value.trim();
  if (!email) return toast("Adj meg emailt.", false);
  if (!state.activeTeamId) return toast("Nincs aktív csapat.", false);

  try{
    await api("add_member", { team_id: String(state.activeTeamId), email });
    $("memberEmail").value = "";
    toast("Tag hozzáadva ✔");
    await load();
  }catch(err){
    toast(err.message, false);
  }
});

$("createTaskBtn").addEventListener("click", async () => {
  if (!state.activeTeamId) return toast("Nincs aktív csapat.", false);

  const title = $("taskTitle").value.trim();
  const description = $("taskDesc").value.trim();
  const assigned = Number($("assigneeSelect").value || "0");
  const due_date = $("dueDate").value;

  if (!title) return toast("Adj címet a feladatnak.", false);

  try{
    await api("create_task", {
      team_id: String(state.activeTeamId),
      title,
      description,
      assigned_to_user_id: String(assigned),
      due_date
    });
    $("taskTitle").value = "";
    $("taskDesc").value = "";
    $("assigneeSelect").value = "0";
    $("dueDate").value = "";
    toast("Feladat létrehozva ✔");
    await load();
  }catch(err){
    toast(err.message, false);
  }
});

$("teamSelect").addEventListener("change", async (e) => {
  state.activeTeamId = Number(e.target.value || "0") || null;
  setAssigneeOptions();
  renderMembers();
  renderTasks();
});

$("reloadBtn").addEventListener("click", async () => {
  try{ await load(); toast("Frissítve ✔"); }
  catch(err){ toast(err.message, false); }
});

load().catch(err => toast(err.message, false));
