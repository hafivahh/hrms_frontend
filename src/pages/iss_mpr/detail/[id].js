import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import axios from "axios";
import useUser from "@/store/useUser";
import useDecrypt from "@/hooks/useDecrypt";
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
  Group,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useSwal from "@/hooks/useSwal";

export default function IssMprDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { decrypt } = useDecrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const [mprData, setMprData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assignment data dengan nama, tanggal, signature
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    if (id) {
      fetchMprDetail();
    }
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

      setMprData(data);

      // 🔥 INI SATU-SATUNYA assignments (JANGAN DOBEL)
      setAssignments({
        requested_by: data.requestedByEmployee
          ? {
              ...data.requestedByEmployee,
              approval_date: data.assigned_requested_by,
            }
          : null,

        approved_section_manager: data.approvedSectionManagerEmployee
          ? {
              ...data.approvedSectionManagerEmployee,
              approval_date: data.assigned_section_manager,
            }
          : null,

        approved_cm: data.approvedCmEmployee
          ? {
              ...data.approvedCmEmployee,
              approval_date: data.assigned_cm,
            }
          : null,

        concurred_pmo: data.concurredPmoEmployee
          ? {
              ...data.concurredPmoEmployee,
              approval_date: data.assigned_pmo,
            }
          : null,

        concurred_yard_manager: data.concurredYardManagerEmployee
          ? {
              ...data.concurredYardManagerEmployee,
              approval_date: data.assigned_yard_manager,
            }
          : null,

        concurred_by: data.concurredByEmployee
          ? {
              ...data.concurredByEmployee,
              approval_date: data.assigned_concurred_by,
            }
          : null,

        acknowledged_by: data.acknowledgedByEmployee
          ? {
              ...data.acknowledgedByEmployee,
              approval_date: data.assigned_hr,
            }
          : null,

        approved_by: data.approvedByEmployee
          ? {
              ...data.approvedByEmployee,
              approval_date: data.assigned_president_director,
            }
          : null,
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch MPR detail:", err);
      setLoading(false);
    }
  };

  const handleApproval = async (approvalType, status) => {
    try {
      const decryptedId = decrypt(id);

      const { data } = await axios.patch(
        `${API_URL}/api/iss_mpr/${decryptedId}/approval`,
        {
          approval_type: approvalType,
          status,
        },
        {
          headers: { Authorization: "Bearer " + user.token },
        },
      );

      await showAlert(
        "Success",
        "success",
        "Item processed successfully",
        false,
        1000,
      );

      // refresh data
      fetchMprDetail();
    } catch (err) {
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Approval failed",
      );
    }
  };

  const handleAlert = (approvalType, status) => {
    showAlert(
      "Are you sure?",
      "question",
      `You are about to ${status} this MPR`,
      true,
      null,
      "Yes, proceed",
      "Cancel",
    ).then((confirmed) => {
      if (confirmed) {
        handleApproval(approvalType, status);
      }
    });
  };

  // 🔥 Assignment Box
  const AssignmentBox = ({
    title,
    employeeData,
    approvalType,
    currentUser,
  }) => {
    // 1️⃣ user login = user assign
    const isAssignedUser =
      currentUser?.badge_number &&
      employeeData?.badge_number &&
      currentUser.badge_number === employeeData.badge_number;

    // 2️⃣ belum di approve (timestamp masih null)
    const isNotApproved = !employeeData?.approval_date;

    // 3️⃣ izin tampil tombol
    const canApprove =
      approvalType && employeeData && isAssignedUser && isNotApproved;

    return (
      <Box
        style={{
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        <Text size="sm" fw={600} mb={8}>
          {title}
        </Text>

        <Text size="sm" c="dimmed">
          Name: {employeeData?.full_name || "-"}
        </Text>
        <Text size="sm" c="dimmed">
          Date:{" "}
          {employeeData?.approval_date
            ? new Date(employeeData.approval_date).toLocaleDateString()
            : "-"}
        </Text>
        <Text size="sm" c="dimmed">
          Signature: {employeeData?.signature || "-"}
        </Text>

        {/* 🔐 TOMBOL HANYA MUNCUL JIKA SYARAT TERPENUHI */}
        {canApprove && (
          <Group mt="md" grow>
            <Button
              size="xs"
              color="green"
              onClick={() => handleAlert(approvalType, "approved")}
            >
              Approve
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() => handleAlert(approvalType, "rejected")}
            >
              Reject
            </Button>
          </Group>
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
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconArrowLeft
                size={20}
                onClick={() => router.back()}
                className="cursor-pointer hover:text-blue-600 transition-colors"
              />
              <h2 className="text-lg font-semibold">
                MPR Detail - {mprData.mpr_no}
              </h2>
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
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Project"
                    value={mprData.project?.project_name || "-"}
                    readOnly
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
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Employee Status"
                    value={
                      mprData.work_type === "1"
                        ? "In Direct"
                        : mprData.work_type === "2"
                          ? "Direct"
                          : "-"
                    }
                    readOnly
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Qty" value={mprData.qty || "0"} readOnly />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Transfer Qty"
                    value={mprData.transfer_qty || "0"}
                    readOnly
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
                <Textarea
                  value={mprData.job_description || "-"}
                  minRows={4}
                  readOnly
                />
              </div>

              {/* Section 5: Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  3. Years of Relevant Experience
                </label>
                <TextInput value={mprData.experience_years || "-"} readOnly />
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
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Remarks"
                    value={mprData.remarks || "-"}
                    minRows={3}
                    readOnly
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Section 10: Assignment dengan Box */}
              <h3 className="text-md font-semibold mb-4">Assignment</h3>

              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <AssignmentBox
                    title="Requested By (End User)"
                    employeeData={assignments.requested_by}
                    approvalType="requested_by"
                    currentUser={user}
                  />
                </Grid.Col>

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Approved By Section Manager"
                      employeeData={assignments.approved_section_manager}
                      approvalType="section_manager"
                      currentUser={user}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Approved By (CM)"
                      employeeData={assignments.approved_cm}
                      approvalType="cm"
                      currentUser={user}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Concurred By (PMO)"
                      employeeData={assignments.concurred_pmo}
                      approvalType="pmo"
                      currentUser={user}
                    />
                  </Grid.Col>
                )}
                {mprData.id_project !== 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Concurred By Yard Manager"
                      employeeData={assignments.concurred_yard_manager}
                      approvalType="yard_manager"
                      currentUser={user}
                    />
                  </Grid.Col>
                )}

                {mprData.id_project === 11 && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <AssignmentBox
                      title="Concurred By"
                      employeeData={assignments.concurred_by}
                      approvalType="concurred"
                      currentUser={user}
                    />
                  </Grid.Col>
                )}

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <AssignmentBox
                    title="Acknowledged By HR"
                    employeeData={assignments.acknowledged_by}
                    approvalType="hr"
                    currentUser={user}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <AssignmentBox
                    title="Approved By (President Director)"
                    employeeData={assignments.approved_by}
                    approvalType="president_director"
                    currentUser={user}
                  />
                </Grid.Col>
              </Grid>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
