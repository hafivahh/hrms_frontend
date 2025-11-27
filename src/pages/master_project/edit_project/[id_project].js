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

Edit_Leave.title = "Edit Leave";

export default function Edit_Leave() {
  const router = useRouter();
  const { id_project } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      project_name: "",
    },
    validate: {
      project_name: (value) =>
        value.trim().length > 0 ? null : "Project Name is required",
    },
  });

  // FETCH DATA AWAL
  useEffect(() => {
    if (!id_project) return;

    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/master_project/${id_project}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        form.setValues({
          project_name: data?.project_name || "",
        });
      } catch (error) {
        showAlert("Error", "error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_project]);

  // SUBMIT UPDATE
  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "warning",
      "Do You Want To Update This Project?",
      true
    );

    if (!confirm) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/api/master_project/${id_project}`,
        values,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);

        router.push("/master_project/list_project");
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
              <Text fw={500}>Edit Project</Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Project Name"
                  withAsterisk
                  placeholder="Input Project Name"
                  {...form.getInputProps("project_name")}
                />
              </div>

              <div className="px-4 py-2 flex justify-end space-x-2">
                <Button
                  size="md"
                  color="gray"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push("/master_project/list_project")}
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
