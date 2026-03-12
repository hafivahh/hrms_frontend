import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { mprOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import { Button, Paper, Badge, Select } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import {
  IconList,
  IconPencil,
  IconDownload,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import useSwal from "@/hooks/useSwal";

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (context) => {
  return {
    props: { mpr_status: context.params.status },
  };
};

export default function IssMprList({ mpr_status }) {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;

  const allowedStatus = [
    "all",
    "draft",
    "pending",
    "completed",
    "rejected",
    "pending_requestor_end_user",
    "pending_acknowledge_sm",
    "pending_requestor_cm",
    "pending_concurred_pmo",
    "pending_concurred",
    "pending_concurred_ym",
    "pending_acknowledge_hr",
    "pending_approval_president",
  ];

  useEffect(() => {
    if (!user?.token) return;

    axios
      .get(`${API_URL}/api/iss_mpr/dropdowns`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setDepartments(
          res.data.departements?.map((d) => ({
            value: String(d.id),
            label: d.departement_name,
          })) || [],
        );

        setProjects(
          res.data.projects?.map((p) => ({
            value: String(p.id),
            label: p.project_name,
          })) || [],
        );

        setPositions(
          res.data.position_name?.map((p) => ({
            value: String(p.id),
            label: p.position_name,
          })) || [],
        );
      })
      .catch((err) => console.error("Dropdown error:", err));
  }, [user?.token]);

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "created_date", desc: true }]); // ⬅️ ganti dari id ke created_date
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [appliedFilter, setAppliedFilter] = useState({});

  // FILTER STATE
  const [filterDept, setFilterDept] = useState(null);
  const [filterProject, setFilterProject] = useState(null);
  const [filterPosition, setFilterPosition] = useState(null);
  const [filterMprStatus, setFilterMprStatus] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    setFilterDept(null);
    setFilterProject(null);
    setFilterPosition(null);
    setFilterMprStatus(null);
    setAppliedFilter({});
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [mpr_status]);

  const mprStatusOptions = [
    { value: "0", label: "Draft" },
    { value: "1", label: "Pending Approval" },
    { value: "2", label: "Completed" },
    { value: "3", label: "Rejected" },
  ];

  const handleSearch = () => {
    setAppliedFilter({
      department_id: filterDept,
      project_id: filterProject,
      position_id: filterPosition,
      mpr_status: filterMprStatus,
    });

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  // STATUS MAP untuk Vacant Type
  const vacantTypeMap = {
    1: { label: "New Position", color: "green" },
    2: { label: "Replacement", color: "blue" },
  };

  // STATUS MAP untuk MPR Status
  const mprStatusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Completed", color: "green" },
    3: { label: "Rejected", color: "red" },
  };

  // STATUS MAP untuk Index Sign (Approval Stage)
  const indexSignMap = {
    0: { label: "Pending Requestor (End User)", color: "orange" },
    1: { label: "Pending Acknowledge (SM)", color: "yellow" },
    2: { label: "Pending Requestor (CM)", color: "orange" },
    3: { label: "Pending Concurred (PMO)", color: "blue" },
    4: { label: "Pending Concurred", color: "blue" },
    5: { label: "Pending Concurred (YM)", color: "blue" },
    6: { label: "Pending Acknowledge (HR)", color: "cyan" },
    7: { label: "Pending Approval President", color: "grape" },
  };

  // Helper function to get page title
  const getPageTitle = () => {
    const titleMap = {
      all: "Manpower Request List",
      draft: "Draft Manpower Request List",
      pending: "Pending Approval Manpower Request List",
      completed: "Completed Manpower Request List",
      rejected: "Rejected Manpower Request List",
      pending_requestor_end_user: "Pending Requestor (End User)",
      pending_acknowledge_sm: "Pending Acknowledge (SM)",
      pending_requestor_cm: "Pending Requestor (CM)",
      pending_concurred_pmo: "Pending Concurred (PMO)",
      pending_concurred: "Pending Concurred",
      pending_concurred_ym: "Pending Concurred (YM)",
      pending_acknowledge_hr: "Pending Acknowledge (HR)",
      pending_approval_president: "Pending Approval President",
    };
    return titleMap[mpr_status] || "Manpower Request List";
  };

  const handleDownloadMprExcel = async () => {
    try {
      const searchQuery = {};

      columnFilters.forEach((filter) => {
        if (filter.value) searchQuery[filter.id] = filter.value;
      });

      if (appliedFilter.department_id)
        searchQuery.department_id = appliedFilter.department_id;
      if (appliedFilter.project_id)
        searchQuery.project_id = appliedFilter.project_id;
      if (appliedFilter.position_id)
        searchQuery.position_id = appliedFilter.position_id;
      if (appliedFilter.mpr_status)
        searchQuery.mpr_status = appliedFilter.mpr_status;

      const filterParams =
        Object.keys(searchQuery).length > 0
          ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
          : "";

      const sort =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const response = await axios.post(
        `${API_URL}/api/iss_mpr/export?status=${status}&${filterParams}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      const data = response.data;

      if (!data.length) {
        showAlert("Info", "info", "No data to export");
        return;
      }

      const XLSX = await import("xlsx-js-style");

      // ===============================
      // ===== FORMAT DATA =============
      // ===============================
      const formattedData = data.map((item) => ({
        "MPR No": item.mpr_no || "-",
        Department: item.department || "-",
        Project: item.project || "-",
        Position: item.position || "-",
        Request: item.qty_request ?? 0,
        "Vacant Type": item.vacant_type_text || "-",
        "Required Date": item.required_date
          ? new Date(item.required_date).toLocaleDateString("id-ID")
          : "-",
        "Created By": item.created_by || "-",
        "Created Date": item.created_date
          ? new Date(item.created_date).toLocaleDateString("id-ID")
          : "-",
        "MPR Status": item.mpr_status_text || "-",
        "Approval Stage": item.index_sign_text || "-",
      }));

      const worksheet = XLSX.utils.aoa_to_sheet([]);
      const workbook = XLSX.utils.book_new();

      // ===============================
      // ===== TITLE AREA ==============
      // ===============================
      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 1, c: Object.keys(formattedData[0]).length - 1 },
        },
      ];

      worksheet["A1"] = {
        v: "ISS MPR LIST",
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
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      const centerCols = [
        "MPR No",
        "Request",
        "New Join",
        "Vacant Type",
        "Required Date",
        "Created Date",
        "MPR Status",
        "Approval Stage",
      ];

      for (let row = 3; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

          if (!worksheet[cellAddress]) continue;

          const existingStyle = worksheet[cellAddress].s || {};
          const isCenter = centerCols.includes(headers[col]);

          worksheet[cellAddress].s = {
            ...existingStyle,
            alignment: {
              horizontal: isCenter ? "center" : "left",
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
      // ===== COLOR MPR STATUS ========
      // ===============================
      const statusColumnIndex = headers.findIndex((h) => h === "MPR Status");

      if (statusColumnIndex !== -1) {
        for (let row = 3; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: row,
            c: statusColumnIndex,
          });

          const cell = worksheet[cellAddress];
          if (!cell || !cell.v) continue;

          const value = String(cell.v).toLowerCase();

          let bgColor = "D9D9D9";
          let fontColor = "000000";

          if (value === "draft") {
            bgColor = "D9D9D9";
            fontColor = "000000";
          } else if (value === "pending approval") {
            bgColor = "FFC107";
            fontColor = "000000";
          } else if (value === "completed") {
            bgColor = "28A745";
            fontColor = "FFFFFF";
          } else if (value === "rejected") {
            bgColor = "DC3545";
            fontColor = "FFFFFF";
          }

          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { bold: true, color: { rgb: fontColor } },
            fill: { fgColor: { rgb: bgColor } },
            alignment: { horizontal: "center", vertical: "center" },
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
      // ===== COLOR APPROVAL STAGE ====
      // ===============================
      const approvalColumnIndex = headers.findIndex(
        (h) => h === "Approval Stage",
      );

      // color map per approval stage text
      const approvalColorMap = {
        "pending requestor (end user)": { bg: "FF8C00", font: "FFFFFF" }, // dark orange
        "pending acknowledge (sm)": { bg: "FFC107", font: "000000" }, // yellow
        "pending requestor (cm)": { bg: "FF8C00", font: "FFFFFF" }, // dark orange
        "pending concurred (pmo)": { bg: "007BFF", font: "FFFFFF" }, // blue
        "pending concurred": { bg: "0056B3", font: "FFFFFF" }, // dark blue
        "pending concurred (ym)": { bg: "007BFF", font: "FFFFFF" }, // blue
        "pending acknowledge (hr)": { bg: "17A2B8", font: "FFFFFF" }, // cyan
        "pending approval president": { bg: "6F42C1", font: "FFFFFF" }, // purple
      };

      if (approvalColumnIndex !== -1) {
        for (let row = 3; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: row,
            c: approvalColumnIndex,
          });

          const cell = worksheet[cellAddress];
          if (!cell || !cell.v || cell.v === "-") continue;

          const value = String(cell.v).toLowerCase();
          const colorInfo = approvalColorMap[value];

          if (!colorInfo) continue;

          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { bold: true, color: { rgb: colorInfo.font } },
            fill: { fgColor: { rgb: colorInfo.bg } },
            alignment: { horizontal: "center", vertical: "center" },
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
      const fileName = `ISS_MPR_List_${formattedDate}.xlsx`;

      XLSX.utils.book_append_sheet(workbook, worksheet, "ISS MPR");
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error(error);
      showAlert("Error", "error", "Failed to export MPR excel");
    }
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
        accessorFn: (row) => row.position,
        id: "position",
        header: "Position",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.qty_request,
        id: "qty_request",
        header: "Request",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => info.getValue() || 0,
        size: 100,
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
        cell: (info) => {
          const val = Number(info.getValue());
          if (isNaN(val)) return "-";

          const vt = vacantTypeMap[val] ?? {
            label: "Unknown",
            color: "gray",
          };

          return (
            <Badge color={vt.color} variant="filled" size="sm">
              {vt.label}
            </Badge>
          );
        },
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
        accessorFn: (row) => row.mpr_status,
        id: "mpr_status",
        header: () => (
          <span className="flex flex-col text-center">
            <span>Status</span>
            <span>MPR</span>
          </span>
        ),
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => {
          const val = Number(info.getValue());
          if (isNaN(val)) return "-";

          const st = mprStatusMap[val] ?? {
            label: "Unknown",
            color: "gray",
          };

          return (
            <Badge color={st.color} variant="filled" size="sm">
              {st.label}
            </Badge>
          );
        },
      },
      // Tambahkan kolom index_sign hanya jika mpr_status adalah pending approval
      ...(mpr_status === "pending" || mpr_status.startsWith("pending_")
        ? [
            {
              accessorFn: (row) => row.index_sign,
              id: "index_sign",
              header: () => (
                <span className="flex flex-col text-center">
                  <span>Approval</span>
                  <span>Stage</span>
                </span>
              ),
              enableColumnFilter: false,
              enableSorting: true,
              cell: (info) => {
                const val = Number(info.getValue());
                if (isNaN(val)) return "-";

                const stage = indexSignMap[val] ?? {
                  label: "Unknown",
                  color: "gray",
                };

                return (
                  <Badge color={stage.color} variant="filled" size="sm">
                    {stage.label}
                  </Badge>
                );
              },
            },
          ]
        : []),
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
          const row = info.row.original;
          const currentStatus = info.getValue();

          const statusOptions = [
            { value: "", label: "---", color: "yellow" },
            { value: "1", label: "Open", color: "green" },
            { value: "2", label: "Fulfillment in Progress", color: "blue" },
            { value: "3", label: "Closed", color: "gray" },
            { value: "4", label: "Cancel", color: "red" },
          ];
          const selectedOption = statusOptions.find(
            (opt) => opt.value === String(currentStatus),
          );

          const statusColor = selectedOption?.color || "gray";

          const handleStatusChange = async (newStatus) => {
            try {
              if (newStatus === "") return;

              const confirm = await showAlert(
                "Are you sure?",
                "question",
                "Do you want to update recruitment status?",
                true,
                null,
                "Yes, Update",
                "Cancel",
              );
              if (!confirm?.isConfirmed) return;

              await axios.patch(
                `${API_URL}/api/iss_mpr/${row.id}/recruitment-status`,
                {
                  recruitment_status: Number(newStatus),
                },
                {
                  headers: { Authorization: "Bearer " + user.token },
                },
              );

              await fetchData();

              await showAlert(
                "Success",
                "success",
                "Recruitment status updated successfully",
                false,
                1500,
              );
            } catch (err) {
              console.error("Update error:", err);

              await showAlert(
                "Error",
                "error",
                err.response?.data?.message ||
                  "Failed to update recruitment status",
                false,
                2000,
              );
            }
          };
const editable = row.mpr_status === 2;
          return (
           <Select
  value={currentStatus ? String(currentStatus) : ""}
  onChange={handleStatusChange}
  data={statusOptions}
  size="xs"
  disabled={!editable}
  styles={{
    input: {
      textAlign: "center",
      textAlignLast: "center",
      fontWeight: 600,
      cursor: editable ? "pointer" : "not-allowed",

      backgroundColor: !editable
        ? "#343a40" // 🔒 abu gelap kalau tidak bisa edit
        : statusColor === "green"
        ? "#d3f9d8"
        : statusColor === "blue"
        ? "#d0ebff"
        : statusColor === "red"
        ? "#ffc9c9"
        : "#fff3bf", // 🟡 kuning kalau belum dipilih

      color: !editable
        ? "#ffffff"
        : statusColor === "green"
        ? "#2b8a3e"
        : statusColor === "blue"
        ? "#1864ab"
        : statusColor === "red"
        ? "#c92a2a"
        : "#e67700",

      border: "1px solid transparent",
    },
  }}
/>
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
                leftSection={<IconList size={16} />}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [encrypt, router, mpr_status],
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
  // FETCH DATA
  // ======================
  const fetchData = useCallback(async () => {
    if (!user?.token) return;

    try {
      const searchQuery = {};

      // 🔹 Column filter
      columnFilters.forEach((filter) => {
        if (filter.value != null && filter.value !== "") {
          searchQuery[filter.id] = filter.value;
        }
      });

      Object.entries(appliedFilter).forEach(([key, value]) => {
        if (value) {
          searchQuery[key] = value;
        }
      });

      const filterParams =
        Object.keys(searchQuery).length > 0
          ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
          : "";

      const sort =
        sorting?.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const response = await axios.post(
        `${API_URL}/api/iss_mpr/serverside/${mpr_status}?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      setData(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
      setTotalPages(1);
    }
  }, [
    columnFilters,
    appliedFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    mpr_status,
    API_URL,
    user?.token,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isFilterApplied = Object.values(appliedFilter).some((v) => v);

  return (
    <AuthLayout sidebarList={mprOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {/* FILTER SECTION */}
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconList size={20} />
              <h2 className="text-lg font-semibold">Filter</h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <Select
                  label="Department"
                  placeholder="Select Department"
                  data={departments}
                  value={filterDept}
                  onChange={setFilterDept}
                  searchable
                  clearable
                />
                <Select
                  label="Project"
                  placeholder="Select Project"
                  data={projects}
                  value={filterProject}
                  onChange={setFilterProject}
                  searchable
                  clearable
                />
                <Select
                  label="Position"
                  placeholder="Select Position"
                  data={positions}
                  value={filterPosition}
                  onChange={setFilterPosition}
                  searchable
                  clearable
                />
                <Select
                  label="MPR Status"
                  placeholder="Select Status"
                  data={mprStatusOptions}
                  value={filterMprStatus}
                  onChange={setFilterMprStatus}
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

          {/* LIST SECTION */}
          <Paper radius="sm" mt="md" withBorder className="overflow-hidden">
            {/* HEADER + ACTION BUTTONS */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconList size={20} />
                <h2 className="text-lg font-semibold uppercase">
                  {getPageTitle()}
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  color="green"
                  leftSection={<IconDownload size={16} />}
                  onClick={async () => {
                    if (!isFilterApplied) {
                      await showAlert(
                        "Information",
                        "info",
                        "Please use filter and click Search before downloading data.",
                      );
                      return;
                    }

                    handleDownloadMprExcel();
                  }}
                >
                  Download
                </Button>
                <Button
                  size="xs"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => router.push("/iss_mpr/create")}
                >
                  Add Manpower Request
                </Button>
              </div>
            </div>

            {/* DATATABLE */}
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
