"use client";
import { useState, useSyncExternalStore, type FC } from "react";
import dynamic from "next/dynamic";
import {
    MapPin, MessageSquare, Mail, Package, RefreshCw, Edit2, Check, Star,
} from "lucide-react";

import { C } from "../../../constants/colors";
import { StatCard, Badge, Modal, FormField } from "../../../components/ui";
import type { FuelPrices, DashboardData } from "../../../types";
import { FUEL_META } from "../../../constants/fuel";
import { TilesLayout } from "./_components/TilesLayout";
import { avatarColor } from "@/lib/avatarColor";

// Recharts is loaded as a deferred client chunk (ssr:false) so it stays out of
// the dashboard's initial bundle. A themed skeleton holds the space meanwhile.
const ChartFallback = () => <div className="h-full min-h-[180px] w-full animate-pulse rounded-xl bg-line" />;
const FeedbackBarChart = dynamic(
    () => import("./_components/Charts").then((m) => m.FeedbackBarChart),
    { ssr: false, loading: ChartFallback }
);
const FeedbackStatusDonut = dynamic(
    () => import("./_components/Charts").then((m) => m.FeedbackStatusDonut),
    { ssr: false, loading: ChartFallback }
);

interface DashboardPageProps {
    prices: FuelPrices;
    onEditPrice: (p: FuelPrices) => void;
    dashboardData: DashboardData;
    onRefresh: () => void;
    refreshing: boolean;
    userName?: string;
}

type FuelDraft = {
    diesel: string;
    petrol: string;
    autoLPG: string;
}

// Built from the shared FUEL_META so the icon per fuel matches the Topbar badges.
const fuelRows = FUEL_META.map(({ key, label, color, icon: Icon }) => ({
    key,
    label,
    color,
    em: <Icon size={20} style={{ color: C.p }} />,
}));

