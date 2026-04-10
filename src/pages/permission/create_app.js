import AuthLayout from "@/components/layout/authLayout";
import { adminOnly } from "@/data/sidebar/employee";
import Head from "next/head";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import { Paper, TextInput, Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CreateApp() {
  const { user } = useUser();
  const { API_URL } = useApi();
  const { showAlert } = useSwal();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: { app_name: "" },
    validate: {
      app_name: (val) => (val.trim() ? null : "Application name is required"),
    },
  });

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to save this application?",
      true,
    );

    if (!confirm?.isConfirmed) return;

    try {
      setSaving(true);
      const { data } = await axios.post(
        `${API_URL}/api/permission/application`,
        { app_name: values.app_name },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await showAlert(
        "Success",
        "success",
        "Application created successfully",
        false,
        1500,
      );
      router.back();
    } catch (err) {
      if (err.response?.status === 409) {
        showAlert(
          "Duplicate Application Name",
          "error",
          `Application name "${values.app_name}" already exists`,
        );
      } else {
        showAlert(
          "Error",
          "error",
          err.response?.data?.message || "Failed to save",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout sidebarList={adminOnly}>
      <Head>
        <title>Create Application — HRMS</title>
      </Head>

      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Add Application
                </h2>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Application Name"
                  withAsterisk
                  placeholder="Fill Up Application Name"
                  {...form.getInputProps("app_name")}
                />
              </div>
              <div className="px-4 py-2 flex justify-end">
                <Button size="sm" color="blue" type="submit" loading={saving}>
                  Save
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
