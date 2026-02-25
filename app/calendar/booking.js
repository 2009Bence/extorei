(() => {
  const html = document.documentElement;

  // ======= Demo data (később API-ból jön) =======
  const services = [
    { id: 1, name: "Férfi hajvágás", duration: 30, price: 4500 },
    { id: 2, name: "Női vágás + szárítás", duration: 60, price: 9000 },
    { id: 3, name: "Festés + vágás", duration: 120, price: 22000 },
    { id: 4, name: "Manikűr (gél lakk)", duration: 75, price: 12000 }
  ];

  const staff = [
    { id: 1, name: "Bence", serviceIds: [1, 2, 3] },
    { id: 2, name: "Nóri", serviceIds: [2, 3, 4] },
    { id: 3, name: "Dani", serviceIds: [1, 2] }
  ];

  // demo booked events (később GET /api/calendar)
  let booked = [
    // { id:"a1", staffId: 1, start:"2026-02-24T10:00:00", end:"2026-02-24T10:30:00", status:"confirmed" }
  ];

  // ======= DOM =======
  const serviceSelect = document.getElementById("serviceSelect");
  const staffSelect = document.getElementById("staffSelect");
  const dateSelect = document.getElementById("dateSelect");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");

  const todayBtn = document.getElementById("todayBtn");
  const viewBtns = document.querySelectorAll(".seg-btn");

  const selectedSlot = document.getElementById("selectedSlot");
  const bookingForm = document.getElementById("bookingForm");
  const bookBtn = document.getElementById("bookBtn");
  const clearBtn = document.getElementById("clearBtn");

  const clientName = document.getElementById("clientName");
  const clientPhone = document.getElementById("clientPhone");
  const clientEmail = document.getElementById("clientEmail");
  const clientNote = document.getElementById("clientNote");

  const summaryService = document.getElementById("summaryService");
  const summaryStaff = document.getElementById("summaryStaff");
  const summaryDuration = document.getElementById("summaryDuration");
  const summaryPrice = document.getElementById("summaryPrice");

  const statusText = document.getElementById("statusText");
  const nextSlotText = document.getElementById("nextSlotText");

  const scrollToCalendar = document.getElementById("scrollToCalendar");

  // theme
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");
  const THEME_KEY = "extorei_public_theme";

  // ======= State =======
  const state = {
    serviceId: services[0]?.id ?? null,
    staffId: staff[0]?.id ?? null,
    selectedStart: null,
    selectedEnd: null
  };

  // ======= Helpers =======
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtLocal = (d) => {
    const yy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${yy}-${mm}-${dd} ${hh}:${mi}`;
  };

  function setStatus(text) {
    if (statusText) statusText.textContent = text;
  }

  function toast(title, text) {
    const wrap = document.getElementById("toastWrap");
    if (!wrap) return;

    const el = document.createElement("div");
    el.className = "toastx";
    el.innerHTML = `
      <div class="toastx-row">
        <div>
          <div class="toastx-title">${title}</div>
          <div class="toastx-text">${text}</div>
        </div>
        <button class="toastx-close" type="button">OK</button>
      </div>
    `;
    wrap.appendChild(el);

    const btn = el.querySelector(".toastx-close");
    btn?.addEventListener("click", () => el.remove());
    setTimeout(() => el.remove(), 5500);
  }

  // =====================
  // THEME (javítva)
  // =====================
  function setTheme(theme) {
    // csak light/dark engedélyezett
    const t = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", t);

    const isLight = t === "light";
    if (themeIcon) themeIcon.textContent = isLight ? "☀️" : "🌙";
    if (themeText) themeText.textContent = isLight ? "Light" : "Dark";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#f6f7fb" : "#0b1020");
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;

    return prefersLight ? "light" : "dark";
  }

  function toggleTheme() {
    const current = html.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  }

  // ======= Data -> UI =======
  function populateServices() {
    if (!serviceSelect) return;

    serviceSelect.innerHTML = services
      .map(
        (s) =>
          `<option value="${s.id}">${s.name} • ${s.duration} perc • ${s.price.toLocaleString(
            "hu-HU"
          )} Ft</option>`
      )
      .join("");

    state.serviceId = Number(serviceSelect.value) || services[0]?.id || null;
  }

  function populateStaff() {
    if (!staffSelect) return;

    const filtered = staff.filter((p) => p.serviceIds.includes(state.serviceId));
    if (!filtered.length) {
      staffSelect.innerHTML = `<option value="">Nincs elérhető szakember</option>`;
      state.staffId = null;
      return;
    }

    staffSelect.innerHTML = filtered.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    state.staffId = Number(staffSelect.value) || filtered[0]?.id || null;
  }

  function updateSummary() {
    const svc = services.find((s) => s.id === state.serviceId);
    const stf = staff.find((s) => s.id === state.staffId);

    if (summaryService) summaryService.textContent = svc ? svc.name : "—";
    if (summaryStaff) summaryStaff.textContent = stf ? stf.name : "—";
    if (summaryDuration) summaryDuration.textContent = svc ? `${svc.duration} perc` : "—";
    if (summaryPrice) summaryPrice.textContent = svc ? `${svc.price.toLocaleString("hu-HU")} Ft` : "—";
  }

  function canSubmit() {
    return !!(state.selectedStart && state.selectedEnd && state.serviceId && state.staffId);
  }

  function clearSelection() {
    state.selectedStart = null;
    state.selectedEnd = null;
    if (selectedSlot) selectedSlot.value = "";
    if (bookBtn) bookBtn.disabled = true;
    setStatus("Kiválasztás törölve");
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
  }

  function getServiceDurationMs() {
    const svc = services.find((s) => s.id === state.serviceId);
    const mins = svc?.duration ?? 30;
    return mins * 60 * 1000;
  }

  function computeNextFreeSlot(dateBase) {
    // demo: 09:00-17:00, 15 perces lépés
    const day = new Date(dateBase);
    day.setHours(9, 0, 0, 0);

    const endDay = new Date(dateBase);
    endDay.setHours(17, 0, 0, 0);

    const step = 15 * 60 * 1000;
    const dur = getServiceDurationMs();

    const staffId = state.staffId;
    if (!staffId) return null;

    for (let t = day.getTime(); t + dur <= endDay.getTime(); t += step) {
      const start = new Date(t);
      const end = new Date(t + dur);

      const conflict = booked.some((ev) => {
        if (ev.staffId !== staffId) return false;
        const es = new Date(ev.start);
        const ee = new Date(ev.end);
        return overlaps(start, end, es, ee);
      });

      if (!conflict) return { start, end };
    }

    return null;
  }

  // ======= FullCalendar =======
  let calendar;

  function buildEventsForCalendar() {
    // ⚠️ MÓDOSÍTVA: inline backgroundColor helyett classNames
    return booked
      .filter((ev) => ev.staffId === state.staffId)
      .map((ev) => ({
        id: ev.id,
        title: ev.status === "pending" ? "Függő" : "Foglalt",
        start: ev.start,
        end: ev.end,
        editable: false,
        classNames: [ev.status === "pending" ? "ev-pending" : "ev-busy"]
      }));
  }

  function initCalendar() {
    const el = document.getElementById("calendar");
    if (!el) return;

    calendar = new FullCalendar.Calendar(el, {
      initialView: "timeGridWeek",
      height: "auto",
      nowIndicator: true,
      firstDay: 1,
      locale: "hu",
      slotMinTime: "08:00:00",
      slotMaxTime: "19:00:00",
      slotDuration: "00:15:00",
      expandRows: true,
      allDaySlot: false,
      selectable: true,
      selectMirror: true,
      selectOverlap: false,
      headerToolbar: {
        left: "prev,next",
        center: "title",
        right: ""
      },
      events: buildEventsForCalendar(),

      select: (info) => {
        if (!state.serviceId || !state.staffId) {
          toast("Válassz előbb szolgáltatást", "Szolgáltatás és szakember nélkül nem tudsz foglalni.");
          calendar.unselect();
          return;
        }

        const dur = getServiceDurationMs();
        const start = new Date(info.start);
        const end = new Date(start.getTime() + dur);

        // ne engedje zárás után (17:00)
        const dayEnd = new Date(start);
        dayEnd.setHours(17, 0, 0, 0);
        if (end > dayEnd) {
          toast("Túl késői időpont", "Válassz korábbi idősávot.");
          calendar.unselect();
          return;
        }

        // ütközés check (demo)
        const conflict = booked.some((ev) => {
          if (ev.staffId !== state.staffId) return false;
          const es = new Date(ev.start);
          const ee = new Date(ev.end);
          return overlaps(start, end, es, ee);
        });

        if (conflict) {
          toast("Foglalt időpont", "Ez az idősáv már foglalt. Válassz másikat.");
          calendar.unselect();
          return;
        }

        state.selectedStart = start;
        state.selectedEnd = end;

        if (selectedSlot) selectedSlot.value = `${fmtLocal(start)} → ${fmtLocal(end)}`;
        if (bookBtn) bookBtn.disabled = !canSubmit();
        setStatus("Időpont kiválasztva");
      }
    });

    calendar.render();
  }

  function refreshCalendar() {
    if (!calendar) return;

    // set date if provided
    if (dateSelect?.value) {
      calendar.gotoDate(dateSelect.value);
    }

    calendar.removeAllEvents();
    buildEventsForCalendar().forEach((e) => calendar.addEvent(e));

    // compute next free slot for that date
    const base = dateSelect?.value ? new Date(dateSelect.value) : new Date();
    const next = computeNextFreeSlot(base);

    if (nextSlotText) {
      nextSlotText.textContent = next ? `${fmtLocal(next.start)} (kb.)` : "Nincs több szabad időpont ma.";
    }

    clearSelection();
    updateSummary();
    setStatus("Naptár frissítve");
  }

  // ======= Booking submit (demo) =======
  async function createBookingDemo() {
    const id = `demo_${Math.random().toString(16).slice(2)}`;

    booked.push({
      id,
      staffId: state.staffId,
      start: state.selectedStart.toISOString(),
      end: state.selectedEnd.toISOString(),
      status: "pending"
    });

    return { ok: true, id };
  }

  // ======= Events =======
  themeToggle?.addEventListener("click", toggleTheme);

  scrollToCalendar?.addEventListener("click", () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  serviceSelect?.addEventListener("change", () => {
    state.serviceId = Number(serviceSelect.value);
    populateStaff();
    updateSummary();
    refreshCalendar();
  });

  staffSelect?.addEventListener("change", () => {
    state.staffId = Number(staffSelect.value);
    updateSummary();
    refreshCalendar();
  });

  applyFiltersBtn?.addEventListener("click", refreshCalendar);

  todayBtn?.addEventListener("click", () => {
    calendar?.today();
    setStatus("Ugrás: Ma");
  });

  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const view = btn.getAttribute("data-view");
      calendar?.changeView(view);
      setStatus(`Nézet: ${view === "timeGridWeek" ? "Hét" : "Nap"}`);
    });
  });

  clearBtn?.addEventListener("click", clearSelection);

  bookingForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!canSubmit()) {
      toast("Hiányzó adatok", "Válassz időpontot és ellenőrizd a szolgáltatást/szakembert.");
      return;
    }
    if (!clientName?.value.trim() || !clientPhone?.value.trim()) {
      toast("Hiányzó adatok", "Név és telefonszám kötelező.");
      return;
    }

    if (bookBtn) bookBtn.disabled = true;
    setStatus("Mentés…");

    try {
      const res = await createBookingDemo();

      toast("Foglalás rögzítve (demo)", `Azonosító: ${res.id}. (Státusz: függő)`);
      setStatus("Foglalás létrehozva");

      refreshCalendar();

      if (clientNote) clientNote.value = "";
    } catch (err) {
      console.error(err);
      toast("Hiba", "Nem sikerült a foglalás. Próbáld újra.");
      setStatus("Hiba történt");
      if (bookBtn) bookBtn.disabled = false;
    }
  });

  // ======= Init =======
  (function init() {
    setTheme(getInitialTheme());

    // default date = today
    const now = new Date();
    if (dateSelect) {
      dateSelect.value = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    }

    populateServices();
    populateStaff();
    updateSummary();

    initCalendar();
    refreshCalendar();

    toast("Készen áll", "Válassz szolgáltatást és kattints egy szabad idősávra.");
  })();
})();
