import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { adminOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import { Button, Paper } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconArrowLeft, IconPlus, IconPencil } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function PermissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { encrypt, decrypt } = useEncrypt(); // ← tambah decrypt
  const API = useApi();
  const API_URL = API.API_URL;

  const [ready, setReady] = useState(false);
  const [realId, setRealId] = useState(null); // ← tambah realId
  const [appName, setAppName] = useState("");
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "index_key", desc: false }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (router.isReady && id) {
      const decrypted = decrypt(id);
      setRealId(decrypted);
      setReady(true);
    }
  }, [router.isReady, id]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.app_name,
        id: "app_name",
        header: "Application Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.permission_group,
        id: "permission_group",
        header: "Permission Group",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.permission_name,
        id: "permission_name",
        header: "Permission Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.index_key,
        id: "index_key",
        header: "Index Key",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "actions",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => {
          const encryptedPermId = encrypt(
            String(row.original.id_app_permission),
          );
          return (
            <Button
              size="xs"
              color="yellow"
              leftSection={<IconPencil size={14} />}
              onClick={() =>
                router.push(
                  `/permission/detail/edit/${encrypt(String(row.original.id_permission))}`,
                )
              }
            >
              Edit
            </Button>
          );
        },
      },
    ],
    [encrypt, router],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, columnFilters },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
  });

  // FETCH APP NAME
  useEffect(() => {
    if (!ready || !realId || !user?.token) return;
    axios
      .get(`${API_URL}/api/permission/application/${realId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setAppName(res.data.app_name))
      .catch(console.error);
  }, [ready, realId, user?.token, API_URL]);

  // FETCH PERMISSIONS
  const fetchData = useCallback(async () => {
    if (!ready || !realId || !user?.token) return;

    const searchQuery = {};
    columnFilters.forEach((filter) => {
      if (filter.value) searchQuery[filter.id] = filter.value;
    });

    const filterParams =
      Object.keys(searchQuery).length > 0
        ? `&search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    const { data: res } = await axios.get(
      `${API_URL}/api/permission/detail/${realId}?page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}${filterParams}`,
      { headers: { Authorization: `Bearer ${user.token}` } },
    );

    setData(res.data ?? []);
    setTotalPages(res.total_pages ?? 1);
  }, [
    ready,
    realId,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    user?.token,
    API_URL,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
     <AuthLayout sidebarList={adminOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  {appName ? `${appName} — Permission List` : "Permission List"}
                </h2>
              </div>
              <Button
                size="xs"
                color="blue"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  router.push(
                    `/permission/detail/create?app_id=${encrypt(String(realId))}`,
                  )
                }
              >
                Add New Permission
              </Button>
            </div>

            <div className="p-4 overflow-x-auto">
              {!ready ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Loading...
                </p>
              ) : (
                <Datatables table={table} totalPages={totalPages} />
              )}
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
