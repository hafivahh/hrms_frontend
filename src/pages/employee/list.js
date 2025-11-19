import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Paper } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { use, useCallback, useEffect, useMemo, useState } from "react";

export default function List() {
  const router = useRouter();
  const { user } = useUser();

  const API = useApi();
  const API_URL = API.API_URL;

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
        accessorFn: (row) => row.id_departement,
        id: "id_departement",
        header: "Departement",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.id_project,
        id: "id_project",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button.Group>
            <Button
              size="xs"
              color="red"
              onClick={() => {
                handleDelete(row.original.id);
              }}
              leftSection={<IconTrash size={16} />}
            >
              Delete
            </Button>
          </Button.Group>
        ),
      },
    ],
    []
  );

  // Tambahkan ini supaya tidak error
  const handleDelete = (id) => {
    console.log("Delete", id);
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
            <div className="px-4 py-2 text-right space-x-2">
              <Button onClick={() => router.push("/employee/add_employee")}>
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
