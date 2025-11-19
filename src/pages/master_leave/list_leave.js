import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { master_data } from "@/data/sidebar/master_data";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button } from "@mantine/core";
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
        accessorFn: (row) => row.id,
        id: "id",
        header: "No",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.type_name,
        id: "type_name",
        header: "Type Leave",
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
                handleDelete(row.original.id); // atau encrypt kalau perlu
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
        ? `${sorting[0].id},${sorting[0].desc ? "asc" : "desc"}`
        : "";

    const { data } = await axios.post(
      API_URL +
        `/api/master_leave_type/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
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
    <AuthLayout sidebarList={master_data}>
      <div style={{ padding: "0 40px" }}>
        <Datatables table={table} totalPages={totalPages} />
      </div>
    </AuthLayout>
  );
}
