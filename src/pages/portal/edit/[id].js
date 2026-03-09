import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { adminOnly } from "@/data/sidebar/employee";

export default function EditPortalUser() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { id } = router.query;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      full_name: "",
      badge_number: "",
      username: "",
      email: "",
      id_role: "",
      status_user: "1",
    },
    validate: {
      full_name: (v) => (v.trim() ? null : "Full Name is required"),
      badge_number: (v) => (v.trim() ? null : "Badge Number is required"),
      username: (v) => (v.trim() ? null : "Username is required"),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Valid email is required"),
      id_role: (v) => (v ? null : "Role is required"),
      status_user: (v) => (v ? null : "Status is required"),
    },
  });

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/master/role/serverside`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setRoles(
        data.data.map((item) => ({
          value: item.id_role.toString(),
          label: item.role_name,
        })),
      );
    } catch (err) {
      console.error("Fetch roles error:", err);
      showAlert("Error", "error", "Failed to fetch roles");
    }
  };

  // Fetch user data
  const fetchUser = async () => {
    if (!id) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/user/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const u = data;
      form.setValues({
        full_name: u.full_name || "",
        badge_number: u.badge_number || "",
        username: u.username || "",
        email: u.email || "",
        id_role: u.id_role?.toString() || "",
        status_user: u.status_user?.toString() || "1",
      });
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err);
      showAlert("Error", "error", "Failed to fetch user data");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSubmit = async (values) => {
    if (loading) return;

    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to update this user?",
      true,
      null,
      "Update",
      "Cancel",
    );

       if (!confirm?.isConfirmed) return;

    const payload = {
      full_name: values.full_name,
      badge_number: values.badge_number,
      username: values.username,
      email: values.email,
      id_role: Number(values.id_role),
      status_user: Number(values.status_user),
    };

    try {
      setLoading(true);

      const res = await axios.put(
        `${API_URL}/api/user/update/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      await showAlert(
        "Success",
        "success",
        res.data?.message || "User updated successfully",
        false,
        1500,
      );
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update user";

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
                Edit Portal User
              </h2>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="flex flex-col gap-6">
                <TextInput
                  label="Full Name"
                  withAsterisk
                  {...form.getInputProps("full_name")}
                />

                <TextInput
                  label="Badge Number"
                  withAsterisk
                  {...form.getInputProps("badge_number")}
                />

                <TextInput
                  label="Username"
                  withAsterisk
                  {...form.getInputProps("username")}
                />

                <TextInput
                  label="Email"
                  withAsterisk
                  {...form.getInputProps("email")}
                />

                <Select
                  label="Role"
                  placeholder="Select role"
                  data={roles}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_role")}
                />

                <Select
                  label="Account Status"
                  data={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  withAsterisk
                  {...form.getInputProps("status_user")}
                />
              </div>

              <div className="flex justify-end mt-10">
                <Button type="submit" size="xs" loading={loading}>
                  Update User
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}