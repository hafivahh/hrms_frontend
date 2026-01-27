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

export default function Create_Company() {
  Create_Company.title = "Add Company";

  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const form = useForm({
    initialValues: {
      company_name: "",
    },
    validate: {
      company_name: (value) =>
        value.trim().length > 0 ? null : "Company Name is required",
    },
  });

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to submit this company?",
      true
    );

    if (!confirm) {
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/api/master/company/create`,
        values,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );

      if (data.success) {
        await showAlert("Success", "success", data.message, false, 1500);
        router.push("/master/company/list");
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
             <Paper radius="md" withBorder shadow="xs">
               <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <IconArrowLeft
                     size={18}
                     onClick={() => router.push("/master/company/list")}
                     className="cursor-pointer hover:text-blue-600 transition-colors"
                   />
                   <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                     Add Company
                   </h2>
                 </div>
               </div>
   
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2">
                <TextInput
                  label="Company Name"
                  withAsterisk
                  placeholder="Input Company Name"
                  {...form.getInputProps("company_name")}
                />
              </div>
              <div className="px-4 py-2 flex justify-end space-x-2">
            

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
