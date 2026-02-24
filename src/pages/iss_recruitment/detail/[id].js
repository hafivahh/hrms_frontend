// pages/iss_recruitment/detail/[id].tsx

import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Paper } from "@mantine/core";
import { IconArrowLeft, IconFileCv } from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export default function IssRecruitmentDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  // ================= FETCH DATA (NANTI ISI API) =================
  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      // sementara kosong dulu
      setData([]);
      setTotalPages(1);
    } catch (error) {
      console.error("Error fetching detail:", error);
      setData([]);
      setTotalPages(1);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= COLUMNS =================
  const columns = useMemo(
    () => [
      {
        id: "no",
        header: "No",
        size: 60,
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "phone_number",
        header: "Phone Number",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
       {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "cv",
        header: "Document CV",
        enableSorting: false,
        cell: () => (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconFileCv size={14} />}
          >
            View CV
          </Button>
        ),
      },
    ],
    [],
  );

  // ================= TABLE =================
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER PERSIS */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconArrowLeft
                size={20}
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => router.push("/iss_recruitment/list/all")}
              />
              <h2 className="text-lg font-semibold uppercase">
                Recruitment Detail
              </h2>
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
