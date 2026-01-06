import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, Text, TextInput, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { employee } from "@/data/sidebar/employee";

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
        }))
      );

      setProjects(
        data.projects.map((item) => ({
          value: item.id.toString(),
          label: item.project_name,
        }))
      );

      setCompanies(
        data.companies.map((item) => ({
          value: item.id.toString(),
          label: item.company_name,
        }))
      );

      setPositions(
        data.positions.map((item) => ({
          value: item.id.toString(),
          label: item.position_name,
        }))
      );
      setJoinDates(
        data.join_dates.map((item) => ({
          value: item.id.toString(),
          label: item.join_date,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDropdown();
  }, []);

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are you sure?",
      "warning",
      "Do you want to submit this employee?",
      true,
      null,
      "Submit",
      "Cancel"
    );

    if (!confirm) return;

    const payload = {
      ...values,
      id_departement: Number(values.id_departement),
      id_project: Number(values.id_project),
      id_company: Number(values.id_company),
      id_position: Number(values.id_position),
      gender: values.gender === "male" ? 1 : 2,
      join_date: values.join_date ? values.join_date.toISOString() : null, 
    };

    try {
      console.log("SUBMIT payload:", payload);

      const res = await axios.post(`${API_URL}/api/employee/create`, payload, {
        headers: { Authorization: "Bearer " + user.token },
      });

      console.log("RESPONSE (create employee):", res);

      const data = res.data;
      const isSuccess = !!(
        data &&
        (data.success === true || data.id || data.createdAt || data.data)
      );

      if (isSuccess) {
        const message = data?.message || "Employee created successfully";
        await showAlert("Success", "success", message, false, 1500);
        router.push("/employee/list");
        return;
      }

      console.warn("Unexpected response shape:", data);
      const errMsg = data?.message || "Unexpected response from server";
      showAlert("Error", "error", errMsg);
    } catch (error) {
      console.error("CREATE employee error:", error);
      const data_error = error.response?.data || null;

      if (data_error) {
        const msg = data_error.message || JSON.stringify(data_error);
        const detail = data_error.error || "";
        showAlert(msg, "error", detail);
      } else if (error.request) {
        showAlert(
          "Network Error",
          "error",
          "No response from server (check backend/CORS)."
        );
      } else {
        showAlert("Error", "error", error.message || "Unknown error");
      }
    }
  };

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Add Employee</Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              {/* FULL NAME */}
              <div className="px-4 py-2">
                <TextInput
                  label="Full Name"
                  withAsterisk
                  placeholder="Input Employee Name"
                  {...form.getInputProps("full_name")}
                />
              </div>

              {/* BADGE NUMBER */}
              <div className="px-4 py-2">
                <TextInput
                  label="Badge Number"
                  withAsterisk
                  placeholder="Input Badge Number"
                  {...form.getInputProps("badge_number")}
                />
              </div>

              {/* GENDER */}
              <div className="px-4 py-2">
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
              </div>

              {/* DEPARTEMENT */}
              <div className="px-4 py-2">
                <Select
                  label="Departement"
                  placeholder="Select departement"
                  data={departments}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_departement")}
                />
              </div>

              {/* PROJECT */}
              <div className="px-4 py-2">
                <Select
                  label="Project"
                  placeholder="Select project"
                  data={projects}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_project")}
                />
              </div>

              {/* COMPANY */}
              <div className="px-4 py-2">
                <Select
                  label="Company"
                  placeholder="Select company"
                  data={companies}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_company")}
                />
              </div>

              {/* POSITION */}
              <div className="px-4 py-2">
                <Select
                  label="Position"
                  placeholder="Select position"
                  data={positions}
                  searchable
                  withAsterisk
                  {...form.getInputProps("id_position")}
                />
              </div>
              {/* JOIN DATE */}
              <div className="px-4 py-2">
                <DateInput
                  label="Join Date"
                  placeholder="Select join date"
                  withAsterisk
                  {...form.getInputProps("join_date")}
                />
              </div>
              {/* SUBMIT BUTTONS */}
              <div className="px-4 py-2 text-right flex justify-end gap-3">
                <Button
                  size="md"
                  color="gray"
                  variant="filled"
                  className="w-32"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.push("/employee/list")}
                >
                  Back
                </Button> 
                <Button
                  size="md"
                  color="blue"
                  variant="filled"
                  className="w-32"
                  leftSection={<IconCheck size={16} />}
                  type="submit"
                >
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
