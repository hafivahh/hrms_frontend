import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { adminOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Badge } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import {
  IconTrash,
  IconPencil,
  IconList,
  IconPlus,
  IconLock,
  IconEye,
} from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useEncrypt from "@/hooks/useEncrypt";

export default function PortalUser() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id_user", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  const statusMap = {
    1: { label: "Active", color: "green" },
    0: { label: "Inactive", color: "red" },
  };

  // ===============================
  // COLUMNS
  // ===============================
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: "Created Date",
      },
      {
        accessorFn: (row) => row.username,
        id: "username",
        header: "Username",
      },
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "Full Name",
      },
      {
        accessorFn: (row) => row.badge_number,
        id: "badge_number",
        header: "Badge Number",
      },
      {
        accessorFn: (row) => row.role_name,
        id: "role_name",
        header: "Role",
      },
      {
  accessorFn: (row) => row.status_user,
  id: "status_user",
  header: "Account Status",
  cell: (info) => {
    const val = Number(info.getValue());
    const st = statusMap[val] ?? { label: "Unknown", color: "gray" };
    return <Badge color={st.color} variant="filled" size="sm">{st.label}</Badge>;
  },
},
      // ===============================
      // ACTIONS
      // ===============================
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const encryptedId = encrypt(String(row.original.id_user));
          return (
            <Button.Group style={{ display: "flex", width: "100%" }}>
              {/* Edit User */}
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconPencil size={14} />}
                style={{ flex: 1 }}
                onClick={() => router.push(`/portal/edit/${encryptedId}`)}
              >
                Edit
              </Button>

              {/* Change Password */}
              <Button
                size="xs"
                color="grey"
                leftSection={<IconLock size={14} />}
                style={{ flex: 1 }}
                // Di list page, ganti encryptedId → id_user biasa
               onClick={() => router.push(`/portal/change/${encryptedId}`)}
              >
                Change Password
              </Button>
            </Button.Group>
          );
        },
      },
    ],
    [encrypt],
  );

  // ===============================
  // TABLE
  // ===============================
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    state: { sorting, pagination, columnFilters },

    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
  });

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
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

    const { data } = await axios.post(
      `${API_URL}/api/user/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {},
      {
        headers: { Authorization: `Bearer ${user.token}` },
      },
    );

    setData(data.data);
    setTotalPages(data.total_pages);
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    user?.token,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================
  // RENDER
  // ===============================
  return (
    <AuthLayout sidebarList={adminOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder className="overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconList size={20} />
                <h2 className="text-lg font-semibold">Portal User List</h2>
              </div>
              <Button
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/portal/create")}
              >
                Add User
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
