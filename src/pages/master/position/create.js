import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { master_data } from "@/data/sidebar/master_data";

Create_Position.title = "Add Position";

export default function Create_Position() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      position_name: "",
    },
    validate: {
      position_name: (value) =>
        value.trim().length > 0 ? null : "Position Name is required",
    },
  });

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to submit this position?",
      true,
    );

    if (!confirm?.isConfirmed) return;

    try {
      const { data } = await axios.post(
        `${API_URL}/api/master/position/create`,
        values,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        },
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);
        router.push("/master/position/list");
      }
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Error",
        error: "Unknown",
      };
      showAlert(data_error.message, "error", data_error.error);
    }
  };

  return (
    <AuthLayout sidebarList={master_data}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.push("/master/position/list")}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Add Position
                </h2>
              </div>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Position Name"
                  withAsterisk
                  placeholder="Input Position Name"
                  {...form.getInputProps("position_name")}
                />
              </div>

              <div className="px-4 py-2 flex justify-end space-x-2">
                <Button size="sx" type="submit">
                  Submit
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}