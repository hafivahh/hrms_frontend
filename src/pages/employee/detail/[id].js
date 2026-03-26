import AuthLayout from "@/components/layout/authLayout";
import { employeeOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import { Paper, Badge, Loader, Button } from "@mantine/core";
import { IconArrowLeft, IconPencil } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useEncrypt from "@/hooks/useEncrypt";

export default function EmployeeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { decrypt } = useEncrypt();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/employee/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        showAlert(
          "Error",
          "error",
          err.response?.data?.message || "Failed to load employee data",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const Field = ({ label, value }) => (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value || "-"}
        disabled
        className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700"
      />
    </div>
  );

  if (loading)
    return (
      <AuthLayout sidebarList={employeeOnly}>
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </AuthLayout>
    );

  if (!data)
    return (
      <AuthLayout sidebarList={employeeOnly}>
        <div className="text-center mt-8">Employee data not found</div>
      </AuthLayout>
    );

  return (
    <AuthLayout sidebarList={employeeOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Employee Detail
                </h2>
              </div>
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconPencil size={16} />}
                onClick={() => router.push(`/employee/edit/${id}`)}
              >
                Edit
              </Button>
            </div>

            {/* CONTENT */}
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Badge Number" value={data.badge_number} />
              <Field label="Full Name" value={data.full_name} />
              <Field label="Gender" value={data.gender_text} />
              <Field label="Position" value={data.position_name} />
              <Field label="Department" value={data.departement_name} />
              <Field label="Project" value={data.project_name} />
              <Field label="Company" value={data.company_name} />
              <Field
                label="Join Date"
                value={
                  data.join_date
                    ? new Date(data.join_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"
                }
              />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <div>
                  <Badge
                    color={data.status_active === 1 ? "green" : "red"}
                    size="lg"
                  >
                    {data.status_active === 1 ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Employee Status
                </label>
                <div>
                  <Badge
                    color={data.status_employee === 1 ? "green" : "red"}
                    size="lg"
                  >
                    {data.status_employee === 1 ? "Direct" : "Indirect"}
                  </Badge>
                </div>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
