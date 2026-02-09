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
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function IssMprDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { decrypt } = useDecrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const [mprData, setMprData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({});

  // Style untuk readonly input
  const readOnlyInputStyle = {
    input: {
      backgroundColor: '#f1f3f5',
      cursor: 'not-allowed',
    }
  };

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
        }
      );

      const mpr = data.data;
      setMprData(mpr);

      // Mapping assignment dari backend
      const mapAssignment = (index) => {
        const assign = mpr.assignments?.find((a) => a.index === index);
        if (!assign) return null;

        return {
          ...assign.user,
          approval_date: assign.assign_date,
          status_sign: assign.status_sign,
        };
      };

      setAssignments({
        requested_by: mapAssignment(1),
        approved_section_manager: mapAssignment(2),
        approved_cm: mapAssignment(3),
        concurred_pmo: mapAssignment(4),
        concurred_yard_manager: mapAssignment(5),
        concurred_by: mapAssignment(6),
        acknowledged_by: mapAssignment(7),
        approved_by: mapAssignment(8),
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch MPR detail:", err);
      setLoading(false);
    }
  };

  // Assignment Box - Display Only
  const AssignmentBox = ({ title, employeeData }) => {
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
          Status:{" "}
          {employeeData?.status_sign === 1
            ? "Approved"
            : employeeData?.status_sign === 2
            ? "Rejected"
            : "Pending"}
        </Text>
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
                <Textarea
                  value={mprData.job_description || "-"}
                  minRows={4}
                  readOnly
                  styles={readOnlyInputStyle}
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
                      styles={mprData.contract_type === 2 ? readOnlyInputStyle : undefined}
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

              {/* Section 10: Assignment - Display Only */}
              <h3 className="text-md font-semibold mb-4">Assignment</h3>

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
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}