import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Paper, Button } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconList, IconDownload } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function IssDocumentsList() {
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

  const handleDownload = async (doc) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/ess_documents/download/${doc.id}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      // Ambil ekstensi dari file_name asli
      const originalName = doc.file_name || "";
      const ext = originalName.includes(".")
        ? originalName.split(".").pop()
        : doc.file_type?.includes("pdf")
          ? "pdf"
          : doc.file_type?.includes("spreadsheetml")
            ? "xlsx"
            : doc.file_type?.includes("ms-excel")
              ? "xls"
              : "file";

      const downloadName = `work_document_${doc.badge_number}.${ext}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal download file");
    }
  };

  // ======================
  // TABLE COLUMNS
  // ======================
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.file_type,
        id: "file_type",
        header: "File Type",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          if (val.includes("spreadsheetml")) return "xlsx";
          if (val.includes("ms-excel")) return "xls";
          return val;
        },
      },
      {
        accessorFn: (row) => row.remarks,
        id: "remarks",
        header: "Remarks",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Upload</span>
            <span>Date</span>
          </span>
        ),
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";//
          return new Date(val).toISOString().split("T")[0];
        }, //////
      },
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <Button
              size="xs"
              color="green"
              leftSection={<IconDownload size={16} />}
              onClick={() => handleDownload(doc)}
            >
              Download
            </Button>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [API_URL],
  );

  // ======================
  // REACT TABLE CONFIG
  // ======================
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

  // ======================
  // FETCH DATA (SERVER SIDE)
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
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const { data } = await axios.post(
        `${API_URL}/api/ess_documents/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
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
      console.error(error);
      setData([]);
      setTotalPages(1);
    }
  }, [
    columnFilters,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    API_URL,
    user.token,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
  <AuthLayout sidebarList={[]} hideSidebar={true}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconList size={20} />
              <h2 className="text-lg font-semibold uppercase">My Documents</h2>
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
