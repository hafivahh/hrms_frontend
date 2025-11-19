import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { useRouter } from "next/router";
import { master_data } from "@/data/sidebar/master_data";

Create_Departement.title = "Add Departement";

export default function Create_Departement() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      departement_name: "",
    },
    validate: {
      departement_name: (value) =>
        value.trim().length > 0 ? null : "Department Name is required",
    },
  });

 const handleSubmit = async (values) => {

  // 1️⃣ Konfirmasi dulu
  const confirm = await showAlert(
    "Are you sure?",
    "warning",
    "Do you want to submit this departement?",
    true // 👉 ada tombol Submit & Cancel
  );

  // 2️⃣ Kalau user klik Cancel → stop proses
  if (!confirm) {
    return; 
  }

  // 3️⃣ Lanjut submit ke backend
  try {
    const { data } = await axios.post(
      `${API_URL}/api/master_departement/create`,
      values,
      {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      }
    );

    if (data.success) {
      await showAlert("Success", "success", data.message);

      form.reset();
      router.push("/master_departement/list_departement");
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
              <Text fw={500}>Add Departement</Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Departement Name"
                  withAsterisk
                  placeholder="Input Department Name"
                  {...form.getInputProps("departement_name")}
                />
              </div>
              <div className="px-4 py-2 flex justify-between">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() =>
                    router.push("/master_departement/list_departement")
                  }
                >
                  Back
                </Button>

                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
