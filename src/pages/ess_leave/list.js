import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";

import { Button, Paper, Badge } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconList, IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { formatDateTime } from "@/lib/utils";

export default function ESSLeaveList() {
  const router = useRouter();
  const { user } = useUser();

  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "created_date", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const actions = ["detail", "update", "delete"];

  // STATUS MAP
  const statusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Completed", color: "green" },
    3: { label: "Rejected", color: "red" },
  };

  // ======================
  // TABLE COLUMNS
  // ======================
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.leave_in,
        id: "leave_in",
        header: () => (
          <span className="flex flex-col sm:flex-row sm:gap-1 text-center sm:text-left">
            <span>Start</span>
            <span>Date</span>
          </span>
        ),
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.leave_out,
        id: "leave_out",
        header: () => (
          <span className="flex flex-col sm:flex-row sm:gap-1 text-center sm:text-left">
            <span>End</span>
            <span>Date</span>
          </span>
        ),
        cell: (info) => info.getValue() || "-",
      },

      {
        accessorFn: (row) => row.leave_status,
        id: "leave_status",
        header: "Status",
        cell: (info) => {
          const val = Number(info.getValue());
          const s = statusMap[val];
          // eslint-disable-next-line react/jsx-no-undef
          return <Badge color={s.color}>{s.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const id = row.original?.id; // pastikan id ada
          const leaveStatus = row.original?.leave_status;

          // jika mau encrypt: aktifkan ini
          // const encryptedId = encrypt(String(id));

          return (
            <Button.Group>
              {actions.includes("detail") && (
                <Button
                  size="xs"
                  color="blue"
                  leftSection={<IconList size={16} />}
                  onClick={() => router.push(`/ess_leave/detail/${id}`)}
                >
                  Detail
                </Button>
              )}

              {/* {actions.includes("update") && (
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconPencil size={16} />}
                onClick={() => router.push(`/ess_leave/update/${id}`)}
              >
                Update
              </Button>
            )} */}

              {/* {actions.includes("delete") && (
              <Button
                size="xs"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => onDelete(id)}
              >
                Delete
              </Button>
            )} */}
            </Button.Group>
          );
        },
      },
    ],
    []
  );

  // ======================
  // REACT TABLE CONFIG
  // ======================
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  // ======================
  // FETCH DATA
  // ======================
  const fetchData = useCallback(async () => {
    const searchQuery = {};
    columnFilters.forEach((filter) => {
      if (filter.value != null && filter.value !== "") {
        searchQuery[filter.id] = filter.value;
      }
    });

    const filterParams =
      searchQuery && Object.keys(searchQuery).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting && sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    const { data } = await axios.post(
      API_URL +
        `/api/ess_leave/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setData(data.data);
    setTotalPages(data.total_pages);
  }, [columnFilters, pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconList size={20} />
                <h2 className="text-lg font-semibold">Leave List</h2>
              </div>
              <Button
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/ess_leave/create")}
              >
                Add Leave
              </Button>
            </div>

            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
