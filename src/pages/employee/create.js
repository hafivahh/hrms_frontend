import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { employeeOnly } from "@/data/sidebar/employee";

Add_employee.title = "Add Employee";

export default function Add_employee() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      full_name: "",
      badge_number: "",
      gender: "",
      id_departement: "",
      id_project: "",
      id_company: "",
      id_position: "",
      join_date: "",
      status_employee: "",
    },
    validate: {
      full_name: (value) =>
        value.trim().length > 0 ? null : "Employee Name is required",
      badge_number: (value) =>
        value.trim().length > 0 ? null : "Badge Number is required",
      gender: (value) => (value ? null : "Gender is required"),
      id_departement: (value) => (value ? null : "Department is required"),
      id_project: (value) => (value ? null : "Project is required"),
      id_company: (value) => (value ? null : "Company is required"),
      id_position: (value) => (value ? null : "Position is required"),
      join_date: (value) => (value ? null : "Join Date is required"),
      status_employee: (value) =>
        value !== "" ? null : "Employee Status is required",
    },
  });

  // FETCH DATA DROPDOWN
  const fetchDropdown = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/employee/dropdowns`, {
        headers: { Authorization: "Bearer " + user.token },
      });

      setDepartments(
        data.departments.map((item) => ({
          value: item.id.toString(),
          label: item.departement_name,
        })),
      );

      setProjects(
        data.projects.map((item) => ({
          value: item.id.toString(),
          label: item.project_name,
        })),
      );

      setCompanies(
        data.companies.map((item) => ({
          value: item.id.toString(),
          label: item.company_name,
        })),
      );

      setPositions(
        data.positions.map((item) => ({
          value: item.id.toString(),
          label: item.position_name,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDropdown();
  }, []);

  const handleSubmit = async (values) => {
    if (loading) return; // ⬅️ prevent double submit

    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to submit this employee?",
      true,
      null,
      "Submit",
      "Cancel",
    );

    // ⬅️ handle kedua kemungkinan return value dari showAlert
    if (!confirm) return;
    if (typeof confirm === "object" && confirm.isConfirmed === false) return;

    setLoading(true); // ⬅️ aktifkan loading

    const payload = {
      ...values,
      id_departement: Number(values.id_departement),
      id_project: Number(values.id_project),
      id_company: Number(values.id_company),
      id_position: Number(values.id_position),
      gender: values.gender === "male" ? 1 : 2,
      join_date: values.join_date ? values.join_date.toISOString() : null,
      status_employee: Number(values.status_employee),
    };

    try {
      const res = await axios.post(`${API_URL}/api/employee/create`, payload, {
        headers: { Authorization: "Bearer " + user.token },
      });

      const data = res.data;
      const isSuccess = !!(
        data &&
        (data.success === true || data.id || data.createdAt || data.data)
      );

      if (isSuccess) {
        await showAlert(
          "Success",
          "success",
          data?.message || "Employee created successfully",
          false,
          1500,
        );
        router.push("/employee/list");
        return;
      }

      showAlert(
        "Error",
        "error",
        data?.message || "Unexpected response from server",
      );
    } catch (error) {
      const data_error = error.response?.data || null;
      if (data_error) {
        showAlert(
          data_error.message || "Error",
          "error",
          data_error.error || "",
        );
      } else if (error.request) {
        showAlert(
          "Network Error",
          "error",
          "No response from server (check backend/CORS).",
        );
      } else {
        showAlert("Error", "error", error.message || "Unknown error");
      }
    } finally {
      setLoading(false); // matikan loading
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
                  Add Employee
                </h2>
              </div>
            </div>

            {/* CONTENT SECTION */}
            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FULL NAME */}
                <TextInput
                  label="Full Name"
                  withAsterisk
                  placeholder="Input Employee Name"
                  {...form.getInputProps("full_name")}
                />

                {/* BADGE NUMBER */}
                <TextInput
                  label="Badge Number"
                  withAsterisk
                  placeholder="Input Badge Number"
                  {...form.getInputProps("badge_number")}
                />

                {/* GENDER */}
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  data={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  searchable
                  withAsterisk
                  {...form.getInputProps("gender")}
                />

                {/* DEPARTEMENT */}
                <Select
                  label="Departement"
                  placeholder="Select departement"
                  data={departments}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_departement")}
                />

                {/* PROJECT */}
                <Select
                  label="Project"
                  placeholder="Select project"
                  data={projects}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_project")}
                />

                {/* COMPANY */}
                <Select
                  label="Company"
                  placeholder="Select company"
                  data={companies}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_company")}
                />

                {/* POSITION */}
                <Select
                  label="Position"
                  placeholder="Select position"
                  data={positions}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_position")}
                />

                {/* JOIN DATE */}
                <DateInput
                  label="Join Date"
                  placeholder="Select join date"
                  withAsterisk
                  {...form.getInputProps("join_date")}
                />

                <Select
                  label="Employee Status"
                  placeholder="Select employee status"
                  data={[
                    { value: "1", label: "Direct" },
                    { value: "0", label: "Indirect" },
                  ]}
                  withAsterisk
                  {...form.getInputProps("status_employee")}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end mt-10">
                <Button type="submit" size="xs" loading={loading}>
                  Submit Employee Data
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
