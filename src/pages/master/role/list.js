import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { master_data } from "@/data/sidebar/master_data";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Paper } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconTrash, IconDatabase, IconPencil } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";

export default function List() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id_role", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const handleDelete = async (id) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      "Do you want to delete this role?",
      true,
      null,
      "Delete",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/master/role/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      showAlert("Success", "success", "Role deleted", false, 1200);

      fetchData();
    } catch (err) {
      showAlert("Error", "error", "Failed to delete");
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "no",
        header: "No",
        cell: ({ row }) =>
          pagination.pageIndex * pagination.pageSize + row.index + 1,
        enableSorting: false,
        enableColumnFilter: false,
        size: 50,
      },
      {
        accessorFn: (row) => row.role_name,
        id: "role_name",
        header: "Name Role",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const encryptedId = encrypt(String(row.original.id_role));

          return (
            <Button.Group>
              <Button
                size="xs"
                color="yellow"
                onClick={() => router.push(`/master/role/edit/${encryptedId}`)}
                leftSection={<IconPencil size={16} />}
              >
                Edit
              </Button>

              <Button
                size="xs"
                color="red"
                onClick={() => handleDelete(encryptedId)}
                leftSection={<IconTrash size={16} />}
              >
                Delete
              </Button>
            </Button.Group>
          );
        },
      },
    ],
    [encrypt],
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
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
        `/api/master/role/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );

    setData(data.data);
    setTotalPages(data.total_pages);
  }, [columnFilters, pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthLayout sidebarList={master_data}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper
            radius="sm"
            mt="md"
            style={{ position: "relative" }}
            withBorder
          >
            {/* JUDUL + ICON */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconDatabase size={20} />
              <h2 className="text-lg font-semibold">Master Role</h2>
            </div>

            {/* Tombol di kanan */}
            <div className="px-4 py-2 text-right space-x-2">
              <Button
                size="xs"
                onClick={() => router.push("/master/role/create")}
              >
                Add Role
              </Button>
            </div>

            {/* Tabel */}
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
