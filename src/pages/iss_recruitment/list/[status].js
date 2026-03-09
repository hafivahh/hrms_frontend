// pages/iss_recruitment/list/[status].js

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { recruitmentOnly  } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";

import { Button, Paper, Select } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconList } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export default function IssRecruitmentList() {
  const router = useRouter();
  const { status } = router.query;

  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;

  const allowedStatus = ["all", "open", "fulfillment", "closed", "cancel"];

  /* ================= VALIDATE STATUS ================= */
  useEffect(() => {
    if (!status) return;

    if (!allowedStatus.includes(status)) {
      Swal.fire({
        text: `Invalid status: "${status}"`,
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });

      router.replace("/iss_recruitment/list/all");
    }
  }, [status, router]);

  /* ================= PAGE TITLE ================= */
  const pageTitle = useMemo(() => {
    const titleMap = {
      all: "Recruitment",
      open: "Open Recruitment",
      fulfillment: "Fulfillment in Progress",
      closed: "Closed Recruitment",
      cancel: "Cancelled Recruitment",
    };
    return titleMap[status] || "Recruitment List";
  }, [status]);

  /* ================= STATES ================= */
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    if (!status || !user?.token) return;

    try {
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
        `${API_URL}/api/iss_recruitment/serverside/${status}?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
      setTotalPages(1);
    }
  }, [
    status,
    columnFilters,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
    API_URL,
    user?.token,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= COLUMNS ================= */
  const columns = useMemo(
    () => [
      {
        accessorKey: "mpr_no",
        header: "MPR No.",
      },
      {
        accessorKey: "department",
        header: "Department",
      },
      {
        accessorKey: "project",
        header: "Project",
      },
      {
        accessorKey: "position",
        header: "Position",
      },
      {
        accessorKey: "qty_request",
        header: "Request",
        size: 80,
      },
{
  accessorKey: "recruitment_status",
  header: "Recruitment Status",
  cell: ({ row }) => {
    const currentStatus = row.original.recruitment_status;

    const statusOptions = [
      { value: "", label: "---", color: "gray" },
      { value: "1", label: "Open", color: "green" },
      { value: "2", label: "Fulfillment in Progress", color: "blue" },
      { value: "3", label: "Closed", color: "gray" },
      { value: "4", label: "Cancel", color: "red" },
    ];

    const selectedOption = statusOptions.find(
      (opt) => opt.value === String(currentStatus)
    );

    const statusColor = selectedOption?.color || "gray";

    const handleStatusChange = async (newStatus) => {
      if (!newStatus) return;

      const confirm = await showAlert(
        "Are you sure?",
        "question",
        "Update recruitment status?",
        true,
        null,
        "Yes, Update",
        "Cancel"
      );

      if (!confirm?.isConfirmed) return;

      try {
        await axios.patch(
          `${API_URL}/api/iss_mpr/${row.original.id}/recruitment-status`,
          { recruitment_status: Number(newStatus) },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        await fetchData();
        await showAlert("Success", "success", "Status updated", false, 1500);
      } catch (err) {
        await showAlert(
          "Error",
          "error",
          err.response?.data?.message || "Update failed",
          false,
          2000
        );
      }
    };

   return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Select
          size="xs"
          value={currentStatus ? String(currentStatus) : ""}
          onChange={handleStatusChange}
          data={statusOptions}
          disabled={row.original.mpr_status !== 2}
          styles={{
            input: {
              textAlign: "center",
              textAlignLast: "center",
              fontWeight: 600,
              backgroundColor:
                statusColor === "green"
                  ? "#d3f9d8"
                  : statusColor === "blue"
                  ? "#d0ebff"
                  : statusColor === "red"
                  ? "#ffc9c9"
                  : "#e9ecef",
              color:
                statusColor === "green"
                  ? "#2b8a3e"
                  : statusColor === "blue"
                  ? "#1864ab"
                  : statusColor === "red"
                  ? "#c92a2a"
                  : "#495057",
              border: "1px solid transparent",
            },
          }}
        />
      </div>
    );
  },
},
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const encryptedId = encrypt(String(row.original.id));

          return (
           <Button
        size="xs"
        leftSection={<IconList size={16} />}
        onClick={() =>
          router.push({
            pathname: `/iss_recruitment/detail/${encryptedId}`,
            query: {
              mpr_id: row.original.id,        // ← ID asli untuk fetch applicants
              mpr_no: row.original.mpr_no,    // ← untuk ditampilkan di header
              position: row.original.position, // ← untuk ditampilkan di header
            },
          })
        }
      >
        Detail
      </Button>
          );
        },
      },
    ],
    [encrypt, router, showAlert, fetchData, API_URL, user?.token]
  );

  /* ================= TABLE ================= */
  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
  });

  /* ================= RENDER ================= */
  return (
    <AuthLayout sidebarList={recruitmentOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconList size={20} />
              <h2 className="text-lg font-semibold uppercase">
                {pageTitle}
              </h2>
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