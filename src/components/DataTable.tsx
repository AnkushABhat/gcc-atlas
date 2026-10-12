"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  defaultSortKey?: string;
  defaultSortDirection?: "asc" | "desc";
  emptyState?: {
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  ariaLabel?: string;
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  defaultSortKey,
  defaultSortDirection = "asc",
  emptyState,
  ariaLabel = "Data table",
  className = "",
  stickyHeader = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSortDirection
  );

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    if (sortKey === column.key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        // Toggle back to asc
        setSortDirection("asc");
      }
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortable) return data;

    return [...data].sort((a, b) => {
      if (col.sortFn) {
        const res = col.sortFn(a, b);
        return sortDirection === "asc" ? res : -res;
      }
      // Default string/number comparison on raw key if accessor not sorting
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const cmp = strA.localeCompare(strB);
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDirection, columns]);

  if (sortedData.length === 0) {
    return (
      <div
        className={`rounded-lg border border-border bg-surface p-8 text-center space-y-2 ${className}`}
        role="region"
        aria-label={ariaLabel}
      >
        <p className="text-xs font-medium text-text">
          {emptyState?.title || "No data available."}
        </p>
        {emptyState?.description && (
          <p className="text-xs text-text-muted">{emptyState.description}</p>
        )}
        {emptyState?.action && <div className="pt-2">{emptyState.action}</div>}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-border gradient-card overflow-x-auto shadow-xs ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <table className="w-full text-xs sm:text-[13px] text-left border-collapse">
        <thead
          className={`bg-gradient-to-b from-surface-raised to-surface text-text-muted border-b border-border ${
            stickyHeader ? "sticky top-0 z-10" : ""
          }`}
        >
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              const ariaSortValue = isSorted
                ? sortDirection === "asc"
                  ? "ascending"
                  : "descending"
                : col.sortable
                ? "none"
                : undefined;

              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSortValue}
                  className={`px-4 py-2.5 font-medium ${
                    col.headerClassName || ""
                  }`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      aria-label={`Sort by ${col.header}`}
                      onClick={() => handleSort(col)}
                      className="inline-flex items-center gap-1.5 text-text-muted hover:text-text transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                      title={`Sort by ${col.header}`}
                    >
                      <span>{col.header}</span>
                      <span className="shrink-0" aria-hidden="true">
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-accent" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-background/60 transition-colors duration-150"
            >
              {columns.map((col) => {
                const cellContent = col.accessor
                  ? col.accessor(item)
                  : String((item as Record<string, unknown>)[col.key] ?? "—");

                return (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 ${col.className || ""}`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
