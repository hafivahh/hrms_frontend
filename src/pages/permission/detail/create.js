import AuthLayout from "@/components/layout/authLayout";
import { adminOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import useEncrypt from "@/hooks/useEncrypt";
import { Button, Paper, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function CreatePermission() {
  const router = useRouter();
  const { app_id } = router.query;
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { decrypt } = useEncrypt();

  const [ready, setReady] = useState(false);
  const [realAppId, setRealAppId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nextIndex, setNextIndex] = useState(0);

  useEffect(() => {
    if (!router.isReady || !app_id || !user?.token) return;

    const decrypted = decrypt(app_id);
    const appId = Number(decrypted);
    setRealAppId(appId);

    axios
      .get(`${API_URL}/api/permission/next-index/${appId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setNextIndex(res.data.next_index ?? 0);
        setReady(true);
      })
      .catch(() => {
        setNextIndex(0);
        setReady(true);
      });
  }, [router.isReady, app_id, API_URL, user?.token]);

  const form = useForm({
    initialValues: {
      permission_name: "",
      permission_group: "",
    },
    validate: {
      permission_name: (val) =>
        !val.trim() ? "Permission Name is required" : null,
      permission_group: (val) =>
        !val.trim() ? "Permission Group is required" : null,
    },
  });

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Confirm",
      "question",
      "Save this permission?",
      true,
      null,
      "Yes, Save",
      "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    try {
      setSaving(true);
      await axios.post(
        `${API_URL}/api/permission/create`,
        {
          permission_name:   values.permission_name,
          permission_group:  values.permission_group,
          id_app_permission: realAppId,
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      await showAlert("Success", "success", "Permission created successfully", false, 1500);
      router.back();
    } catch (err) {
  if (err.response?.status === 409) {
    showAlert(
      "Duplicate Permission Name",
      "error",
      `Permission "${values.permission_name}" already exists in group "${values.permission_group}"`,
    );
  } else {
    showAlert("Error", "error", err.response?.data?.message || "Failed to save");
  }
} finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <AuthLayout sidebarList={adminOnly}>
        <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={adminOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.back()}
                className="cursor-pointer hover:text-blue-600 transition-colors"
              />
              <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                Add New Permission
              </h2>
            </div>

            {/* FORM */}
            <div className="p-6">
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className="flex flex-col gap-4">
                  <TextInput
                    label="Permission Name"
                    placeholder="Filling Up Permission Name"
                    required
                    {...form.getInputProps("permission_name")}
                  />
                  <TextInput
                    label="Permission Group"
                    placeholder="Filling Up Permission Group"
                    required
                    {...form.getInputProps("permission_group")}
                  />
                  <TextInput
                    label="Index Key"
                    value={nextIndex}
                    disabled
                    styles={{
                      input: { backgroundColor: "#f1f3f5", color: "#868e96" },
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="default" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" color="green" loading={saving}>
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}