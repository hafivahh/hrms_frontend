import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, TextInput, Select, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { employee } from "@/data/sidebar/employee";

AddPortalUser.title = "Add Portal User";

export default function AddPortalUser() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // FORM
  // ===============================
  const form = useForm({
    initialValues: {
      full_name: "",
      badge_number: "",
      username: "",
      email: "",
      password: "",
      id_role: "",
      status_user: "1",
    },
    validate: {
      full_name: (value) =>
        value.trim().length > 0 ? null : "Full Name is required",
      badge_number: (value) =>
        value.trim().length > 0 ? null : "Badge Number is required",
      username: (value) =>
        value.trim().length > 0 ? null : "Username is required",
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Valid email is required",
      password: (value) =>
        value.length >= 6 ? null : "Password minimum 6 characters",
      id_role: (value) => (value ? null : "Role is required"),
      status_user: (value) => (value ? null : "Status is required"),
    },
  });

  // ===============================
  // FETCH ROLES
  // ===============================
  const fetchRoles = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/master/role/serverside`,
        {}, // body kosong
        {
          headers: { Authorization: "Bearer " + user.token },
        },
      );

      setRoles(
        data.data.map((item) => ({
          value: item.id_role.toString(),
          label: item.role_name,
        })),
      );
    } catch (err) {
      console.log("Fetch roles error:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (values) => {
    if (loading) return;

    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to create this user?",
      true,
      null,
      "Submit",
      "Cancel",
    );

    if (!confirm) return;

    const payload = {
      ...values,
      id_role: Number(values.id_role),
      status_user: Number(values.status_user),
    };

    console.log("dsadsadas", payload);

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/user/create`, payload, {
        headers: { Authorization: "Bearer " + user.token },
      });

      await showAlert(
        "Success",
        "success",
        res.data?.message || "User created successfully",
        false,
        1500,
      );

      router.push("/portal/user");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create user";

      showAlert("Error", "error", msg);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.push("/portal/user")}
                className="cursor-pointer hover:text-blue-600"
              />
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Add Portal User
              </h2>
            </div>

            {/* FORM */}
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

                <PasswordInput
                  label="Password"
                  withAsterisk
                  {...form.getInputProps("password")}
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
                  Submit User Data
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
