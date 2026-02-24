"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./Sidebar.module.css";

import {
  Home,
  Calendar,
  Users,
  UserRound,
  Scissors,
  Wallet,
  CreditCard,
  Package,
  Sparkles,
  BadgePercent,
  MessageSquare,
  Bot,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Bell,
} from "lucide-react";

type Item = {
  id: string;
  label: string;
  desc?: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;     // pl. "NEW", "3"
  dot?: boolean;      // kék pötty
};

type Group = {
  title: string;
  items: Item[];
};

const MINI_KEY = "extorei_sidebar_mini";

export default function Sidebar() {
  const pathname = usePathname();
  const [mini, setMini] = useState(false);
  const [hovered, setHovered] = useState<Item | null>(null);

  const groups: Group[] = useMemo(
    () => [
      {
        title: "Áttekintés",
        items: [
          { id: "home", label: "Dashboard", desc: "Napi összefoglaló", href: "/app", icon: <Home size={22} /> },
          { id: "notifications", label: "Értesítések", desc: "Foglalások, üzenetek", href: "/app/notifications", icon: <Bell size={22} />, dot: true },
        ],
      },
      {
        title: "Foglalás & Ügyfelek",
        items: [
          { id: "calendar", label: "Naptár", desc: "Időpontok kezelése", href: "/app/calendar", icon: <Calendar size={22} /> },
          { id: "clients", label: "Vendégek", desc: "Törzsvendégek, megjegyzések", href: "/app/clients", icon: <Users size={22} /> },
          { id: "staff", label: "Munkatársak", desc: "Beosztás, jogosultság", href: "/app/staff", icon: <UserRound size={22} /> },
        ],
      },
      {
        title: "Szolgáltatások & Árazás",
        items: [
          { id: "services", label: "Szolgáltatások", desc: "Kezelések, idő, ár", href: "/app/services", icon: <Scissors size={22} /> },
          { id: "memberships", label: "Bérletek & Tagság", desc: "Csomagok, kedvezmények", href: "/app/memberships", icon: <Sparkles size={22} />, badge: "PRO" },
          { id: "promos", label: "Kuponok", desc: "Akciók, promókódok", href: "/app/promos", icon: <BadgePercent size={22} /> },
        ],
      },
      {
        title: "Pénzügy & Készlet",
        items: [
          { id: "billing", label: "Számlázás", desc: "Számlák, előfizetés", href: "/app/billing", icon: <Wallet size={22} /> },
          { id: "payments", label: "Fizetések", desc: "POS, online fizetés", href: "/app/payments", icon: <CreditCard size={22} /> },
          { id: "inventory", label: "Készlet", desc: "Termékek, fogyás, raktár", href: "/app/inventory", icon: <Package size={22} /> },
        ],
      },
      {
        title: "Marketing & Automatizálás",
        items: [
          { id: "inbox", label: "Üzenetek", desc: "SMS / Email / chat", href: "/app/inbox", icon: <MessageSquare size={22} />, badge: "3" },
          { id: "automations", label: "Automatizmusok", desc: "No-show, emlékeztető", href: "/app/automations", icon: <Bot size={22} />, badge: "NEW" },
        ],
      },
      {
        title: "Elemzés",
        items: [
          { id: "analytics", label: "Statisztika", desc: "Bevétel, kihasználtság", href: "/app/analytics", icon: <BarChart3 size={22} /> },
          { id: "reports", label: "Riportok", desc: "Export, KPI-k", href: "/app/reports", icon: <FileText size={22} /> },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MINI_KEY);
      if (saved === "1") setMini(true);
    } catch {}
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => { if (mq.matches) setMini(true); };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const toggleMini = () => {
    setMini(v => {
      const next = !v;
      try { localStorage.setItem(MINI_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname?.startsWith(href);
  };

  // Smart panel: active > hover
  const smartItem =
    hovered ??
    groups.flatMap(g => g.items).find(i => isActive(i.href)) ??
    null;

  return (
    <>
      <aside
        className={`${styles.sidebar} ${mini ? styles.mini : ""}`}
        aria-label="Oldalsáv navigáció"
        onMouseLeave={() => setHovered(null)}
      >
        <div className={styles.top}>
          <button className={styles.brand} type="button" aria-label="BeautySuite">
            <span className={styles.brandMark} />
          </button>

          <button className={styles.collapse} onClick={toggleMini} type="button" aria-label="Összecsukás">
            <span className={styles.collapseIcon}>⟨⟩</span>
          </button>
        </div>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <div className={styles.group} key={group.title}>
              <div className={styles.groupLabel}>{group.title}</div>

              {group.items.map((it) => (
                <Link
                  key={it.id}
                  href={it.href}
                  className={`${styles.item} ${isActive(it.href) ? styles.active : ""}`}
                  data-tooltip={it.label}
                  onMouseEnter={() => setHovered(it)}
                  aria-current={isActive(it.href) ? "page" : undefined}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {it.icon}
                    {it.dot ? <span className={styles.dot} aria-hidden="true" /> : null}
                  </span>

                  {/* badge a “pill” sarkában */}
                  {it.badge ? <span className={styles.badge}>{it.badge}</span> : null}

                  <span className={styles.label}>{it.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <Link className={styles.item} href="/app/settings" data-tooltip="Beállítások">
            <span className={styles.icon} aria-hidden="true"><Settings size={22} /></span>
            <span className={styles.label}>Beállítások</span>
          </Link>
          <Link className={styles.item} href="/app/help" data-tooltip="Súgó">
            <span className={styles.icon} aria-hidden="true"><HelpCircle size={22} /></span>
            <span className={styles.label}>Súgó</span>
          </Link>
        </div>
      </aside>

      {/* Smart Panel: kreatív, de clean */}
      <aside className={`${styles.panel} ${mini ? styles.panelMini : ""}`} aria-label="Menüpont panel">
        {smartItem ? (
          <div className={styles.panelCard}>
            <div className={styles.panelIcon}>{smartItem.icon}</div>
            <div className={styles.panelText}>
              <div className={styles.panelTitle}>
                {smartItem.label}
                {smartItem.badge ? <span className={styles.panelBadge}>{smartItem.badge}</span> : null}
              </div>
              <div className={styles.panelDesc}>{smartItem.desc ?? "—"}</div>
            </div>
          </div>
        ) : (
          <div className={styles.panelCard}>
            <div className={styles.panelText}>
              <div className={styles.panelTitle}>Menü</div>
              <div className={styles.panelDesc}>Válassz egy modult.</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
