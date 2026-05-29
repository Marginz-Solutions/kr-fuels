"use client";
import { useState, type FC } from "react";
import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    Label
} from "recharts";
import {
    MapPin, MessageSquare, Mail, Package, RefreshCw, Edit2, Check, Star,
    Droplet, Fuel,
    Leaf
} from "lucide-react";

import { C } from "../../../constants/colors";
import { StatCard, Badge, Modal, FormField } from "../../../components/ui";
import type { FuelPrices, DashboardData } from "../../../types";
import { TilesLayout } from "./_components/TilesLayout";

interface DashboardPageProps {
    prices: FuelPrices;
    onEditPrice: (p: FuelPrices) => void;
    dashboardData: DashboardData;
    onRefresh: () => void;
    refreshing: boolean;
}

type FuelDraft = Record<keyof FuelPrices, string>;

const fuelRows: Array<[keyof FuelPrices, string, "blue" | "amber" | "green", React.ReactNode]> = [
    ["diesel", "Diesel", "blue", <Fuel size={20} key={1} style={{ color: C.p }} />],
    ["petrol", "Petrol", "amber", <Droplet size={20} key={2} style={{ color: C.p }} />],
    ["autoLPG", "Auto LPG", "green", <Leaf size={20} key={3} style={{ color: C.p }} />],
];

const categoriesList = [
    "Station Experience",
    "Safety & Education",
    "Pricing & Value",
    "Website/App Support",
    "New Station Request",
    "General Inquiry"
];

const TOOLTIP_STYLE = {
  backgroundColor: C.bgGlass,
  backdropFilter: "blur(3px)",
  border: `1px solid #FFFFFF0D`,
  borderRadius: 8,
  fontSize: 11,
  color: "#868988",
  textTransform: "capitalize",
  zIndex: 20
};

