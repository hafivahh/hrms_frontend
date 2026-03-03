import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Button, Paper, Badge, Select } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  IconList,
  IconSearch,
  IconTrash,
  IconDownload,
} from "@tabler/icons-react";

import { DateInput } from "@mantine/dates";
import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employee as sidebarData } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";
// import { formatDateTime } from "@/lib/utils";

export async function getStaticPaths() {
  const statuses = ["pending_approval", "completed", "rejected", "all"];
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
    pending_approval: 1,
    completed: 4,
  };

  const allowedStatus = [...Object.keys(statusStringMap), "all"];

  // VALIDASI STATUS
  useEffect(() => {
    if (!allowedStatus.includes(status)) {
      showAlert("error", `Invalid leave status: ${status}`);
      router.push("/leave_manage/list/draft");
    }
  }, [status]);
  useEffect(() => {
    if (!user?.token) return;

    axios
      .get(`${API_URL}/api/leave/dropdowns`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setDepartments(
          res.data.departments.map((d) => ({
            value: d.id.toString(),
            label: d.departement_name,
          })),
        );
        setProjects(
          res.data.projects.map((p) => ({
            value: p.id.toString(),
            label: p.project_name,
          })),
        );
      })
      .catch(console.error);
  }, [user?.token]);

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);
  // ===============================
  // FILTER STATE (TAMBAHAN)
  // ===============================
  const [filterDept, setFilterDept] = useState(null);
  const [filterProject, setFilterProject] = useState(null);
  const [filterStart, setFilterStart] = useState(null);
  const [filterEnd, setFilterEnd] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [appliedFilter, setAppliedFilter] = useState({});
  const sidebarList = sidebarData;

  const statusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Approved", color: "blue" },
    3: { label: "Rejected", color: "red" },
    4: { label: "Completed", color: "green" },
  };

  const getActionsByStatus = (statusId) => {
    const sId = Number(statusId);

    if (sId === 0) {
      return ["detail", "delete"];
    }

    return ["detail", "delete"];
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.request_date,
        id: "request_date",
        header: "Request Date",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
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
          const s = statusMap[val] || { label: "Unknown", color: "gray" };

          return (
            <Badge color={s.color} variant="filled">
              {s.label}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const statusId = Number(row.original.leave_status);
          const actions = getActionsByStatus(statusId);
          const rawId = String(row.original.header_id || row.original.id);
          const encryptedId = encrypt(rawId);

          return (
            <Button.Group>
              {actions.includes("detail") && (
                <Button
                  size="xs"
                  color="blue"
                  leftSection={<IconList size={16} />}
                  onClick={() =>
                    router.push(`/leave_manage/detail/${encryptedId}`)
                  }
                >
                  Detail
                </Button>
              )}
              {actions.includes("delete") && (
                <Button
                  size="xs"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => handleDelete(encryptedId)}
                >
                  Delete
                </Button>
              )}
            </Button.Group>
          );
        },
      },
    ],
    [encrypt, router],
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
      const filterParams =
        Object.keys(appliedFilter).length > 0
          ? `&search=${encodeURIComponent(JSON.stringify(appliedFilter))}`
          : "";

      const { data } = await axios.post(
        `${API_URL}/api/leave/serverside?${
          isAll ? "allStatus=true" : `status=${statusStringMap[status]}`
        }${filterParams}&page=${pagination.pageIndex}&size=${
          pagination.pageSize
        }&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
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
  const handleSearch = () => {
    const deptLabel =
      departments.find((d) => d.value === filterDept)?.label || "";

    const projLabel =
      projects.find((p) => p.value === filterProject)?.label || "";

    setAppliedFilter({
      departement_name: deptLabel,
      project_name: projLabel,
      leave_in: filterStart ? filterStart.toISOString().split("T")[0] : "",
      leave_out: filterEnd ? filterEnd.toISOString().split("T")[0] : "",
    });

    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };
  //okee3
  const handleDownloadExcel = async () => {
    try {
      const isAll = status === "all";

      // ✅ Bangun search params dari appliedFilter (sama seperti fetchData)
      const filterParams =
        Object.keys(appliedFilter).length > 0
          ? `&search=${encodeURIComponent(JSON.stringify(appliedFilter))}`
          : "";

      // ✅ Bangun sort params
      const sortParam =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const response = await axios.post(
        `${API_URL}/api/leave/export?${
          isAll ? "allStatus=true" : `status=${statusStringMap[status]}`
        }${filterParams}&sort=${sortParam}`, // ✅ kirim status + filter + sort
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      const data = response.data;

      if (!data.length) {
        showAlert("Info", "info", "No data to export");
        return;
      }

      const XLSX = await import("xlsx-js-style");

      // ===============================
      // ===== FORMAT HEADER ===========
      // ===============================
      const formattedData = data.map((item) => {
        const newObj = {};
        Object.keys(item).forEach((key) => {
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          newObj[formattedKey] = item[key];
        });
        return newObj;
      });

      const worksheet = XLSX.utils.aoa_to_sheet([]);
      const workbook = XLSX.utils.book_new();

      // ===============================
      // ===== TITLE AREA A-I ==========
      // ===============================
      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 1, c: 9 }, // A sampai j
        },
      ];

      worksheet["A1"] = {
        v: "LEAVE LIST",
        s: {
          font: { bold: true, sz: 20 },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        },
      };

      worksheet["!rows"] = [{ hpt: 40 }, { hpt: 40 }];

      // ===============================
      // ===== ADD TABLE START A3 ======
      // ===============================
      XLSX.utils.sheet_add_json(worksheet, formattedData, {
        origin: "A3",
      });

      const headers = Object.keys(formattedData[0]);

      // ===============================
      // ===== STYLE HEADER (ROW 3) ====
      // ===============================
      headers.forEach((header, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 2, c: colIndex });

        if (!worksheet[cellAddress]) return;

        worksheet[cellAddress].s = {
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
          },
          fill: {
            fgColor: { rgb: "007BFF" },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      });

      // ===============================
      // ===== STYLE ALL DATA CELLS ====
      // ===============================
      // ===============================
      // ===== STYLE ALL DATA CELLS ====
      // ===============================
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      const dateColumns = [
        "Request Date",
        "Start Date",
        "End Date",
        "Badge Number",
      ];
      const dateColumnIndexes = dateColumns.map((name) =>
        headers.findIndex((h) => h === name),
      );

      for (let row = 3; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

          if (!worksheet[cellAddress]) continue;

          const existingStyle = worksheet[cellAddress].s || {};

          const isDateCol = dateColumnIndexes.includes(col);

          worksheet[cellAddress].s = {
            ...existingStyle,
            alignment: {
              ...(existingStyle.alignment || {}),
              vertical: "center",
              ...(isDateCol && { horizontal: "center" }),
            },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          };
        }
      }

      // ===============================
      // ===== COLOR LEAVE STATUS ONLY =
      // ===============================
      const statusColumnIndex = headers.findIndex((h) => h === "Leave Status");

      if (statusColumnIndex !== -1) {
        for (let row = 3; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: row,
            c: statusColumnIndex,
          });

          const cell = worksheet[cellAddress];
          if (!cell || !cell.v) continue;

          const value = String(cell.v).toLowerCase();

          let bgColor = "";
          let fontColor = "000000";

          if (value === "draft") {
            bgColor = "D9D9D9";
          } else if (value === "pending") {
            bgColor = "FFC107";
          } else if (value === "completed") {
            bgColor = "28A745";
            fontColor = "FFFFFF";
          } else if (value === "reject") {
            bgColor = "DC3545";
            fontColor = "FFFFFF";
          }

          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: {
              bold: true,
              color: { rgb: fontColor },
            },
            fill: {
              fgColor: { rgb: bgColor },
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          };
        }
      }

      // ===============================
      // ===== AUTO WIDTH ==============
      // ===============================
      worksheet["!cols"] = headers.map((header) => ({
        wch: header.length + 15,
      }));

      // ===============================
      // ===== FILE NAME ===============
      // ===============================
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      const fileName = `Leave_List_${formattedDate}.xlsx`;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave");
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error(error);
      showAlert("Error", "error", "Failed to export excel");
    }
  };

  const handleDelete = async (encryptedId) => {
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to delete this leave request?",
      true,
      null,
      "Delete",
      "Cancel",
    );

    if (!confirm) return;

    try {
      await axios.delete(`${API_URL}/api/leave/${encryptedId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      await showAlert(
        "Success",
        "success",
        "Leave deleted successfully",
        false,
        1500,
      );
      fetchData();
    } catch (err) {
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to delete",
      );
    }
  };

  return (
    <AuthLayout sidebarList={sidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {/* ================= FILTER SECTION ================= */}
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconSearch size={20} />
              <h2 className="text-lg font-semibold">Filter</h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Select
                  label="Department"
                  placeholder="Select Department"
                  data={departments}
                  value={filterDept}
                  onChange={setFilterDept}
                  clearable
                  searchable
                />

                <Select
                  label="Project"
                  placeholder="Select Project"
                  data={projects}
                  value={filterProject}
                  onChange={setFilterProject}
                  clearable
                  searchable
                />

                <DateInput
                  label="Start Date"
                  value={filterStart}
                  onChange={setFilterStart}
                  clearable
                />

                <DateInput
                  label="End Date"
                  value={filterEnd}
                  onChange={setFilterEnd}
                  clearable
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="xs"
                  leftSection={<IconSearch size={16} />}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </Paper>

          {/* ================= LIST SECTION ================= */}
          <Paper radius="sm" mt="md" withBorder className="overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconList size={20} />
                <h2 className="text-lg font-semibold uppercase">
                  {status === "all"
                    ? "Leave List"
                    : `${status.replace(/_/g, " ")} Leave List`}
                </h2>
              </div>

              <div className="flex gap-2">
                <Button
                  size="xs"
                  color="green"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownloadExcel}
                >
                  Download
                </Button>
              </div>
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
