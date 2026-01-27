import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import { Button, Paper, Badge } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconList, IconPencil, IconEye } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function IssMprList() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API = useApi();
  const API_URL = API.API_URL;

  const { status = "all" } = router.query;

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  // STATUS MAP untuk Recruitment Status
  const recruitmentStatusMap = {
    pending: { label: "Pending", color: "yellow" },
    approved: { label: "Approved", color: "green" },
    rejected: { label: "Rejected", color: "red" },
  };

  // ======================
  // TABLE COLUMNS
  // ======================
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
        accessorFn: (row) => row.job_title,
        id: "job_title",
        header: "Job Title",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        header: "Qty",
        columns: [
          {
            accessorFn: (row) => row.qty_request,
            id: "qty_request",
            header: "Request",
            enableColumnFilter: false,
            enableSorting: true,
            cell: (info) => info.getValue() || 0,
            size: 80,
          },
          {
            accessorFn: (row) => row.qty_new_join,
            id: "qty_new_join",
            header: "New Join",
            enableColumnFilter: false,
            enableSorting: true,
            cell: (info) => info.getValue() || 0,
            size: 80,
          },
        ],
      },
      {
        accessorFn: (row) => row.vacant_type,
        id: "vacant_type",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Vacant</span>
            <span>Type</span>
          </span>
        ),
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.required_date,
        id: "required_date",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Required</span>
            <span>Date</span>
          </span>
        ),
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          return new Date(val).toISOString().split("T")[0];
        },
      },
      {
        accessorFn: (row) => row.created_by,
        id: "created_by",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Created</span>
            <span>By</span>
          </span>
        ),
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Created</span>
            <span>Date</span>
          </span>
        ),
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          return new Date(val).toISOString().split("T")[0];
        },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          return val;
        },
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
          const val = info.getValue();
          if (!val) return "-";

          const statusInfo = recruitmentStatusMap[val] || {
            label: val,
            color: "gray",
          };

          return (
            <Badge color={statusInfo.color} variant="filled" size="sm">
              {statusInfo.label}
            </Badge>
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
            <Button.Group>
              <Button
                size="xs"
                color="blue"
                leftSection={<IconEye size={16} />}
                onClick={() => router.push(`/iss_mpr/detail/${encryptedId}`)}
              >
                Detail
              </Button>
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconPencil size={16} />}
                onClick={() => router.push(`/iss_mpr/edit/${encryptedId}`)}
              >
                Edit
              </Button>
            </Button.Group>
          );
        },
      },
    ],
    [encrypt, router],
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
    try {
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

      const statusParam = status !== "all" ? `&status=${status}` : "";

      const { data } = await axios.post(
        API_URL +
          `/api/iss_mpr/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}${statusParam}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty data jika error
      setData([]);
      setTotalPages(1);
    }
  }, [
    columnFilters,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    status,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconList size={20} />
              <h2 className="text-lg font-semibold uppercase">
                {status === "all"
                  ? "MPR LIST"
                  : `${status.replace(/_/g, " ")} MPR LIST`}
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