const DashboardPage: FC<DashboardPageProps> = ({
    prices,
    onEditPrice,
    dashboardData,
    onRefresh,
    refreshing
}) => {
    const [editPrice, setEditPrice] = useState(false);
    const [draft, setDraft] = useState<FuelDraft>({
        diesel: String(prices.diesel),
        petrol: String(prices.petrol),
        autoLPG: String(prices.autoLPG),
    });

    const handleSave = () => {
        onEditPrice({ diesel: +draft.diesel, petrol: +draft.petrol, autoLPG: +draft.autoLPG });
        setEditPrice(false);
    };

    // Row 1 metrics
    const totalLPGStations = dashboardData?.stations?.total ?? 0;
    const activeStations = dashboardData?.stations?.active ?? 0;
    const inactiveStations = dashboardData?.stations?.inactive ?? 0;

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

    // Row 4 data (Low-Rated Stations Radar)
    const lowRatedStations = (dashboardData?.feedback?.byStation ?? []).slice(0, 6);
    const hasRadarData = lowRatedStations.length > 0;

    const radarData = categoriesList.map(cat => {
        const point: any = { category: cat.replace(" Experience", "").replace(" & Education", "").replace(" & Value", "").replace("/App Support", "").replace(" Station Request", "").replace(" Inquiry", "") };
        lowRatedStations.forEach(s => {
            point[s.stationName] = s.categoryRatings[cat] ?? 0;
        });
        return point;
    });

    const radarColors = [C.red, C.amber, C.blue, C.green, C.pLight, C.tm];

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
            <div className="flex justify-end items-center">
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="bg-transparent text-[#5a7872] border border-[#e2e8f0] rounded-[10px] py-[8px] px-[14px] cursor-pointer font-medium text-[13px] flex items-center gap-1.5 transition-opacity duration-150 whitespace-nowrap hover:opacity-80"
                >
                    <RefreshCw
                        size={14}
                        className={`transition-transform duration-1000 ease-out ${refreshing ? "animate-spin" : ""}`}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* KPI Row (Row 1) */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                <StatCard
                    icon={<MapPin size={20} />}
                    label="Total LPG Stations"
                    value={totalLPGStations}
                    sub={`${activeStations} active · ${inactiveStations} inactive`}
                />
                <StatCard
                    icon={<MessageSquare size={20} />}
                    label="Pending Feedback"
                    value={pendingFeedback}
                    sub={`${inProgressFeedback} in progress`}
                />
                <StatCard
                    icon={<Mail size={20} />}
                    label="New Enquiries"
                    value={totalEnquiries}
                    sub={`${thisMonthEnquiries} this month`}
                />
                <StatCard
                    icon={<Package size={20} />}
                    label="Total Products"
                    value={totalProducts}
                    sub={productSubText}
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
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={barData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={C.bd} horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: C.tm }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: C.pXLight }} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </TilesLayout>

                {/* Fuel Prices */}
                <TilesLayout title="Fuel Prices" className="relative">
                    <div className="absolute right-4">
                        <button onClick={() => setEditPrice(true)} className="bg-transparent text-[#5a7872] border border-[#e2e8f0] rounded-[10px] py-[4px] px-[10px] cursor-pointer font-medium text-xs inline-flex items-center gap-1.5 transition-opacity duration-150 whitespace-nowrap hover:opacity-80">
                            <Edit2 size={12} /> Edit
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        {fuelRows.map(([key, label, , em]) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-[#e2e8f0]">
                                <div className="flex items-center gap-5">
                                    {em}
                                    <div>
                                        <div className="font-medium text-[13px] text-[#1a2e29]">{label}</div>
                                        <div className="text-[11px] text-[#5a7872]">per litre</div>
                                    </div>
                                </div>
                                <span className="font-bold text-[18px] text-[oklch(0.43_0.06_172.08)]">₹{prices[key]}</span>
                            </div>
                        ))}
                        <div className="mt-3 py-2 px-3 bg-[oklch(0.92_0.04_172.08)] rounded-[10px]">
                            <div className="text-[11px] text-[#5a7872]">Verified by</div>
                            <div className="text-xs font-medium text-[oklch(0.43_0.06_172.08)]">teamkrfuels@gmail.com</div>
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
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart responsive>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        cornerRadius="5%"
                                        dataKey="value"
                                    >
                                        <Label
                                            position="left"
                                            content={({ viewBox }) => {
                                                const { cx, cy } = (viewBox || {}) as any;
                                                return (
                                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                        <tspan x={cx} dy="-5" className="text-[22px] font-bold fill-[#1a2e29]">
                                                            {dashboardData?.feedback?.total ?? 0}
                                                        </tspan>
                                                        <tspan x={cx} dy="18" className="text-[10px] uppercase tracking-wider fill-[#5a7872] font-semibold">
                                                            Feedbacks
                                                        </tspan>
                                                    </text>
                                                );
                                            }}
                                        />
                                    </Pie>
                                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: C.pXLight }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-1">
                            {donutData.map((s) => (
                                <div key={s.name} className="flex justify-center items-baseline gap-1.5 text-xs">
                                    <span className="w-2 h-2 rounded-md" style={{ background: s.fill }} />
                                    <span className="text-[#1a2e29] font-medium">{s.name}</span>
                                    <span className="text-[#5a7872]">({s.value})</span>
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
                        <div className="flex justify-between items-center py-2.5 px-3 bg-[oklch(0.92_0.04_172.08)] rounded-xl">
                            <div>
                                <div className="text-[11px] text-[#5a7872] uppercase font-semibold tracking-wide">Average Rating</div>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-xl font-bold text-[#1a2e29]">{avgRating}</span>
                                    <span className="text-xs text-[#5a7872]">/ 5.0</span>
                                </div>
                            </div>
                            <div>{renderStars(avgRating)}</div>
                        </div>

                        {/* Safety Awareness */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-[#1a2e29]">Safety Awareness</span>
                                <span className="text-[oklch(0.43_0.06_172.08)] font-bold">{safetyAwarenessPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-[width] duration-500 ease-out" 
                                    style={{ 
                                        width: `${safetyAwarenessPercent}%`,
                                        backgroundColor: C.blueLight
                                    }} 
                                />
                            </div>
                            <span className="text-[11px] text-[#5a7872]">Percentage of users expressing safety awareness</span>
                        </div>

                        {/* Resolution Rate */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-[#1a2e29]">Resolution Rate</span>
                                <span className="text-emerald-500 font-bold">{resolutionRate}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-[width] duration-500 ease-out" 
                                    style={{ 
                                        width: `${resolutionRate}%`,
                                        backgroundColor: C.greenLight
                                    }} 
                                />
                            </div>
                            <span className="text-[11px] text-[#5a7872]">Percentage of resolved feedback requests</span>
                        </div>
                    </div>
                </TilesLayout>
            </div>

            {/* Row 4: Low-Rated Stations (Radar Chart) */}
            <TilesLayout
                title="Low-Rated Stations Performance"
                description="Bottom 4–6 stations plotted across 6 performance categories (1.0 - 5.0 rating scale)"
                className="min-w-0"
            >
                {hasRadarData ? (
                    <div className="flex-1 min-h-[320px] flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={320}>
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke={C.bd} />
                                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: C.tm, fontWeight: 500 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: C.tm }} />
                                {lowRatedStations.map((s, index) => {
                                    const color = radarColors[index % radarColors.length];
                                    return (
                                        <Radar
                                            key={s.stationId}
                                            name={`${s.stationName} (${s.avgRating}★)`}
                                            dataKey={s.stationName}
                                            stroke={color}
                                            fill={color}
                                            fillOpacity={0.12}
                                        />
                                    );
                                })}
                                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.bd}`, fontSize: 11 }} />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="py-10 px-5 text-center border border-dashed border-[#e2e8f0] rounded-xl bg-[oklch(0.92_0.04_172.08)] my-2.5">
                        <div className="font-semibold text-[#1a2e29] text-sm">All Stations Performing Well</div>
                        <div className="text-xs text-[#5a7872] mt-1">No low-rated station feedback or review records found.</div>
                    </div>
                )}
            </TilesLayout>

            {/* Row 5: Recent Feedback + Recent Enquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
                {/* Recent Feedback */}
                <TilesLayout
                    title="Recent Feedback"
                >
                    <div className="flex flex-col gap-3 flex-1">
                        {recentFeedback.length > 0 ? (
                            recentFeedback.map((s) => (
                                <div key={s.id} className="flex gap-3 py-2.5 border-b border-[#e2e8f0] items-start">
                                    <div className="w-9 h-9 rounded-full bg-[oklch(0.92_0.04_172.08)] text-[oklch(0.43_0.06_172.08)] flex items-center justify-center font-bold text-[13px] shrink-0">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <div className="text-[13px] font-semibold text-[#1a2e29]">{s.name}</div>
                                            <Badge color={getStatusBadgeColor(s.status)}>
                                                {s.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-[2px] mb-[6px]">
                                            <span className="bg-[oklch(0.92_0.04_172.08)] text-[oklch(0.32_0.07_172.08)] py-[1px] px-1.5 rounded text-[10px] font-semibold uppercase">
                                                {s.category}
                                            </span>
                                            <span className="text-[11px] text-[#5a7872]">@ {s.stationName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {renderStars(s.rating)}
                                            {s.safetyAwareness && (
                                                <span className="text-[10px] text-blue-500 bg-blue-100 py-0 px-1.5 rounded font-medium">
                                                    Safety Aware
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[#5a7872] leading-[1.4] break-words">
                                            {s.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-[30px] px-[10px] text-center text-[#5a7872] text-[13px]">
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
                                <div key={e.id} className="flex gap-3 py-2.5 border-b border-[#e2e8f0] items-start">
                                    <div className="w-9 h-9 rounded-full bg-[oklch(0.92_0.04_172.08)] text-[oklch(0.43_0.06_172.08)] flex items-center justify-center font-bold text-[13px] shrink-0">
                                        {e.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <div className="text-[13px] font-semibold text-[#1a2e29]">{e.name}</div>
                                            <span className="text-[11px] text-[#5a7872]">
                                                {e.createdAt ? new Date(e.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-[oklch(0.43_0.06_172.08)] mb-1 truncate">
                                            {e.email}
                                        </div>
                                        <div className="text-xs text-[#5a7872] leading-[1.4] break-words">
                                            {e.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-[30px] px-[10px] text-center text-[#5a7872] text-[13px]">
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
                            className="w-full py-[9px] px-3 rounded-[10px] border border-[#e2e8f0] text-sm outline-none bg-white text-[#1a2e29] box-border"
                            type="number"
                            step="0.01"
                            value={draft[k]}
                            onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))}
                        />
                    </FormField>
                ))}
                <div className="flex gap-2 justify-end mt-2">
                    <button className="bg-transparent text-[#5a7872] border border-[#e2e8f0] rounded-[10px] py-2 px-4 cursor-pointer font-medium text-sm inline-flex items-center gap-1.5 transition-opacity duration-150 whitespace-nowrap hover:opacity-80" onClick={() => setEditPrice(false)}>Cancel</button>
                    <button className="bg-[oklch(0.43_0.06_172.08)] text-white border-none rounded-[10px] py-2 px-4 cursor-pointer font-medium text-sm inline-flex items-center gap-1.5 transition-opacity duration-150 whitespace-nowrap hover:opacity-80" onClick={handleSave}><Check size={14} />Save Prices</button>
                </div>
            </Modal>
        </section>
    );
};

export default DashboardPage;
