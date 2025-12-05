import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { employee } from "@/data/sidebar/employee";

Edit_Employee.title = "Edit Employee";

export default function Edit_Employee() {
  const router = useRouter();
  const { id_employee } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);

  const form = useForm({
    initialValues: {
      badge_number: "",
      full_name: "",
      gender: "1", // string sekarang
      id_position: "",
      id_departement: "",
      id_project: "",
      id_company: "",
    },
    validate: {
      badge_number: (value) =>
        value.trim() ? null : "Badge number is required",
      full_name: (value) => (value.trim() ? null : "Full name is required"),
    },
  });

  // FETCH DROPDOWNS
  const fetchDropdowns = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/employee/dropdowns`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(data.departments || []);
      setProjects(data.projects || []);
      setCompanies(data.companies || []);
      setPositions(data.positions || []);
    } catch (err) {
      showAlert("Error", "error", "Failed to load dropdowns");
    }
  };

  // FETCH EMPLOYEE DATA
  useEffect(() => {
    if (!id_employee) return;

    const fetchData = async () => {
      setLoading(true);
      await fetchDropdowns();

      try {
        const { data } = await axios.get(
          `${API_URL}/api/employee/${id_employee}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        form.setValues({
          badge_number: data.badge_number || "",
          full_name: data.full_name || "",
          gender: data.gender?.toString() || "1",
          id_position: data.position?.id?.toString() || "",
          id_departement: data.departement?.id?.toString() || "",
          id_project: data.project?.id?.toString() || "",
          id_company: data.company?.id?.toString() || "",
        });
      } catch (error) {
        showAlert("Error", "error", "Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_employee]);

  // HANDLE SUBMIT UPDATE
  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are You Sure?",
      "warning",
      "Do you want to update this employee?",
      true,
      null,
      "Update", // btn confirm
      "Cancel"
    );

    if (!confirm) return;

    try {
      const payload = {
        ...values,
        gender: Number(values.gender),
        id_position: Number(values.id_position),
        id_departement: Number(values.id_departement),
        id_project: Number(values.id_project),
        id_company: Number(values.id_company),
      };

      const { data } = await axios.put(
        `${API_URL}/api/employee/${id_employee}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      await showAlert(
        "Success",
        "success",
        "Employee updated successfully",
        false,
        1500
      );
      router.push("/employee/list");
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
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Edit Employee</Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="px-4 py-2 space-y-3">
                <TextInput
                  label="Badge Number"
                  withAsterisk
                  {...form.getInputProps("badge_number")}
                />
                <TextInput
                  label="Full Name"
                  withAsterisk
                  {...form.getInputProps("full_name")}
                />

                <Select
                  label="Gender"
                  data={[
                    { value: "1", label: "Laki-Laki" },
                    { value: "2", label: "Perempuan" },
                  ]}
                  {...form.getInputProps("gender")}
                />

                <Select
                  label="Position"
                  data={positions.map((p) => ({
                    value: p.id.toString(),
                    label: p.position_name,
                  }))}
                  {...form.getInputProps("id_position")}
                />

                <Select
                  label="Departement"
                  data={departments.map((d) => ({
                    value: d.id.toString(),
                    label: d.departement_name,
                  }))}
                  {...form.getInputProps("id_departement")}
                />

                <Select
                  label="Project"
                  data={projects.map((p) => ({
                    value: p.id.toString(),
                    label: p.project_name,
                  }))}
                  {...form.getInputProps("id_project")}
                />

                <Select
                  label="Company"
                  data={companies.map((c) => ({
                    value: c.id.toString(),
                    label: c.company_name,
                  }))}
                  {...form.getInputProps("id_company")}
                />
              </div>

              <div className="px-4 py-2 flex justify-end space-x-2">
                <Button
                  size="md"
                  color="gray"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push("/employee/list")}
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
