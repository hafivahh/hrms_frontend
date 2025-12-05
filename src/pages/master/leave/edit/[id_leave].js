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
  const { id_leave } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      type_name: "",
    },
    validate: {
      type_name: (value) =>
        value.trim().length > 0 ? null : "Type Name is required",
    },
  });

  // FETCH DATA AWAL
  useEffect(() => {
    if (!id_leave) return;

    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/master/leave/${id_leave}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        form.setValues({
          type_name: data?.type_name || "",
        });
      } catch (error) {
        showAlert("Error", "error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_leave]);

  // SUBMIT UPDATE
  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "warning",
      "Do You Want To Update This Leave Type?",
      true
    );

    if (!confirm) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/api/master/leave/${id_leave}`,
        values,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);

        router.push("/master/leave/list");
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
              <Text fw={500}>Edit Leave Type</Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Type Name"
                  withAsterisk
                  placeholder="Input Leave Type Name"
                  {...form.getInputProps("type_name")}
                />
              </div>

              <div className="px-4 py-2 flex justify-end space-x-2">
                <Button
                  size="md"
                  color="gray"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push("/master/leave/list")}
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
