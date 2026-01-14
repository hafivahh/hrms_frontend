import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Paper, Badge, Button, Loader } from "@mantine/core";
import AuthLayout from "@/components/layout/authLayout";
import { employee as sidebarData } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import Swal from "sweetalert2";
import axios from "axios";

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

  // Tambahkan status 4 ke dalam statusMap
  const statusMap = {
    0: { label: "Draft", color: "gray" },
    1: { label: "Pending Approval", color: "yellow" },
    2: { label: "Approved", color: "blue" }, // Untuk level item
    3: { label: "Rejected", color: "red" }, // Untuk level item
    4: { label: "Completed", color: "green" }, // Untuk level header
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

  // ====== APPROVE / REJECT PER ITEM ======
  const handleApproveItem = async (itemId) => {
    const confirmed = await showConfirm(
      "Approve this leave?",
      "Are you sure you want to approve this leave date?"
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fetch(`${API_URL}/api/leave/item/approve/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: 2 }),
      });

      showAlert("success", "Leave item approved");
      fetchLeaveDetail();
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectItem = async (itemId) => {
    const confirmed = await showConfirm(
      "Reject this leave?",
      "Are you sure you want to reject this leave date?"
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await fetch(`${API_URL}/api/leave/item/reject/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: 3 }),
      });

      showAlert("success", "Leave item rejected");
      fetchLeaveDetail();
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproval = async (itemId, payload) => {
    setActionLoading(true);
    try {
      // 1. Update status item ke database
      await axios.post(
        `${API_URL}/api/leave-record-detail/${itemId}/update`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      await showAlert(
        "Success",
        "success",
        "Item processed successfully",
        false,
        1000
      );

      // 2. REFRESH DATA (Crucial!)
      // Ini akan memicu findOne di backend kembali dan menghitung ulang leave_status kolektif
      const res = await fetch(`${API_URL}/api/leave/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const latestData = await res.json();

      setLeave(latestData);

      // 3. Jika hasil perhitungan status adalah 4 (Completed), baru pindah halaman
      if (Number(latestData.leave_status) === 4) {
        setTimeout(() => {
          router.push("/leave_manage/list/completed");
        }, 1500);
      }
    } catch (err) {
      showAlert("Error", "error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAlert = (id, payload) => {
    showAlert(
      "Are you sure?",
      "question",
      "You are about to update this leave item status.",
      true,
      null,
      "Yes, proceed",
      "Cancel"
    ).then((confirmed) => {
      if (confirmed) {
        handleApproval(id, payload);
      }
    });
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
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.back()}
                className="cursor-pointer"
              />

              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Leave Request Detail
              </h2>
            </div>
            {/* FORM INFO USER */}
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" value={leave.full_name} />
              <Field label="Badge" value={leave.badge_number} />

              <Field label="Departement" value={leave.departement_name} />
              <Field label="Position" value={leave.position_name} />

              <Field label="Project" value={leave.project_name} />
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Status
                </label>
                {/* Ini akan otomatis menampilkan "Completed" jika leave.leave_status bernilai 4 */}
                <Badge color={statusMap[leave.leave_status]?.color} size="lg">
                  {statusMap[leave.leave_status]?.label}
                </Badge>
              </div>
            </div>
            {/* ATTACHMENT */}
            <div className="px-6 pb-4">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Attachment
              </label>
              {leave.attachment ? (
                <a
                  href={leave.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
                >
                  link attachment
                </a>
              ) : (
                <div className="text-gray-400 italic text-sm">
                  No attachment
                </div>
              )}
            </div>
            {/* REMARK */}
            <div className="px-6 pb-6">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Leave Remark
              </label>
              <textarea
                value={leave.leave_remarks || ""}
                disabled
                className="w-full p-3 border rounded-md bg-gray-100 text-gray-700 resize-none focus:outline-none"
                rows={4}
              />
            </div>
            {/* TABLE DATE DETAIL */}
            <div className="px-6 pb-6">
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
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leave.items?.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3 text-center">{item.leave_in}</td>
                      <td className="p-3 text-center">{item.leave_out}</td>
                      <td className="p-3 text-center">
                        {item.type_name || "-"}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-2">
                          {/* 1. Tampilkan Tombol jika status masih Pending (1) */}
                          {Number(item.leave_status) === 1 &&
                            String(leave?.supervisor_badge) ===
                              String(user?.badge_number) && (
                              <>
                                <Button
                                  size="xs"
                                  color="green"
                                  onClick={() =>
                                    handleAlert(item.id, { leave_status: 2 })
                                  }
                                  loading={actionLoading}
                                >
                                  Approve
                                </Button>

                                <Button
                                  size="xs"
                                  color="red"
                                  onClick={() =>
                                    handleAlert(item.id, { leave_status: 3 })
                                  }
                                  loading={actionLoading}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                          {/* 2. Tampilkan Badge jika status SUDAH BUKAN Pending (bukan 1) */}
                          {Number(item.leave_status) !== 1 && (
                            <Badge
                              color={statusMap[item.leave_status]?.color}
                              variant="filled"
                            >
                              {statusMap[item.leave_status]?.label}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
