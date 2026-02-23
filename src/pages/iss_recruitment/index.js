// pages/iss_recruitment/index.tsx
import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";
import { Button, Paper, Select } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconList, IconEye } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function IssRecruitmentList() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  // ================= FETCH DATA =================
  const fetchData = useCallback(async () => {
    try {
      const searchQuery = {};
      columnFilters.forEach((filter) => {
        if (filter.value != null && filter.value !== "") {
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

      const { data } = await axios.post(
        `${API_URL}/api/iss_mpr/serverside/completed?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotalPages(1);
    }
  }, [columnFilters, pagination.pageIndex, pagination.pageSize, sorting, API_URL, user.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= COLUMNS =================
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.mpr_no,
        id: "mpr_no",
        header: "MPR No.",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.department,
        id: "department",
        header: "Department",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.project,
        id: "project",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.position,
        id: "position",
        header: "Position",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.qty_request,
        id: "qty_request",
        header: "Request",
        enableColumnFilter: false,
        enableSorting: true,
        size: 100,
        cell: (info) => info.getValue() ?? 0,
      },
      {
        accessorFn: (row) => row.recruitment_status,
        id: "recruitment_status",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Recruitment</span>
            <span>Status</span>
          </span>
        ),
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => {
          const row = info.row.original;
          const currentStatus = info.getValue();

          const statusOptions = [
            { value: "", label: "---" },
            { value: "1", label: "Open" },
            { value: "2", label: "Fulfillment in Progress" },
            { value: "3", label: "Closed" },
            { value: "4", label: "Cancel" },
          ];

          const handleStatusChange = async (newStatus) => {
            if (!newStatus) return;
            try {
              const confirm = await showAlert(
                "Are you sure?",
                "question",
                "Do you want to update recruitment status?",
                true,
                null,
                "Yes, Update",
                "Cancel",
              );
              if (!confirm?.isConfirmed) return;

              await axios.patch(
                `${API_URL}/api/iss_mpr/${row.id}/recruitment-status`,
                { recruitment_status: Number(newStatus) },
                { headers: { Authorization: `Bearer ${user.token}` } },
              );

              await fetchData();

              await showAlert(
                "Success",
                "success",
                "Recruitment status updated successfully",
                false,
                1500,
              );
            } catch (err) {
              console.error("Update error:", err);
              await showAlert(
                "Error",
                "error",
                err.response?.data?.message || "Failed to update recruitment status",
                false,
                2000,
              );
            }
          };

          return (
            <Select
              value={currentStatus ? String(currentStatus) : ""}
              onChange={handleStatusChange}
              data={statusOptions}
              size="xs"
              disabled={row.mpr_status !== 2}
            />
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original?.id;
          const encryptedId = encrypt(String(id));
          return (
            <Button
              size="xs"
              color="blue"
              leftSection={<IconList size={16} />}
              onClick={() => router.push(`/iss_recruitment/detail/${encryptedId}`)}
            >
              Detail
            </Button>
          );
        },
      },
    ],
    [showAlert, API_URL, user.token, fetchData, encrypt, router],
  );

  // ================= TABLE =================
  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconList size={20} />
              <h2 className="text-lg font-semibold uppercase">
                Recruitment List
              </h2>
            </div>

            {/* TABEL */}
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}