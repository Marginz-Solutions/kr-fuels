"use client";
import { type FC, Suspense, use, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, LogOut, UserCircle, Menu } from "lucide-react";
import { C } from "../../constants/colors";
import { pill } from "../../styles/shared";
import { FUEL_META } from "../../constants/fuel";
import { useFuelPrices } from "@/components/providers/FuelPriceContext";
import { useAuth } from "@/components/providers/AuthProvider";
import { logout, displayName, initials } from "@/lib/auth";
import { avatarColor } from "@/lib/avatarColor";

function FuelBadgesSkeleton() {
    return (
        <div style={{ display: "flex", gap: 6 }}>
            {FUEL_META.map(({ key, color, icon: Icon }) => (
                <div
                    key={key}
                    style={{
                        ...pill(color),
                        padding: "4px 10px",
                        fontSize: 11,
                        opacity: 0.35,
                        userSelect: "none",
                    }}
                >
                    <Icon size={10} style={{ marginRight: 4 }} />
                    ₹ —/L
                </div>
            ))}
        </div>
    );
}

// Mount detector: false on the server + the first client render, true after.
const subscribeMount = () => () => {};
const getMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

function FuelBadgesResolved() {
    const { pricesPromise } = useFuelPrices();
    const prices = use(pricesPromise);

    return (
        <div style={{ display: "flex", gap: 6 }}>
            {FUEL_META.map(({ key, color, icon: Icon }) => (
                <div key={key} style={{ ...pill(color), padding: "4px 10px", fontSize: 11 }}>
                    <Icon size={10} style={{ marginRight: 4 }} />
                    ₹{prices[key]}/L
                </div>
            ))}
        </div>
    );
}

// `pricesPromise` resolves to session-dependent data that only exists on the
// authenticated client — the server (no session cookie) would resolve different
// values, so rendering them during SSR causes a hydration mismatch that throws
// away the whole tree. Show the skeleton on the server + first client render,
// then resolve the live prices once mounted.
function FuelBadges() {
    const mounted = useSyncExternalStore(subscribeMount, getMountSnapshot, getServerMountSnapshot);
    if (!mounted) return <FuelBadgesSkeleton />;
    return <FuelBadgesResolved />;
}

function UserMenu() {
    const router = useRouter();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click / Escape.
    useEffect(() => {
        if (!open) return;
        function onDown(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    async function handleLogout() {
        setSigningOut(true);
        await logout();
        router.replace("/login");
    }

    const name = displayName(user);
    const email = user?.email ?? "";
    const photo = user?.photoURL ?? "";

    return (
        <>
        <div ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open ? "true" : "false"}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 8px",
                    borderRadius: 12,
                    border: `1px solid ${open ? C.bd : "transparent"}`,
                    background: open ? C.bg : "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                }}
            >
                <Avatar photo={photo} text={initials(user)} name={name} />
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }} className="hidden sm:flex">
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.t, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                    </span>
                    {email && (
                        <span style={{ fontSize: 11, color: C.tm, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {email}
                        </span>
                    )}
                </span>
                <ChevronDown size={15} style={{ color: C.tm, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {open && (
                <div
                    role="menu"
                    className="kr-pop-in"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: 240,
                        background: C.white,
                        border: `1px solid ${C.bd}`,
                        borderRadius: 16,
                        boxShadow: "0 12px 32px rgba(26,46,41,0.12)",
                        overflow: "hidden",
                        zIndex: 200,
                    }}
                >
                    <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar photo={photo} text={initials(user)} name={name} />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.t, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                            {email && <div style={{ fontSize: 11, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>}
                        </div>
                    </div>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setOpen(false); router.push("/profile"); }}
                        style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <UserCircle size={16} style={{ color: C.tm }} /> Profile
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={signingOut}
                        style={{ ...menuItemStyle, color: C.red, borderTop: `1px solid ${C.bd}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.redBg)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <LogOut size={16} /> {signingOut ? "Signing out…" : "Logout"}
                    </button>
                </div>
            )}
        </div>
        </>
    );
}

const menuItemStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    color: C.t,
    textAlign: "left",
    transition: "background 0.15s",
};

function Avatar({ photo, text, name }: { photo: string; text: string; name?: string }) {
    const { bg, fg } = avatarColor(name || text);
    const base: React.CSSProperties = {
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: 13,
    };
    if (photo) {
        return (
            // Profile photos are remote (Google/Firebase) auth-provider URLs →
            // unoptimized (bypasses remotePatterns), still lazy-loaded by next/image.
            <Image src={photo} alt="" width={36} height={36} unoptimized referrerPolicy="no-referrer" style={base} />
        );
    }
    return <div style={base}>{text}</div>;
}

interface TopbarProps {
    onMenuClick?: () => void;
    showMenu?: boolean;
}

const Topbar: FC<TopbarProps> = ({ onMenuClick, showMenu = false }) => {
    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                minHeight: 64,
                background: C.white,
                borderBottom: `1px solid ${C.bd}`,
                flexShrink: 0,
                position: "sticky",
                top: 0,
                zIndex: 100,
                justifyContent: "space-between",
            }}
        >
            {/* Hamburger — mobile only */}
            {showMenu ? (
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={onMenuClick}
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        border: `1px solid ${C.bd}`, background: C.white, color: C.t, cursor: "pointer",
                    }}
                >
                    <Menu size={18} />
                </button>
            ) : (
                <span />
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
                <span className="hidden sm:flex">
                    <Suspense fallback={<FuelBadgesSkeleton />}>
                        <FuelBadges />
                    </Suspense>
                </span>

                <UserMenu />
            </div>
        </header>
    );
};

export default Topbar;
