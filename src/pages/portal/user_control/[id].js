import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function ChangeOwnPassword() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    validate: {
      old_password: (value) => (!value ? "Old Password is required" : null),
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

  const handleSubmit = async (values) => {
    if (loading) return;

    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to change your password?",
      true,
      null,
      "Update",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_URL}/api/user/change_own/${id}`, // ⬅️ id langsung dari URL
        {
          old_password: values.old_password,
          new_password: values.new_password,
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await showAlert(
        "Success",
        "success",
        res.data?.message || "Password successfully changed",
        false,
        1500,
      );

      form.reset();
 
    } catch (error) {
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
    <AuthLayout sidebarList={[]}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.back()}
                className="cursor-pointer hover:text-blue-600"
              />
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Change Password
              </h2>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="flex flex-col gap-6">
                <PasswordInput
                  label="Old Password"
                  placeholder="Enter current password"
                  withAsterisk
                  {...form.getInputProps("old_password")}
                />
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

                <div className="text-sm bg-gray-50 p-4 rounded border">
                  <p className="font-semibold mb-2">Password Policy:</p>
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
