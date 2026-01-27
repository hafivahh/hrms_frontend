import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconTrash, IconPencil, IconList  } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import useEncrypt from "@/hooks/useEncrypt";

export default function List() {
  const router = useRouter();
  const { user } = useUser();

  const { encrypt } = useEncrypt();

  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.badge_number,
        id: "badge_number",
        header: "Badge Number",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "Full Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.gender,
        id: "gender",
        header: "Gender",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue();
          return value === 1 ? "Laki-Laki" : value === 2 ? "Perempuan" : "-";
        },
      },
      {
        accessorFn: (row) => row.position_name,
        id: "position_name",
        header: "Position",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.departement_name,
        id: "departement_name",
        header: "Departement",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },

      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.company_name,
        id: "company_name",
        header: "Company",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const encryptedId = encrypt(String(row.original.id));

          return (
            <Button.Group>
              <Button
                size="xs"
                color="blue"
                onClick={() => router.push(`/employee/edit/${encryptedId}`)}
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
    [encrypt]
  );

  // Tambahkan ini supaya tidak error
  const handleDelete = async (encryptedId) => {
    // Konfirmasi sebelum hapus
    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      "Do you want to delete this employee?",
      true,
      null,
      "Delete",
      "Cancel"
    );

    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/employee/${encryptedId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Notifikasi success
      await showAlert(
        "Success",
        "success",
        "Employee deleted successfully",
        false,
        1500
      );

      // Refresh data
      fetchData();
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Error",
        error: "Unknown",
      };
      showAlert(data_error.message, "error", data_error.error);
    }
  };

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
        `/api/employee/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
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

  const downloadExcel = () => {
    console.log("Download Excel");
  };

  const downloadPdf = () => {
    console.log("Download PDF");
  };

  return (
    <AuthLayout sidebarList={employee}>
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
              <IconList  size={20} />
              <h2 className="text-lg font-semibold">List Employee</h2>
            </div>
            <div className="px-4 py-2 text-right space-x-2">
              <Button onClick={() => router.push("/employee/create")}>
                {" "}
                Add Employee
              </Button>
              <Button onClick={downloadExcel}> Download Excel</Button>
              <Button onClick={downloadPdf}> Download PDF</Button>
              <Button onClick={() => router.push("/employee/upload_sftp")}>
                {" "}
                Upload SFTP
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
