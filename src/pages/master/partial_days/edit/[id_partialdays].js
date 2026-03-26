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

Edit_PartialDays.title = "Edit Partial Days";

export default function Edit_PartialDays() {
  const router = useRouter();
  const { id_partialdays } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      partial_days: "",
    },
    validate: {
      partial_days: (value) =>
        value.trim().length > 0 ? null : "Partial Days is required",
    },
  });

  // ======================
  // FETCH DATA AWAL
  // ======================
  useEffect(() => {
    if (!id_partialdays) return;

    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/master/partial_days/${id_partialdays}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        form.setValues({
          partial_days: data?.partial_days || "",
        });
      } catch (error) {
        showAlert("Error", "error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_partialdays]);

  // ======================
  // SUBMIT UPDATE
  // ======================
  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      "Do You Want To Update This Partial Days?",
      true
    );

    if (!confirm?.isConfirmed) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/api/master/partial_days/${id_partialdays}`,
        values,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);
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
    <AuthLayout sidebarList={[]} hideSidebar={true}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.push("/master/partial_days/list")}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Edit Partial Days
                </h2>
              </div>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Partial Days"
                  withAsterisk
                  placeholder="Input Partial Days"
                  {...form.getInputProps("partial_days")}
                />
              </div>

              <div className="px-4 py-2 flex justify-end space-x-2">
                <Button size="xs" type="submit">
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
