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

export default function EditPermission() {
  const router = useRouter();
  const { id } = router.query; // encrypted id_permission
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { decrypt } = useEncrypt();

  const [ready, setReady] = useState(false);
  const [realId, setRealId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [indexKey, setIndexKey] = useState("");

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

  useEffect(() => {
    if (!router.isReady || !id || !user?.token) return;

    const decrypted = decrypt(id);
    const permId = Number(decrypted);
    setRealId(permId);

    axios
      .get(`${API_URL}/api/permission/permission/${permId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        const data = res.data;
        form.setValues({
          permission_name:  data.permission_name  ?? "",
          permission_group: data.permission_group ?? "",
        });
        setIndexKey(data.index_key ?? 0);
        setReady(true);
      })
      .catch(() => {
        showAlert("Error", "error", "Failed to load permission data");
        setReady(true);
      });
  }, [router.isReady, id, user?.token, API_URL]);

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Confirm",
      "question",
      "Update this permission?",
      true,
      null,
      "Yes, Update",
      "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    try {
      setSaving(true);
      await axios.put(
        `${API_URL}/api/permission/permission/${realId}`,
        {
          permission_name:  values.permission_name,
          permission_group: values.permission_group,
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      await showAlert("Success", "success", "Permission updated successfully", false, 1500);
      router.back();
    } catch (err) {
      showAlert("Error", "error", err.response?.data?.message || "Failed to update");
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
                Edit Permission
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
                    value={indexKey}
                    disabled
                    styles={{
                      input: { backgroundColor: "#f1f3f5", color: "#868e96" },
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="default" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" color="blue" loading={saving}>
                      Update
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