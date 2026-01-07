import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Button, Paper, Badge } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { IconList, IconPencil, IconTrash } from "@tabler/icons-react";

import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee as sidebarData } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";
import { formatDateTime } from "@/lib/utils";

export async function getStaticPaths() {
  const statuses = [
    "draft",
    "pending_approval",
    "completed",
    "rejected",
    "all",
  ];
  const paths = statuses.map((status) => ({ params: { status } }));
  return { paths, fallback: false };
}

export async function getStaticProps(context) {
  return { props: { status: context.params.status } };
}

export default function ListLeaveByStatus({ status }) {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const statusStringMap = {
    draft: 0,
    pending_approval: 1,
    completed: 2,
    rejected: 3,
  };

  const allowedStatus = [...Object.keys(statusStringMap), "all"];

  // VALIDASI STATUS
  useEffect(() => {
    if (!allowedStatus.includes(status)) {
      showAlert("error", `Invalid leave status: ${status}`);
      router.push("/leave_manage/list/draft");
    }
  }, [status]);

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  const sidebarList = sidebarData;

  const statusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Completed", color: "green" },
    3: { label: "Rejected", color: "red" },
  };
  const leaveTypeMap = {
    // "Annual Leave": "green",
    // "Sick Leave": "red",
    // "Unpaid Leave": "gray",
    // "Maternity Leave": "pink",
    // "Permission": "yellow",
  };

  const getActionsByStatus = (statusId) => {
    if (statusId === 0) return ["detail", "update"];
    return ["detail", "delete"];
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.badge_number,
        id: "badge_number",
        header: "Badge Number",
      },
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "Full Name",
      },
      {
        accessorFn: (row) => row.position_name,
        id: "position_name",
        header: "Position",
      },
      {
        accessorFn: (row) => row.departement_name,
        id: "departement_name",
        header: "Departement",
      },
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project",
      },
      {
        accessorFn: (row) => row.supervisor_name,
        id: "supervisor_id",
        header: "Supervisor",
      },
      {
        accessorFn: (row) => row.leave_type,
        id: "leave_type",
        header: "Leave Type",
        cell: (info) => {
          const value = info.getValue();
          const color = leaveTypeMap[value] || "blue";

          return <Badge color={color}>{value || "-"}</Badge>;
        },
      },
      {
        accessorFn: (row) => row.request_date,
        id: "request_date",
        header: "Request Date",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.leave_in,
        id: "leave_in",
        header: "Start Date",
      },
      {
        accessorFn: (row) => row.leave_out,
        id: "leave_out",
        header: "End Date",
      },
      {
        accessorFn: (row) => row.leave_status,
        id: "leave_status",
        header: "Status",
        cell: (info) => {
          const val = Number(info.getValue());
          const s = statusMap[val];
          return <Badge color={s.color}>{s.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const statusId = Number(row.original.leave_status);
          const actions = getActionsByStatus(statusId);
          const encryptedId = encrypt(String(row.original.id));

          return (
            <Button.Group>
              {actions.includes("detail") && (
                <Button.Group>
                  {actions.includes("detail") && (
                    <Button
                      size="xs"
                      color="blue"
                      leftSection={<IconList size={16} />}
                      onClick={() => {
                        // Ambil ID dari row data
                        const plainId = row.original.header_id; // atau row.header_id, tergantung struktur data

                        console.log("Navigating to detail with ID:", plainId);

                        // TEMPORARY: Pakai plain ID dulu
                        router.push(`/leave_manage/detail/${plainId}`);

                        // ATAU jika mau tetap pakai encryption:
                        // const encrypted = aes.encryptBase64Url(String(plainId));
                        // console.log('Encrypted ID:', encrypted);
                        // router.push(`/leave_manage/detail/${encrypted}`);
                      }}
                    >
                      Detail
                    </Button>
                  )}
                </Button.Group>
              )}
              {actions.includes("update") && (
                <Button
                  size="xs"
                  color="yellow"
                  leftSection={<IconPencil size={16} />}
                  onClick={() =>
                    router.push(`/leave_manage/update?id=${encryptedId}`)
                  }
                >
                  Update
                </Button>
              )}
              {actions.includes("delete") && (
                <Button
                  size="xs"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => console.log("Delete:", encryptedId)}
                >
                  Delete
                </Button>
              )}
            </Button.Group>
          );
        },
      },
    ],
    [encrypt, router]
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, 
    manualFiltering: true,
    manualPagination: true,
  });

  // FETCH DATA
  const fetchData = useCallback(async () => {
    const isAll = status === "all";

    const searchQuery = {};
    columnFilters.forEach((f) => {
      if (f.value) searchQuery[f.id] = f.value;
    });

    const sort =
      sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    try {
      const { data } = await axios.post(
        `${API_URL}/api/leave/serverside?${
          isAll ? "allStatus=true" : `status=${statusStringMap[status]}`
        }&page=${pagination.pageIndex}&size=${
          pagination.pageSize
        }&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (err) {
      showAlert("error", "Failed to load data");
    }
  }, [status, columnFilters, sorting, pagination, API_URL, user?.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthLayout sidebarList={sidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconList size={20} />
              <h2 className="text-lg font-semibold uppercase">
                {status === "all"
                  ? "Leave List"
                  : `${status.replace(/_/g, " ")} Leave List`}
              </h2>
            </div>
            {/* 
            <div className="px-4 py-2 text-right">
              <Button onClick={() => router.push("/leave_manage/create")}>
                Add Leave
              </Button>
            </div> */}
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
