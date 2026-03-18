import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import { adminOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import { Button, Paper, Modal, TextInput } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import {
  IconList,
  IconPlus,
  IconPencil,
  IconShield,
  IconBolt,
  IconTrash,
} from "@tabler/icons-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import useEncrypt from "@/hooks/useEncrypt";

export default function ApplicationList() {
  const { encrypt, decrypt } = useEncrypt();
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { showAlert } = useSwal();

  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([{ id: "created_date", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [appName, setAppName] = useState("");
  const [saving, setSaving] = useState(false);

  // ======================
  // COLUMNS
  // ======================
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.app_name,
        id: "app_name",
        header: "Application Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: "Created Date",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return "-";
          return new Date(val)
            .toLocaleString("id-ID", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
            .replace(/\//g, "-");
        },
      },
      {
        id: "actions",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => {
          const app = row.original;
          const encryptedId = encrypt(String(app.id_application)); // ← tambah
          //   return (
          //     <div className="flex gap-2 w-fit">
          //       <Button
          //         size="xs"
          //         color="gray"
          //         leftSection={<IconShield size={14} />}
          //         onClick={
          //           () => router.push(`/permission/detail/${encryptedId}`) // ← pakai encryptedId
          //         }
          //       >
          //         Permission
          //       </Button>
          //      <Button
          //   size="xs"
          //   color="yellow"
          //   leftSection={<IconPencil size={14} />}
          //   onClick={() => handleEdit(app)}
          // >
          //   Edit
          // </Button>
          //     </div>

          //   );
          return (
            <Button.Group>
              <Button
                size="xs"
                color="gray"
                leftSection={<IconShield size={14} />}
                onClick={
                  () => router.push(`/permission/detail/${encryptedId}`) // ← pakai encryptedId
                }
              >
                Permission
              </Button>
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconPencil size={14} />}
                onClick={() => handleEdit(app)}
              >
                Edit
              </Button>
            </Button.Group>
          );
        },
      },
    ],
    [],
  );

  // ======================
  // TABLE
  // ======================
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

  // ======================
  // FETCH
  // ======================
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      const searchQuery = {};
      columnFilters.forEach((f) => {
        if (f.value) searchQuery[f.id] = f.value;
      });

      const searchParam =
        Object.keys(searchQuery).length > 0
          ? `&search=${encodeURIComponent(searchQuery.app_name || "")}`
          : "";

      const sort =
        sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const { data: res } = await axios.get(
        `${API_URL}/api/permission/application?page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}${searchParam}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setData(res.data);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalPages(1);
    }
  }, [columnFilters, sorting, pagination, API_URL, user?.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ======================
  // HANDLERS
  // ======================
  const handleOpenAdd = () => {
    setEditId(null);
    setAppName("");
    setModalOpen(true);
  };

  const handleEdit = (app) => {
    setEditId(app.id_application);
    setAppName(app.app_name);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!appName.trim()) {
      showAlert("Warning", "warning", "Application name is required");
      return;
    }
    try {
      setSaving(true);
      if (editId) {
        await axios.put(
          `${API_URL}/api/permission/application/${editId}`,
          { app_name: appName },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
      } else {
        await axios.post(
          `${API_URL}/api/permission/application`,
          { app_name: appName },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
      }
      setModalOpen(false);
      await showAlert(
        "Success",
        "success",
        `Application ${editId ? "updated" : "created"} successfully`,
        false,
        1500,
      );
      fetchData();
    } catch (err) {
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to save",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "This application will be deleted permanently.",
      true,
      null,
      "Yes, Delete",
      "Cancel",
    );
    if (!confirm?.isConfirmed) return;
    try {
      await axios.delete(`${API_URL}/api/permission/application/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await showAlert("Deleted", "success", "Application deleted", false, 1500);
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
    <AuthLayout sidebarList={adminOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconList size={20} />
                <h2 className="text-lg font-semibold uppercase">
                  Application List
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  color="blue"
                  leftSection={<IconPlus size={16} />}
                  // ganti onClick Add New button
                  onClick={() => router.push("/permission/create_app")}
                >
                  Add New
                </Button>
              </div>
            </div>

            {/* TABLE */}
            <div className="p-4 overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Application" : "Add New Application"}
        centered
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Application Name"
            placeholder="Enter application name"
            value={appName}
            onChange={(e) => setAppName(e.currentTarget.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editId ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
}
