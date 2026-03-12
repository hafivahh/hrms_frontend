//list leave
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
import { leaveOnly } from "@/data/sidebar/employee";
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
  const [filterStatus, setFilterStatus] = useState(null);
  const [appliedFilter, setAppliedFilter] = useState({});

  useEffect(() => {
    setFilterDept(null);
    setFilterProject(null);
    setFilterStatus(null);
    setAppliedFilter({});
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [status]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);

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
        id: "supervisor_name",
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
        enableColumnFilter: false,
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

    const sort =
      sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    try {
      // gabungkan columnFilters + appliedFilter
      const searchQuery = {};
      columnFilters.forEach((f) => {
        if (f.value) searchQuery[f.id] = f.value;
      });

      // merge appliedFilter ke searchQuery
      Object.keys(appliedFilter).forEach((key) => {
        if (appliedFilter[key]) searchQuery[key] = appliedFilter[key];
      });

      const filterParams =
        Object.keys(searchQuery).length > 0
          ? `&search=${encodeURIComponent(JSON.stringify(searchQuery))}`
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
  }, [
    status,
    columnFilters,
    sorting,
    pagination,
    appliedFilter,
    API_URL,
    user?.token,
  ]); // appliedFilter

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
      leave_status: filterStatus || "",
    });

    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  //okee3
  const handleDownloadExcel = async () => {
    try {
      const isAll = status === "all";

      const filterParams =
        Object.keys(appliedFilter).length > 0
          ? `&search=${encodeURIComponent(JSON.stringify(appliedFilter))}`
          : "";
      const sortParam =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const response = await axios.post(
        `${API_URL}/api/leave/export?${
          isAll ? "allStatus=true" : `status=${statusStringMap[status]}`
        }${filterParams}&sort=${sortParam}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      const data = response.data;
      if (!data.length) {
        showAlert("Info", "info", "No data to export");
        return;
      }

      const XLSX = await import("xlsx-js-style");

      // ============================================================
      // COLUMN CONFIG
      // ============================================================
      const columnConfig = [
        { label: "Name", key: "Name", align: "left" },
        { label: "Badge Number", key: "Badge", align: "center" },
        { label: "Department", key: "Department", align: "left" },
        { label: "Project", key: "Project", align: "left" },
        { label: "Position", key: "Position", align: "left" },
        { label: "Start Date", key: "Start_Date", align: "center" },
        { label: "End Date", key: "End_Date", align: "center" },
        { label: "Leave Type", key: "Leave_Type", align: "left" },
        { label: "Leave Status", key: "Leave_Status", align: "center" },
        { label: "Approval Notes", key: "Remarks_Status", align: "left" },
      ];

      const totalCols = columnConfig.length - 1;
      const worksheet = XLSX.utils.aoa_to_sheet([]);
      const workbook = XLSX.utils.book_new();

      // ============================================================
      // TITLE — Row 1 (index 0)
      // ============================================================
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } }];
      worksheet["A1"] = {
        v: "LEAVE LIST",
        t: "s",
        s: {
          font: { name: "Calibri", bold: true, sz: 16 },
          alignment: { horizontal: "center", vertical: "center" },
        },
      };

      // ============================================================
      // HEADER ROW — Row 2 (index 1)
      // ============================================================
      const headerStyle = {
        font: {
          name: "Calibri",
          bold: true,
          color: { rgb: "FFFFFF" },
          sz: 11,
        },
        fill: { fgColor: { rgb: "1F6FBF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      columnConfig.forEach((col, colIdx) => {
        const addr = XLSX.utils.encode_cell({ r: 1, c: colIdx });
        worksheet[addr] = { v: col.label, t: "s", s: headerStyle };
      });

      // ============================================================
      // STATUS COLOR MAP
      // ============================================================
      const statusColorMap = {
        pending: { bg: "FFC107", font: "000000" }, // kuning
        approved: { bg: "28A745", font: "FFFFFF" }, // hijau
        rejected: { bg: "DC3545", font: "FFFFFF" }, // merah
      };

      // ============================================================
      // DATA ROWS — mulai Row 3 (index 2)
      // ============================================================
      data.forEach((row, rowIdx) => {
        columnConfig.forEach((col, colIdx) => {
          const addr = XLSX.utils.encode_cell({ r: rowIdx + 2, c: colIdx });
          const value = row[col.key] ?? "-";

          const style = {
            font: { name: "Calibri", sz: 11 },
            alignment: {
              horizontal: col.align,
              vertical: "center",
              wrapText: true,
            },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };

          // Warna Leave Status
          if (col.key === "Leave_Status") {
            const colorKey = String(value).toLowerCase();
            const color = statusColorMap[colorKey];
            if (color) {
              style.fill = { fgColor: { rgb: color.bg } };
              style.font = {
                ...style.font,
                bold: true,
                color: { rgb: color.font },
              };
            }
          }

          worksheet[addr] = { v: value, t: "s", s: style };
        });
      });

      // ============================================================
      // !REF, ROW HEIGHT, COLUMN WIDTH
      // ============================================================
      worksheet["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: data.length + 1, c: totalCols },
      });

      worksheet["!rows"] = [
        { hpt: 36 }, // title
        { hpt: 28 }, // header
        ...Array(data.length).fill({ hpt: 20 }), // data
      ];

      worksheet["!cols"] = columnConfig.map((col) => ({
        wch: Math.max(col.label.length, 12) + 6,
      }));

      // ============================================================
      // EXPORT
      // ============================================================
      const today = new Date().toISOString().split("T")[0];
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave");
      XLSX.writeFile(workbook, `Leave_List_${today}.xlsx`);
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

  const isFilterApplied = Object.values(appliedFilter).some((v) => v);

  return (
    <AuthLayout sidebarList={leaveOnly}>
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
                <Select
                  label="Leave Status"
                  placeholder="Select Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  clearable
                  data={[
                    { value: "1", label: "Pending Approval" },
                    { value: "4", label: "Completed" },
                  ]}
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
                  onClick={async () => {
                    if (!isFilterApplied) {
                      const confirm = await showAlert(
                        "Download All Data?",
                        "question",
                        "No filter applied. Are you sure you want to download all leave data?",
                        true,
                        null,
                        "Yes, Download All",
                        "Cancel",
                      );

                      if (!confirm?.isConfirmed) return;
                    }

                    handleDownloadExcel();
                  }}
                >
                  Download
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} key={status} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
