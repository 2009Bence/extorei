"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./Sidebar.module.css";

import {
  Home,
  Calendar,
  Tag,
  Smile,
  Book,
  User,
  Megaphone,
  Users,
  LineChart,
  LayoutGrid,
  Settings,
  HelpCircle,
} from "lucide-react";

type Item = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  dot?: boolean;
};

const MINI_KEY = "extorei_sidebar_mini";

export default function Sidebar() {
  const pathname = usePathname();
  const [mini, setMini] = useState(false);

  const items: Item[] = useMemo(
    () => [
      { id: "home", label: "Home", href: "/app", icon: <Home size={22} /> },
      { id: "calendar", label: "Naptár", href: "/app/calendar", icon: <Calendar size={22} /> },
      { id: "tags", label: "Címkék", href: "/app/tags", icon: <Tag size={22} /> },
      { id: "clients", label: "Ügyfelek", href: "/app/clients", icon: <Smile size={22} /> },
      { id: "docs", label: "Dokumentum", href: "/app/docs", icon: <Book size={22} /> },
      { id: "profile", label: "Profil", href: "/app/profile", icon: <User size={22} /> },
      { id: "campaigns", label: "Kampány", href: "/app/campaigns", icon: <Megaphone size={22} /> },
      { id: "team", label: "Csapat", href: "/app/team", icon: <Users size={22} />, dot: true },
      { id: "stats", label: "Statisztika", href: "/app/stats", icon: <LineChart size={22} /> },
      { id: "apps", label: "Appok", href: "/app/apps", icon: <LayoutGrid size={22} /> },
      { id: "settings", label: "Beállítások", href: "/app/settings", icon: <Settings size={22} /> },
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
    // mobilon alapból mini
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => {
      if (mq.matches) setMini(true);
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const toggleMini = () => {
    setMini((v) => {
      const next = !v;
      try {
        localStorage.setItem(MINI_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const isActive = (href: string) => {
    // pontos vagy prefix match
    if (href === "/app") return pathname === "/app";
    return pathname?.startsWith(href);
  };

  return (
    <aside className={`${styles.sidebar} ${mini ? styles.mini : ""}`} aria-label="Oldalsáv navigáció">
      <button className={styles.collapse} onClick={toggleMini} type="button" aria-label="Oldalsáv összecsukása">
        <span className={styles.collapseIcon}>⟨⟩</span>
      </button>

      <nav className={styles.nav}>
        {items.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            className={`${styles.item} ${isActive(it.href) ? styles.active : ""}`}
            data-tooltip={it.label}
            aria-current={isActive(it.href) ? "page" : undefined}
          >
            <span className={styles.icon} aria-hidden="true">
              {it.icon}
              {it.dot ? <span className={styles.dot} aria-hidden="true" /> : null}
            </span>
            <span className={styles.label}>{it.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <Link className={styles.item} href="/app/help" data-tooltip="Súgó">
          <span className={styles.icon} aria-hidden="true">
            <HelpCircle size={22} />
          </span>
          <span className={styles.label}>Súgó</span>
        </Link>
      </div>
    </aside>
  );
}
