// pages/iss_recruitment/detail/[id].tsx

import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Badge, Button, Paper } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconArrowLeft, IconDownload } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function IssRecruitmentDetail() {
  const router = useRouter();
  const { mpr_id, mpr_no, position } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500); // ← sama dengan list
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    if (!router.isReady || !mpr_id || isNaN(Number(mpr_id))) return;
    if (!user?.token) return;

    try {
      // ← sama persis dengan list
      const searchQuery = {};
      columnFilters.forEach((filter) => {
        if (filter.value) {
          searchQuery[filter.id] = filter.value;
        }
      });

      const filterParams =
        Object.keys(searchQuery).length > 0
          ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
          : "";

      const sort =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const res = await axios.get(
        `${API_URL}/api/iss_recruitment/applicants/${mpr_id}?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      setData(res.data?.data || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setData([]);
      setTotalPages(1);
    }
  }, [
    router.isReady,
    mpr_id,
    columnFilters,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
    API_URL,
    user?.token,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadCV = async (applicant) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/iss_recruitment/download/${applicant.id}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", applicant.document?.split("/").pop() || "cv_document");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download error:", error);
    alert("Gagal download file CV");
  }
};
  /* ================= COLUMNS ================= */
  const columns = useMemo(
    () => [
      {
        id: "no",
        header: "No",
        size: 60,
        cell: (info) =>
          pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      },
      {
        accessorKey: "full_name",
        header: "Name",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "phone_number",
        header: "Phone Number",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
     {
  id: "action",
  header: "Action",
  enableSorting: false,
  cell: ({ row }) => {
    const applicant = row.original;
    return applicant.document ? (
      <Button
        size="xs"
        color="green"
        leftSection={<IconDownload size={16} />}
        onClick={() => handleDownloadCV(applicant)}
      >
        Download CV
      </Button>
    ) : (
      <span className="text-gray-400 text-xs">No CV</span>
    );
  },
},
    ],
    [pagination.pageIndex, pagination.pageSize],
  );

  /* ================= TABLE ================= */
  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, pagination }, // ← tambah columnFilters
    onColumnFiltersChange: setColumnFilters, // ← sama dengan list
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true, // ← sama dengan list
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <IconArrowLeft
                size={20}
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => router.push("/iss_recruitment/list/all")}
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold uppercase">
                  Recruitment Detail
                </h2>
                {mpr_no && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      MPR No: <strong>{mpr_no}</strong>
                    </span>
                    {position && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">
                          Position: <strong>{position}</strong>
                        </span>
                      </>
                    )}
                    <Badge color="blue" size="sm">
                      {totalItems} Applicant{totalItems !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* TABLE */}
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
