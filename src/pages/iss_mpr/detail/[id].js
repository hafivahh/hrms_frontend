import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import axios from "axios";
import useUser from "@/store/useUser";
import useDecrypt from "@/hooks/useDecrypt";
import useSwal from "@/hooks/useSwal";
import Swal from "sweetalert2";
import {
  Paper,
  TextInput,
  Textarea,
  Checkbox,
  Grid,
  Divider,
  Text,
  Box,
  Button,
  Modal,
  Group,
  Badge,
} from "@mantine/core";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
export default function IssMprDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { decrypt } = useDecrypt();
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;
  const [mprData, setMprData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const readOnlyInputStyle = {
    input: {
      backgroundColor: "#f1f3f5",
      cursor: "not-allowed",
    },
  };

  useEffect(() => {
    if (id) {
      fetchMprDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMprDetail = async () => {
    try {
      const decryptedId = decrypt(id);

      const { data } = await axios.get(
        `${API_URL}/api/iss_mpr/${decryptedId}`,
        {
          headers: { Authorization: "Bearer " + user.token },
        },
      );

      const mpr = data.data;
      setMprData(mpr);

      // Mapping assignment dari backend
      const mapAssignment = (index) => {
        const assign = mpr.assignments?.find((a) => a.index === index);
        if (!assign) return null;

        return {
          ...assign.user,
          user_id: assign.user_id,
          approval_date: assign.assign_date,
          status_sign: assign.status_sign,
          index: assign.index,
          remarks_status: assign.remarks_status,
        };
      };

      setAssignments({
        requested_by: mapAssignment(0),
        approved_section_manager: mapAssignment(1),
        approved_cm: mapAssignment(2),
        concurred_pmo: mapAssignment(3),
        concurred_yard_manager: mapAssignment(4),
        concurred_by: mapAssignment(5),
        acknowledged_by: mapAssignment(6),
        approved_by: mapAssignment(7),
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch MPR detail:", err);
      setLoading(false);
    }
  };

  // Submit MPR
  const handleSubmitMpr = async () => {
    try {
      const confirm = await showAlert(
        "Are you sure?",
        "question",
        "Do you want to submit this Manpower Request?",
        true,
        null,
        "Submit",
        "Cancel",
      );

      if (!confirm.isConfirmed) return;

      setSubmitting(true);
      const decryptedId = decrypt(id);

      await axios.patch(
        `${API_URL}/api/iss_mpr/${decryptedId}/submit`,
        {},
        {
          headers: { Authorization: "Bearer " + user.token },
        },
      );

      await showAlert(
        "Success",
        "success",
        "Manpower request submitted successfully",
        false,
        1500,
      );


    } catch (err) {
      console.error("Failed to submit MPR:", err);
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to submit MPR",
      );
    } finally {
      setSubmitting(false);
    }
  };

const handleActionWithRemarks = async (type) => {
  const { value: remarksValue, isConfirmed } = await Swal.fire({
    title: type === "approve" ? "Approve Manpower Request" : "Reject Manpower Request",
    input: "textarea",
    inputLabel: "Remarks",
    inputPlaceholder: type === "approve"
      ? "Add approval remarks ..."
      : "Please provide rejection reason...",
    inputAttributes: { "aria-label": "Type your remarks here" },
    showCancelButton: true,
    confirmButtonText: type === "approve" ? "Approve" : "Reject",
    confirmButtonColor: type === "approve" ? "#2f9e44" : "#e03131",
    cancelButtonText: "Cancel",
    inputValidator: type === "reject"
      ? (value) => { if (!value) return "Rejection reason is required!" }
      : undefined,
  });

  if (!isConfirmed) return;

  try {
    const decryptedId = decrypt(id);
    const endpoint = type === "approve" ? "approve" : "reject";

    await axios.patch(
      `${API_URL}/api/iss_mpr/${decryptedId}/${endpoint}`,
      { remarks: remarksValue || "" },
      { headers: { Authorization: "Bearer " + user.token } },
    );

    await showAlert(
      "Success",
      "success",
      type === "approve"
        ? "Manpower request approved successfully"
        : "Manpower request rejected",
      false,
      1500,
    );

    fetchMprDetail();
  } catch (err) {
    showAlert(
      "Error",
      "error",
      err.response?.data?.message || `Failed to ${type} MPR`,
    );
  }
};

  /**
   *  DYNAMIC ASSIGNMENT BOX
   */
  const AssignmentBox = ({ title, employeeData }) => {
    if (!employeeData) return null;

    const isCurrentStep =
      Number(mprData?.mpr_status) === 1 &&
      Number(mprData?.index_sign) === Number(employeeData.index);

    // Decrypt user ID untuk mendapatkan numeric ID
   const currentUserId = user?.id_user
  ? Number(user.id_user)
  : user?.id
    ? Number(user.id)
    : null;
   console.log("=== USER ID CHECK ===", {
  id_user: user?.id_user,
  id: user?.id,
  currentUserId,
  employeeUserId: employeeData.user_id,
  match: Number(currentUserId) === Number(employeeData.user_id)
});

    // Cek apakah user yang login adalah user yang terdaftar di assignment ini
    const isAuthorizedUser =
      currentUserId && Number(currentUserId) === Number(employeeData.user_id);

   const canApprove =
  isCurrentStep === true &&
  isAuthorizedUser === true &&
  employeeData.status_sign !== 1 &&
  employeeData.status_sign !== 2;
// ⬅️ tambah log sementara
  console.log("=== ASSIGNMENT BOX DEBUG ===", {
    title,
    mpr_status: mprData?.mpr_status,
    index_sign: mprData?.index_sign,
    employeeIndex: employeeData.index,
    employeeUserId: employeeData.user_id,
    currentUserId,
    status_sign: employeeData.status_sign,
    isCurrentStep,
    isAuthorizedUser,
    canApprove,
  });
    // Format tanggal dengan waktu
    const formatDateTime = (date) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    };
    const getSignatureStatus = (statusSign) => {
      if (statusSign === 1) return { label: "Approved", color: "green" };
      if (statusSign === 2) return { label: "Rejected", color: "red" };
      return null;
    };

    return (
      <Box
        style={{
          border: isCurrentStep ? "2px solid #228be6" : "1px solid #dee2e6",
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
          backgroundColor: isCurrentStep ? "#f0f8ff" : "white",
        }}
      >
        <div className="space-y-1">
          <div className="flex">
            <Text size="sm" fw={400} style={{ minWidth: "90px" }}>
              Name
            </Text>
            <Text size="sm" fw={400} mr={8}>
              :
            </Text>
            <Text size="sm">{employeeData.full_name ?? "-"}</Text>
          </div>

          <div className="flex">
            <Text size="sm" fw={400} style={{ minWidth: "90px" }}>
              Date
            </Text>
            <Text size="sm" fw={400} mr={8}>
              :
            </Text>
            <Text size="sm">
              {employeeData.status_sign === 1 || employeeData.status_sign === 2
                ? new Date(employeeData.approval_date).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "-"}
            </Text>
          </div>

          <div className="flex">
            <Text size="sm" fw={400} style={{ minWidth: "90px" }}>
              Signature
            </Text>
            <Text size="sm" fw={400} mr={8}>
              :
            </Text>
            <div>
              {employeeData.status_sign === 1 ||
              employeeData.status_sign === 2 ? (
                <>
                  <Text size="sm" fw={400}>
                    {employeeData.full_name}
                  </Text>

                  <Text size="xs" c="dimmed">
                    {formatDateTime(employeeData.approval_date)}
                  </Text>
                  <Text
                    size="xs"
                    fw={600}
                    c={getSignatureStatus(employeeData.status_sign)?.color}
                  >
                    {getSignatureStatus(employeeData.status_sign)?.label}
                  </Text>
                  {employeeData.remarks_status && (
  <Text size="xs" c="dimmed" mt={2} fs="italic">
    {employeeData.remarks_status}
  </Text>
)}
                </>
              ) : (
                <Text size="sm">-</Text>
              )}
            </div>
          </div>
        </div>

        {canApprove && (
  <div className="flex gap-2 mt-3 pt-3 border-t">
    <Button
      size="xs"
      color="red"
      variant="light"
      onClick={() => handleActionWithRemarks("reject")}
      fullWidth
    >
      Reject
    </Button>
    <Button
      size="xs"
      color="green"
      onClick={() => handleActionWithRemarks("approve")}
      fullWidth
    >
      Approve
    </Button>
  </div>
)}
      </Box>
    );
  };

  if (loading) {
    return (
      <AuthLayout sidebarList={employee}>
        <Paper radius="sm" mt="md" withBorder p="lg">
          <Text>Loading...</Text>
        </Paper>
      </AuthLayout>
    );
  }

  if (!mprData) {
    return (
      <AuthLayout sidebarList={employee}>
        <Paper radius="sm" mt="md" withBorder p="lg">
          <Text>MPR not found</Text>
        </Paper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconArrowLeft
                  size={20}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold">
                  MPR Detail - {mprData.mpr_no}
                </h2>
              </div>
            </div>

            {/* FORM CONTENT */}
            <div className="p-6">
              {/* Section 1: Department & Project */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Department"
                    value={mprData.departement?.departement_name || "-"}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Project"
                    value={mprData.project?.project_name || "-"}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Section 2: Position Vacant */}
              <h3 className="text-md font-semibold mb-4">Position Vacant</h3>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Position"
                    value={mprData.position?.position_name || "-"}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Employee Status"
                    value={
                      mprData.work_type === 1
                        ? "In Direct"
                        : mprData.work_type === 2
                          ? "Direct"
                          : "-"
                    }
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Qty"
                    value={mprData.qty || "0"}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Transfer Qty"
                    value={mprData.transfer_qty || "0"}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
              </Grid>

              {/* Vacant Type */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Vacant Type
                </label>
                <div className="space-y-2">
                  <Checkbox
                    label="New Position"
                    checked={mprData.vacant_type === 1}
                    readOnly
                    disabled
                  />
                  <Checkbox
                    label="Replacement"
                    checked={mprData.vacant_type === 2}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 3: Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  1. Is the above manpower request budgeted for in the Annual
                  Budget?
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Yes"
                    checked={mprData.is_budgeted === 1}
                    readOnly
                    disabled
                  />
                  <Checkbox
                    label="No"
                    checked={mprData.is_budgeted === 2}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Section 4: Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  2. Job Description
                </label>
                <ReactQuill
                  theme="snow"
                  value={mprData.job_description || ""}
                  readOnly={true}
                  modules={{ toolbar: false }}
                  style={{
                    backgroundColor: "#f1f3f5",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* Section 5: Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  3. Years of Relevant Experience
                </label>
                <TextInput
                  value={mprData.experience_years || "-"}
                  readOnly
                  styles={readOnlyInputStyle}
                />
              </div>

              <Divider my="lg" />

              {/* Section 6: Education */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4">
                  4. Educational Background
                </label>
                <div className="space-y-3 ml-4">
                  {[
                    { key: 1, label: "Degree" },
                    { key: 2, label: "Diploma" },
                    { key: 3, label: "High School" },
                    { key: 4, label: "Others" },
                  ].map((item) => {
                    const detail = mprData.details?.find(
                      (d) => d.detail_type === 1 && d.detail_key === item.key,
                    );
                    return (
                      <div
                        key={item.key}
                        className="grid grid-cols-[180px_1fr] items-center gap-4"
                      >
                        <Checkbox
                          label={item.label}
                          checked={!!detail}
                          readOnly
                          disabled
                        />
                        <TextInput
                          value={detail?.detail_value || ""}
                          readOnly
                          disabled={!detail}
                          styles={detail ? readOnlyInputStyle : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 7: Contract Type */}
              <label className="block text-sm font-medium mb-3">
                5. Contract Type
              </label>
              <div className="space-y-3 ml-4">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Checkbox
                    label="Probation / Permanent"
                    checked={mprData.contract_type === 1}
                    readOnly
                    disabled
                  />
                  <div />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Checkbox
                    label="Contract / Temporary"
                    checked={mprData.contract_type === 2}
                    readOnly
                    disabled
                  />
                  <div className="flex items-center gap-2">
                    <TextInput
                      value={mprData.contract_duration || ""}
                      readOnly
                      disabled={mprData.contract_type !== 2}
                      className="w-40"
                      styles={
                        mprData.contract_type === 2
                          ? readOnlyInputStyle
                          : undefined
                      }
                    />
                    <span className="text-sm text-gray-600">Month</span>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 8: IT Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">
                  6. Information Technology Facilities
                </h3>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Computer"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 2 && d.detail_key === 1,
                    )}
                    readOnly
                    disabled
                  />
                  <Checkbox
                    label="Email"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 2 && d.detail_key === 2,
                    )}
                    readOnly
                    disabled
                  />
                </div>

                <label className="block text-sm font-medium mb-3 mt-4">
                  Share Folder
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Public"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 3 && d.detail_key === 1,
                    )}
                    readOnly
                    disabled
                  />
                  <Checkbox
                    label="Department"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 3 && d.detail_key === 2,
                    )}
                    readOnly
                    disabled
                  />
                </div>

                <label className="block text-sm font-medium mb-3 mt-4">
                  Printer
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Black / White"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 4 && d.detail_key === 1,
                    )}
                    readOnly
                    disabled
                  />
                  <Checkbox
                    label="Color"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 4 && d.detail_key === 2,
                    )}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Application */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3">
                  Application
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Employee Service System"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 5 && d.detail_key === 1,
                    )}
                    readOnly
                    disabled
                  />
                  <Checkbox
                    label="PCMS/ISS"
                    checked={mprData.details?.some(
                      (d) => d.detail_type === 5 && d.detail_key === 2,
                    )}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 9: Purpose & Date */}
              <Grid>
                <Grid.Col span={12}>
                  <Textarea
                    label="Purpose for Request"
                    value={mprData.purpose || "-"}
                    minRows={3}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Required Date"
                    value={
                      mprData.required_date
                        ? new Date(mprData.required_date)
                            .toISOString()
                            .split("T")[0]
                        : "-"
                    }
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Remarks"
                    value={mprData.remarks || "-"}
                    minRows={3}
                    readOnly
                    styles={readOnlyInputStyle}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Section 10: DYNAMIC APPROVAL FLOW */}
              <div className="mb-4">
                <h3 className="text-md font-semibold">Approval Remarks</h3>
              </div>

              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <AssignmentBox
                    title="Requested By (End User)"
                    employeeData={assignments.requested_by}
                  />
                </Grid.Col>

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Approved By Section Manager"
                      employeeData={assignments.approved_section_manager}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Approved By (CM)"
                      employeeData={assignments.approved_cm}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Concurred By (PMO)"
                      employeeData={assignments.concurred_pmo}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Concurred By Yard Manager"
                      employeeData={assignments.concurred_yard_manager}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project === 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Concurred By"
                      employeeData={assignments.concurred_by}
                    />
                  </Grid.Col>
                )}

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <AssignmentBox
                    title="Acknowledged By HR"
                    employeeData={assignments.acknowledged_by}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <AssignmentBox
                    title="Approved By (President Director)"
                    employeeData={assignments.approved_by}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Submit Button - Only show if draft */}
              {mprData.mpr_status === 0 && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitMpr}
                    loading={submitting}
                    size="md"
                    color="blue"
                  >
                    Submit Manpower Request
                  </Button>
                </div>
              )}
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
