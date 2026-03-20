import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { employeeOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Select, Badge } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import {
  IconTrash,
  IconPencil,
  IconList,
  IconPlus,
  IconSearch,
  IconDownload,
} from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useEncrypt from "@/hooks/useEncrypt";

export default function List() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  // PERMISSION
  const permissions = user?.permissions || [];
  const hasPermission = (key) =>
    permissions.some((p) => Number(p) === Number(key));
  const canCreate = hasPermission(2);
  const canUpdate = hasPermission(3);
  const canDelete = hasPermission(4);
  const canExport = hasPermission(5);

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filterDept, setFilterDept] = useState(null);
  const [filterProject, setFilterProject] = useState(null);
  const [filterCompany, setFilterCompany] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [appliedFilter, setAppliedFilter] = useState({});

  // Fetch dropdowns
  useEffect(() => {
    axios
      .get(`${API_URL}/api/employee/dropdowns`, {
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
        setCompanies(
          res.data.companies.map((c) => ({
            value: c.id.toString(),
            label: c.company_name,
          })),
        );
      })
      .catch((err) => console.error(err));
  }, []);

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
        accessorFn: (row) =>
          row.gender === 1 ? "Laki-Laki" : row.gender === 2 ? "Perempuan" : "-",
        id: "gender",
        header: "Gender",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.position_name,
        id: "position_name",
        header: "Position",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.departement_name,
        id: "departement_name",
        header: "Departement",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.company_name,
        id: "company_name",
        header: "Company",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.status_active,
        id: "status_active",
        header: "Status Active",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => {
          const val = Number(info.getValue());
          const statusMap = {
            1: { label: "Active", color: "green" },
            0: { label: "Inactive", color: "red" },
          };
          const st = statusMap[val] ?? { label: "Unknown", color: "gray" };
          return (
            <Badge color={st.color} variant="filled" size="sm">
              {st.label}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const encryptedId = encrypt(String(row.original.id));
          return (
            <Button.Group>
              <Button
                size="xs"
                color="blue"
                onClick={() => router.push(`/employee/detail/${encryptedId}`)}
                leftSection={<IconList size={16} />}
              >
                Detail
              </Button>
              {canUpdate && (
                <Button
                  size="xs"
                  color="yellow"
                  onClick={() => router.push(`/employee/edit/${encryptedId}`)}
                  leftSection={<IconPencil size={16} />}
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  size="xs"
                  color="red"
                  onClick={() => handleDelete(encryptedId)}
                  leftSection={<IconTrash size={16} />}
                >
                  Delete
                </Button>
              )}
            </Button.Group>
          );
        },
      },
    ],
    [encrypt],
  );

  const handleDelete = async (encryptedId) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      "Do you want to delete this employee?",
      true,
      null,
      "Delete",
      "Cancel",
    );

    if (!confirm) return;
    if (typeof confirm === "object" && confirm.isConfirmed === false) return;

    try {
      await axios.delete(`${API_URL}/api/employee/${encryptedId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await showAlert(
        "Success",
        "success",
        "Employee deleted successfully",
        false,
        1500,
      );
      fetchData();
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Error",
        error: "Unknown",
      };
      showAlert(data_error.message, "error", data_error.error);
    }
  };

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: { columnFilters, sorting, pagination },
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

    // Column filter dari tabel
    columnFilters.forEach((filter) => {
      if (filter.value != null && filter.value !== "") {
        searchQuery[filter.id] = filter.value;
      }
    });

    // Applied filter dari dropdown
    if (appliedFilter.departement_name)
      searchQuery.departement_name = appliedFilter.departement_name;
    if (appliedFilter.project_name)
      searchQuery.project_name = appliedFilter.project_name;
    if (appliedFilter.company_name)
      searchQuery.company_name = appliedFilter.company_name;

    const filterParams =
      Object.keys(searchQuery).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    const { data } = await axios.post(
      `${API_URL}/api/employee/serverside?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } },
    );

    setData(data.data);
    setTotalPages(data.total_pages);
  }, [
    columnFilters,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    appliedFilter,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    // Cari label dari value yang dipilih
    const deptLabel =
      departments.find((d) => d.value === filterDept)?.label || "";
    const projLabel =
      projects.find((p) => p.value === filterProject)?.label || "";
    const compLabel =
      companies.find((c) => c.value === filterCompany)?.label || "";

    setAppliedFilter({
      departement_name: deptLabel,
      project_name: projLabel,
      company_name: compLabel,
    });

    // Reset ke halaman pertama
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };
  //oke2
  const handleDownloadExcel = async () => {
    try {
      const searchQuery = {};

      // ===============================
      // ===== FILTER SECTION ==========
      // ===============================
      columnFilters.forEach((filter) => {
        if (filter.value) {
          searchQuery[filter.id] = filter.value;
        }
      });

      if (appliedFilter.departement_name)
        searchQuery.departement_name = appliedFilter.departement_name;

      if (appliedFilter.project_name)
        searchQuery.project_name = appliedFilter.project_name;

      if (appliedFilter.company_name)
        searchQuery.company_name = appliedFilter.company_name;

      const filterParams =
        Object.keys(searchQuery).length > 0
          ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
          : "";

      const sort =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const response = await axios.post(
        `${API_URL}/api/employee/export?${filterParams}&sort=${sort}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const data = response.data;

      if (!data.length) {
        showAlert("Info", "info", "No data to export");
        return;
      }

      // ===============================
      // ===== CONVERT TO EXCEL ========
      // ===============================
      const XLSX = await import("xlsx-js-style");

      // Rapikan header
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

      // Buat sheet kosong dulu
      const worksheet = XLSX.utils.aoa_to_sheet([]);
      const workbook = XLSX.utils.book_new();

      // ===============================
      // ===== LOGO AREA A1:H4 =========
      // ===============================
      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 }, // A1
          e: { r: 1, c: 7 }, // H4
        },
      ];

      worksheet["A1"] = {
        v: "EMPLOYEE LIST",
        s: {
          font: { bold: true, sz: 20 },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        },
      };

      worksheet["!rows"] = [
        { hpt: 40 }, // Row 1
        { hpt: 40 }, // Row 2
      ];
      // ===============================
      // ===== ADD TABLE START A3 ======
      // ===============================
      XLSX.utils.sheet_add_json(worksheet, formattedData, {
        origin: "A3",
      });

      const headers = Object.keys(formattedData[0]);

      // ===============================
      // ===== STYLE HEADER (Row 3) ====
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
      // ===== STYLE HEADER + DATA =====
      // ===============================
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      const centerCols = ["Badge Number", "Join Date"];

      for (let row = 2; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: "" };
          }

          const existingStyle = worksheet[cellAddress].s || {};
          const isCenter = centerCols.includes(headers[col]);

          worksheet[cellAddress].s = {
            ...existingStyle,
            alignment: {
              ...(existingStyle.alignment || {}),
              horizontal: isCenter
                ? "center"
                : existingStyle.alignment?.horizontal,
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
      const colWidths = headers.map((header) => ({
        wch: header.length + 15,
      }));

      worksheet["!cols"] = colWidths;

      // ===============================
      // ===== EXPORT FILE =============
      // ===============================
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // month mulai dari 0
      const dd = String(today.getDate()).padStart(2, "0");

      const fileName = `Employee_List_${yyyy}_${mm}_${dd}.xlsx`;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      showAlert("Error", "error", "Failed to export excel");
    }
  };

  const isFilterApplied = Object.values(appliedFilter).some((v) => v);

  return (
    <AuthLayout sidebarList={employeeOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          {/* FILTER SECTION */}
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
                  label="Company"
                  placeholder="Select Company"
                  data={companies}
                  value={filterCompany}
                  onChange={setFilterCompany}
                  clearable
                  searchable
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
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconList size={20} />
                <h2 className="text-lg font-semibold">List Employee</h2>
              </div>
              <div className="flex gap-2">
                {canExport && (
                  <Button
                    size="xs"
                    color="green"
                    leftSection={<IconDownload size={16} />}
                    onClick={async () => {
                      if (!isFilterApplied) {
                        const confirm = await showAlert(
                          "Download All Data?",
                          "question",
                          "No filter applied. Are you sure you want to download all employee data?",
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
                )}
                {canCreate && (
                  <Button
                    size="xs"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => router.push("/employee/create")}
                  >
                    Add Employee
                  </Button>
                )}
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
