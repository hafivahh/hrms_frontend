import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { master_data } from "@/data/sidebar/master_data";

export default function Create_PartialDays() {
  Create_PartialDays.title = "Add Partial Days";

  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      partial_days: "",
    },
    validate: {
      partial_days: (value) =>
        value.trim().length > 0 ? null : "Partial Days is required",
    },
  });

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are you sure?",
      "warning",
      "Do you want to submit this partial days?",
      true
    );

    if (!confirm) return;

    try {
      const { data } = await axios.post(
        `${API_URL}/api/master/partial_days/create`,
        values,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);
        router.push("/master/partial_days/list");
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
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Add Partial Days</Text>
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
                <Button
                  size="md"
                  color="gray"
                  variant="filled"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push("/master/partial_days/list")}
                >
                  Back
                </Button>

                <Button size="md" type="submit">
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
