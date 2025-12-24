import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Paper, Badge, Button, Group, Text, Loader } from "@mantine/core";
import AuthLayout from "@/components/layout/authLayout";
import { employee as sidebarData } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";

export default function LeaveDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert, showConfirm } = useSwal();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const sidebarList = sidebarData;

  const statusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Completed", color: "green" },
    3: { label: "Rejected", color: "red" },
  };

  const fetchLeaveDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leave/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leave detail");
      const data = await res.json();
      setLeave(data);
    } catch (err) {
      showAlert("error", err.message || "Failed to load leave detail");
      setLeave(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveDetail();
  }, [id]);

  const handleAction = async (newStatus) => {
    if (!leave) return;
    const actionText = newStatus === 2 ? "Approve" : "Reject";
    const confirmed = await showConfirm(
      `${actionText} this leave request?`,
      `Are you sure you want to ${actionText.toLowerCase()} this leave request?`
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leave/approve/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update leave status");
      showAlert("success", `Leave has been ${actionText.toLowerCase()}d`);
      fetchLeaveDetail();
    } catch (err) {
      showAlert("error", err.message || "Failed to update leave status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <AuthLayout sidebarList={sidebarList}>
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </AuthLayout>
    );

  if (!leave)
    return (
      <AuthLayout sidebarList={sidebarList}>
        <div className="text-center mt-8">Leave data not found</div>
      </AuthLayout>
    );
  const Field = ({ label, value }) => (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled
        className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700"
      />
    </div>
  );

  return (
    <AuthLayout sidebarList={sidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="md" withBorder shadow="xs">
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md">
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Leave Request Detail
              </h2>
            </div>
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Badge Number" value={leave.badge_number} />
              <Field label="Full Name" value={leave.full_name} />
              <Field label="Departement" value={leave.departement_name} />
              <Field label="Position" value={leave.position_name} />
              <Field label="Project" value={leave.project_name} />
              <Field
  label="Leave Type"
  value={leave.leaveType?.type_name || "-"}
/>

              <Field label="Start Date" value={leave.leave_in} />
              <Field label="End Date" value={leave.leave_out} />

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Status
                </label>
                <div className="mt-1">
                  <Badge color={statusMap[leave.leave_status]?.color} size="lg">
                    {statusMap[leave.leave_status]?.label}
                  </Badge>
                </div>
              </div>
            </div>
          </Paper>

          <Paper radius="md" withBorder shadow="xs" className="mt-6">
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md">
              <h3 className="font-semibold text-gray-700">Leave Notes</h3>
            </div>

            <div className="px-6 py-6">
              <textarea
                value={leave.leave_remarks || ""}
                disabled
                className="w-full p-3 border rounded-md bg-gray-100 text-gray-700 resize-none focus:outline-none"
                rows={4}
              />
            </div>

            {leave.items?.length > 0 && (
              <div className="px-6 py-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">
                        No
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">
                        Description
                      </th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-600">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leave.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3">{item.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Paper>

          <Paper radius="md" withBorder shadow="xs" className="mt-6 p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Approved By</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Name" value={leave.approved_by || "-"} />
              <Field label="Date" value={leave.approved_date || "-"} />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              {(leave.leave_status === 1 && leave.supervisor_id == user?.badge_number) && (
                <>
                  <Button
                    size="sm"
                    radius="sm"
                    color="green"
                    onClick={() => handleAction(2)}
                    loading={actionLoading}
                    className="w-28"
                  >
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    radius="sm"
                    color="red"
                    onClick={() => handleAction(3)}
                    loading={actionLoading}
                    className="w-28"
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                size="sm"
                radius="sm"
                color="gray"
                onClick={() => router.back()}
                className="w-28"
              >
                Back
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