// Hydration helpers
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const DashboardPage: FC<DashboardPageProps> = ({
    prices,
    onEditPrice,
    dashboardData,
    onRefresh,
    refreshing,
    userName
}) => {
    const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [editPrice, setEditPrice] = useState(false);
    const [draft, setDraft] = useState<FuelDraft>({
        diesel: String(prices.diesel),
        petrol: String(prices.petrol),
        autoLPG: String(prices.autoLPG),
    });

    // Seed the inputs from the CURRENT prices every time the modal opens, so a
    // prior cancelled edit (or an external update) never leaves stale values.
    const openEditModal = () => {
        setDraft({
            diesel: String(prices.diesel),
            petrol: String(prices.petrol),
            autoLPG: String(prices.autoLPG),
        });
        setEditPrice(true);
    };

    const parsedDraft = {
        diesel: Number(draft.diesel),
        petrol: Number(draft.petrol),
        autoLPG: Number(draft.autoLPG),
    };
    const draftValid = (["diesel", "petrol", "autoLPG"] as const).every(
        (k) => draft[k].trim() !== "" && Number.isFinite(parsedDraft[k]) && parsedDraft[k] >= 0
    );

    const handleSave = () => {
        if (!draftValid) return;
        onEditPrice(parsedDraft);
        setEditPrice(false);
    };

    // Row 1 metrics
    const totalLPGStations = dashboardData?.stations?.total ?? 0;
    const activeStations = dashboardData?.stations?.active ?? 0;
    const inactiveStations = dashboardData?.stations?.inactive ?? 0;

    const totalFeedback = dashboardData?.feedback?.total ?? 0;
    const pendingFeedback = dashboardData?.feedback?.pending ?? 0;
    const inProgressFeedback = dashboardData?.feedback?.inProgress ?? 0;

    const totalEnquiries = dashboardData?.enquiries?.new ?? dashboardData?.enquiries?.total ?? 0;
    const thisMonthEnquiries = dashboardData?.enquiries?.thisMonth ?? 0;

    const totalProducts = dashboardData?.products?.total ?? 0;
    const activeProducts = dashboardData?.products?.active;
    const productCategories = dashboardData?.products?.categories ?? 0;
    const productSubText = activeProducts !== undefined
        ? `${activeProducts} active · ${productCategories} categories`
        : `${productCategories} categories`;

    // Row 2 data (Feedback by Category Bar Chart)
    const byCategoryData = dashboardData?.feedback?.byCategory;
    const byCategoryCounts: Record<string, number> = {};
    if (Array.isArray(byCategoryData)) {
        byCategoryData.forEach((item: any) => {
            if (item && typeof item.name === "string") {
                byCategoryCounts[item.name] = item.count ?? 0;
            }
        });
    }
    else if (byCategoryData && typeof byCategoryData === "object") {
        Object.assign(byCategoryCounts, byCategoryData);
    }

    const barData = [
        { name: "Experience", count: byCategoryCounts["Station Experience"] ?? 0, fill: C.greenLight },
        { name: "Safety", count: byCategoryCounts["Safety & Education"] ?? 0, fill: C.blueLight },
        { name: "Pricing", count: byCategoryCounts["Pricing & Value"] ?? 0, fill: C.amberLight },
        { name: "Web/App", count: byCategoryCounts["Website/App Support"] ?? 0, fill: C.redLight },
        { name: "New Station", count: byCategoryCounts["New Station Request"] ?? 0, fill: C.pLightLight },
        { name: "General", count: byCategoryCounts["General Inquiry"] ?? 0, fill: C.tmLight },
    ];

    // Row 3 data (Feedback Status Donut)
    const resolvedFeedback = dashboardData?.feedback?.resolved ?? 0;
    const donutData = [
        { name: "Pending", value: pendingFeedback, fill: C.amberLight },
        { name: "In Progress", value: inProgressFeedback, fill: C.blueLight },
        { name: "Resolved", value: resolvedFeedback, fill: C.greenLight },
    ];

    // Feedback Insights
    const avgRating = dashboardData?.feedback?.avgRating ?? 0;
    const safetyAwarenessPercent = dashboardData?.feedback?.safetyAwarenessPercent ?? 0;
    const resolutionRate = dashboardData?.feedback?.resolutionRate ?? 0;

    // Row 5 (Recent lists)
    const recentFeedback = dashboardData?.recentFeedback ?? [];
    const recentEnquiries = dashboardData?.recentEnquiries ?? [];

    const renderStars = (rating: number | string) => {
        const parsed = typeof rating === "string" ? parseFloat(rating) : rating;
        const rounded = Math.round((parsed || 0) * 2) / 2; // round to nearest 0.5
        return (
            <div className="flex gap-[3px]">
                {[1, 2, 3, 4, 5].map((i) => {
                    const fill = i <= rounded ? C.amber : (i - 0.5 === rounded ? "#fcd34d" : "#e2e8f0");
                    return <Star key={i} size={13} fill={fill} stroke={i <= rounded ? C.amber : "#cbd5e1"} />;
                })}
            </div>
        );
    };

    const getStatusBadgeColor = (status: string) => {
        const norm = status.toLowerCase();
        if (norm === "resolved") return "green";
        if (norm === "in-progress" || norm === "in_progress") return "blue";
        return "amber";
    };

    return (
        <section className="p-6 flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <div>
                    <h1 className="text-[20px] font-bold text-ink leading-tight">Dashboard</h1>
                    <p className="text-[13px] text-mutedfg">Overview of stations, feedback, enquiries and products</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={openEditModal}
                        className="bg-brand text-white border-none rounded-full py-[9px] px-[18px] cursor-pointer font-semibold text-[13px] flex items-center gap-1.5 transition hover:bg-brand-dark whitespace-nowrap"
                    >
                        <Edit2 size={15} /> Update Fuel Prices
                    </button>
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="bg-white text-mutedfg border border-line rounded-full py-[8px] px-[16px] cursor-pointer font-semibold text-[13px] flex items-center gap-1.5 transition hover:bg-cream whitespace-nowrap"
                    >
                        <RefreshCw
                            size={14}
                            className={`transition-transform duration-1000 ease-out ${refreshing ? "animate-spin" : ""}`}
                        />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* KPI Row (Row 1) */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                <StatCard
                    icon={<MapPin size={20} />}
                    label="Total LPG Stations"
                    value={totalLPGStations}
                    sub={`${activeStations} active · ${inactiveStations} inactive`}
                    href="/stations"
                />
                <StatCard
                    icon={<MessageSquare size={20} />}
                    label="Total Feedback"
                    value={totalFeedback}
                    sub={`${pendingFeedback} pending · ${inProgressFeedback} in progress · ${resolvedFeedback} resolved`}
                    href="/contact?tab=feedback&status=pending"
                />
                <StatCard
                    icon={<Mail size={20} />}
                    label="New Enquiries"
                    value={totalEnquiries}
                    sub={`${thisMonthEnquiries} this month`}
                    href="/contact?tab=submissions"
                />
                <StatCard
                    icon={<Package size={20} />}
                    label="Total Products"
                    value={totalProducts}
                    sub={productSubText}
                    href="/products"
                />
            </div>

            {/* Row 2: Feedback by Category + Fuel Prices */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 min-w-0">
                {/* Feedback by Category (Horizontal Bar Chart) */}
                <TilesLayout 
                    title="Feedback by Category"
                    description="Distribution of user feedback across 6 categories"
                    className="min-w-0"
                >
                    <div className="flex-1 min-h-[220px]">
                        <FeedbackBarChart data={barData} />
                    </div>
                </TilesLayout>

                {/* Fuel Prices */}
                <TilesLayout title="Fuel Prices" className="relative">
                    <div className="absolute right-4 top-4">
                        <button onClick={openEditModal} className="bg-white text-mutedfg border border-line rounded-full py-[4px] px-[12px] cursor-pointer font-semibold text-xs inline-flex items-center gap-1.5 transition hover:bg-cream whitespace-nowrap">
                            <Edit2 size={12} /> Edit
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        {fuelRows.map(({ key, label, em }) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-line">
                                <div className="flex items-center gap-5">
                                    {em}
                                    <div>
                                        <div className="font-medium text-[13px] text-ink">{label}</div>
                                        <div className="text-[11px] text-mutedfg">per litre</div>
                                    </div>
                                </div>
                                <span className="font-bold text-[18px] text-brand">₹{prices[key]}</span>
                            </div>
                        ))}
                        <div className="mt-3 py-2 px-3 bg-ink rounded-[10px]">
                            <div className="text-[11px] text-white/60">Verified by</div>
                            <div className="text-xs font-medium text-brand-light">teamkrfuels@gmail.com</div>
                        </div>
                    </div>
                </TilesLayout>
            </div>

            {/* Row 3: Status Donut + Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Feedback Status Breakdown (Donut) */}
                <TilesLayout
                    className="min-w-0"
                    title="Feedback Status Breakdown"
                    description="Proportion of pending, in progress, and resolved cases"
                >
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="relative w-full h-[180px]">
                            <FeedbackStatusDonut data={donutData} total={dashboardData?.feedback?.total ?? 0} />
                        </div>
                        <div className="flex justify-center gap-4 mt-1">
                            {donutData.map((s) => (
                                <div key={s.name} className="flex justify-center items-baseline gap-1.5 text-xs">
                                    <span className="w-2 h-2 rounded-md" style={{ background: s.fill }} />
                                    <span className="text-ink font-medium">{s.name}</span>
                                    <span className="text-mutedfg">({s.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TilesLayout>

                {/* Feedback Insights */}
                <TilesLayout 
                    title="Feedback Insights" 
                    description="Key quality and performance indicators" 
                    className=" gap-4"
                >
                    <div className="flex flex-col gap-3.5">
                        {/* Avg Rating */}
                        <div className="flex justify-between items-center py-2.5 px-3 bg-ink rounded-xl">
                            <div>
                                <div className="text-[11px] text-white/60 uppercase font-semibold tracking-wide">Average Rating</div>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-xl font-bold text-white">{avgRating}</span>
                                    <span className="text-xs text-white/70">/ 5.0</span>
                                </div>
                            </div>
                            <div>{renderStars(avgRating)}</div>
                        </div>

                        {/* Safety Awareness */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-ink">Safety Awareness</span>
                                <span className="text-brand font-bold">{safetyAwarenessPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-[width] duration-500 ease-out" 
                                    style={{ 
                                        width: `${safetyAwarenessPercent}%`,
                                        backgroundColor: C.blueLight
                                    }} 
                                />
                            </div>
                            <span className="text-[11px] text-mutedfg">Percentage of users expressing safety awareness</span>
                        </div>

                        {/* Resolution Rate */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-ink">Resolution Rate</span>
                                <span className="text-brand font-bold">{resolutionRate}%</span>
                            </div>
                            <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-[width] duration-500 ease-out" 
                                    style={{ 
                                        width: `${resolutionRate}%`,
                                        backgroundColor: C.greenLight
                                    }} 
                                />
                            </div>
                            <span className="text-[11px] text-mutedfg">Percentage of resolved feedback requests</span>
                        </div>
                    </div>
                </TilesLayout>
            </div>

            {/* Row 4: Recent Feedback + Recent Enquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
                {/* Recent Feedback */}
                <TilesLayout
                    title="Recent Feedback"
                >
                    <div className="flex flex-col gap-3 flex-1">
                        {recentFeedback.length > 0 ? (
                            recentFeedback.map((s) => (
                                <div key={s.id} className="flex gap-3 py-2.5 border-b border-line items-start">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
                                        style={{ background: avatarColor(s.name).bg, color: avatarColor(s.name).fg }}
                                    >
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <div className="text-[13px] font-semibold text-ink">{s.name}</div>
                                            <Badge color={getStatusBadgeColor(s.status)}>
                                                {s.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-[2px] mb-[6px]">
                                            <span className="bg-brand text-white py-[1px] px-1.5 rounded text-[10px] font-semibold uppercase">
                                                {s.category}
                                            </span>
                                            <span className="text-[11px] text-mutedfg">@ {s.stationName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {renderStars(s.rating)}
                                            {s.safetyAwareness && (
                                                <span className="text-[10px] text-blue-500 bg-blue-100 py-0 px-1.5 rounded font-medium">
                                                    Safety Aware
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-mutedfg leading-[1.4] break-words">
                                            {s.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-[30px] px-[10px] text-center text-mutedfg text-[13px]">
                                No recent feedback submissions.
                            </div>
                        )}
                    </div>
                </TilesLayout>

                {/* Recent Enquiries */}
                <TilesLayout
                    title="Recent Enquiries"
                >
                    <div className="flex flex-col gap-3 flex-1">
                        {recentEnquiries.length > 0 ? (
                            recentEnquiries.map((e) => (
                                <div key={e.id} className="flex gap-3 py-2.5 border-b border-line items-start">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
                                        style={{ background: avatarColor(e.name).bg, color: avatarColor(e.name).fg }}
                                    >
                                        {e.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <div className="text-[13px] font-semibold text-ink">{e.name}</div>
                                            <span className="text-[11px] text-mutedfg">
                                                {e.createdAt ? new Date(e.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-brand mb-1 truncate">
                                            {e.email}
                                        </div>
                                        <div className="text-xs text-mutedfg leading-[1.4] break-words">
                                            {e.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-[30px] px-[10px] text-center text-mutedfg text-[13px]">
                                No recent enquiries found.
                            </div>
                        )}
                    </div>
                </TilesLayout>
            </div>

            {/* Edit Price Modal */}
            <Modal open={editPrice} title="Edit Fuel Prices" onClose={() => setEditPrice(false)} width={380}>
                {(["diesel", "petrol", "autoLPG"] as const).map((k) => (
                    <FormField key={k} label={k === "autoLPG" ? "Auto LPG (₹/L)" : `${k.charAt(0).toUpperCase() + k.slice(1)} (₹/L)`}>
                        <input
                            className="w-full py-[10px] px-3.5 rounded-xl border border-line text-sm outline-none bg-white text-ink box-border focus:border-brand"
                            type="number"
                            step="0.01"
                            value={draft[k]}
                            onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))}
                        />
                    </FormField>
                ))}
                <div className="flex gap-2 justify-end mt-2">
                    <button className="bg-white text-mutedfg border border-line rounded-full py-2 px-5 cursor-pointer font-semibold text-sm inline-flex items-center gap-1.5 transition hover:bg-cream whitespace-nowrap" onClick={() => setEditPrice(false)}>Cancel</button>
                    <button disabled={!draftValid} className="bg-brand text-white border-none rounded-full py-2 px-5 cursor-pointer font-semibold text-sm inline-flex items-center gap-1.5 transition hover:bg-brand-dark whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand" onClick={handleSave}><Check size={14} />Save Prices</button>
                </div>
            </Modal>
        </section>
    );
};

export default DashboardPage;
