import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Paper, Badge, Loader, Button } from "@mantine/core";
import AuthLayout from "@/components/layout/authLayout";
import { ess as sidebarData } from "@/data/sidebar/ess";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";

export default function LeaveDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidebarList = sidebarData;

  const statusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Approved", color: "blue" },
    3: { label: "Rejected", color: "red" },
    4: { label: "Completed", color: "green" },
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

  const handleDownloadAttachment = async (leave) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/ess_leave/download/${leave.id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", leave.attachment || "leave-file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal download file");
    }
  };

  const handleSubmitRequest = async () => {
    const confirm = await showAlert(
      "Submit Request?",
      "question",
      "This will submit your leave for approval.",
      true,
    );

    if (!confirm) return;

    try {
      setLoading(true);

      await axios.put(
       `${API_URL}/api/ess_leave/submit/${id}`,
        {
          submit: true, // optional kalau backend butuh flag
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      await showAlert(
        "Success",
        "success",
        "Leave request submitted for approval!",
        false,
        1500,
      );

      fetchLeaveDetail(); // refresh data
    } catch (err) {
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to submit request",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeaveDetail();
  }, [id]);

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

  return (
    <AuthLayout sidebarList={sidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.back()}
                  className="cursor-pointer"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide">
                  Leave Request Detail
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-600">
                  OVERALL STATUS:
                </span>
                <Badge
                  color={statusMap[leave.leave_status]?.color}
                  size="lg"
                  variant="filled"
                >
                  {statusMap[leave.leave_status]?.label}
                </Badge>
              </div>
            </div>

            {/* 1. TABLE DATE DETAIL (TANPA KOLOM ACTION) */}
            <div className="px-6 py-6">
              <div className="mb-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                Requested Dates
              </div>
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-3 text-center text-sm font-semibold text-gray-600">
                        Start Date
                      </th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-600">
                        End Date
                      </th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-600">
                        Leave Type
                      </th>
                      <th className="p-3 text-center text-sm font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leave.items?.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 text-center text-sm">
                          {item.leave_in}
                        </td>
                        <td className="p-3 text-center text-sm">
                          {item.leave_out}
                        </td>
                        <td className="p-3 text-center text-sm">
                          {item.type_name || "-"}
                        </td>
                        <td className="p-3 text-center text-sm">
                          <Badge
                            color={statusMap[item.leave_status]?.color}
                            variant="filled"
                            size="sm"
                          >
                            {statusMap[item.leave_status]?.label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="mx-6 border-gray-100" />

            {/* 2. ATTACHMENT */}
            <div className="px-6 py-4">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Attachment
              </label>
              {leave.attachment ? (
                <button
                  onClick={() => handleDownloadAttachment(leave)}
                  className="inline-flex items-center px-4 py-2 border rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Download Attachment
                </button>
              ) : (
                <div className="text-gray-400 italic text-sm p-2 border border-dashed rounded bg-gray-50">
                  No attachment provided
                </div>
              )}
            </div>

            {/* 3. REMARK */}
            <div className="px-6 pb-8">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Leave Remark
              </label>
              <textarea
                value={leave.leave_remarks || ""}
                disabled
                className="w-full p-3 border rounded-md bg-gray-50 text-gray-700 resize-none focus:outline-none italic"
                rows={3}
              />
            </div>
            {/* 4. ACTION BUTTON */}
            {leave.leave_status === 0 && (
              <div className="px-6 pb-8 flex justify-end">
                <Button
                  size="md"
                  color="blue"
                  loading={loading}
                  onClick={handleSubmitRequest}
                >
                  Submit Request
                </Button>
              </div>
            )}
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
