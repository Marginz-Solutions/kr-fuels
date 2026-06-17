"use client";
import React from "react";

const Loading = () => {
  return (
    <div className="p-6 flex flex-col gap-6 w-full animate-pulse">
      {/* Page Header */}
      <div className="flex justify-end items-center">
        <div className="h-10 w-24 rounded-[10px] sk" />
      </div>

      {/* KPI Row (Row 1) */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] p-5 flex justify-between items-start">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-28 sk" />
              <div className="h-8 w-16 sk" />
              <div className="h-3 w-36 sk" />
            </div>
            <div className="w-11 h-11 rounded-lg sk shrink-0" />
          </div>
        ))}
      </div>

      {/* Row 2: Category Analysis + Fuel Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 min-w-0">
        {/* Category Chart Skeleton */}
        <div className="bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] p-5 flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-44 sk" />
            <div className="h-4 w-64 sk" />
          </div>
          <div className="h-[220px] w-full sk" />
        </div>

        {/* Fuel Prices Skeleton */}
        <div className="bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 sk" />
            <div className="h-6 w-12 rounded sk" />
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-line">
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded sk" />
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-16 sk" />
                    <div className="h-3 w-12 sk" />
                  </div>
                </div>
                <div className="h-6 w-14 sk" />
              </div>
            ))}
            <div className="mt-2 h-10 w-full rounded-[10px] sk" />
          </div>
        </div>
      </div>

      {/* Row 3: Status Donut + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status Donut Skeleton */}
        <div className="bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] p-5 flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-48 sk" />
            <div className="h-4 w-72 sk" />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 py-4">
            <div className="w-[120px] h-[120px] rounded-full sk mb-4" />
            <div className="flex gap-4">
              <div className="h-4 w-16 sk" />
              <div className="h-4 w-16 sk" />
              <div className="h-4 w-16 sk" />
            </div>
          </div>
        </div>

        {/* Insights Skeleton */}
        <div className="bg-white rounded-2xl border border-line shadow-[0_2px_18px_rgba(26,46,41,0.05)] p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-32 sk" />
            <div className="h-4 w-52 sk" />
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-between">
            <div className="h-16 w-full rounded-xl sk" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-28 sk" />
              <div className="h-2 w-full rounded sk" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-28 sk" />
              <div className="h-2 w-full rounded sk" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;