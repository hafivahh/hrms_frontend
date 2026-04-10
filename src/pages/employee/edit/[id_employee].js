import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { employeeOnly } from "@/data/sidebar/employee";
import { DateInput } from "@mantine/dates";

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
      gender: "1",
      id_position: "",
      id_departement: "",
      id_project: "",
      id_company: "",
      join_date: null,
    },
    validate: {
      badge_number: (value) =>
        value.trim() ? null : "Badge number is required",
      full_name: (value) => (value.trim() ? null : "Full name is required"),
      gender: (value) => (value ? null : "Gender is required"),
      id_position: (value) => (value ? null : "Position is required"),
      id_departement: (value) => (value ? null : "Departement is required"),
      id_project: (value) => (value ? null : "Project is required"),
      id_company: (value) => (value ? null : "Company is required"),
      join_date: (value) => (value ? null : "Join date is required"),
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
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        form.setValues({
          badge_number: data.badge_number || "",
          full_name: data.full_name || "",
          gender: data.gender?.toString() || "1",
          id_position: data.position?.id?.toString() || "",
          id_departement: data.departement?.id?.toString() || "",
          id_project: data.project?.id?.toString() || "",
          id_company: data.company?.id?.toString() || "",
          join_date: data.join_date ? new Date(data.join_date) : null,
        });
      } catch (error) {
        showAlert("Error", "error", "Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_employee]);

  const handleSubmit = async (values) => {
    if (loading) return;

    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      "Do you want to update this employee?",
      true,
      null,
      "Update",
      "Cancel",
    );

    if (!confirm) return;
    if (typeof confirm === "object" && confirm.isConfirmed === false) return;

    setLoading(true);

    try {
      const payload = {
        ...values,
        gender: Number(values.gender),
        id_position: Number(values.id_position),
        id_departement: Number(values.id_departement),
        id_project: Number(values.id_project),
        id_company: Number(values.id_company),
        join_date: values.join_date ? values.join_date.toISOString() : null,
      };

      const { data } = await axios.put(
        `${API_URL}/api/employee/${id_employee}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await showAlert(
        "Success",
        "success",
        "Employee updated successfully",
        false,
        1500,
      );
    } catch (error) {
      const data_error = error.response?.data || null;
      if (data_error) {
        if (error.response?.status === 409) {
          form.setFieldError(
            "badge_number",
            data_error.message || "Badge number already exists",
          );
          showAlert(
            "Duplicate Badge Number",
            "error",
            data_error.message || "Badge number already exists",
          );
        } else {
          showAlert(
            data_error.message || "Error",
            "error",
            data_error.error || "",
          );
        }
      } else if (error.request) {
        showAlert("Network Error", "error", "No response from server.");
      } else {
        showAlert("Error", "error", error.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={employeeOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER SECTION */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.push("/employee/list")}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Edit Employee
                </h2>
              </div>
            </div>

            {/* CONTENT SECTION */}
            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BADGE NUMBER */}
                <TextInput
                  label="Badge Number"
                  withAsterisk
                  placeholder="Input Badge Number"
                  {...form.getInputProps("badge_number")}
                />

                {/* FULL NAME */}
                <TextInput
                  label="Full Name"
                  withAsterisk
                  placeholder="Input Full Name"
                  {...form.getInputProps("full_name")}
                />

                {/* GENDER */}
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  data={[
                    { value: "1", label: "Laki-Laki" },
                    { value: "2", label: "Perempuan" },
                  ]}
                  searchable
                  {...form.getInputProps("gender")}
                />

                {/* POSITION */}
                <Select
                  label="Position"
                  placeholder="Select position"
                  data={positions.map((p) => ({
                    value: p.id.toString(),
                    label: p.position_name,
                  }))}
                  searchable
                  {...form.getInputProps("id_position")}
                />

                {/* DEPARTEMENT */}
                <Select
                  label="Departement"
                  placeholder="Select departement"
                  data={departments.map((d) => ({
                    value: d.id.toString(),
                    label: d.departement_name,
                  }))}
                  searchable
                  {...form.getInputProps("id_departement")}
                />

                {/* PROJECT */}
                <Select
                  label="Project"
                  placeholder="Select project"
                  data={projects.map((p) => ({
                    value: p.id.toString(),
                    label: p.project_name,
                  }))}
                  searchable
                  {...form.getInputProps("id_project")}
                />

                {/* COMPANY */}
                <Select
                  label="Company"
                  placeholder="Select company"
                  data={companies.map((c) => ({
                    value: c.id.toString(),
                    label: c.company_name,
                  }))}
                  searchable
                  {...form.getInputProps("id_company")}
                />
                {/* JOIN DATE */}
                <DateInput
                  label="Join Date"
                  placeholder="Select join date"
                  withAsterisk
                  {...form.getInputProps("join_date")}
                />
              </div>

              {/* UPDATE BUTTON */}
              <div className="flex justify-end mt-10">
                <Button type="submit" size="xs" loading={loading}>
                  Update Employee Data
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
