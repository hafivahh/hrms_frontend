import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { master_data } from "@/data/sidebar/master_data";

Edit_Role.title = "Edit Role";

export default function Edit_Role() {
  const router = useRouter();
  const { id_role } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      role_name: "",
    },
    validate: {
      role_name: (value) =>
        value.trim().length > 0 ? null : "Role Name is required",
    },
  });

  // FETCH DATA AWAL
  useEffect(() => {
    if (!id_role) return;

    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/master/role/${id_role}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        form.setValues({
          role_name: data?.role_name || "",
        });
      } catch (error) {
        showAlert("Error", "error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_role]);

  // SUBMIT UPDATE
  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "warning",
      "Do You Want To Update This Role?",
      true
    );

    if (!confirm) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/api/master/role/${id_role}`,
        values,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);

        router.push("/master/role/list");
      }
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Error",
        error: "Unknown",
      };

      showAlert(data_error.message, "error", data_error.error);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <AuthLayout sidebarList={master_data}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Edit Role</Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Role Name"
                  withAsterisk
                  placeholder="Input Role Name"
                  {...form.getInputProps("role_name")}
                />
              </div>

              <div className="px-4 py-2 flex justify-end space-x-2">
                <Button
                  size="md"
                  color="gray"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push("/master/role/list")}
                >
                  Back
                </Button>

                <Button size="md" type="submit">
                  Update
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
