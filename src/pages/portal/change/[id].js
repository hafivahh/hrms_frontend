import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, TextInput, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { adminOnly } from "@/data/sidebar/employee";

export default function ChangePassword() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      full_name: "",
      badge_number: "",
      new_password: "",
      confirm_password: "",
    },
    validate: {
      new_password: (value) => {
        if (!value) return "New Password is required";
        if (value.length < 14) return "Password must be at least 14 characters";
        if (!/[0-9]/.test(value))
          return "Password must contain at least one number";
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value))
          return "Password must contain uppercase & lowercase letters";
        return null;
      },
      confirm_password: (value, values) =>
        value !== values.new_password
          ? "Confirm Password must match New Password"
          : null,
    },
  });

  // ============================
  // Fetch User Data (Readonly)
  // ============================
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      form.setValues({
        full_name: data.full_name || "",
        badge_number: data.badge_number || "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err);
      showAlert("Error", "error", "Failed to fetch user data");
    }
  };

  useEffect(() => {
    if (router.isReady && id) {
      fetchUser();
    }
  }, [router.isReady, id]);

  // ============================
  // Submit Change Password
  // ============================
  const handleSubmit = async (values) => {
    if (loading) return;

    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to change this user's password?",
      true,
      null,
      "Update",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    try {
      setLoading(true);

      const res = await axios.patch(
        `${API_URL}/api/user/change/${id}`,
        {
          new_password: values.new_password,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      await showAlert(
        "Success",
        "success",
        res.data?.message || "Password successfully changed",
        false,
        1500,
      );

    } catch (error) {
      console.error("Change password error:", error.response?.data || error);

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update password";

      showAlert("Error", "error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={adminOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.push("/portal/user")}
                className="cursor-pointer hover:text-blue-600"
              />
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Change Password
              </h2>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="flex flex-col gap-6">
                <TextInput
                  label="Full Name"
                  readOnly
                  styles={{
                    input: {
                      backgroundColor: "#f1f3f5",
                      color: "#495057",
                      cursor: "not-allowed",
                    },
                  }}
                  {...form.getInputProps("full_name")}
                />

                <TextInput
                  label="Badge Number"
                  readOnly
                  styles={{
                    input: {
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                    },
                  }}
                  {...form.getInputProps("badge_number")}
                />

                {/* PASSWORD INPUT */}
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  withAsterisk
                  {...form.getInputProps("new_password")}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  withAsterisk
                  {...form.getInputProps("confirm_password")}
                />

                {/* PASSWORD POLICY */}
                <div className="text-sm bg-gray-50 p-4 rounded border">
                  <p className="font-semibold mb-2">
                    Please Follow Password Configuration Policy Settings:
                  </p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Minimum Length: 14 characters</li>
                    <li>Must contain at least one number</li>
                    <li>Must contain uppercase & lowercase letters</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <Button type="submit" size="xs" loading={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
